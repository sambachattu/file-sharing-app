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
	uploadDir   string
	files       map[string]*models.File
	filenameMap map[string]string // Maps filename to file ID for O(1) lookups
	mu          sync.RWMutex
	metaFile    string
	saveChan    chan struct{}
}

func NewFileService(uploadDir string) *FileService {
	fs := &FileService{
		uploadDir:   uploadDir,
		files:       make(map[string]*models.File),
		filenameMap: make(map[string]string),
		metaFile:    filepath.Join(uploadDir, "metadata.json"),
		saveChan:    make(chan struct{}, 1),
	}
	fs.loadMetadata()

	// Start background goroutine to save metadata asynchronously.
	// This removes synchronous disk I/O from the global mutex to improve throughput.
	go fs.metadataSaver()

	return fs
}

func (fs *FileService) metadataSaver() {
	for range fs.saveChan {
		// Drain any pending saves to avoid saving multiple times consecutively
		// when multiple updates happen in quick succession.
		for len(fs.saveChan) > 0 {
			<-fs.saveChan
		}

		fs.mu.RLock()
		data, err := json.MarshalIndent(fs.files, "", "  ")
		fs.mu.RUnlock()

		if err == nil {
			os.WriteFile(fs.metaFile, data, 0644)
		}
	}
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
	fs.filenameMap[file.Filename] = file.ID
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

	if fileID, ok := fs.filenameMap[filename]; ok {
		return fs.files[fileID]
	}

	return nil
}

func (fs *FileService) DeleteFile(filename string) error {
	fs.mu.Lock()
	defer fs.mu.Unlock()

	fileID, ok := fs.filenameMap[filename]
	if !ok {
		return fmt.Errorf("file not found")
	}

	// Delete physical file
	filePath := filepath.Join(fs.uploadDir, filename)
	if err := os.Remove(filePath); err != nil {
		return err
	}

	// Delete from memory
	delete(fs.files, fileID)
	delete(fs.filenameMap, filename)
	fs.saveMetadata()

	return nil
}

func (fs *FileService) saveMetadata() {
	// Signal to the background saver in a non-blocking way
	select {
	case fs.saveChan <- struct{}{}:
	default:
	}
}

func (fs *FileService) loadMetadata() {
	data, err := os.ReadFile(fs.metaFile)
	if err != nil {
		return
	}
	json.Unmarshal(data, &fs.files)

	// Rebuild filenameMap
	for id, file := range fs.files {
		fs.filenameMap[file.Filename] = id
	}
}
