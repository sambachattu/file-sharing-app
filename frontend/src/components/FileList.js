import React from 'react';
import './FileList.css';

function FileList({ files, onDelete }) {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getFileIcon = (mimeType, filename) => {
    if (mimeType && mimeType.startsWith('image/')) return '🖼️';
    if (mimeType && mimeType.startsWith('video/')) return '🎥';
    if (mimeType && mimeType.startsWith('audio/')) return '🎵';
    if (mimeType && mimeType.includes('pdf')) return '📄';
    if (mimeType && mimeType.includes('zip') || mimeType && mimeType.includes('rar')) return '📦';
    if (filename && filename.endsWith('.txt')) return '📝';
    return '📁';
  };

  const handleDownload = (downloadUrl, originalName) => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (files.length === 0) {
    return (
      <div className="no-files">
        <p>No files uploaded yet. Upload your first file above!</p>
      </div>
    );
  }

  return (
    <div className="file-list">
      {files.map((file) => (
        <div key={file.id} className="file-item">
          <div className="file-icon">
            {getFileIcon(file.mimeType, file.originalName)}
          </div>
          
          <div className="file-details">
            <h4 className="file-name">{file.originalName}</h4>
            <div className="file-meta">
              <span>{formatFileSize(file.size)}</span>
              <span>•</span>
              <span>{formatDate(file.uploadedAt)}</span>
            </div>
          </div>

          <div className="file-actions">
            <button
              onClick={() => handleDownload(file.downloadUrl, file.originalName)}
              className="action-button download"
              title="Download"
            >
              ⬇️ Download
            </button>
            <button
              onClick={() => onDelete(file.filename)}
              className="action-button delete"
              title="Delete"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FileList;
