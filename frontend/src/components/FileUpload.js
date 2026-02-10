import React, { useState } from 'react';
import './FileUpload.css';

function FileUpload({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setMessage('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setUploading(true);
    setUploadProgress(0);
    setMessage('');

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          setMessage('✓ File uploaded successfully!');
          setSelectedFile(null);
          setUploadProgress(0);
          onUploadSuccess();
          
          // Reset file input
          document.getElementById('file-input').value = '';
        } else {
          setMessage('✗ Upload failed. Please try again.');
        }
        setUploading(false);
      });

      xhr.addEventListener('error', () => {
        setMessage('✗ Upload failed. Please try again.');
        setUploading(false);
      });

      xhr.open('POST', '/api/files/upload');
      xhr.send(formData);
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage('✗ Upload failed. Please try again.');
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="file-upload">
      <div className="upload-area">
        <div className="upload-icon">📤</div>
        <h3>Upload File</h3>
        
        <input
          id="file-input"
          type="file"
          onChange={handleFileSelect}
          disabled={uploading}
          className="file-input"
        />
        
        {selectedFile && (
          <div className="file-info">
            <p><strong>Selected:</strong> {selectedFile.name}</p>
            <p><strong>Size:</strong> {formatFileSize(selectedFile.size)}</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="upload-button"
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>

        {uploading && (
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            >
              {uploadProgress}%
            </div>
          </div>
        )}

        {message && (
          <div className={`message ${message.includes('✓') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUpload;
