import React, { memo } from 'react';
import './FileList.css';

// Move utility functions outside the component so they are not re-created on every render
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

const handleDownload = (downloadUrl, originalName) => {
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = originalName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const FileItem = memo(({ file, onDelete }) => {
  return (
    <div className="file-item">
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
  );
}, (prevProps, nextProps) => {
  // Custom equality function: avoid re-rendering if the file ID is the same
  // The API returns new objects every time, so shallow comparison would fail.
  return prevProps.file.id === nextProps.file.id && prevProps.onDelete === nextProps.onDelete;
});

function FileList({ files, onDelete }) {
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
        <FileItem key={file.id} file={file} onDelete={onDelete} />
      ))}
    </div>
  );
}

export default FileList;
