## 2024-05-18 - First Optimization Hunt
**Learning:** Understanding the frontend React codebase to find optimization opportunities.
**Action:** Identified `FileList.js` rendering a list of files that could benefit from virtualization or memoization, and `formatFileSize` / `getFileIcon` being re-computed on every render.

## 2024-05-18 - Backend Optimization Hunt
**Learning:** Evaluated `file_service.go`. The internal storage is a map mapping ID to *File. In `GetFileByFilename` and `DeleteFile`, the code does an O(N) scan over the map to find the file by filename. Since the ID doesn't seem strictly necessary as a lookup key for the map (only `filename` is ever used to query or delete, except for `id` inside the struct), this O(N) scan could be O(1) if we either store a secondary map of filename -> id or simply use filename as the key. Wait, looking at `GetFileByFilename` and `DeleteFile`, `filename` is unique per file (it's a UUID).
**Action:** Change `FileService.files` to map `filename` instead of `ID` or add an index map.

## 2024-05-18 - Unnecessary React Component Unmounting Anti-Pattern
**Learning:** Found a common performance bottleneck in `App.js` where a single `loading` state was used to replace the entire `FileList` component with a loading indicator. This approach completely unmounts the `FileList` (and all its children) on every background fetch (e.g., after upload or deletion), causing massive DOM destruction and recreation.
**Action:** Always conditionally render loading states so that existing lists/components are preserved (e.g., `loading && files.length === 0` for full replacement, and a subtle overlay/indicator for background refetches). Additionally, extracted inner utility functions from `FileList.js` to avoid re-creation on every render.

## 2026-09-11 - Eliminating Redundant React State Fetching
**Learning:** In the frontend React application, actions like `handleUploadSuccess` and `handleDelete` were previously triggering a full re-fetch of all files via `fetchFiles()`. Since the backend API (`GetAllFiles`) does not support pagination and returns the entire list in non-deterministic order, this caused unnecessary network load and complete list re-renders. We learned from the file upload response structure that the backend returns the newly created file object inside the `file` property (`response.file`) on a 201 status.
**Action:** Instead of calling `fetchFiles()` after mutations, I've updated local React state efficiently by mutating it directly (e.g. appending `newFile` to the `files` array, or filtering it out on deletion). This prevents full list re-fetches. Combined with extracting list items into a `React.memo` wrapped `FileItem` that accepts scalar properties and utilizing `useCallback` for event handlers, this dramatically reduces redundant renders and API traffic.
