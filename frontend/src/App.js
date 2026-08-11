import React, { useState, useEffect, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import './App.css';

function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleUploadSuccess = useCallback((newFile) => {
    if (newFile) {
      setFiles((prev) => [...prev, newFile]);
    } else {
      fetchFiles(); // Fallback if no file is returned
    }
  }, [fetchFiles]);

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
        setFiles((prev) => prev.filter((f) => f.filename !== filename));
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
