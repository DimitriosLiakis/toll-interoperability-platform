import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Upload to /uploads
      const uploadResponse = await axios.post('https://localhost:5000/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (uploadResponse.status === 200) {
        // Request to /api/passing_toll
        const response = await axios.post('https://localhost:5000/api/passing_toll', {
          fileName: file.name,
        });
        setData(response.data);
      }
    } catch (err) {
      setError(err.response ? err.response.data : 'Error during upload');
    }
  };

  return (
    <div>
      <h1>File Upload</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload and Process</button>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {data && (
        <div>
          <h2>New Passings:</h2>
          <ul>
            {data.map((passing, index) => (
              <li key={index}>
                {passing.vehicleId} passed toll {passing.tollName} at {passing.time}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
