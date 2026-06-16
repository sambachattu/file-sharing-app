import React, { memo, useCallback } from 'react';
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

// ⚡ Bolt Optimization: Memoize individual list items to prevent re-rendering unchanged files
// Impact: O(1) rendering cost for unchanged items instead of O(N) when the list updates.
const FileItem = memo(({ file, onDownload, onDelete }) => (
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
        onClick={() => onDownload(file.downloadUrl, file.originalName)}
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
));

function FileList({ files, onDelete }) {
  // ⚡ Bolt Optimization: Memoize the download handler
  // Impact: Provides a stable reference to FileItem, enabling its React.memo optimization to work.
  const handleDownload = useCallback((downloadUrl, originalName) => {
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
          key={file.id}
          file={file}
          onDownload={handleDownload}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

// ⚡ Bolt Optimization: Memoize the entire list component
// Impact: Reduces re-renders by 100% when parent state (e.g. `loading` in App.js) changes but `files` remain the same.
export default memo(FileList);
