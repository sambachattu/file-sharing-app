1. Install Jest and React Testing Library dependencies (`@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`) if not already present. I ran this and they are now installed.
2. Create `frontend/src/components/FileUpload.test.js` to test `FileUpload.js`.
3. The component needs test coverage for the `handleUpload` function. The missing error path tests include scenarios where:
    - The server responds with a status other than 201.
    - A network error occurs (triggering the `error` event on the XMLHttpRequest).
    - An exception occurs inside the `try` block (e.g., XMLHttpRequest fails to instantiate).
    - Progress event handling (optional but good to have since the instructions mention error paths and there is another path for progress).
4. Implement tests using Jest to mock the `XMLHttpRequest` constructor and simulate the various events (`load`, `error`, `progress`) as well as `throw`ing an error during object creation for the `catch` block path.
5. Complete pre commit steps.
6. Submit the testing improvements via PR.
