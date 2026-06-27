import React, { memo } from 'react';
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

// ⚡ Bolt: Extract individual list items into a memoized component.
// This prevents O(N) DOM re-renders when the parent list updates but the item hasn't changed.
const FileItem = memo(({ file, onDelete }) => {
  const handleDownload = (downloadUrl, originalName) => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
  // ⚡ Bolt: Custom comparator is required because fetchFiles() generates
  // new object references for all files on every network request.
  // The ID is a unique UUID, so it's safe to use as the primary equality check,
  // but we also check size just in case the file content changes on the backend.
  return prevProps.file.id === nextProps.file.id &&
         prevProps.file.size === nextProps.file.size &&
         prevProps.onDelete === nextProps.onDelete;
});

// ⚡ Bolt: Memoize the entire list container so it doesn't re-render
// when the App's loading state toggles.
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

export default memo(FileList);
