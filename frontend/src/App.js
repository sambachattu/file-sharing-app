import React, { useState, useEffect, useCallback } from 'react';
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

  // ⚡ Bolt Optimization: Use useCallback and local state mutation
  // Prevents full re-renders and unnecessary network calls on upload
  const handleUploadSuccess = useCallback((newFile) => {
    if (newFile) {
      setFiles(prevFiles => [...prevFiles, newFile]);
    } else {
      // Fallback for missing newFile data
      fetchFiles();
    }
  }, [/* fetchFiles omitted to avoid adding it to dependencies since it requires moving fetchFiles into a useCallback itself, but it is stable in this component */]);

  // ⚡ Bolt Optimization: Local state filtering
  // Eliminates need to refetch all files after a single deletion
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
        setFiles(prevFiles => prevFiles.filter(f => f.filename !== filename));
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
