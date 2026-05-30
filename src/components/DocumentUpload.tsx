import React, { useState, useRef } from 'react';

interface DocumentUploadProps {
  onExtractSuccess: (text: string) => void;
  onExtractError: (error: string) => void;
  t: Record<string, string>;
}

export default function DocumentUpload({ 
  onExtractSuccess, 
  onExtractError,
  t
}: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger file selection dialog
  const onButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Process the selected file
  const processFile = async (file: File) => {
    const filename = file.name.toLowerCase();
    
    // Client-side extension validation
    if (!filename.endsWith('.pdf') && !filename.endsWith('.docx')) {
      onExtractError('Only PDF and DOCX files are supported.');
      return;
    }

    setUploading(true);
    onExtractError(''); // Clear previous errors

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      const textResponse = await response.text();
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (parseErr) {
        // If it's not JSON, it's likely an HTML error page from the hosting provider (e.g. 500, 413)
        console.error('Non-JSON response from server:', textResponse.substring(0, 200));
        throw new Error(`Server returned an error (${response.status}). The file might be too large or the server encountered an issue.`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Document processing failed. Please try another file.');
      }

      if (!data.text || data.text.trim().length === 0) {
        throw new Error('Unable to extract text from this document.');
      }

      onExtractSuccess(data.text);
    } catch (err: unknown) {
      console.error('File upload component error:', err);
      const message = err instanceof Error ? err.message : 'Document processing failed. Please try another file.';
      onExtractError(message);
    } finally {
      setUploading(false);
      // Reset input value to allow uploading same file again if desired
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle file select from input dialog
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="upload-container">
      <h3 className="label-title" style={{ marginBottom: '0.75rem' }}>{t.uploadTitle}</h3>
      
      <div 
        className={`upload-dropzone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="upload-file-input"
          accept=".pdf,.docx"
          onChange={handleChange}
          disabled={uploading}
        />

        {uploading ? (
          <div className="upload-loader-content">
            <span className="spinner" style={{ width: '30px', height: '30px', borderWidth: '4px' }}></span>
            <p className="upload-main-text" style={{ color: 'var(--primary-hover)', fontWeight: 600 }}>
              {t.readingDoc}
            </p>
          </div>
        ) : (
          <div className="upload-prompt-content">
            <span className="upload-icon">📁</span>
            <p className="upload-main-text">
              {t.dragDropText}{' '}
              <button 
                type="button" 
                className="upload-select-btn" 
                onClick={onButtonClick}
              >
                {t.browse}
              </button>
            </p>
            <p className="upload-sub-text">{t.supportedFormats}</p>
          </div>
        )}
      </div>
    </div>
  );
}
