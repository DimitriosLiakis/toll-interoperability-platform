// src/PassAnalysis.js
import React, { useState } from 'react';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import './PassAnalysis.css';

const PassAnalysis = () => {
    const operationOptions = [
        { value: 'AM', label: 'AM - Aegean Motorway' },
        { value: 'EG', label: 'EG - Egnatia' },
        { value: 'KO', label: 'KO - Kentrikiodos' },
        { value: 'MO', label: 'MO - Moreas' },
        { value: 'NAO', label: 'NAO - Naodos' },
        { value: 'NO', label: 'NO - Neaodos' },
        { value: 'OO', label: 'OO - Olympiaodos' },
    ];

    const [stationOpID, setStationOpID] = useState('');
    const [tagOpID, setTagOpID] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [format, setFormat] = useState('json');
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [csvData, setCsvData] = useState('');
    const [loading, setLoading] = useState(false);

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = (`0${d.getMonth() + 1}`).slice(-2);
        const day = (`0${d.getDate()}`).slice(-2);
        return `${year}${month}${day}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setData(null);
        setCsvData('');
        setLoading(true);

        if (!stationOpID || !tagOpID || !dateFrom || !dateTo) {
            setError('All fields are required.');
            setLoading(false);
            return;
        }

        const formattedDateFrom = formatDate(dateFrom);
        const formattedDateTo = formatDate(dateTo);

        const dateRegex = /^\d{8}$/;
        if (!dateRegex.test(formattedDateFrom) || !dateRegex.test(formattedDateTo)) {
            setError('Dates must be in YYYYMMDD format.');
            setLoading(false);
            return;
        }

        try {
            const url = `http://localhost:9115/api/passAnalysis/${stationOpID}/${tagOpID}/${formattedDateFrom}/${formattedDateTo}`;
            const response = await axios.get(url, {
                params: {
                    format,
                },
                responseType: format === 'csv' ? 'blob' : 'json',
            });

            if (format === 'json') {
                setData(response.data);
            } else if (format === 'csv') {
                if (response.data instanceof Blob) {
                    const csvUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
                    setCsvData(csvUrl);
                } else {
                    setError('Unexpected CSV data format.');
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred while fetching data.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Pass Analysis</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Station Operation ID:</label>
                    <select
                        value={stationOpID}
                        onChange={(e) => setStationOpID(e.target.value)}
                        required
                    >
                        <option value="">-- Select Station Operation ID --</option>
                        {operationOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Tag Operation ID:</label>
                    <select
                        value={tagOpID}
                        onChange={(e) => setTagOpID(e.target.value)}
                        required
                    >
                        <option value="">-- Select Tag Operation ID --</option>
                        {operationOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Date From:</label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Date To:</label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Format:</label>
                    <select value={format} onChange={(e) => setFormat(e.target.value)}>
                        <option value="json">JSON</option>
                        <option value="csv">CSV</option>
                    </select>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Fetching...' : 'Fetch Data'}
                </button>
            </form>

            {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

            {format === 'json' && data && (
                <div>
                    <h3>Pass Analysis Data</h3>
                    <p><strong>StationOpID:</strong> {data.stationOpID}</p>
                    <p><strong>TagOpID:</strong> {data.tagOpID}</p>
                    <p><strong>Request Timestamp:</strong> {data.requestTimestamp}</p>
                    <p><strong>Period From:</strong> {data.periodFrom}</p>
                    <p><strong>Period To:</strong> {data.periodTo}</p>
                    <p><strong>Number of Passes:</strong> {data.nPasses}</p>
                    {Array.isArray(data.passList) && data.passList.length > 0 ? (
                        <table border="1" cellPadding="5" cellSpacing="0">
                            <thead>
                                <tr>
                                    <th>Pass Index</th>
                                    <th>Pass ID</th>
                                    <th>Station ID</th>
                                    <th>Timestamp</th>
                                    <th>Tag ID</th>
                                    <th>Pass Charge</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.passList.map((pass) => (
                                    <tr key={pass.passID}>
                                        <td>{pass.passIndex}</td>
                                        <td>{pass.passID}</td>
                                        <td>{pass.stationID}</td>
                                        <td>{pass.timestamp}</td>
                                        <td>{pass.tagID}</td>
                                        <td>{pass.passCharge.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No pass data available.</p>
                    )}
                </div>
            )}

            {format === 'csv' && csvData && (
                <div>
                    <h3>Download CSV</h3>
                    <a href={csvData} download={`pass_analysis_${stationOpID}_${tagOpID}_${dateFrom}_${dateTo}.csv`}>
                        Download CSV
                    </a>
                </div>
            )}
        </div>
    );
};

export default PassAnalysis;
