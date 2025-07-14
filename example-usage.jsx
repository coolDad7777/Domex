// example-usage.jsx
// Example of how to use the DomainFileUpload component in your Domex application

import React, { useState, useEffect } from 'react';
import DomainFileUpload from './DomainFileUpload';

const DomainManagement = ({ domainId }) => {
  const [domain, setDomain] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    // Fetch domain data and existing files
    fetchDomainData();
    fetchDomainFiles();
  }, [domainId]);

  const fetchDomainData = async () => {
    try {
      // This would fetch from your /domains endpoint
      const response = await fetch(`/domains`);
      const domains = await response.json();
      const currentDomain = domains.find(d => d._id === domainId);
      setDomain(currentDomain);
    } catch (error) {
      console.error('Error fetching domain:', error);
    }
  };

  const fetchDomainFiles = async () => {
    try {
      const response = await fetch(`/api/domains/${domainId}/files`);
      const data = await response.json();
      if (data.success) {
        setFiles(data.files);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleUploadComplete = (result) => {
    console.log('File uploaded successfully:', result);
    
    // Show success message
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
    
    // Refresh the files list
    fetchDomainFiles();
    
    // If it's a logo upload, update domain data
    if (result.fileMetadata.fileType.startsWith('image/')) {
      setDomain(prev => ({
        ...prev,
        logoUrl: result.fileMetadata.downloadURL
      }));
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Remove file from local state
        setFiles(prev => prev.filter(f => f._id !== fileId));
      } else {
        alert('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!domain) {
    return <div>Loading domain information...</div>;
  }

  return (
    <div className="domain-management">
      <h2>Manage Domain: {domain.name}</h2>
      
      {uploadSuccess && (
        <div className="success-message">
          ✅ File uploaded successfully!
        </div>
      )}

      {/* Domain Logo Upload */}
      <section className="logo-section">
        <h3>Domain Logo</h3>
        {domain.logoUrl && (
          <div className="current-logo">
            <img src={domain.logoUrl} alt="Domain logo" style={{ maxWidth: '200px', maxHeight: '100px' }} />
          </div>
        )}
        <DomainFileUpload
          domainId={domainId}
          onUploadComplete={handleUploadComplete}
          allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
          maxSizeBytes={5 * 1024 * 1024} // 5MB for images
        />
      </section>

      {/* Documentation Upload */}
      <section className="documents-section">
        <h3>Upload Documents</h3>
        <p>Upload verification documents, certificates, or other relevant files.</p>
        <DomainFileUpload
          domainId={domainId}
          onUploadComplete={handleUploadComplete}
          allowedTypes={['application/pdf', 'image/*']}
          maxSizeBytes={10 * 1024 * 1024} // 10MB for documents
        />
      </section>

      {/* Files List */}
      <section className="files-section">
        <h3>Uploaded Files ({files.length})</h3>
        {files.length === 0 ? (
          <p>No files uploaded yet.</p>
        ) : (
          <div className="files-list">
            {files.map(file => (
              <div key={file._id} className="file-item">
                <div className="file-info">
                  <div className="file-name">
                    <strong>{file.fileName}</strong>
                    <span className="file-type">({file.fileType})</span>
                  </div>
                  <div className="file-details">
                    <span>Size: {formatFileSize(file.fileSize)}</span>
                    <span>Uploaded: {formatDate(file.uploadedAt)}</span>
                  </div>
                </div>
                <div className="file-actions">
                  <a 
                    href={file.downloadURL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="view-button"
                  >
                    View
                  </a>
                  <button 
                    onClick={() => handleDeleteFile(file._id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <style jsx>{`
        .domain-management {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .success-message {
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .logo-section, .documents-section, .files-section {
          margin-bottom: 40px;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background-color: #f9f9f9;
        }

        .current-logo {
          margin-bottom: 15px;
          padding: 10px;
          background-color: white;
          border-radius: 6px;
          display: inline-block;
        }

        .files-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .file-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background-color: white;
          border-radius: 6px;
          border: 1px solid #ddd;
        }

        .file-info {
          flex: 1;
        }

        .file-name {
          margin-bottom: 5px;
        }

        .file-type {
          color: #666;
          font-size: 14px;
          margin-left: 8px;
        }

        .file-details {
          font-size: 14px;
          color: #666;
          display: flex;
          gap: 15px;
        }

        .file-actions {
          display: flex;
          gap: 10px;
        }

        .view-button, .delete-button {
          padding: 6px 12px;
          border-radius: 4px;
          text-decoration: none;
          font-size: 14px;
          border: none;
          cursor: pointer;
        }

        .view-button {
          background-color: #007bff;
          color: white;
        }

        .view-button:hover {
          background-color: #0056b3;
        }

        .delete-button {
          background-color: #dc3545;
          color: white;
        }

        .delete-button:hover {
          background-color: #c82333;
        }

        @media (max-width: 600px) {
          .file-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .file-actions {
            align-self: stretch;
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

// Example of how to use it in your main app
const App = () => {
  const [selectedDomain, setSelectedDomain] = useState('domain123'); // Example domain ID

  return (
    <div>
      <h1>Domex Domain Auction Platform</h1>
      <DomainManagement domainId={selectedDomain} />
    </div>
  );
};

export default App;