import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import './DisplayPassages.css';


const DisplayPassages = () => {
  const [data, setData] = useState([]); // Stores parsed CSV data
  const [error, setError] = useState(''); // Stores error messages
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchCsv = async () => {
      try {
        // Fetch the CSV file from the server
        const response = await axios.get('http://localhost:5000/uploads/passages.csv', {
          responseType: 'blob', // Fetch as a Blob
        });

        // Create a FileReader to read the Blob
        const reader = new FileReader();
        reader.onload = () => {
          // Parse the CSV data using PapaParse
          Papa.parse(reader.result, {
            header: true, // Expect headers in the CSV
            skipEmptyLines: true, // Skip empty lines
            complete: (result) => {
              if (result.errors.length) {
                setError('Error parsing the CSV file.');
                console.error('Parsing Errors:', result.errors);
              } else {
                setData(result.data); // Set the parsed data
              }
              setLoading(false); // Set loading to false
            },
          });
        };

        reader.onerror = () => {
          setError('Error reading the file.');
          setLoading(false);
        };

        reader.readAsText(response.data); // Read the CSV file as text
      } catch (err) {
        setError('Error fetching the CSV file.');
        console.error('Fetch Error:', err);
        setLoading(false);
      }
    };

    fetchCsv();
  }, []);

  return (
    <div>
      <h1>Passages Data</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && data.length > 0 ? (
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {Object.keys(data[0]).map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((value, idx) => (
                  <td key={idx}>{value || 'N/A'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <p>No data to display.</p>
      )}
    </div>
  );
};

export default DisplayPassages;
