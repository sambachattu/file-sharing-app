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

func TestDeleteFile(t *testing.T) {
	t.Run("Delete non-existent file", func(t *testing.T) {
		tempDir := t.TempDir()
		fs := NewFileService(tempDir)

		err := fs.DeleteFile("does-not-exist.txt")
		if err == nil {
			t.Errorf("Expected error when deleting non-existent file, got nil")
		}
		if err != nil && err.Error() != "file not found" {
			t.Errorf("Expected 'file not found' error, got: %v", err)
		}
	})

	t.Run("Delete existing file successfully", func(t *testing.T) {
		tempDir := t.TempDir()
		fs := NewFileService(tempDir)

		filename := "test-delete.txt"

		// Create a physical file
		filePath := filepath.Join(tempDir, filename)
		if err := os.WriteFile(filePath, []byte("test content"), 0644); err != nil {
			t.Fatalf("Failed to create test file: %v", err)
		}

		// Add to FileService
		file, err := fs.SaveFile("test.txt", filename, 12, "text/plain")
		if err != nil {
			t.Fatalf("Failed to save file: %v", err)
		}

		// Delete the file
		err = fs.DeleteFile(filename)
		if err != nil {
			t.Errorf("Expected no error, got %v", err)
		}

		// Verify physical file is deleted
		if _, err := os.Stat(filePath); !os.IsNotExist(err) {
			t.Errorf("Expected physical file to be deleted, but it still exists or another error occurred: %v", err)
		}

		// Verify internal state
		fs.mu.RLock()
		_, existsInFiles := fs.files[file.ID]
		_, existsInMap := fs.filenameMap[filename]
		fs.mu.RUnlock()

		if existsInFiles {
			t.Errorf("Expected file to be removed from fs.files map")
		}
		if existsInMap {
			t.Errorf("Expected file to be removed from fs.filenameMap")
		}

		// Verify metadata.json
		metaFilePath := filepath.Join(tempDir, "metadata.json")
		data, err := os.ReadFile(metaFilePath)
		if err != nil {
			t.Fatalf("Expected metadata.json to be readable, got error: %v", err)
		}

		var metadata map[string]*models.File
		if err := json.Unmarshal(data, &metadata); err != nil {
			t.Fatalf("Expected metadata.json to be valid JSON, got error: %v", err)
		}

		if _, exists := metadata[file.ID]; exists {
			t.Errorf("Expected file to be removed from metadata.json")
		}
	})

	t.Run("Delete file missing on disk", func(t *testing.T) {
		tempDir := t.TempDir()
		fs := NewFileService(tempDir)

		filename := "test-missing-on-disk.txt"

		// Add to FileService without creating physical file
		_, err := fs.SaveFile("test.txt", filename, 12, "text/plain")
		if err != nil {
			t.Fatalf("Failed to save file: %v", err)
		}

		// Delete the file
		err = fs.DeleteFile(filename)
		if err == nil {
			t.Errorf("Expected error when deleting file missing on disk, got nil")
		}
	})
}
