import React, { useCallback } from 'react';
import './FileList.css';
import FileItem from './FileItem';

function FileList({ files, onDelete }) {
  // ⚡ Bolt Optimization: useCallback prevents recreating handler on every render
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
          id={file.id}
          filename={file.filename}
          originalName={file.originalName}
          size={file.size}
          mimeType={file.mimeType}
          uploadedAt={file.uploadedAt}
          downloadUrl={file.downloadUrl}
          onDelete={onDelete}
          onDownload={handleDownload}
        />
      ))}
    </div>
  );
}

export default FileList;
