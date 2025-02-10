// PassagesStats.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import { MOTORWAY_MAP } from '../pages/motorways';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import './PassagesStats.css'; // Create this file for styling if needed

const PassagesStats = () => {
  const [data, setData] = useState([]); // Parsed CSV data
  const [error, setError] = useState(''); // Error messages
  const [loading, setLoading] = useState(true); // Loading state
  const [stats, setStats] = useState({}); // Statistics data

  useEffect(() => {
    const fetchCsv = async () => {
      try {
        // Fetch the CSV file from the server
        const response = await axios.get('https://localhost:5000/uploads/passages.csv', {
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
                const parsedData = result.data.map(row => ({
                  ...row,
                  motorwayFull: MOTORWAY_MAP[row.motorway] || row.motorway, // Assuming 'motorway' is the column name
                }));
                setData(parsedData); // Set the parsed data
                computeStats(parsedData); // Compute statistics
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

  // Function to compute statistics
  const computeStats = (parsedData) => {
    const motorwayCounts = {};

    parsedData.forEach(row => {
      const motorway = row.motorwayFull;
      if (motorway in motorwayCounts) {
        motorwayCounts[motorway] += 1;
      } else {
        motorwayCounts[motorway] = 1;
      }
    });

    setStats(motorwayCounts);
  };

  // Prepare data for the chart
  const chartData = Object.keys(stats).map(key => ({
    motorway: key,
    passages: stats[key],
  }));

  return (
    <div className="passages-stats">
      <h1>Passages Statistics</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && data.length > 0 && (
        <>
          <h2>Number of Passages per Motorway</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <XAxis dataKey="motorway" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="passages" fill="#8884d8" name="Passages" />
            </BarChart>
          </ResponsiveContainer>

          {/* Additional Statistics can be added here */}
          <h2>Summary</h2>
          <table border="1" style={{ width: '50%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Motorway</th>
                <th>Number of Passages</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats).map(([motorway, count]) => (
                <tr key={motorway}>
                  <td>{motorway}</td>
                  <td>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {!loading && data.length === 0 && !error && <p>No data to display.</p>}
    </div>
  );
};

export default PassagesStats;
