-- ============================================
-- init.sql — Runs on first database start
-- ============================================

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    text VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed with sample data
INSERT INTO messages (text) VALUES
    ('Hello from Docker! 🐳'),
    ('PostgreSQL is running with persistent volume'),
    ('This data survives container restarts');
