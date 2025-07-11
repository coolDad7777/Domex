// index.js
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔑 Store this in Render as MONGODB_URI (Settings → Environment Variables)
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("❌ MONGODB_URI environment variable is required but not set.");
  process.exit(1);
}

// Create one MongoClient for the whole app
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Main startup
async function main() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    // GET /domains → live data
    app.get('/domains', async (req, res) => {
      try {
        const db = client.db('domex');                  // database name
        // Pagination parameters
        const limit = Math.min(parseInt(req.query.limit) || 20, 100); // default 20, max 100
        const skip = parseInt(req.query.skip) || 0;
        const domains = await db
          .collection('domains')                        // collection name
          .find({})                                     // no filter = all docs
          .skip(skip)
          .limit(limit)
          .toArray();
        // Map _id to id for consistency with sample data
        const mappedDomains = domains.map(d => ({
          id: d._id ? d._id.toString() : d.id,
          ...d,
        }));
        mappedDomains.forEach(d => { delete d._id; });
        return res.json(mappedDomains);
      } catch (err) {
        console.error("Error fetching domains:", err);
        return res.status(500).json({ error: "Unable to load domains" });
      }
    });

    // Optional root endpoint
    app.get('/', (_req, res) => {
      res.send("Domex API – hit /domains for live data");
    });

    app.listen(PORT, () => {
      console.log(`🚀 Domex API running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
}

main();
