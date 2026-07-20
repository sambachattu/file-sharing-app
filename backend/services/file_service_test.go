package services

import (
	"encoding/json"
	"file-sharing-app/models"
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestSaveFile(t *testing.T) {
	tempDir := t.TempDir()

	fs := NewFileService(tempDir)

	originalName := "test_document.txt"
	filename := "uuid-test-document.txt"
	var size int64 = 1024
	mimeType := "text/plain"

	file, err := fs.SaveFile(originalName, filename, size, mimeType)

	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if file == nil {
		t.Fatalf("Expected file to be returned, got nil")
	}

	if file.ID == "" {
		t.Errorf("Expected file ID to be generated, got empty string")
	}
	if file.OriginalName != originalName {
		t.Errorf("Expected OriginalName %q, got %q", originalName, file.OriginalName)
	}
	if file.Filename != filename {
		t.Errorf("Expected Filename %q, got %q", filename, file.Filename)
	}
	if file.Size != size {
		t.Errorf("Expected Size %d, got %d", size, file.Size)
	}
	if file.MimeType != mimeType {
		t.Errorf("Expected MimeType %q, got %q", mimeType, file.MimeType)
	}
	if file.DownloadURL != "/api/files/"+filename+"/download" {
		t.Errorf("Expected DownloadURL to be correctly formatted, got %q", file.DownloadURL)
	}
	if time.Since(file.UploadedAt) > time.Second {
		t.Errorf("Expected UploadedAt to be recent, got %v", file.UploadedAt)
	}

	// Check internal state
	fs.mu.RLock()
	storedFile, exists := fs.files[file.ID]
	fs.mu.RUnlock()

	if !exists {
		t.Errorf("Expected file to be stored in fs.files map")
	}
	if storedFile != file {
		t.Errorf("Expected stored file to match returned file")
	}

	// Check metadata.json creation
	metaFilePath := filepath.Join(tempDir, "metadata.json")
	data, err := os.ReadFile(metaFilePath)
	if err != nil {
		t.Fatalf("Expected metadata.json to be readable, got error: %v", err)
	}

	var metadata map[string]*models.File
	if err := json.Unmarshal(data, &metadata); err != nil {
		t.Fatalf("Expected metadata.json to be valid JSON, got error: %v", err)
	}

	metaFile, exists := metadata[file.ID]
	if !exists {
		t.Errorf("Expected file to be present in metadata.json")
	}
	if metaFile.Filename != filename {
		t.Errorf("Expected filename in metadata.json to match, got %q", metaFile.Filename)
	}
}

func TestGetAllFiles(t *testing.T) {
	tempDir := t.TempDir()
	fs := NewFileService(tempDir)

	// Initially empty
	files := fs.GetAllFiles()
	if len(files) != 0 {
		t.Fatalf("Expected 0 files initially, got %d", len(files))
	}

	// Add some files
	_, err := fs.SaveFile("file1.txt", "uuid-file1.txt", 100, "text/plain")
	if err != nil {
		t.Fatalf("Failed to save file1: %v", err)
	}
	_, err = fs.SaveFile("file2.png", "uuid-file2.png", 200, "image/png")
	if err != nil {
		t.Fatalf("Failed to save file2: %v", err)
	}
	_, err = fs.SaveFile("file3.pdf", "uuid-file3.pdf", 300, "application/pdf")
	if err != nil {
		t.Fatalf("Failed to save file3: %v", err)
	}

	// Get all files
	files = fs.GetAllFiles()

	if len(files) != 3 {
		t.Fatalf("Expected 3 files, got %d", len(files))
	}

	// Verify that the files returned contain the ones we added (order is not guaranteed)
	fileNames := make(map[string]bool)
	for _, f := range files {
		fileNames[f.OriginalName] = true
	}

	expectedNames := []string{"file1.txt", "file2.png", "file3.pdf"}
	for _, name := range expectedNames {
		if !fileNames[name] {
			t.Errorf("Expected file %q to be in the result", name)
		}
	}
}
