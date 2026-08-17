import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import './App.css';

function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/files/');
      const data = await response.json();
      if (data.success) {
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // ⚡ Bolt: Using useCallback to prevent unnecessary re-renders of child components
  // and updating state directly instead of refetching all files
  const handleUploadSuccess = React.useCallback((newFile) => {
    if (!newFile) {
      // Fallback in case the new file is not provided
      fetchFiles();
      return;
    }
    setFiles(prevFiles => {
      // Handle non-deterministic backend sorting by prepending
      return [newFile, ...prevFiles];
    });
  }, []);

  // ⚡ Bolt: Using useCallback and updating state directly instead of refetching
  const handleDelete = React.useCallback(async (filename) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      const response = await fetch(`/api/files/${filename}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setFiles(prevFiles => prevFiles.filter(file => file.filename !== filename));
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>📁 File Sharing App</h1>
        <p>Upload and share files securely</p>
      </header>
      
      <main className="App-main">
        <FileUpload onUploadSuccess={handleUploadSuccess} />
        
        <div className="files-section">
          <h2>Uploaded Files ({files.length})</h2>
          {loading && files.length === 0 ? (
            <div className="loading">Loading files...</div>
          ) : (
            <>
              {loading && <div className="loading-indicator">Updating...</div>}
              <FileList files={files} onDelete={handleDelete} />
            </>
          )}
        </div>
      </main>

      <footer className="App-footer">
        <p>Built with Go Fiber + React</p>
      </footer>
    </div>
  );
}

export default App;
