// src/PassAnalysis.js
import React, { useState } from 'react';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import './PassAnalysis.css';

const PassAnalysis = () => {
    const operationOptions = [
        { value: 'AM', label: 'AM - Αυτοκινητόδρομος Αιγαίου' },
        { value: 'EG', label: 'EG - Εγνατία Οδός' },
        { value: 'KO', label: 'KO - Κεντρική Οδός' },
        { value: 'MO', label: 'MO - Μορέας' },
        { value: 'NAO', label: 'NAO - Αττική Οδός' },
        { value: 'NO', label: 'NO - Νέα Οδός' },
        { value: 'OO', label: 'OO - Ολυμπία Οδός' },
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
            setError('Όλα τα πεδία είναι υποχρεωτικά.');
            setLoading(false);
            return;
        }

        const formattedDateFrom = formatDate(dateFrom);
        const formattedDateTo = formatDate(dateTo);

        const dateRegex = /^\d{8}$/;
        if (!dateRegex.test(formattedDateFrom) || !dateRegex.test(formattedDateTo)) {
            setError('Οι ημερομηνίες πρέπει να είναι στη μορφή YYYYMMDD.');
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
                    setError('Μη αναμενόμενη μορφή δεδομένων CSV.');
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Προέκυψε σφάλμα κατά την ανάκτηση των δεδομένων.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Ανάλυση Περασμάτων</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Κωδικός Λειτουργού Σταθμού:</label>
                    <select
                        value={stationOpID}
                        onChange={(e) => setStationOpID(e.target.value)}
                        required
                    >
                        <option value="">-- Επιλέξτε Σταθμό --</option>
                        {operationOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Κωδικός Παρόχου Ετικέτας:</label>
                    <select
                        value={tagOpID}
                        onChange={(e) => setTagOpID(e.target.value)}
                        required
                    >
                        <option value="">-- Επιλέξτε Ετικέτα --</option>
                        {operationOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Ημερομηνία Από:</label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Ημερομηνία Έως:</label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Μορφή:</label>
                    <select value={format} onChange={(e) => setFormat(e.target.value)}>
                        <option value="json">JSON</option>
                        <option value="csv">CSV</option>
                    </select>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Φόρτωση...' : 'Εμφάνιση Δεδομένων'}
                </button>
            </form>

            {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

            {format === 'json' && data && (
                <div>
                    <h3>Δεδομένα Ανάλυσης Περασμάτων</h3>
                    <p><strong> ID Λειτουργού Σταθμού:</strong> {data.stationOpID}</p>
                    <p><strong>ID Παρόχου Ετικέτας:</strong> {data.tagOpID}</p>
                    <p><strong>Χρονική Σήμανση Αιτήματος:</strong> {data.requestTimestamp}</p>
                    <p><strong>Περίοδος Από:</strong> {data.periodFrom}</p>
                    <p><strong>Περίοδος Έως:</strong> {data.periodTo}</p>
                    <p><strong>Αριθμός Διελεύσεων:</strong> {data.nPasses}</p>
                    {Array.isArray(data.passList) && data.passList.length > 0 ? (
                        <table border="1" cellPadding="5" cellSpacing="0">
                            <thead>
                                <tr>
                                    <th>Δείκτης Διέλευσης</th>
                                    <th>Κωδικός Διέλευσης</th>
                                    <th>Κωδικός Σταθμού</th>
                                    <th>Χρονική Σήμανση</th>
                                    <th>Κωδικός Ετικέτας</th>
                                    <th>Κόστος Διέλευσης</th>
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
                        <p>Δεν υπάρχουν διαθέσιμα δεδομένα περασμάτων.</p>
                    )}
                </div>
            )}

            {format === 'csv' && csvData && (
                <div>
                    <h3>Λήψη CSV</h3>
                    <a href={csvData} download={`analysis_${stationOpID}_${tagOpID}_${dateFrom}_${dateTo}.csv`}>
                        Κατεβάστε το CSV
                    </a>
                </div>
            )}
        </div>
    );
};

export default PassAnalysis;
