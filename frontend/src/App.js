import React, { useState, useEffect, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import './App.css';

function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // ⚡ Bolt: Memoize fetchFiles to keep its reference stable.
  // This is required so useCallback hooks that depend on it don't get recreated on every render.
  const fetchFiles = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // ⚡ Bolt: Memoize callback to prevent FileUpload from re-rendering
  // on every parent component state change (e.g., when loading changes).
  const handleUploadSuccess = useCallback(() => {
    fetchFiles();
  }, [fetchFiles]);

  // ⚡ Bolt: Memoize callback to prevent FileList and FileItems from re-rendering
  // unnecessarily when App.js re-renders.
  const handleDelete = useCallback(async (filename) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      const response = await fetch(`/api/files/${filename}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        fetchFiles();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    }
  }, [fetchFiles]);

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
