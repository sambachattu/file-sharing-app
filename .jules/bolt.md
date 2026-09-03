## 2024-05-18 - First Optimization Hunt
**Learning:** Understanding the frontend React codebase to find optimization opportunities.
**Action:** Identified `FileList.js` rendering a list of files that could benefit from virtualization or memoization, and `formatFileSize` / `getFileIcon` being re-computed on every render.

## 2024-05-18 - Backend Optimization Hunt
**Learning:** Evaluated `file_service.go`. The internal storage is a map mapping ID to *File. In `GetFileByFilename` and `DeleteFile`, the code does an O(N) scan over the map to find the file by filename. Since the ID doesn't seem strictly necessary as a lookup key for the map (only `filename` is ever used to query or delete, except for `id` inside the struct), this O(N) scan could be O(1) if we either store a secondary map of filename -> id or simply use filename as the key. Wait, looking at `GetFileByFilename` and `DeleteFile`, `filename` is unique per file (it's a UUID).
**Action:** Change `FileService.files` to map `filename` instead of `ID` or add an index map.

## 2024-05-18 - Unnecessary React Component Unmounting Anti-Pattern
**Learning:** Found a common performance bottleneck in `App.js` where a single `loading` state was used to replace the entire `FileList` component with a loading indicator. This approach completely unmounts the `FileList` (and all its children) on every background fetch (e.g., after upload or deletion), causing massive DOM destruction and recreation.
**Action:** Always conditionally render loading states so that existing lists/components are preserved (e.g., `loading && files.length === 0` for full replacement, and a subtle overlay/indicator for background refetches). Additionally, extracted inner utility functions from `FileList.js` to avoid re-creation on every render.

## 2024-05-18 - Avoiding Redundant Full-List Refetches on Single Mutations
**Learning:** Found a performance bottleneck where a single file upload or deletion triggered a full `/api/files/` refetch. This is particularly wasteful when the payload for a single uploaded file is already returned by the server, and the state can be modified locally (appended or filtered). Doing this locally not only saves bandwidth and reduces server load, but coupled with React.memo on list items, prevents O(N) re-renders of the DOM.
**Action:** Always update the frontend state locally (appending new elements or filtering out deleted ones) after a successful single-item mutation instead of relying on a full-list refetch, unless the backend API explicitly requires it or pagination makes local updates too complex.
