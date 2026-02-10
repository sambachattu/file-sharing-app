package services

import (
	"encoding/json"
	"file-sharing-app/models"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/google/uuid"
)

type FileService struct {
	uploadDir string
	files     map[string]*models.File
	mu        sync.RWMutex
	metaFile  string
}

func NewFileService(uploadDir string) *FileService {
	fs := &FileService{
		uploadDir: uploadDir,
		files:     make(map[string]*models.File),
		metaFile:  filepath.Join(uploadDir, "metadata.json"),
	}
	fs.loadMetadata()
	return fs
}

func (fs *FileService) SaveFile(originalName string, filename string, size int64, mimeType string) (*models.File, error) {
	fs.mu.Lock()
	defer fs.mu.Unlock()

	file := &models.File{
		ID:           uuid.New().String(),
		OriginalName: originalName,
		Filename:     filename,
		Size:         size,
		MimeType:     mimeType,
		UploadedAt:   time.Now(),
		DownloadURL:  fmt.Sprintf("/api/files/%s/download", filename),
	}

	fs.files[file.ID] = file
	fs.saveMetadata()

	return file, nil
}

func (fs *FileService) GetAllFiles() []*models.File {
	fs.mu.RLock()
	defer fs.mu.RUnlock()

	files := make([]*models.File, 0, len(fs.files))
	for _, file := range fs.files {
		files = append(files, file)
	}

	return files
}

func (fs *FileService) GetFileByFilename(filename string) *models.File {
	fs.mu.RLock()
	defer fs.mu.RUnlock()

	for _, file := range fs.files {
		if file.Filename == filename {
			return file
		}
	}

	return nil
}

func (fs *FileService) DeleteFile(filename string) error {
	fs.mu.Lock()
	defer fs.mu.Unlock()

	var fileID string
	for id, file := range fs.files {
		if file.Filename == filename {
			fileID = id
			break
		}
	}

	if fileID == "" {
		return fmt.Errorf("file not found")
	}

	// Delete physical file
	filePath := filepath.Join(fs.uploadDir, filename)
	if err := os.Remove(filePath); err != nil {
		return err
	}

	// Delete from memory
	delete(fs.files, fileID)
	fs.saveMetadata()

	return nil
}

func (fs *FileService) saveMetadata() {
	data, err := json.MarshalIndent(fs.files, "", "  ")
	if err != nil {
		return
	}
	os.WriteFile(fs.metaFile, data, 0644)
}

func (fs *FileService) loadMetadata() {
	data, err := os.ReadFile(fs.metaFile)
	if err != nil {
		return
	}
	json.Unmarshal(data, &fs.files)
}
