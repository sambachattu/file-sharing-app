#!/bin/bash

echo "Setting up File Sharing App Backend..."
echo ""

cd backend

echo "Downloading Go dependencies and generating go.sum..."
go mod download
go mod tidy

echo ""
echo "✓ Dependencies downloaded successfully!"
echo ""
echo "You can now run the backend with: go run main.go"
echo "Or use Docker with: docker-compose up --build"
