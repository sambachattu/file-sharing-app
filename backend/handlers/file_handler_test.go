package handlers

import (
	"bytes"
	"file-sharing-app/config"
	"file-sharing-app/services"
	"io"
	"mime/multipart"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
)

func TestUploadFile_InvalidExtension(t *testing.T) {
	tempDir := t.TempDir()
	cfg := &config.Config{
		UploadDir:   tempDir,
		MaxFileSize: 10 * 1024 * 1024,
	}
	svc := services.NewFileService(tempDir)
	handler := NewFileHandler(svc, cfg)

	app := fiber.New()
	app.Post("/upload", handler.UploadFile)

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("file", "test.exe")
	io.WriteString(part, "fake executable content")
	writer.Close()

	req := httptest.NewRequest("POST", "/upload", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Failed to test app: %v", err)
	}

	if resp.StatusCode != fiber.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", resp.StatusCode)
	}
}

func TestUploadFile_ValidExtension(t *testing.T) {
	tempDir := t.TempDir()
	cfg := &config.Config{
		UploadDir:   tempDir,
		MaxFileSize: 10 * 1024 * 1024,
	}
	svc := services.NewFileService(tempDir)
	handler := NewFileHandler(svc, cfg)

	app := fiber.New()
	app.Post("/upload", handler.UploadFile)

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("file", "test.txt")
	io.WriteString(part, "valid text content")
	writer.Close()

	req := httptest.NewRequest("POST", "/upload", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Failed to test app: %v", err)
	}

	if resp.StatusCode != fiber.StatusCreated {
		t.Errorf("Expected status 201, got %d", resp.StatusCode)
	}
}
