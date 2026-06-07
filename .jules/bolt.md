## 2024-06-07 - File Lookup Bottleneck in In-Memory Store
**Learning:** The `FileService` uses an in-memory map keyed by `file.ID`, but the handlers query and delete files by `filename` (which is a separate UUID). This forced O(N) linear scans across all uploaded files during every download and delete operation.
**Action:** When working with the in-memory metadata store in this codebase, ensure secondary indexes (like `filenameIndex`) are maintained alongside the primary map to avoid O(N) bottlenecks.
