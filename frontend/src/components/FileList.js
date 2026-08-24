import React from 'react';
import FileItem from './FileItem';
import './FileList.css';

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
        <FileItem
          key={file.id}
          originalName={file.originalName}
          size={file.size}
          mimeType={file.mimeType}
          uploadedAt={file.uploadedAt}
          downloadUrl={file.downloadUrl}
          filename={file.filename}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default FileList;
