## 2024-05-18 - First Optimization Hunt
**Learning:** Understanding the frontend React codebase to find optimization opportunities.
**Action:** Identified `FileList.js` rendering a list of files that could benefit from virtualization or memoization, and `formatFileSize` / `getFileIcon` being re-computed on every render.

## 2024-05-18 - Backend Optimization Hunt
**Learning:** Evaluated `file_service.go`. The internal storage is a map mapping ID to *File. In `GetFileByFilename` and `DeleteFile`, the code does an O(N) scan over the map to find the file by filename. Since the ID doesn't seem strictly necessary as a lookup key for the map (only `filename` is ever used to query or delete, except for `id` inside the struct), this O(N) scan could be O(1) if we either store a secondary map of filename -> id or simply use filename as the key. Wait, looking at `GetFileByFilename` and `DeleteFile`, `filename` is unique per file (it's a UUID).
**Action:** Change `FileService.files` to map `filename` instead of `ID` or add an index map.

## 2024-05-18 - Unnecessary React Component Unmounting Anti-Pattern
**Learning:** Found a common performance bottleneck in `App.js` where a single `loading` state was used to replace the entire `FileList` component with a loading indicator. This approach completely unmounts the `FileList` (and all its children) on every background fetch (e.g., after upload or deletion), causing massive DOM destruction and recreation.
**Action:** Always conditionally render loading states so that existing lists/components are preserved (e.g., `loading && files.length === 0` for full replacement, and a subtle overlay/indicator for background refetches). Additionally, extracted inner utility functions from `FileList.js` to avoid re-creation on every render.
## 2024-05-18 - React.memo and useCallback for Lists
**Learning:** Found a common pattern in the React frontend where components update their state by refetching an entire file list from the API (e.g., `App.js` calling `fetchFiles()`). Since the backend reconstructs these objects and returns a new JSON array, the frontend generates entirely new object references for each file item on every fetch, even if the files haven't changed. This causes React to re-render every item in the list needlessly, which can be computationally expensive as lists grow.
**Action:** When working with lists populated from backend refetches, wrap child list items and the main list component in `React.memo` with custom comparison functions (e.g., checking `file.id`). Combine this by wrapping handler functions (like `fetchFiles`, `handleDelete`) with `useCallback` to ensure stable prop references passed down the component tree.
