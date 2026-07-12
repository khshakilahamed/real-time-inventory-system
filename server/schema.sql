
-- ── enums ──────────────────────────────────────────────────────────────
CREATE TYPE enum_users_role AS ENUM ('admin', 'user');
CREATE TYPE enum_reservations_status AS ENUM ('pending', 'completed', 'cancelled', 'expired');

-- ── users ──────────────────────────────────────────────────────────────
CREATE TABLE users (
  id            VARCHAR(100)     PRIMARY KEY DEFAULT gen_random_uuid()::text,
  first_name    VARCHAR(50)      NOT NULL,
  last_name     VARCHAR(50)      NOT NULL,
  email         VARCHAR(255)     NOT NULL UNIQUE,
  password_hash VARCHAR(255)     NOT NULL,
  role          enum_users_role  NOT NULL DEFAULT 'user',
  created_at    TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

-- ── drops ──────────────────────────────────────────────────────────────
CREATE TABLE drops (
  id              VARCHAR(100)   PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name            VARCHAR(255)   NOT NULL,
  price           DECIMAL(10,2)  NOT NULL,
  total_stock     INTEGER        NOT NULL,
  available_stock INTEGER        NOT NULL,
  starts_at       TIMESTAMPTZ    NOT NULL,
  image_url       TEXT,
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ── reservations ───────────────────────────────────────────────────────
CREATE TABLE reservations (
  id         VARCHAR(100)              PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id    VARCHAR(100)              NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  drop_id    VARCHAR(100)              NOT NULL REFERENCES drops(id) ON DELETE CASCADE ON UPDATE CASCADE,
  status     enum_reservations_status  NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ               NOT NULL,
  created_at TIMESTAMPTZ               NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ               NOT NULL DEFAULT NOW()
);

-- ── purchases ──────────────────────────────────────────────────────────
CREATE TABLE purchases (
  id             VARCHAR(100)   PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id        VARCHAR(100)   NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  drop_id        VARCHAR(100)   NOT NULL REFERENCES drops(id) ON DELETE CASCADE ON UPDATE CASCADE,
  reservation_id VARCHAR(100)   NOT NULL UNIQUE REFERENCES reservations(id) ON DELETE CASCADE ON UPDATE CASCADE,
  amount_paid    DECIMAL(10,2)  NOT NULL,
  created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);
