import React, { useState, useEffect, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import './App.css';

function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = useCallback(async (background = false) => {
    if (!background) {
      setLoading(true);
    }
    try {
      const response = await fetch('/api/files/');
      const data = await response.json();
      if (data.success) {
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      if (!background) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUploadSuccess = useCallback(() => {
    fetchFiles(true);
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
        fetchFiles(true);
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
          <h2>Uploaded Files ({files.length}) {loading && <span className="loading-indicator">(Loading...)</span>}</h2>
          <FileList files={files} onDelete={handleDelete} />
        </div>
      </main>

      <footer className="App-footer">
        <p>Built with Go Fiber + React</p>
      </footer>
    </div>
  );
}

export default App;
