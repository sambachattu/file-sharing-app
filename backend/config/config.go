package config

import (
	"os"
)

type Config struct {
	Port        string
	UploadDir   string
	MaxFileSize int64
}

func LoadConfig() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "./uploads"
	}

	// Create upload directory if it doesn't exist
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		panic(err)
	}

	return &Config{
		Port:        port,
		UploadDir:   uploadDir,
		MaxFileSize: 100 * 1024 * 1024, // 100MB
	}
}
