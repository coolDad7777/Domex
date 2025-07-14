# Firebase Storage Setup Guide for Domex API

This guide will help you quickly set up Firebase storage integration with your Domex domain auction platform.

## Files Created

1. **`firebase-storage-integration.md`** - Complete documentation
2. **`DomainFileUpload.jsx`** - React component for file uploads
3. **`firebase-config.js`** - Firebase configuration template
4. **`example-usage.jsx`** - Example implementation
5. **`index.js`** - Updated with file handling API endpoints

## Quick Setup Steps

### 1. Install Dependencies

Update your Node.js project:

```bash
npm install mongodb cors
npm install -g nodemon  # Optional for development
```

For your React frontend, install Firebase:

```bash
npm install firebase
```

### 2. Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firebase Storage in your project
3. Copy your Firebase configuration to `firebase-config.js`
4. Set up Storage security rules (see example in `firebase-config.js`)

### 3. Backend Integration

Your `index.js` file has been updated with these new endpoints:

- `POST /api/domains/files` - Save file metadata
- `GET /api/domains/:domainId/files` - Get files for a domain
- `GET /api/files/:fileId` - Get specific file metadata
- `PUT /api/files/:fileId` - Update file metadata
- `DELETE /api/files/:fileId` - Delete a file
- `GET /api/files/stats` - Get upload statistics

### 4. Frontend Integration

Use the `DomainFileUpload` component in your React app:

```jsx
import DomainFileUpload from './DomainFileUpload';

<DomainFileUpload
  domainId="domain123"
  onUploadComplete={(result) => console.log('Upload done:', result)}
  allowedTypes={['image/*', 'application/pdf']}
  maxSizeBytes={10 * 1024 * 1024} // 10MB
/>
```

### 5. Test the Integration

1. Start your Node.js server:
   ```bash
   npm start
   ```

2. Test the API endpoints:
   ```bash
   # Get existing domains
   curl http://localhost:3000/domains
   
   # Test file metadata endpoint
   curl -X POST http://localhost:3000/api/domains/files \
     -H "Content-Type: application/json" \
     -d '{"domainId":"test123","fileName":"test.png","downloadURL":"https://example.com/test.png"}'
   ```

3. Integrate the React component into your frontend application

## Database Schema

The integration creates a new `domain_files` collection in your MongoDB:

```javascript
{
  "_id": ObjectId,
  "domainId": "string",
  "fileName": "original_file.png",
  "storedFileName": "domain123_1672531200000_original_file.png",
  "fileSize": 1024000,
  "fileType": "image/png",
  "storagePath": "domains/domain123/...",
  "downloadURL": "https://firebasestorage.googleapis.com/...",
  "uploadedAt": ISODate,
  "createdAt": ISODate,
  "isActive": true
}
```

## Features

✅ **Drag & Drop Upload** - Modern file upload interface  
✅ **Progress Tracking** - Real-time upload progress  
✅ **File Validation** - Type and size validation  
✅ **Error Handling** - Comprehensive error messaging  
✅ **API Integration** - Seamless backend integration  
✅ **File Management** - List, view, and delete files  
✅ **Responsive Design** - Mobile-friendly interface  
✅ **Security** - File type and size restrictions  

## Security Considerations

- Configure Firebase Storage security rules
- Validate file types on both client and server
- Implement file size limits
- Add user authentication if needed
- Consider virus scanning for uploads
- Implement rate limiting

## Next Steps

1. Set up your Firebase project and get configuration keys
2. Update `firebase-config.js` with your actual Firebase settings
3. Deploy your updated Node.js API
4. Integrate the React components into your frontend
5. Test the complete upload flow
6. Configure Firebase security rules for production

For detailed implementation instructions, see `firebase-storage-integration.md`.

## Troubleshooting

- **CORS Issues**: Make sure CORS is properly configured in your Express app
- **Firebase Auth**: Check your Firebase security rules and authentication setup
- **File Size**: Verify Firebase Storage quota and file size limits
- **API Errors**: Check server logs for detailed error messages

## Support

For questions about this integration, refer to:
- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)