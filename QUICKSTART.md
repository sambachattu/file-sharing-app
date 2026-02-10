# 🚀 Quick Start Guide - File Sharing App

## Option 1: Using Docker (Easiest - Recommended)

### Step 1: Ensure Docker is installed
```bash
docker --version
docker-compose --version
```

### Step 2: Navigate to project directory
```bash
cd file-sharing-app
```

### Step 3: Start the application
```bash
docker-compose up --build
```

Wait for both services to start (you'll see logs from both frontend and backend).

### Step 4: Access the application
Open your browser and go to:
```
http://localhost:3000
```

### Step 5: Stop the application
Press `Ctrl+C` in the terminal, then:
```bash
docker-compose down
```

---

## Option 2: Local Development (No Docker)

### Prerequisites
- Go 1.21 or higher
- Node.js 18 or higher
- npm 9 or higher

### IMPORTANT: First Time Setup

Before running the app locally, you need to download Go dependencies:

**On Windows:**
```bash
cd file-sharing-app
setup.bat
```

**On Mac/Linux:**
```bash
cd file-sharing-app
chmod +x setup.sh
./setup.sh
```

**Or manually:**
```bash
cd file-sharing-app/backend
go mod download
go mod tidy
```

This will generate the `go.sum` file with correct checksums for your environment.

### Backend Setup

**Terminal 1 - Backend:**
```bash
cd file-sharing-app/backend
go run main.go
```

Backend will start on `http://localhost:8080`

### Frontend Setup

**Terminal 2 - Frontend:**
```bash
cd file-sharing-app/frontend
npm install
npm start
```

Frontend will start on `http://localhost:3000`

---

## 🎯 What You Can Do

1. **Upload Files** - Click the file input or drag & drop
2. **View Files** - See all uploaded files in the list below
3. **Download Files** - Click the download button on any file
4. **Delete Files** - Click the delete button to remove files

---

## 📊 Verify It's Working

### Check Backend Health
```bash
curl http://localhost:8080/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "File sharing API is running"
}
```

### Check Frontend
Open browser to `http://localhost:3000` - you should see the file sharing interface.

---

## 🐛 Common Issues

### Issue: Port already in use
**Solution:** Change ports in `docker-compose.yml`:
```yaml
ports:
  - "3001:80"  # Frontend (change 3001 to any available port)
  - "8081:8080"  # Backend (change 8081 to any available port)
```

### Issue: Permission denied on uploads folder
**Solution:**
```bash
chmod 755 backend/uploads
```

### Issue: Docker build fails
**Solution:**
```bash
docker-compose down
docker system prune -a
docker-compose up --build
```

---

## 📝 Environment Variables (Optional)

Create a `.env` file in the backend directory:
```env
PORT=8080
UPLOAD_DIR=./uploads
```

---

## 🎉 That's It!

You now have a fully functional file sharing application running locally.

For more details, see the complete [README.md](README.md)
