package services

import (
	"file-sharing-app/models"
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestDeleteFile_Success(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "file_service_test_*")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	fs := NewFileService(tempDir)

	// Create physical file
	filename := "test_file.txt"
	filePath := filepath.Join(tempDir, filename)
	err = os.WriteFile(filePath, []byte("test content"), 0644)
	if err != nil {
		t.Fatalf("Failed to write file: %v", err)
	}

	// Register file in memory directly
	fileID := "file-123"
	fs.files[fileID] = &models.File{
		ID:           fileID,
		OriginalName: "test_file.txt",
		Filename:     filename,
		Size:         12,
		MimeType:     "text/plain",
		UploadedAt:   time.Now(),
	}

	// Assert file exists physically
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		t.Fatalf("Expected file to exist before delete")
	}

	// Delete file
	err = fs.DeleteFile(filename)
	if err != nil {
		t.Fatalf("Expected no error on delete, got: %v", err)
	}

	// Assert physical file is deleted
	if _, err := os.Stat(filePath); !os.IsNotExist(err) {
		t.Errorf("Expected file to be physically deleted")
	}

	// Assert file is removed from memory
	if _, exists := fs.files[fileID]; exists {
		t.Errorf("Expected file to be removed from memory")
	}
}

func TestDeleteFile_FileNotFound(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "file_service_test_*")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	fs := NewFileService(tempDir)

	err = fs.DeleteFile("non_existent_file.txt")
	if err == nil {
		t.Errorf("Expected error when deleting non-existent file, got nil")
	} else if err.Error() != "file not found" {
		t.Errorf("Expected 'file not found' error, got: %v", err)
	}
}

func TestDeleteFile_RemoveError(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "file_service_test_*")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	fs := NewFileService(tempDir)

	filename := "test_file_missing_physical.txt"
	fileID := "file-456"

	// Register file in memory but don't create physical file
	fs.files[fileID] = &models.File{
		ID:           fileID,
		OriginalName: "test_file.txt",
		Filename:     filename,
		Size:         12,
		MimeType:     "text/plain",
		UploadedAt:   time.Now(),
	}

	// Delete file
	err = fs.DeleteFile(filename)
	if err == nil {
		t.Errorf("Expected error when physical file doesn't exist, got nil")
	}
}
