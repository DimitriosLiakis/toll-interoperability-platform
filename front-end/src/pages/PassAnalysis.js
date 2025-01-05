// src/PassAnalysis.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import { useNavigate } from 'react-router-dom'; // For redirection
import './PassAnalysis.css';

const PassAnalysis = () => {
    const navigate = useNavigate(); // Hook for navigation
    const operationOptions = [
        { value: 'AM', label: 'Αυτοκινητόδρομος Αιγαίου' },
        { value: 'EG', label: 'Εγνατία Οδός' },
        { value: 'KO', label: 'Κεντρική Οδός' },
        { value: 'MO', label: 'Μορέας' },
        { value: 'NAO', label: 'Αττική Οδός' },
        { value: 'NO', label: 'Νέα Οδός' },
        { value: 'OO', label: 'Ολυμπία Οδός' },
        { value: 'GE', label: 'Γέφυρα' },
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

    // Helper function to format dates as YYYYMMDD
    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = (`0${d.getMonth() + 1}`).slice(-2);
        const day = (`0${d.getDate()}`).slice(-2);
        return `${year}${month}${day}`;
    };

    // Function to handle logout (remove token and redirect to login)
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    useEffect(() => {
        // Optional: Check token validity on component mount
        const checkToken = () => {
            const token = localStorage.getItem('token');
            if (!token) {
                // No token found, redirect to login
                navigate('/login');
                return;
            }

            try {
                // Decode the token to get payload
                const payload = JSON.parse(atob(token.split('.')[1]));
                const currentTime = Date.now() / 1000;

                if (payload.exp && payload.exp < currentTime) {
                    // Token expired
                    alert('Η συνεδρία σας έχει λήξει. Παρακαλώ συνδεθείτε ξανά.');
                    handleLogout();
                }
            } catch (err) {
                console.error('Invalid token:', err);
                alert('Μη έγκυρο token. Παρακαλώ συνδεθείτε ξανά.');
                handleLogout();
            }
        };

        checkToken();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setData(null);
        setCsvData('');
        setLoading(true);

        // Validate form inputs
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
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Δεν βρέθηκε το token. Παρακαλώ συνδεθείτε ξανά.');
                handleLogout();
                return;
            }

            const url = `http://localhost:9115/api/passAnalysis/${stationOpID}/${tagOpID}/${formattedDateFrom}/${formattedDateTo}`;

            const response = await axios.get(url, {
                params: { format },
                headers: {
                    'Content-Type': 'application/json',
                    'x-observatory-auth': token, // Attach JWT token here
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
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                setError('Μη εξουσιοδοτημένο αίτημα. Παρακαλώ συνδεθείτε ξανά.');
                handleLogout();
            } else {
                setError(err.response?.data?.error || 'Προέκυψε σφάλμα κατά την ανάκτηση των δεδομένων.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Ανάλυση Διελεύσεων</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
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

                <div className="form-group">
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

                <div className="form-group">
                    <label>Ημερομηνία Από:</label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Ημερομηνία Έως:</label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
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

            {error && <div className="error-message">{error}</div>}

            {format === 'json' && data && (
                <div className="results-section">
                    <h3>Δεδομένα Ανάλυσης Περασμάτων</h3>
                    <p><strong>ID Λειτουργού Σταθμού:</strong> {data.stationOpID}</p>
                    <p><strong>ID Παρόχου Ετικέτας:</strong> {data.tagOpID}</p>
                    <p><strong>Χρονική Σήμανση Αιτήματος:</strong> {data.requestTimestamp}</p>
                    <p><strong>Περίοδος Από:</strong> {data.periodFrom}</p>
                    <p><strong>Περίοδος Έως:</strong> {data.periodTo}</p>
                    <p><strong>Αριθμός Διελεύσεων:</strong> {data.nPasses}</p>
                    {Array.isArray(data.passList) && data.passList.length > 0 ? (
                        <table className="data-table">
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
                <div className="csv-download-section">
                    <h3>Λήψη CSV</h3>
                    <CSVLink
                        data={data.passList}
                        headers={[
                            { label: 'Δείκτης Διέλευσης', key: 'passIndex' },
                            { label: 'Κωδικός Διέλευσης', key: 'passID' },
                            { label: 'Κωδικός Σταθμού', key: 'stationID' },
                            { label: 'Χρονική Σήμανση', key: 'timestamp' },
                            { label: 'Κωδικός Ετικέτας', key: 'tagID' },
                            { label: 'Κόστος Διέλευσης', key: 'passCharge' },
                        ]}
                        filename={`analysis_${stationOpID}_${tagOpID}_${dateFrom}_${dateTo}.csv`}
                        className="download-link"
                    >
                        Κατεβάστε το CSV
                    </CSVLink>
                </div>
            )}
        </div>
    ); // <-- Close the return statement

}; // <-- Close the PassAnalysis component

export default PassAnalysis;
