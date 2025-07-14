# Firebase Storage Integration for Domex API

This document outlines how to integrate Firebase Storage with your Domex domain auction marketplace for handling file uploads such as domain logos, documentation, or verification documents.

## Overview

The integration consists of:
- **Client-side (React)**: File upload component using Firebase Storage
- **Server-side (Node.js)**: API endpoints to handle file metadata and associations
- **Database**: MongoDB collections to store file references

## Prerequisites

1. Firebase project setup with Storage enabled
2. Firebase configuration in your React frontend
3. Firebase Admin SDK in your Node.js backend (optional for server-side operations)

## Client-Side Implementation

### Firebase Configuration

First, set up your Firebase configuration:

```javascript
// firebase-config.js
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Your Firebase config
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
```

### Enhanced Upload Component

```javascript
// components/DomainFileUpload.jsx
import React, { useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';

const DomainFileUpload = ({ domainId, onUploadComplete, allowedTypes = ['image/*', 'application/pdf'] }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const storage = getStorage();

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const isValidType = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', '/'));
      }
      return file.type === type;
    });

    if (!isValidType) {
      setError(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Create unique filename
      const timestamp = Date.now();
      const fileName = `${domainId}_${timestamp}_${file.name}`;
      const storageRef = ref(storage, `domains/${domainId}/${fileName}`);

      // Upload with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          setError('Upload failed: ' + error.message);
          setUploading(false);
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Save file metadata to your API
            const fileMetadata = {
              domainId,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              storagePath: `domains/${domainId}/${fileName}`,
              downloadURL,
              uploadedAt: new Date().toISOString()
            };

            // Call your Domex API to save file metadata
            const response = await fetch('/api/domains/files', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(fileMetadata)
            });

            if (response.ok) {
              const result = await response.json();
              onUploadComplete && onUploadComplete(result);
              setUploading(false);
              setProgress(0);
              // Reset file input
              event.target.value = '';
            } else {
              throw new Error('Failed to save file metadata');
            }
          } catch (error) {
            setError('Failed to save file information: ' + error.message);
            setUploading(false);
          }
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed: ' + error.message);
      setUploading(false);
    }
  };

  return (
    <div className="domain-file-upload">
      <div className="upload-area">
        <input
          type="file"
          onChange={handleUpload}
          disabled={uploading}
          accept={allowedTypes.join(',')}
          id="file-upload"
        />
        <label htmlFor="file-upload" className={`upload-button ${uploading ? 'disabled' : ''}`}>
          {uploading ? 'Uploading...' : 'Choose File'}
        </label>
      </div>

      {uploading && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          <span>{Math.round(progress)}%</span>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default DomainFileUpload;
```

## Server-Side Integration

### Updated package.json Dependencies

Add these dependencies to your `package.json`:

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongodb": "^6.0.0",
    "firebase-admin": "^12.0.0",
    "multer": "^1.4.5-lts.1",
    "cors": "^2.8.5"
  }
}
```

### API Endpoints for File Management

```javascript
// Add to your index.js or create a separate routes file

// File metadata endpoint
app.post('/api/domains/files', async (req, res) => {
  try {
    const {
      domainId,
      fileName,
      fileSize,
      fileType,
      storagePath,
      downloadURL,
      uploadedAt
    } = req.body;

    const db = client.db('domex');
    const result = await db.collection('domain_files').insertOne({
      domainId,
      fileName,
      fileSize,
      fileType,
      storagePath,
      downloadURL,
      uploadedAt: new Date(uploadedAt),
      createdAt: new Date()
    });

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

// Get files for a domain
app.get('/api/domains/:domainId/files', async (req, res) => {
  try {
    const { domainId } = req.params;
    const db = client.db('domex');
    
    const files = await db
      .collection('domain_files')
      .find({ domainId })
      .sort({ uploadedAt: -1 })
      .toArray();

    res.json(files);
  } catch (error) {
    console.error('Error fetching domain files:', error);
    res.status(500).json({ error: 'Failed to fetch domain files' });
  }
});

// Delete a file
app.delete('/api/domains/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const db = client.db('domex');
    
    // Get file info first
    const file = await db.collection('domain_files').findOne({ 
      _id: new require('mongodb').ObjectId(fileId) 
    });
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete from Firebase Storage (optional - requires Firebase Admin SDK)
    // const bucket = admin.storage().bucket();
    // await bucket.file(file.storagePath).delete();

    // Delete from database
    await db.collection('domain_files').deleteOne({ 
      _id: new require('mongodb').ObjectId(fileId) 
    });

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});
```

## Database Schema

### domain_files Collection

```javascript
{
  "_id": ObjectId("..."),
  "domainId": "string", // Reference to domain
  "fileName": "logo.png",
  "fileSize": 1024000, // Size in bytes
  "fileType": "image/png",
  "storagePath": "domains/domain123/domain123_1672531200000_logo.png",
  "downloadURL": "https://firebasestorage.googleapis.com/...",
  "uploadedAt": ISODate("2023-01-01T12:00:00.000Z"),
  "createdAt": ISODate("2023-01-01T12:00:00.000Z"),
  "tags": ["logo", "branding"], // Optional categorization
  "isPublic": true // Whether file is publicly accessible
}
```

## Security Considerations

1. **Firebase Security Rules**: Configure proper security rules in Firebase Storage
2. **File Validation**: Always validate file types and sizes on both client and server
3. **Authentication**: Implement user authentication before allowing uploads
4. **Rate Limiting**: Add rate limiting to prevent abuse
5. **Virus Scanning**: Consider integrating virus scanning for uploaded files

## Usage Examples

### Domain Logo Upload

```javascript
// In your domain management component
const handleLogoUpload = (fileData) => {
  // Update domain with logo URL
  updateDomain(domainId, { logoUrl: fileData.downloadURL });
};

<DomainFileUpload
  domainId={domain._id}
  onUploadComplete={handleLogoUpload}
  allowedTypes={['image/jpeg', 'image/png', 'image/gif']}
/>
```

### Document Upload

```javascript
// For verification documents
<DomainFileUpload
  domainId={domain._id}
  onUploadComplete={(fileData) => console.log('Document uploaded:', fileData)}
  allowedTypes={['application/pdf', 'image/*']}
/>
```

## Testing

Use tools like Postman to test your API endpoints:

```bash
# Test file metadata saving
POST http://localhost:3000/api/domains/files
Content-Type: application/json

{
  "domainId": "test123",
  "fileName": "test.png",
  "fileSize": 1024,
  "fileType": "image/png",
  "storagePath": "domains/test123/test.png",
  "downloadURL": "https://example.com/test.png",
  "uploadedAt": "2023-01-01T12:00:00.000Z"
}
```

This integration provides a robust file upload system that scales with your domain auction marketplace while maintaining security and performance.