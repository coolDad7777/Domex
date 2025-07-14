// firebase-config.js
// Firebase configuration for Domex domain auction platform

import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth'; // Optional: for user authentication

// Your Firebase project configuration
// Replace these values with your actual Firebase project settings
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Initialize Firebase Authentication (optional)
export const auth = getAuth(app);

export default app;

// Storage configuration constants
export const STORAGE_CONFIG = {
  // Maximum file size (10MB)
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  
  // Allowed file types for domain uploads
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: ['application/pdf'],
    ALL: ['image/*', 'application/pdf']
  },
  
  // Storage paths
  PATHS: {
    DOMAIN_FILES: 'domains',
    USER_UPLOADS: 'uploads',
    TEMP_FILES: 'temp'
  }
};

// Firebase Storage security rules example (to be added in Firebase Console)
/*
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload files to domains folder
    match /domains/{domainId}/{filename} {
      allow read: if true; // Public read access
      allow write: if request.auth != null 
                   && request.resource.size < 10 * 1024 * 1024 // 10MB limit
                   && request.resource.contentType.matches('image/.*|application/pdf');
    }
    
    // Allow authenticated users to manage their own uploads
    match /uploads/{userId}/{filename} {
      allow read, write: if request.auth != null && request.auth.uid == userId
                         && request.resource.size < 10 * 1024 * 1024;
    }
  }
}
*/