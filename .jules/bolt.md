## 2024-05-18 - First Optimization Hunt
**Learning:** Understanding the frontend React codebase to find optimization opportunities.
**Action:** Identified `FileList.js` rendering a list of files that could benefit from virtualization or memoization, and `formatFileSize` / `getFileIcon` being re-computed on every render.

## 2024-05-18 - Backend Optimization Hunt
**Learning:** Evaluated `file_service.go`. The internal storage is a map mapping ID to *File. In `GetFileByFilename` and `DeleteFile`, the code does an O(N) scan over the map to find the file by filename. Since the ID doesn't seem strictly necessary as a lookup key for the map (only `filename` is ever used to query or delete, except for `id` inside the struct), this O(N) scan could be O(1) if we either store a secondary map of filename -> id or simply use filename as the key. Wait, looking at `GetFileByFilename` and `DeleteFile`, `filename` is unique per file (it's a UUID).
**Action:** Change `FileService.files` to map `filename` instead of `ID` or add an index map.

## 2024-05-18 - Unnecessary React Component Unmounting Anti-Pattern
**Learning:** Found a common performance bottleneck in `App.js` where a single `loading` state was used to replace the entire `FileList` component with a loading indicator. This approach completely unmounts the `FileList` (and all its children) on every background fetch (e.g., after upload or deletion), causing massive DOM destruction and recreation.
**Action:** Always conditionally render loading states so that existing lists/components are preserved (e.g., `loading && files.length === 0` for full replacement, and a subtle overlay/indicator for background refetches). Additionally, extracted inner utility functions from `FileList.js` to avoid re-creation on every render.

## 2024-07-26 - React Component Primitive Prop Memoization & API Call Redundancy Anti-Pattern
**Learning:** Found two frontend performance issues: `FileList.js` passed entire `file` objects to list items causing unnecessary re-renders when list length changed (or list re-rendered), and `App.js` redundantly refetched all files after uploading or deleting one instead of updating the state directly from the backend's response or using simple state filtering.
**Action:** Extract list item logic into `FileItem.js`, destructured the scalar/primitive properties of the `file` object as props, wrapped it in `React.memo`, and moved local functions inside it. Additionally, `App.js` was updated to append `newFile` from the upload API response to state and filter deleted files from state, avoiding expensive full refetches. `useCallback` was added to event handlers to ensure reference stability.
