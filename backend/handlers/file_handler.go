package handlers

import (
	"file-sharing-app/config"
	"file-sharing-app/models"
	"file-sharing-app/services"
	"fmt"
	"os"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type FileHandler struct {
	service *services.FileService
	config  *config.Config
}

func NewFileHandler(service *services.FileService, cfg *config.Config) *FileHandler {
	return &FileHandler{
		service: service,
		config:  cfg,
	}
}

func (h *FileHandler) UploadFile(c *fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Success: false,
			Message: "No file uploaded",
		})
	}

	// Check file size
	if file.Size > h.config.MaxFileSize {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Success: false,
			Message: "File size exceeds maximum allowed size",
		})
	}

	// Generate unique filename
	ext := filepath.Ext(file.Filename)
	newFilename := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	filePath := filepath.Join(h.config.UploadDir, newFilename)

	// Save file to disk
	if err := c.SaveFile(file, filePath); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Success: false,
			Message: "Failed to save file",
		})
	}

	// Save metadata
	savedFile, err := h.service.SaveFile(file.Filename, newFilename, file.Size, file.Header.Get("Content-Type"))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Success: false,
			Message: "Failed to save file metadata",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(models.UploadResponse{
		Success: true,
		Message: "File uploaded successfully",
		File:    savedFile,
	})
}

func (h *FileHandler) GetFiles(c *fiber.Ctx) error {
	files := h.service.GetAllFiles()
	return c.JSON(fiber.Map{
		"success": true,
		"files":   files,
	})
}

func (h *FileHandler) DownloadFile(c *fiber.Ctx) error {
	filename := c.Params("filename")
	file := h.service.GetFileByFilename(filename)

	if file == nil {
		return c.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{
			Success: false,
			Message: "File not found",
		})
	}

	filePath := filepath.Join(h.config.UploadDir, filename)
	
	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return c.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{
			Success: false,
			Message: "File not found on disk",
		})
	}
	
	// Set proper headers for download
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", file.OriginalName))
	if file.MimeType != "" {
		c.Set("Content-Type", file.MimeType)
	}
	
	return c.SendFile(filePath)
}

func (h *FileHandler) DeleteFile(c *fiber.Ctx) error {
	filename := c.Params("filename")

	if err := h.service.DeleteFile(filename); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{
			Success: false,
			Message: "File not found",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "File deleted successfully",
	})
}
