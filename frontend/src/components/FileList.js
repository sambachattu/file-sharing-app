import React from 'react';
import './FileList.css';

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
  if ((mimeType && mimeType.includes('zip')) || (mimeType && mimeType.includes('rar'))) return '📦';
  if (filename && filename.endsWith('.txt')) return '📝';
  return '📁';
};

// ⚡ Bolt Optimization: Destructure props and use React.memo to prevent unnecessary re-renders
const FileItem = React.memo(({ originalName, mimeType, size, uploadedAt, downloadUrl, filename, onDownload, onDelete }) => (
  <div className="file-item">
    <div className="file-icon">
      {getFileIcon(mimeType, originalName)}
    </div>

    <div className="file-details">
      <h4 className="file-name">{originalName}</h4>
      <div className="file-meta">
        <span>{formatFileSize(size)}</span>
        <span>•</span>
        <span>{formatDate(uploadedAt)}</span>
      </div>
    </div>

    <div className="file-actions">
      <button
        onClick={() => onDownload(downloadUrl, originalName)}
        className="action-button download"
        title="Download"
      >
        ⬇️ Download
      </button>
      <button
        onClick={() => onDelete(filename)}
        className="action-button delete"
        title="Delete"
      >
        🗑️ Delete
      </button>
    </div>
  </div>
));

function FileList({ files, onDelete }) {
  const handleDownload = React.useCallback((downloadUrl, originalName) => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

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
        <FileItem
          key={file.filename}
          originalName={file.originalName}
          mimeType={file.mimeType}
          size={file.size}
          uploadedAt={file.uploadedAt}
          downloadUrl={file.downloadUrl}
          filename={file.filename}
          onDownload={handleDownload}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default FileList;
