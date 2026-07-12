# Limited Edition Sneaker Drop — Real-Time Inventory System

A full-stack inventory system built for high-concurrency "sneaker drop" scenarios. Users can browse live drops, reserve items for 60 seconds, and complete purchases — all with real-time stock updates across every open browser tab.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Real-time | Socket.io |
| ORM | Sequelize 6 |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Validation | Zod |

---

## Quick Start

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 14+ running locally / Use Neon Database

### 2. Database Setup

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE inventory_db;"
```

### 3. Configure the Server

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/inventory_db
JWT_SECRET=change_this_to_a_long_random_secret
DB_SYNC=true
```

### 4. Install Dependencies

```bash
# Server
cd server && npm install

# Client
cd client && npm install
```

### 5. Seed the Database (Optional)

Creates 3 test users (`alice`, `bob`, `carol` — all with password `password123`) and 3 live drops.

```bash
cd server && npm run seed
```

### 6. Run the App

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev        # uses nodemon for hot reload
# or: npm start
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## API Reference

| Method | Path | Auth | Admin Required | Description |
|--------|------|------|-------------|-------------|
| GET | `/api/health` | No | No | Health check |
| POST | `/api/auth/register` | No | No |Create account |
| POST | `/api/auth/login` | No | No |Get JWT |
| GET | `/api/drops` | No | No | List drops + top-3 purchasers (Recent 3 purchasers) |
| POST | `/api/drops` | JWT | Yes | Create new drop |
| POST | `/api/drops/:id/reserve` | JWT | No | **Atomic reserve** |
| DELETE | `/api/reservations/:id` | JWT | No | Cancel reservation |
| GET | `/api/reservations` | JWT | Yes | All reservations |
| POST | `/api/reservations/:id/purchase` | JWT | No | Complete purchase |

### Create user account

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | string | ✅ | User's first name. |
| `lastName` | string | ✅ | User's last name. |
| `email` | string | ✅ | Unique email address. |
| `password` | string | ✅ | User password (minimum 6 characters). |


**Example**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alice",
    "lastName": "D",
    "email": "alice@example.com",
    "password": "123456"
  }'
```

### Login

Authenticates a user and returns a JWT access token.

**Endpoint**

```http
POST /api/auth/login
```

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | ✅ | Registered email address. |
| `password` | string | ✅ | User password. |

**Example**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "123456"
  }'
```

### Create a Drop (Merch Drop API)

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Name of the merch drop. |
| `price` | number | ✅ | Price of the product. |
| `totalStock` | integer | ✅ | Total number of items available for the drop. |
| `startsAt` | string (ISO 8601) | ❌ | Date and time when the drop becomes available (UTC). If omitted, the server uses the current time in ISO 8601 format. |
| `imageUrl` | string (URL) | ❌ | Public URL of the product image. |

**Example**

```bash
curl -X POST http://localhost:3000/api/drops \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Air Jordan 1 Retro OG",
    "price": 299.99,
    "totalStock": 100,
    "startsAt": "2026-07-15T18:00:00Z"
    "imageUrl": "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop",
  }'
```

---

## Architecture Decisions

### How the 60-Second Expiration Works

**Approach: Server-side polling job with an atomic CTE.**

A `setInterval` runs every **5 seconds** on the server. Each tick executes a single PostgreSQL CTE that does three things atomically:

```sql
WITH expired AS (
  UPDATE reservations
  SET    status = 'expired'
  WHERE  status = 'pending' AND expires_at < NOW()
  RETURNING id, user_id, drop_id
),
stock_restored AS (
  UPDATE drops d
  SET    available_stock = available_stock + cnt.c
  FROM   (SELECT drop_id, COUNT(*)::int AS c FROM expired GROUP BY drop_id) cnt
  WHERE  d.id = cnt.drop_id
  RETURNING d.id AS drop_id, d.available_stock
)
SELECT e.id, e.user_id, e.drop_id, s.available_stock
FROM expired e JOIN stock_restored s ON s.drop_id = e.drop_id;
```

After the query, the server emits:
- `stock:update` to every client watching the affected drop (via Socket.io room)
- `reservation:expired` to the specific user's socket (via `userId → socketId` map)

**Why polling over `setTimeout` per reservation:**
- Survives server restarts — state is in Postgres, not Node.js memory
- Clears any backlog accumulated during downtime on startup
- One query handles N simultaneous expirations instead of N scheduled callbacks
- No memory leak risk from thousands of pending timers

### How Overselling is Prevented

**Approach: Single atomic `UPDATE` with a `WHERE` guard.**

```sql
UPDATE drops
SET    available_stock = available_stock - 1
WHERE  id            = :dropId
  AND  available_stock > 0
  AND  starts_at    <= NOW()
RETURNING id, available_stock;
```

PostgreSQL acquires a **row-level exclusive lock** when executing an `UPDATE`. When 100 concurrent requests race for the last item, they all queue on this lock. The execution sequence:

1. **T1** acquires lock, sees `available_stock = 1 > 0` → decrements to 0 → returns 1 row → commits
2. **T2** acquires lock, sees `available_stock = 0`, WHERE guard fails → 0 rows returned
3. **T3–T100**: same as T2

If the UPDATE returns 0 rows, the route handler responds with `409`. No `SELECT FOR UPDATE` is needed — the UPDATE itself performs the read-then-write atomically.

### Real-Time Architecture

Socket.io rooms are named `drop:{id}`. When a DropCard mounts, the client emits `join:drop`; on unmount it emits `leave:drop`. All stock updates and purchase activity are broadcast to the room — zero polling from the frontend.

The `stock:update` event carries `{ dropId, availableStock }` and is emitted on:
- Successful reservation (stock decremented)
- Reservation expiry (stock restored)
- Manual cancellation (stock restored)

The `StockBadge` component animates (ring + scale pulse) whenever `availableStock` changes, giving users clear visual feedback.

---

## Verification Checklist

- **Concurrency test**: Seed a drop with `available_stock = 1`, fire 10 simultaneous reserve requests → exactly 1 gets 201, rest get 409.
- **Expiry test**: Reserve an item, wait 65 seconds → stock badge updates across all tabs, toast appears.
- **Purchase test**: Reserve → purchase within 60s → reservation status = `completed`, stock unchanged.
- **Activity feed**: Complete 4 purchases on the same drop → card shows only the 3 most recent buyers.
- **Multi-tab test**: Open 2 tabs, reserve in one → stock count decrements live in both tabs instantly.
