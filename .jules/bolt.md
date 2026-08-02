## 2024-05-18 - First Optimization Hunt
**Learning:** Understanding the frontend React codebase to find optimization opportunities.
**Action:** Identified `FileList.js` rendering a list of files that could benefit from virtualization or memoization, and `formatFileSize` / `getFileIcon` being re-computed on every render.

## 2024-05-18 - Backend Optimization Hunt
**Learning:** Evaluated `file_service.go`. The internal storage is a map mapping ID to *File. In `GetFileByFilename` and `DeleteFile`, the code does an O(N) scan over the map to find the file by filename. Since the ID doesn't seem strictly necessary as a lookup key for the map (only `filename` is ever used to query or delete, except for `id` inside the struct), this O(N) scan could be O(1) if we either store a secondary map of filename -> id or simply use filename as the key. Wait, looking at `GetFileByFilename` and `DeleteFile`, `filename` is unique per file (it's a UUID).
**Action:** Change `FileService.files` to map `filename` instead of `ID` or add an index map.

## 2024-05-18 - Unnecessary React Component Unmounting Anti-Pattern
**Learning:** Found a common performance bottleneck in `App.js` where a single `loading` state was used to replace the entire `FileList` component with a loading indicator. This approach completely unmounts the `FileList` (and all its children) on every background fetch (e.g., after upload or deletion), causing massive DOM destruction and recreation.
**Action:** Always conditionally render loading states so that existing lists/components are preserved (e.g., `loading && files.length === 0` for full replacement, and a subtle overlay/indicator for background refetches). Additionally, extracted inner utility functions from `FileList.js` to avoid re-creation on every render.
## 2023-10-27 - [Optimize React Lists and File Upload Redundant Refetches]
**Learning:** In a codebase that heavily uses `React.memo` and lists of items, simply uploading a new file shouldn't trigger a refetch of all files if the new file's JSON response from the server can just be appended to the local state. Destructuring props in list items and wrapping handlers in `useCallback` ensures that child elements aren't re-rendered when appending a new file (since only the list of items grows).
**Action:** When uploading files and rendering lists, always parse the JSON response from the backend to update state locally instead of relying on a redundant `fetchFiles()` wrapper. Always pass primitive/scalar props to child memoized list components so they're isolated from parent object references, minimizing re-renders.
