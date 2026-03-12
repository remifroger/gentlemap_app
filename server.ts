import express from "express";
import { Pool } from "pg";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PostgreSQL Connection Pool
const poolConfig = process.env.DATABASE_URL 
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "5432"),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };

const pool = new Pool({
  ...poolConfig,
  ssl: process.env.DB_SSL === "true" || process.env.NODE_ENV === "production" 
    ? { rejectUnauthorized: false } 
    : false
});

// Set search_path if a schema is specified
pool.on('connect', (client) => {
  if (process.env.DB_SCHEMA) {
    client.query(`SET search_path TO ${process.env.DB_SCHEMA}, public`).catch(err => {
      console.error('Error setting search_path:', err);
    });
  }
});

// Test connection on startup
pool.query('SELECT NOW()')
  .then(res => console.log('✅ PostgreSQL connected successfully at:', res.rows[0].now))
  .catch(err => console.error('❌ PostgreSQL connection error:', err.message));

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get("/api/places", async (req, res) => {
    const { category, subcategory, minRating, maxPrice, q } = req.query;
    let query = `
      SELECT p.*, 
             AVG(r.rating)::float as avg_rating,
             COUNT(r.id) as review_count
      FROM places p
      LEFT JOIN reviews r ON p.id = r.place_id
      WHERE p.status = 'approved'
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (category && !q) {
      query += ` AND p.category_id = $${paramIndex++}`;
      params.push(category);
    }
    if (subcategory && !q) {
      query += ` AND p.subcategory_id = $${paramIndex++}`;
      params.push(subcategory);
    }
    if (maxPrice) {
      query += ` AND p.price_range <= $${paramIndex++}`;
      params.push(maxPrice);
    }
    if (q) {
      query += ` AND (LOWER(p.name) LIKE $${paramIndex} OR LOWER(p.description) LIKE $${paramIndex} OR LOWER(p.address) LIKE $${paramIndex})`;
      params.push(`%${String(q).toLowerCase()}%`);
      paramIndex++;
    }

    query += ` GROUP BY p.id`;

    if (minRating) {
      query += ` HAVING AVG(r.rating) >= $${paramIndex++}`;
      params.push(minRating);
    }

    if (req.query.limit) {
      query += ` LIMIT $${paramIndex++}`;
      params.push(parseInt(req.query.limit as string));
    }

    try {
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching places:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM categories");
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/places/:id/reviews", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM reviews WHERE place_id = $1 ORDER BY created_at DESC", [req.params.id]);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    const { place_id, rating, comment, user_name } = req.body;
    try {
      const result = await pool.query(
        "INSERT INTO reviews (place_id, rating, comment, user_name) VALUES ($1, $2, $3, $4) RETURNING id",
        [place_id, rating, comment, user_name]
      );
      res.json({ id: result.rows[0].id });
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/places", async (req, res) => {
    const { name, description, category_id, subcategory_id, address, lat, lng, price_range, website, instagram, is_featured } = req.body;
    try {
      const result = await pool.query(`
        INSERT INTO places (name, description, category_id, subcategory_id, address, lat, lng, price_range, website, instagram, status, is_featured)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', $11)
        RETURNING id
      `, [name, description, category_id, subcategory_id, address, lat, lng, price_range, website, instagram, is_featured ? 1 : 0]);
      res.json({ id: result.rows[0].id, status: 'pending' });
    } catch (error) {
      console.error("Error creating place:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
