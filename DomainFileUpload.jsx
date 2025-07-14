import React, { useState } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const DomainFileUpload = ({ 
  domainId, 
  onUploadComplete, 
  allowedTypes = ['image/*', 'application/pdf'],
  maxSizeBytes = 10 * 1024 * 1024, // 10MB default
  apiEndpoint = '/api/domains/files'
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const storage = getStorage();

  const validateFile = (file) => {
    // Validate file type
    const isValidType = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', '/'));
      }
      return file.type === type;
    });

    if (!isValidType) {
      return `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`;
    }

    // Validate file size
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${Math.round(maxSizeBytes / (1024 * 1024))}MB`;
    }

    return null;
  };

  const uploadFile = async (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Create unique filename with timestamp
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFileName = `${domainId}_${timestamp}_${sanitizedFileName}`;
      const storageRef = ref(storage, `domains/${domainId}/${uniqueFileName}`);

      // Upload with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progressPercent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progressPercent);
        },
        (error) => {
          console.error('Upload error:', error);
          setError(`Upload failed: ${error.message}`);
          setUploading(false);
        },
        async () => {
          try {
            // Get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Prepare file metadata
            const fileMetadata = {
              domainId,
              fileName: file.name,
              originalFileName: file.name,
              storedFileName: uniqueFileName,
              fileSize: file.size,
              fileType: file.type,
              storagePath: `domains/${domainId}/${uniqueFileName}`,
              downloadURL,
              uploadedAt: new Date().toISOString()
            };

            // Save metadata to your Domex API
            const response = await fetch(apiEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(fileMetadata)
            });

            if (!response.ok) {
              throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            
            // Reset state
            setUploading(false);
            setProgress(0);
            
            // Notify parent component
            if (onUploadComplete) {
              onUploadComplete({
                ...result,
                fileMetadata
              });
            }

          } catch (error) {
            console.error('Error saving file metadata:', error);
            setError(`Failed to save file information: ${error.message}`);
            setUploading(false);
          }
        }
      );
    } catch (error) {
      console.error('Upload initialization error:', error);
      setError(`Upload failed: ${error.message}`);
      setUploading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="domain-file-upload">
      <div 
        className={`upload-area ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {!uploading ? (
          <>
            <input
              type="file"
              onChange={handleFileSelect}
              disabled={uploading}
              accept={allowedTypes.join(',')}
              id={`file-upload-${domainId}`}
              style={{ display: 'none' }}
            />
            <label htmlFor={`file-upload-${domainId}`} className="upload-content">
              <div className="upload-icon">📁</div>
              <div className="upload-text">
                <p><strong>Choose a file</strong> or drag it here</p>
                <p className="upload-info">
                  Max size: {formatFileSize(maxSizeBytes)}<br/>
                  Allowed types: {allowedTypes.join(', ')}
                </p>
              </div>
            </label>
          </>
        ) : (
          <div className="upload-progress">
            <div className="progress-info">
              <span>Uploading... {Math.round(progress)}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <style jsx>{`
        .domain-file-upload {
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
        }

        .upload-area {
          border: 2px dashed #ccc;
          border-radius: 10px;
          padding: 40px 20px;
          text-align: center;
          transition: all 0.3s ease;
          background-color: #fafafa;
          cursor: pointer;
        }

        .upload-area:hover {
          border-color: #007bff;
          background-color: #f0f8ff;
        }

        .upload-area.drag-over {
          border-color: #007bff;
          background-color: #e3f2fd;
          transform: scale(1.02);
        }

        .upload-area.uploading {
          cursor: not-allowed;
          border-color: #28a745;
          background-color: #f8fff9;
        }

        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          cursor: pointer;
        }

        .upload-icon {
          font-size: 48px;
          opacity: 0.6;
        }

        .upload-text p {
          margin: 0;
          color: #333;
        }

        .upload-info {
          font-size: 14px;
          color: #666;
          line-height: 1.4;
        }

        .upload-progress {
          padding: 20px 0;
        }

        .progress-info {
          margin-bottom: 10px;
          font-weight: 500;
          color: #28a745;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background-color: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background-color: #28a745;
          transition: width 0.3s ease;
          border-radius: 4px;
        }

        .error-message {
          margin-top: 15px;
          padding: 12px 16px;
          background-color: #fee;
          border: 1px solid #fcc;
          border-radius: 6px;
          color: #c33;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .error-icon {
          font-size: 16px;
        }

        @media (max-width: 600px) {
          .upload-area {
            padding: 30px 15px;
          }
          
          .upload-icon {
            font-size: 36px;
          }
          
          .upload-text p {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default DomainFileUpload;