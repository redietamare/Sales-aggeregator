import React, { useState } from 'react';
import axios from 'axios';
import './FileUploader.css';

function FileUploader() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setDownloadUrl(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file); // Matches backend's multer.single('file')

    try {
      const response = await axios.post('http://localhost:3000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Upload response:', response.data);
      setDownloadUrl(response.data.downloadUrl);
    } catch (err) {
      setError('Failed to upload file. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-uploader">
      <h2>Upload Sales CSV</h2>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        disabled={uploading}
        className="file-input"
      />
      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className="upload-button"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {uploading && <p className="loading">Processing... Please wait.</p>}
      {error && <p className="error">{error}</p>}
      {downloadUrl && (
        <div className="download-section">
          <p>Processing complete!</p>
          <a href={downloadUrl} download className="download-link">
            Download Processed CSV
          </a>
        </div>
      )}
    </div>
  );
}

export default FileUploader;