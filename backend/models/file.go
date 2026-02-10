package models

import "time"

type File struct {
	ID           string    `json:"id"`
	OriginalName string    `json:"originalName"`
	Filename     string    `json:"filename"`
	Size         int64     `json:"size"`
	MimeType     string    `json:"mimeType"`
	UploadedAt   time.Time `json:"uploadedAt"`
	DownloadURL  string    `json:"downloadUrl"`
}

type UploadResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	File    *File  `json:"file,omitempty"`
}

type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}
