## 2024-05-18 - First Optimization Hunt
**Learning:** Understanding the frontend React codebase to find optimization opportunities.
**Action:** Identified `FileList.js` rendering a list of files that could benefit from virtualization or memoization, and `formatFileSize` / `getFileIcon` being re-computed on every render.

## 2024-05-18 - Backend Optimization Hunt
**Learning:** Evaluated `file_service.go`. The internal storage is a map mapping ID to *File. In `GetFileByFilename` and `DeleteFile`, the code does an O(N) scan over the map to find the file by filename. Since the ID doesn't seem strictly necessary as a lookup key for the map (only `filename` is ever used to query or delete, except for `id` inside the struct), this O(N) scan could be O(1) if we either store a secondary map of filename -> id or simply use filename as the key. Wait, looking at `GetFileByFilename` and `DeleteFile`, `filename` is unique per file (it's a UUID).
**Action:** Change `FileService.files` to map `filename` instead of `ID` or add an index map.

## 2024-05-18 - React List Rendering
**Learning:** `FileList.js` recreated formatting and icon helper functions on every render and re-rendered the entire file list when state changed. Extracting these functions to the module scope and wrapping individual `FileItem`s with `React.memo` (alongside `React.useCallback` for parent event handlers in `App.js`) prevents all items from needlessly re-rendering during operations like deletion or new file additions.
**Action:** Always extract static helper functions from component scope. For list rendering, extract the list item to a `React.memo` wrapped component and use `React.useCallback` in the parent for prop functions.
