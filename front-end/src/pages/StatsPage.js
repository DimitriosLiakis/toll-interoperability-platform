import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import './StatsPage.css'; 
import { getPrefix } from '../utils/utils';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA336A', '#33AA99'];

const StatsPage = () => {
  const [data, setData] = useState([]);
  const [chargeDetails, setChargeDetails] = useState([]);
  const [peakHours, setPeakHours] = useState({});
  const [totalCharges, setTotalCharges] = useState({});
  const [tagHomeDistribution, setTagHomeDistribution] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/uploads/passages.csv', {
          responseType: 'blob', 
        });
        const csvText = await response.data.text();

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            if (result.errors.length) {
              setError('Error parsing the CSV file.');
              console.error('Parsing Errors:', result.errors);
            } else {
              const parsedData = result.data;
              setData(parsedData);
              processChargeDetails(parsedData);
              calculatePeakHours(parsedData);
              calculateTotalCharges(parsedData);
              calculateTagHomeDistribution(parsedData);
            }
            setLoading(false);
          },
        });
      } catch (err) {
        setError('Error fetching the CSV file.');
        console.error('Fetch Error:', err);
        setLoading(false);
      }
    };

    fetchAndProcessData();
  }, []);

  const processChargeDetails = (parsedData) => {
    const details = {};
  
    parsedData.forEach((row) => {
      const tollPrefix = getPrefix(row.tollID);
      const tagPrefix = getPrefix(row.tagHomeID);
  
      if (tollPrefix && tagPrefix && tollPrefix !== tagPrefix) {
        const key = `${tollPrefix}-${tagPrefix}`;
        if (!details[key]) {
          details[key] = {
            chargedBy: tollPrefix,
            chargedTo: tagPrefix,
            charge: 0,
          };
        }
  
        details[key].charge += parseFloat(row.charge) || 0;
      }
    });
  
    setChargeDetails(Object.values(details));
  };
  

  const calculatePeakHours = (parsedData) => {
    const tollHourCounts = {};

    parsedData.forEach((row) => {
      const tollID = row.tollID;
      const timestamp = new Date(row.timestamp);
      const hour = timestamp.getHours();

      if (!tollHourCounts[tollID]) {
        tollHourCounts[tollID] = {};
      }

      if (!tollHourCounts[tollID][hour]) {
        tollHourCounts[tollID][hour] = 0;
      }

      tollHourCounts[tollID][hour] += 1;
    });

    const peak = {};

    Object.entries(tollHourCounts).forEach(([tollID, hours]) => {
      let maxCount = 0;
      let peakHour = [];

      Object.entries(hours).forEach(([hour, count]) => {
        if (count > maxCount) {
          maxCount = count;
          peakHour = [hour];
        } else if (count === maxCount) {
          peakHour.push(hour);
        }
      });

      peak[tollID] = { hours: peakHour.map(Number), count: maxCount };
    });

    setPeakHours(peak);
  };

  const calculateTotalCharges = (parsedData) => {
    const charges = {};

    parsedData.forEach((row) => {
      const tollID = row.tollID;
      const charge = parseFloat(row.charge) || 0;

      if (!charges[tollID]) {
        charges[tollID] = 0;
      }

      charges[tollID] += charge;
    });

    setTotalCharges(charges);
  };

  const calculateTagHomeDistribution = (parsedData) => {
    const distribution = {};

    parsedData.forEach((row) => {
      const tagPrefix = getPrefix(row.tagHomeID);
      if (tagPrefix) {
        if (!distribution[tagPrefix]) {
          distribution[tagPrefix] = 0;
        }
        distribution[tagPrefix] += 1;
      }
    });

    setTagHomeDistribution(distribution);
  };

  return (
    <div className="stats-container">
      <h1>Statistics</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && data.length > 0 && (
        <>
<section className="stat-section">
  <h2>Charge Mapping (Detailed)</h2>
  {chargeDetails.length > 0 ? (
    <table className="stat-table">
      <thead>
        <tr>
          <th>Charged By (Toll Prefix)</th>
          <th>Charged To (tagHomeID Prefix)</th>
          <th>Total Charge ($)</th>
        </tr>
      </thead>
      <tbody>
        {chargeDetails.map((entry, index) => (
          <tr key={index}>
            <td>{entry.chargedBy}</td>
            <td>{entry.chargedTo}</td>
            <td>{entry.charge.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <p>No charge data available.</p>
  )}
</section>


          <section className="stat-section">
            <h2>Peak Hours per TollID</h2>
            {Object.keys(peakHours).length > 0 ? (
              <table className="stat-table">
                <thead>
                  <tr>
                    <th>TollID</th>
                    <th>Peak Hour(s)</th>
                    <th>Number of Passages</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(peakHours).map(([tollID, info]) => (
                    <tr key={tollID}>
                      <td>{tollID}</td>
                      <td>{info.hours.map((h) => `${h}:00`).join(', ')}</td>
                      <td>{info.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No peak hours data available.</p>
            )}
          </section>

          <section className="stat-section">
            <h2>Total Charges per TollID</h2>
            {data.length > 0 && Object.keys(totalCharges).length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={Object.entries(totalCharges).map(([tollID, totalCharge]) => ({
                    tollID,
                    totalCharge,
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tollID" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalCharge" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p>Loading or no data available.</p>
            )}
          </section>

          <section className="stat-section">
            <h2>Passage Distribution by tagHomeID Prefix</h2>
            {data.length > 0 && Object.keys(tagHomeDistribution).length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(tagHomeDistribution).map(([prefix, count]) => ({
                      name: prefix,
                      value: count,
                    }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                  >
                    {Object.keys(tagHomeDistribution).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p>Loading or no data available.</p>
            )}
          </section>
        </>
      )}

      {!loading && data.length === 0 && <p>No data to display.</p>}
    </div>
  );
};

export default StatsPage;
