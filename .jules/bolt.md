## 2024-05-18 - First Optimization Hunt
**Learning:** Understanding the frontend React codebase to find optimization opportunities.
**Action:** Identified `FileList.js` rendering a list of files that could benefit from virtualization or memoization, and `formatFileSize` / `getFileIcon` being re-computed on every render.

## 2024-05-18 - Backend Optimization Hunt
**Learning:** Evaluated `file_service.go`. The internal storage is a map mapping ID to *File. In `GetFileByFilename` and `DeleteFile`, the code does an O(N) scan over the map to find the file by filename. Since the ID doesn't seem strictly necessary as a lookup key for the map (only `filename` is ever used to query or delete, except for `id` inside the struct), this O(N) scan could be O(1) if we either store a secondary map of filename -> id or simply use filename as the key. Wait, looking at `GetFileByFilename` and `DeleteFile`, `filename` is unique per file (it's a UUID).
**Action:** Change `FileService.files` to map `filename` instead of `ID` or add an index map.

## 2026-06-14 - React List Virtualization and Memoization
**Learning:** In React, simply applying `React.memo` to a component isn't enough if the props passed down are recreated on every render. Functions passed as props (like `onDelete` in a mapped list) will break memoization unless they are stabilized using `useCallback`. Furthermore, inner utility functions should be moved outside the component whenever possible to avoid unnecessary recreation.
**Action:** Used `useCallback` on `fetchFiles` and `handleDelete` in App.js to ensure stability, extracted static formatting utility functions outside `FileList`, and created a memoized `FileItem` component to prevent unnecessary re-rendering of the entire list when only single items are modified.
