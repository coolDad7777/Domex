// index.js
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔑 Store this in Render as MONGODB_URI (Settings → Environment Variables)
const uri = process.env.MONGODB_URI;

// Create one MongoClient for the whole app with robust configuration
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Connection pool settings
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  
  // Timeout settings
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  
  // Retry settings
  retryWrites: true,
  retryReads: true
});

// Main startup
async function main() {
  try {
    if (!uri) {
      console.error("❌ MONGODB_URI environment variable is required");
      process.exit(1);
    }
    await client.connect();
    console.log("✅ Connected to MongoDB");

    // GET /domains → live data
    app.get('/domains', async (_req, res) => {
      try {
        // Check if client is connected, attempt reconnection if needed
        if (!client.topology || !client.topology.isConnected()) {
          console.log("🔄 Attempting to reconnect to MongoDB...");
          await client.connect();
          console.log("✅ Reconnected to MongoDB");
        }

        const db = client.db('domex');                  // database name
        const domains = await db
          .collection('domains')                        // collection name
          .find({})                                     // no filter = all docs
          .toArray();
        return res.json(domains);
      } catch (err) {
        console.error("Error fetching domains:", err);
        
        // Provide more specific error messages based on error type
        if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
          return res.status(503).json({ 
            error: "Database temporarily unavailable. Please try again later.",
            code: "DB_CONNECTION_ERROR"
          });
        } else if (err.name === 'MongoServerSelectionError') {
          return res.status(503).json({ 
            error: "Unable to connect to database server.",
            code: "DB_SERVER_ERROR"
          });
        }
        
        return res.status(500).json({ 
          error: "Unable to load domains",
          code: "INTERNAL_ERROR"
        });
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

// Graceful shutdown handling
async function gracefulShutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  
  try {
    if (client) {
      await client.close();
      console.log("✅ MongoDB connection closed");
    }
    console.log("👋 Process terminated");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
}

// Handle various termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // nodemon restart
