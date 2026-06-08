## 2024-06-08 - O(n) Map Iteration Bottleneck
**Learning:** Found instances of iterating over maps to find an element by a secondary key (`Filename` instead of `ID`), leading to O(n) performance for `GetFileByFilename` and `DeleteFile` in the `FileService`.
**Action:** Always create a secondary index (map) when frequent lookups are needed by a property other than the primary key. Update the index during creation, update, and deletion, as well as upon loading from persistent storage.
