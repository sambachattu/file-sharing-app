import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import FileUpload from './FileUpload';

describe('FileUpload Component', () => {
  let xhrMock;

  beforeEach(() => {
    // Mock XMLHttpRequest
    xhrMock = {
      open: jest.fn(),
      send: jest.fn(),
      addEventListener: jest.fn(),
      upload: {
        addEventListener: jest.fn(),
      },
    };
    window.XMLHttpRequest = jest.fn().mockImplementation(() => xhrMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('handles successful file upload', async () => {
    const onUploadSuccess = jest.fn();
    render(<FileUpload onUploadSuccess={onUploadSuccess} />);

    // Mock document.getElementById
    const originalGetElementById = document.getElementById;
    document.getElementById = jest.fn().mockReturnValue({ value: 'dummy' });

    // Select a file
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]');

    await userEvent.upload(input, file);

    // Click upload
    const uploadButton = screen.getByRole('button', { name: /Upload File/i });
    fireEvent.click(uploadButton);

    // Find the load event listener
    const loadListenerCall = xhrMock.addEventListener.mock.calls.find(call => call[0] === 'load');
    const loadListener = loadListenerCall[1];

    // Trigger successful load
    xhrMock.status = 201;
    xhrMock.responseText = JSON.stringify({ message: 'Success' });
    act(() => {
      loadListener();
    });

    // Verify success behavior
    await waitFor(() => {
      expect(screen.getByText('✓ File uploaded successfully!')).toBeInTheDocument();
    });
    expect(onUploadSuccess).toHaveBeenCalled();

    // Restore document.getElementById
    document.getElementById = originalGetElementById;
  });

  test('handles file upload error (non-201 status)', async () => {
    render(<FileUpload onUploadSuccess={jest.fn()} />);

    // Select a file
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]');
    await userEvent.upload(input, file);

    // Click upload
    const uploadButton = screen.getByRole('button', { name: /Upload File/i });
    fireEvent.click(uploadButton);

    // Find the load event listener
    const loadListenerCall = xhrMock.addEventListener.mock.calls.find(call => call[0] === 'load');
    const loadListener = loadListenerCall[1];

    // Trigger failed load (e.g., 500 Server Error)
    xhrMock.status = 500;
    act(() => {
      loadListener();
    });

    // Verify error behavior
    await waitFor(() => {
      expect(screen.getByText('✗ Upload failed. Please try again.')).toBeInTheDocument();
    });
  });

  test('handles network error (XHR error event)', async () => {
    render(<FileUpload onUploadSuccess={jest.fn()} />);

    // Select a file
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]');
    await userEvent.upload(input, file);

    // Click upload
    const uploadButton = screen.getByRole('button', { name: /Upload File/i });
    fireEvent.click(uploadButton);

    // Find the error event listener
    const errorListenerCall = xhrMock.addEventListener.mock.calls.find(call => call[0] === 'error');
    const errorListener = errorListenerCall[1];

    // Trigger error event
    act(() => {
      errorListener();
    });

    // Verify error behavior
    await waitFor(() => {
      expect(screen.getByText('✗ Upload failed. Please try again.')).toBeInTheDocument();
    });
  });

  test('handles try-catch error (e.g., XMLHttpRequest not available)', async () => {
    // Force an error when trying to create XMLHttpRequest
    window.XMLHttpRequest = jest.fn().mockImplementation(() => {
      throw new Error('XHR not supported');
    });

    // Suppress console.error for this expected error test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<FileUpload onUploadSuccess={jest.fn()} />);

    // Select a file
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]');
    await userEvent.upload(input, file);

    // Click upload
    const uploadButton = screen.getByRole('button', { name: /Upload File/i });
    fireEvent.click(uploadButton);

    // Verify error behavior
    await waitFor(() => {
      expect(screen.getByText('✗ Upload failed. Please try again.')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  test('handles progress event', async () => {
    render(<FileUpload onUploadSuccess={jest.fn()} />);

    // Select a file
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]');
    await userEvent.upload(input, file);

    // Click upload
    const uploadButton = screen.getByRole('button', { name: /Upload File/i });
    fireEvent.click(uploadButton);

    // Find the progress event listener
    const progressListenerCall = xhrMock.upload.addEventListener.mock.calls.find(call => call[0] === 'progress');
    const progressListener = progressListenerCall[1];

    // Trigger progress event
    act(() => {
      progressListener({
        lengthComputable: true,
        loaded: 50,
        total: 100
      });
    });

    // Verify progress behavior (should be 50%)
    await waitFor(() => {
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });
});
