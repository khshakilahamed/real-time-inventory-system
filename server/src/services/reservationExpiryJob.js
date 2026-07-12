import sequelize from "../sequelize/index.js";
import { userSocketMap } from "../socket/index.js";

// Single atomic CTE: expires reservations, restores stock, returns rows to notify
const EXPIRY_SQL = `
  WITH expired AS (
    UPDATE reservations
    SET status = 'expired'
    WHERE status ='pending'
      AND expires_at < NOW()
    RETURNING id, user_id, drop_id
  ),
  stock_restored AS (
    UPDATE drops d
    SET available_stock = available_stock + cnt.c
    FROM (SELECT drop_id, COUNT(*)::int AS c FROM expired GROUP BY drop_id) cnt
    WHERE d.id = cnt.drop_id
    RETURNING d.id AS drop_id, d.available_stock
  )
  SELECT
    e.id AS reservation_id,
    e.user_id,
    e.drop_id,
    s.available_stock
  FROM expired e
  JOIN stock_restored s ON s.drop_id = e.drop_id;
`;

async function runExpiryJob(io) {
  try {
    const [rows] = await sequelize.query(EXPIRY_SQL);
    if (!rows || rows.length === 0) return;

    // Broadcast stock updates (deduplicated per drop)
    const dropUpdates = new Map();
    for (const row of rows) {
      dropUpdates.set(row.drop_id, parseInt(row.available_stock));
    }
    for (const [dropId, availableStock] of dropUpdates) {
      io.to(`drop:${dropId}`).emit("stock:update", { dropId, availableStock });
    }

    // Notify individual users their reservation expired
    for (const row of rows) {
      const socketId = userSocketMap.get(row.user_id);
      if (socketId) {
        io.to(socketId).emit("reservation:expired", {
          reservationId: row.reservation_id,
          dropId: row.drop_id,
        });
      }
    }
  } catch (err) {
    console.error("[ExpiryJob] Error:", err.message);
  }
}

function startExpiryJob(io) {
  // Run immediately to clear any backlog from before server restart
  runExpiryJob(io);
  setInterval(() => runExpiryJob(io), 5000);
}

export { startExpiryJob };
