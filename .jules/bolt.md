## 2024-05-18 - First Optimization Hunt
**Learning:** Understanding the frontend React codebase to find optimization opportunities.
**Action:** Identified `FileList.js` rendering a list of files that could benefit from virtualization or memoization, and `formatFileSize` / `getFileIcon` being re-computed on every render.

## 2024-05-18 - Backend Optimization Hunt
**Learning:** Evaluated `file_service.go`. The internal storage is a map mapping ID to *File. In `GetFileByFilename` and `DeleteFile`, the code does an O(N) scan over the map to find the file by filename. Since the ID doesn't seem strictly necessary as a lookup key for the map (only `filename` is ever used to query or delete, except for `id` inside the struct), this O(N) scan could be O(1) if we either store a secondary map of filename -> id or simply use filename as the key. Wait, looking at `GetFileByFilename` and `DeleteFile`, `filename` is unique per file (it's a UUID).
**Action:** Change `FileService.files` to map `filename` instead of `ID` or add an index map.

## 2024-05-18 - Unnecessary React Component Unmounting Anti-Pattern
**Learning:** Found a common performance bottleneck in `App.js` where a single `loading` state was used to replace the entire `FileList` component with a loading indicator. This approach completely unmounts the `FileList` (and all its children) on every background fetch (e.g., after upload or deletion), causing massive DOM destruction and recreation.
**Action:** Always conditionally render loading states so that existing lists/components are preserved (e.g., `loading && files.length === 0` for full replacement, and a subtle overlay/indicator for background refetches). Additionally, extracted inner utility functions from `FileList.js` to avoid re-creation on every render.

## 2024-05-18 - Go Mutex Blocking by Disk I/O Anti-Pattern
**Learning:** In the Go backend (`file_service.go`), `os.WriteFile` and JSON marshalling were being executed synchronously inside the critical section (while holding a `sync.RWMutex` writer lock) on every file upload and delete. This synchronous disk I/O effectively blocked all concurrent reads (like `GetAllFiles` or `GetFileByFilename`) and writes to the entire in-memory file map, creating a severe bottleneck during high throughput.
**Action:** Always offload slow disk I/O operations (like metadata JSON persistence) to a background goroutine (using a channel for signaling) and ensure only necessary operations are held within the write lock. When serializing data for the background save, acquire only the read lock (`RLock`) to read the map state without blocking other readers.
