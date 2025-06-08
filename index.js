// index.js
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔑 Store this in Render as MONGODB_URI (Settings → Environment Variables)
const uri = process.env.MONGODB_URI 
  || "mongodb+srv://cooldad7777:76qVwi1tBlGP0pAO@cluster0.an99cl5.mongodb.net/domex?retryWrites=true&w=majority&appName=Domex";

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
    app.get('/domains', async (_req, res) => {
      try {
        const db = client.db('domex');                  // database name
        const domains = await db
          .collection('domains')                        // collection name
          .find({})                                     // no filter = all docs
          .toArray();
        return res.json(domains);
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
