# Important Note About go.sum

The `go.sum` file has been intentionally omitted from this project because checksums can vary based on Go version and platform.

When you build the project (either locally or with Docker), Go will automatically generate the correct `go.sum` file with the appropriate checksums for your environment.

## What happens during build:

1. **Docker build**: The Dockerfile runs `go mod download && go mod verify` which automatically creates the correct go.sum file
2. **Local development**: Running `go mod download` or `go run main.go` will generate go.sum automatically

## If you see checksum errors:

If you encounter checksum mismatch errors, simply delete the go.sum file and let Go regenerate it:

```bash
cd backend
rm go.sum
go mod download
```

This is a common and safe practice, especially for new projects or when sharing code across different platforms.
