# 📁 File Sharing Application

A modern, full-stack file sharing application built with **Go Fiber** (backend) and **React** (frontend). Upload, download, and manage files with ease through a beautiful, responsive interface.

## 🚀 Features

- ✅ **File Upload** - Upload files up to 100MB with progress tracking
- ✅ **File Download** - Download uploaded files with original filenames
- ✅ **File Management** - View all uploaded files with metadata
- ✅ **File Deletion** - Remove files you no longer need
- ✅ **Responsive UI** - Works perfectly on desktop and mobile devices
- ✅ **Real-time Progress** - See upload progress in real-time
- ✅ **File Metadata** - Track file size, type, and upload timestamp
- ✅ **RESTful API** - Clean and well-structured API endpoints
- ✅ **Docker Support** - Easy deployment with Docker and Docker Compose

## 🏗️ Project Structure

```
file-sharing-app/
├── backend/                    # Go Fiber Backend
│   ├── config/                 # Configuration files
│   │   └── config.go
│   ├── handlers/               # HTTP request handlers
│   │   └── file_handler.go
│   ├── models/                 # Data models
│   │   └── file.go
│   ├── routes/                 # Route definitions
│   │   └── routes.go
│   ├── services/               # Business logic
│   │   └── file_service.go
│   ├── uploads/                # Uploaded files storage
│   ├── main.go                 # Application entry point
│   ├── go.mod                  # Go dependencies
│   ├── Dockerfile              # Backend Docker image
│   └── .gitignore
│
├── frontend/                   # React Frontend
│   ├── public/                 # Static files
│   │   └── index.html
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── FileUpload.js
│   │   │   ├── FileUpload.css
│   │   │   ├── FileList.js
│   │   │   └── FileList.css
│   │   ├── App.js              # Main App component
│   │   ├── App.css
│   │   ├── index.js            # React entry point
│   │   └── index.css
│   ├── package.json            # Node dependencies
│   ├── Dockerfile              # Frontend Docker image
│   ├── nginx.conf              # Nginx configuration
│   └── .gitignore
│
├── docker-compose.yml          # Docker Compose configuration
├── .gitignore
└── README.md                   # This file
```

## 🛠️ Technology Stack

### Backend
- **Go 1.21+** - Programming language
- **Fiber v2** - Fast, Express-inspired web framework
- **UUID** - Unique file identification

### Frontend
- **React 18** - UI library
- **CSS3** - Styling with modern gradients and animations
- **Axios** - HTTP client (via fetch API)

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and static file serving

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (version 20.10+)
- **Docker Compose** (version 2.0+)

OR for local development:

- **Go** (version 1.21+)
- **Node.js** (version 18+)
- **npm** (version 9+)

## 🚀 Quick Start with Docker (Recommended)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd file-sharing-app
```

### 2. Start the Application
```bash
docker-compose up --build
```

This command will:
- Build the backend Go application
- Build the frontend React application
- Start both services with proper networking
- Expose the application on port 3000

### 3. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

The API is also accessible at:
```
http://localhost:8080/api
```

### 4. Stop the Application
```bash
docker-compose down
```

To also remove volumes (uploaded files):
```bash
docker-compose down -v
```

## 💻 Local Development Setup

### Important: First Time Setup

Before running locally, you **must** generate the `go.sum` file:

**Option 1 - Use Setup Script:**

Windows:
```bash
setup.bat
```

Mac/Linux:
```bash
chmod +x setup.sh
./setup.sh
```

**Option 2 - Manual Setup:**
```bash
cd backend
go mod download
go mod tidy
```

This generates the `go.sum` file with correct checksums for your Go version.

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install Go dependencies**
```bash
go mod download
```

3. **Run the backend server**
```bash
go run main.go
```

The backend will start on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory** (in a new terminal)
```bash
cd frontend
```

2. **Install npm dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

The frontend will start on `http://localhost:3000`

## 📡 API Endpoints

### Health Check
```
GET /api/health
```
Returns API status.

### Upload File
```
POST /api/files/upload
Content-Type: multipart/form-data

Body: file (file)
```
Uploads a new file. Returns file metadata.

### Get All Files
```
GET /api/files/
```
Returns list of all uploaded files with metadata.

### Download File
```
GET /api/files/:filename/download
```
Downloads a specific file.

### Delete File
```
DELETE /api/files/:filename
```
Deletes a specific file.

## 🔧 Configuration

### Backend Environment Variables

You can configure the backend using environment variables:

```bash
PORT=8080                    # Server port (default: 8080)
UPLOAD_DIR=./uploads         # Upload directory (default: ./uploads)
```

### Docker Compose Configuration

Modify `docker-compose.yml` to change:
- Port mappings
- Volume mounts
- Environment variables
- Resource limits

## 📁 File Storage

Files are stored in the `backend/uploads/` directory. File metadata is persisted in `backend/uploads/metadata.json`.

### File Size Limit
- Maximum file size: **100MB** (configurable)

### Supported File Types
All file types are supported. The application automatically detects and displays appropriate icons for:
- Images (🖼️)
- Videos (🎥)
- Audio (🎵)
- PDFs (📄)
- Archives (📦)
- Text files (📝)
- Others (📁)

## 🎨 Features Breakdown

### File Upload Component
- Drag-and-drop support
- File size display
- Upload progress bar
- Real-time feedback
- Success/error messages

### File List Component
- Grid layout with responsive design
- File metadata display (name, size, upload date)
- Download and delete actions
- File type icons
- Hover effects and animations

## 🐳 Docker Details

### Backend Dockerfile
- Multi-stage build for optimized image size
- Alpine Linux base image
- Built binary size: ~15MB

### Frontend Dockerfile
- Multi-stage build with Node.js
- Nginx for serving static files
- Production-optimized React build
- Reverse proxy configuration for API calls

### Docker Compose
- Isolated network for services
- Volume persistence for uploads
- Automatic restart policies
- Service dependencies management

## 🔒 Security Considerations

- File uploads are limited to 100MB to prevent abuse
- Files are stored with UUID-based filenames to prevent conflicts
- CORS is enabled for development (configure for production)
- No authentication implemented (add as needed for production)

## 🚀 Production Deployment

### Recommended Steps:

1. **Add authentication** - Implement user authentication and authorization
2. **Configure CORS** - Restrict allowed origins in production
3. **Use HTTPS** - Set up SSL/TLS certificates
4. **Database** - Consider using a database instead of JSON file storage
5. **Cloud Storage** - Use S3, Azure Blob, or similar for file storage
6. **Monitoring** - Add logging and monitoring solutions
7. **Rate Limiting** - Implement rate limiting to prevent abuse
8. **File Scanning** - Add virus/malware scanning for uploads

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 or 8080 is already in use:
```bash
# Change ports in docker-compose.yml
ports:
  - "3001:80"  # Frontend
  - "8081:8080"  # Backend
```

### Permission Denied (uploads directory)
```bash
sudo chmod 755 backend/uploads
```

### Docker Build Fails
```bash
# Clear Docker cache and rebuild
docker-compose down
docker system prune -a
docker-compose up --build
```

### Files Not Persisting
Ensure the volume mount in `docker-compose.yml` is correct:
```yaml
volumes:
  - ./backend/uploads:/app/uploads
```