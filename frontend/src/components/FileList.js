import React, { useCallback } from 'react';
import FileItem from './FileItem';
import './FileList.css';

function FileList({ files, onDelete }) {
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
          mimeType={file.mimeType}
          size={file.size}
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
