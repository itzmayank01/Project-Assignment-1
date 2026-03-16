const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

// ── PostgreSQL Connection Pool ──────────────────────────────
const pool = new Pool({
  user: process.env.POSTGRES_USER || "postgres",
  host: process.env.DATABASE_HOST || "database",
  database: process.env.POSTGRES_DB || "testdb",
  password: process.env.POSTGRES_PASSWORD || "postgres",
  port: 5432,
});

// ── Retry logic — wait for database to be ready ─────────────
async function waitForDB(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query("SELECT 1");
      console.log("✅ Database connected successfully!");
      return;
    } catch (err) {
      console.log(`⏳ Waiting for database... attempt ${i + 1}/${retries}`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  console.error("❌ Could not connect to database after retries");
  process.exit(1);
}

// ── ROUTES ──────────────────────────────────────────────────

// Health check (used by Docker HEALTHCHECK)
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "healthy", database: "connected" });
  } catch (err) {
    res.status(500).json({ status: "unhealthy", database: "disconnected" });
  }
});

// Root — returns current time from PostgreSQL
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Backend connected to PostgreSQL!",
      time: result.rows[0].now,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /messages — list all messages (volume persistence demo)
app.get("/messages", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM messages ORDER BY created_at DESC"
    );
    res.json({ count: result.rowCount, messages: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /messages — insert a new message
app.post("/messages", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "text field is required" });
  }
  try {
    const result = await pool.query(
      "INSERT INTO messages (text) VALUES ($1) RETURNING *",
      [text]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /messages/:id — delete a message
app.delete("/messages/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM messages WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json({ deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

waitForDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});