import express from "express";
import { Pool } from "pg";
import path from "path";
import fs from "fs";
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
  ssl: { rejectUnauthorized: false }
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
  // Migration: Ensure all tables exist
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          parent_id TEXT,
          icon TEXT,
          color TEXT,
          CONSTRAINT fk_parent FOREIGN KEY (parent_id) REFERENCES categories(id)
      );

      CREATE TABLE IF NOT EXISTS places (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          category_id TEXT NOT NULL,
          subcategory_id TEXT,
          address TEXT,
          lat DOUBLE PRECISION NOT NULL,
          lng DOUBLE PRECISION NOT NULL,
          price_range INTEGER,
          level TEXT DEFAULT 'debutant',
          website TEXT,
          instagram TEXT,
          gentlemap_review TEXT,
          status TEXT DEFAULT 'approved',
          is_featured INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          city VARCHAR(255),
          CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id)
      );

      CREATE TABLE IF NOT EXISTS reviews (
          id SERIAL PRIMARY KEY,
          place_id INTEGER NOT NULL,
          rating INTEGER NOT NULL,
          comment TEXT,
          user_name TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_place FOREIGN KEY (place_id) REFERENCES places(id)
      );

      CREATE TABLE IF NOT EXISTS notebooks (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          image_url TEXT,
          place_ids INTEGER[] NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS blog_posts (
          id SERIAL PRIMARY KEY,
          slug VARCHAR(255) UNIQUE NOT NULL,
          title VARCHAR(255) NOT NULL,
          excerpt TEXT,
          content TEXT,
          date VARCHAR(50),
          author VARCHAR(100),
          category VARCHAR(50),
          image TEXT,
          notebook_id VARCHAR(255)
      );
    `);
    console.log('✅ Database schema verified');

    // Run initial data migration
    const migrationPath = path.join(__dirname, "migration.sql");
    if (fs.existsSync(migrationPath)) {
      const migrationSql = fs.readFileSync(migrationPath, "utf8");
      await pool.query(migrationSql);
      console.log('✅ Initial data migration completed');
    }
  } catch (err) {
    console.error('Migration error:', err);
  }

  const app = express();
  app.use(express.json());

  // API Routes
  app.get("/api/places", async (req, res) => {
    const { category, subcategory, minRating, maxPrice, q, city, level, ids } = req.query;
    console.log("GET /api/places - Query params:", { category, subcategory, minRating, maxPrice, q, city, level, ids });
    
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

    if (ids) {
      const idList = String(ids).split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
      if (idList.length > 0) {
        query += ` AND p.id = ANY($${paramIndex++})`;
        params.push(idList);
      }
    }

    if (category && !q) {
      const categories = String(category).split(',');
      if (categories.length > 1) {
        query += ` AND p.category_id = ANY($${paramIndex++})`;
        params.push(categories);
      } else {
        query += ` AND p.category_id = $${paramIndex++}`;
        params.push(categories[0]);
      }
    }
    if (subcategory && !q) {
      query += ` AND p.subcategory_id = $${paramIndex++}`;
      params.push(subcategory);
    }
    if (maxPrice && maxPrice !== 'all') {
      const priceValue = parseInt(maxPrice as string, 10);
      if (!isNaN(priceValue)) {
        // Use <= for maxPrice to show places up to that price level
        query += ` AND p.price_range <= $${paramIndex++}`;
        params.push(priceValue);
      }
    }
    if (city) {
      query += ` AND LOWER(p.city) = LOWER($${paramIndex++})`;
      params.push(city);
    }
    if (level) {
      query += ` AND p.level = $${paramIndex++}`;
      params.push(level);
    }
    if (q) {
      query += ` AND (LOWER(p.name) LIKE $${paramIndex} OR LOWER(p.description) LIKE $${paramIndex} OR LOWER(p.address) LIKE $${paramIndex} OR LOWER(p.city) LIKE $${paramIndex})`;
      params.push(`%${String(q).toLowerCase()}%`);
      paramIndex++;
    }

    query += ` GROUP BY p.id`;

    if (minRating && minRating !== 'all') {
      const ratingValue = parseFloat(minRating as string);
      if (!isNaN(ratingValue)) {
        query += ` HAVING AVG(r.rating) >= $${paramIndex++}`;
        params.push(ratingValue);
      }
    }

    query += ` ORDER BY p.is_featured DESC`;

    if (req.query.limit) {
      query += ` LIMIT $${paramIndex++}`;
      params.push(parseInt(req.query.limit as string));
    }

    console.log("Executing query:", query, "with params:", params);

    try {
      const result = await pool.query(query, params);
      console.log(`Found ${result.rows.length} places`);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching places:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/places/ids", async (req, res) => {
    const { ids } = req.query;
    if (!ids) return res.json([]);
    
    const idList = String(ids).split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
    if (idList.length === 0) return res.json([]);

    try {
      const result = await pool.query(`
        SELECT p.*, 
               AVG(r.rating)::float as avg_rating,
               COUNT(r.id) as review_count
        FROM places p
        LEFT JOIN reviews r ON p.id = r.place_id
        WHERE p.id = ANY($1)
        GROUP BY p.id
      `, [idList]);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching places by ids:", error);
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

  app.get("/api/cities", async (req, res) => {
    try {
      const result = await pool.query("SELECT DISTINCT city FROM places WHERE city IS NOT NULL AND city != '' ORDER BY city ASC");
      res.json(result.rows.map(r => r.city));
    } catch (error) {
      console.error("Error fetching cities:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/notebooks", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM notebooks ORDER BY created_at DESC");
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching notebooks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/blog", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM blog_posts ORDER BY id DESC");
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/notebooks/:id", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM notebooks WHERE id = $1", [req.params.id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Notebook not found" });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching notebook:", error);
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
    const { name, description, category_id, subcategory_id, address, lat, lng, price_range, level, website, instagram, is_featured } = req.body;
    try {
      const result = await pool.query(`
        INSERT INTO places (name, description, category_id, subcategory_id, address, lat, lng, price_range, level, website, instagram, status, is_featured)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending', $12)
        RETURNING id
      `, [name, description, category_id, subcategory_id, address, lat, lng, price_range, level || 'debutant', website, instagram, is_featured ? 1 : 0]);
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
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = parseInt(process.env.PORT || "3000");
  const HOST = process.env.IP || "0.0.0.0";
  
  app.listen(PORT, HOST, () => {
    console.log(`Server running on ${HOST}:${PORT}`);
  });
}

startServer();
