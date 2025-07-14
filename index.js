// index.js
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// Add middleware for JSON parsing
app.use(express.json());

// Add CORS middleware for frontend integration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

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

    // 📁 FILE UPLOAD ENDPOINTS FOR FIREBASE STORAGE INTEGRATION

    // POST /api/domains/files → Save file metadata after Firebase upload
    app.post('/api/domains/files', async (req, res) => {
      try {
        const {
          domainId,
          fileName,
          originalFileName,
          storedFileName,
          fileSize,
          fileType,
          storagePath,
          downloadURL,
          uploadedAt
        } = req.body;

        // Validate required fields
        if (!domainId || !fileName || !downloadURL) {
          return res.status(400).json({ 
            error: 'Missing required fields: domainId, fileName, downloadURL' 
          });
        }

        const db = client.db('domex');
        const result = await db.collection('domain_files').insertOne({
          domainId,
          fileName: originalFileName || fileName,
          storedFileName: storedFileName || fileName,
          fileSize: fileSize || 0,
          fileType: fileType || 'unknown',
          storagePath: storagePath || '',
          downloadURL,
          uploadedAt: uploadedAt ? new Date(uploadedAt) : new Date(),
          createdAt: new Date(),
          isActive: true
        });

        console.log(`📁 File metadata saved for domain ${domainId}: ${fileName}`);

        res.json({
          success: true,
          fileId: result.insertedId,
          message: 'File metadata saved successfully'
        });
      } catch (error) {
        console.error('Error saving file metadata:', error);
        res.status(500).json({ error: 'Failed to save file metadata' });
      }
    });

    // GET /api/domains/:domainId/files → Get all files for a domain
    app.get('/api/domains/:domainId/files', async (req, res) => {
      try {
        const { domainId } = req.params;
        const db = client.db('domex');
        
        const files = await db
          .collection('domain_files')
          .find({ domainId, isActive: true })
          .sort({ uploadedAt: -1 })
          .toArray();

        res.json({
          success: true,
          count: files.length,
          files
        });
      } catch (error) {
        console.error('Error fetching domain files:', error);
        res.status(500).json({ error: 'Failed to fetch domain files' });
      }
    });

    // GET /api/files/:fileId → Get specific file metadata
    app.get('/api/files/:fileId', async (req, res) => {
      try {
        const { fileId } = req.params;
        const db = client.db('domex');
        
        const file = await db.collection('domain_files').findOne({ 
          _id: new ObjectId(fileId),
          isActive: true
        });
        
        if (!file) {
          return res.status(404).json({ error: 'File not found' });
        }

        res.json({
          success: true,
          file
        });
      } catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).json({ error: 'Failed to fetch file' });
      }
    });

    // DELETE /api/files/:fileId → Mark file as deleted
    app.delete('/api/files/:fileId', async (req, res) => {
      try {
        const { fileId } = req.params;
        const db = client.db('domex');
        
        // Get file info first
        const file = await db.collection('domain_files').findOne({ 
          _id: new ObjectId(fileId),
          isActive: true
        });
        
        if (!file) {
          return res.status(404).json({ error: 'File not found' });
        }

        // Mark as inactive instead of deleting (soft delete)
        await db.collection('domain_files').updateOne(
          { _id: new ObjectId(fileId) },
          { 
            $set: { 
              isActive: false, 
              deletedAt: new Date() 
            } 
          }
        );

        console.log(`📁 File marked as deleted: ${file.fileName} (${fileId})`);

        res.json({ 
          success: true, 
          message: 'File deleted successfully',
          fileId 
        });
      } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Failed to delete file' });
      }
    });

    // PUT /api/files/:fileId → Update file metadata
    app.put('/api/files/:fileId', async (req, res) => {
      try {
        const { fileId } = req.params;
        const { fileName, tags, isPublic } = req.body;
        const db = client.db('domex');
        
        const updateFields = {
          updatedAt: new Date()
        };

        if (fileName) updateFields.fileName = fileName;
        if (tags) updateFields.tags = tags;
        if (typeof isPublic === 'boolean') updateFields.isPublic = isPublic;

        const result = await db.collection('domain_files').updateOne(
          { _id: new ObjectId(fileId), isActive: true },
          { $set: updateFields }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ error: 'File not found' });
        }

        res.json({ 
          success: true, 
          message: 'File updated successfully',
          fileId 
        });
      } catch (error) {
        console.error('Error updating file:', error);
        res.status(500).json({ error: 'Failed to update file' });
      }
    });

    // GET /api/files/stats → Get file upload statistics
    app.get('/api/files/stats', async (req, res) => {
      try {
        const db = client.db('domex');
        
        const stats = await db.collection('domain_files').aggregate([
          { $match: { isActive: true } },
          {
            $group: {
              _id: null,
              totalFiles: { $sum: 1 },
              totalSize: { $sum: '$fileSize' },
              fileTypes: { $addToSet: '$fileType' }
            }
          }
        ]).toArray();

        const result = stats[0] || {
          totalFiles: 0,
          totalSize: 0,
          fileTypes: []
        };

        res.json({
          success: true,
          stats: result
        });
      } catch (error) {
        console.error('Error fetching file stats:', error);
        res.status(500).json({ error: 'Failed to fetch file statistics' });
      }
    });

    app.listen(PORT, () => {
      console.log(`🚀 Domex API running on port ${PORT}`);
      console.log(`📁 File upload endpoints available at /api/domains/files`);
    });

  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
}

main();
