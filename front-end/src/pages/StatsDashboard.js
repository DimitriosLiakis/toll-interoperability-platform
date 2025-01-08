// src/components/AnalysisDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './StatsDashboard.css'; // Ensure this CSS file exists for styling

const AnalysisDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('PassAnalysis'); // Default active tab
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

    // Shared states
    const [format, setFormat] = useState('json');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Authentication check on mount
    useEffect(() => {
        const checkToken = () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const currentTime = Date.now() / 1000;

                if (payload.exp && payload.exp < currentTime) {
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

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Helper function to format dates as YYYYMMDD
    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = (`0${d.getMonth() + 1}`).slice(-2);
        const day = (`0${d.getDate()}`).slice(-2);
        return `${year}${month}${day}`;
    };

    // Helper function to format dates as dd/MM/yyyy for display
    const displayDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const day = (`0${d.getDate()}`).slice(-2);
        const month = (`0${d.getMonth() + 1}`).slice(-2);
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Handler for tab switching
    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        setError('');
    };

    // ==================== PassAnalysis States and Handlers ====================
    const [passAnalysisState, setPassAnalysisState] = useState({
        stationOpID: '',
        tagOpID: '',
        dateFrom: null, // Changed from '' to null
        dateTo: null,   // Changed from '' to null
        data: null,
        csvData: '',
    });

    const handlePassAnalysisChange = (e) => {
        const { name, value } = e.target;
        setPassAnalysisState((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handlePassAnalysisDateChange = (name, date) => {
        setPassAnalysisState((prevState) => ({
            ...prevState,
            [name]: date,
        }));
    };

    const handlePassAnalysisSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setPassAnalysisState((prevState) => ({
            ...prevState,
            data: null,
            csvData: '',
        }));
        setLoading(true);

        const { stationOpID, tagOpID, dateFrom, dateTo } = passAnalysisState;

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
                    'x-observatory-auth': token,
                },
                responseType: format === 'csv' ? 'blob' : 'json',
            });

            if (response.status === 200) {
                if (format === 'json') {
                    setPassAnalysisState((prevState) => ({
                        ...prevState,
                        data: response.data,
                    }));
                } else if (format === 'csv') {
                    if (response.data instanceof Blob) {
                        const csvUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
                        setPassAnalysisState((prevState) => ({
                            ...prevState,
                            csvData: csvUrl,
                        }));
                    } else {
                        setError('Μη αναμενόμενη μορφή δεδομένων CSV.');
                    }
                }
            } else if (response.status === 204) {
                setError('Δεν επιστράφηκαν δεδομένα για τα κριτήρια που δώσατε.');
            }
        } catch (err) {
            if (err.response) {
                switch (err.response.status) {
                    case 400:
                        setError('Άκυρο αίτημα. Παρακαλώ ελέγξτε τις εισροές σας.');
                        break;
                    case 401:
                        setError('Μη εξουσιοδοτημένο αίτημα. Παρακαλώ συνδεθείτε ξανά.');
                        handleLogout();
                        break;
                    case 404:
                        setError('Η ζητούμενη πόρος δεν βρέθηκε. Παρακαλώ ελέγξτε τις παραμέτρους σας.');
                        break;
                    case 500:
                        setError('Προέκυψε σφάλμα στον διακομιστή. Παρακαλώ δοκιμάστε ξανά αργότερα.');
                        break;
                    default:
                        setError(err.response.data?.error || 'Προέκυψε μη αναμενόμενο σφάλμα.');
                }
            } else if (err.request) {
                setError('Δεν ήταν δυνατή η σύνδεση με τον διακομιστή. Παρακαλώ ελέγξτε τη σύνδεσή σας.');
            } else {
                setError('Προέκυψε σφάλμα κατά την εκκίνηση του αιτήματος.');
            }
        } finally {
            setLoading(false);
        }
    };

    // ==================== ChargesBy States and Handlers ====================
    const [chargesByState, setChargesByState] = useState({
        tollOpID: '',
        dateFrom: null, // Changed from '' to null
        dateTo: null,   // Changed from '' to null
        data: null,
        csvData: '',
    });

    const handleChargesByChange = (e) => {
        const { name, value } = e.target;
        setChargesByState((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleChargesByDateChange = (name, date) => {
        setChargesByState((prevState) => ({
            ...prevState,
            [name]: date,
        }));
    };

    const handleChargesBySubmit = async (e) => {
        e.preventDefault();
        setError('');
        setChargesByState((prevState) => ({
            ...prevState,
            data: null,
            csvData: '',
        }));
        setLoading(true);

        const { tollOpID, dateFrom, dateTo } = chargesByState;

        // Validate form inputs
        if (!tollOpID || !dateFrom || !dateTo) {
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

            const url = `http://localhost:9115/api/chargesBy/${tollOpID}/${formattedDateFrom}/${formattedDateTo}`;

            const response = await axios.get(url, {
                params: { format },
                headers: {
                    'Content-Type': 'application/json',
                    'x-observatory-auth': token,
                },
                responseType: format === 'csv' ? 'blob' : 'json',
            });

            if (response.status === 200) {
                if (format === 'json') {
                    setChargesByState((prevState) => ({
                        ...prevState,
                        data: response.data,
                    }));
                } else if (format === 'csv') {
                    if (response.data instanceof Blob) {
                        const csvUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
                        setChargesByState((prevState) => ({
                            ...prevState,
                            csvData: csvUrl,
                        }));
                    } else {
                        setError('Μη αναμενόμενη μορφή δεδομένων CSV.');
                    }
                }
            } else if (response.status === 204) {
                setError('Δεν επιστράφηκαν δεδομένα για τα κριτήρια που δώσατε.');
            }
        } catch (err) {
            if (err.response) {
                switch (err.response.status) {
                    case 400:
                        setError('Άκυρο αίτημα. Παρακαλώ ελέγξτε τις εισροές σας.');
                        break;
                    case 401:
                        setError('Μη εξουσιοδοτημένο αίτημα. Παρακαλώ συνδεθείτε ξανά.');
                        handleLogout();
                        break;
                    case 404:
                        setError('Η ζητούμενη πόρος δεν βρέθηκε. Παρακαλώ ελέγξτε τις παραμέτρους σας.');
                        break;
                    case 500:
                        setError('Προέκυψε σφάλμα στον διακομιστή. Παρακαλώ δοκιμάστε ξανά αργότερα.');
                        break;
                    default:
                        setError(err.response.data?.error || 'Προέκυψε μη αναμενόμενο σφάλμα.');
                }
            } else if (err.request) {
                setError('Δεν ήταν δυνατή η σύνδεση με τον διακομιστή. Παρακαλώ ελέγξτε τη σύνδεσή σας.');
            } else {
                setError('Προέκυψε σφάλμα κατά την εκκίνηση του αιτήματος.');
            }
        } finally {
            setLoading(false);
        }
    };

    // ==================== PassesCost States and Handlers ====================
    const [passesCostState, setPassesCostState] = useState({
        tollOpID: '',
        tagOpID: '',
        dateFrom: null, // Changed from '' to null
        dateTo: null,   // Changed from '' to null
        data: null,
        csvData: '',
    });

    const handlePassesCostChange = (e) => {
        const { name, value } = e.target;
        setPassesCostState((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handlePassesCostDateChange = (name, date) => {
        setPassesCostState((prevState) => ({
            ...prevState,
            [name]: date,
        }));
    };

    const handlePassesCostSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setPassesCostState((prevState) => ({
            ...prevState,
            data: null,
            csvData: '',
        }));
        setLoading(true);

        const { tollOpID, tagOpID, dateFrom, dateTo } = passesCostState;

        // Validate form inputs
        if (!tollOpID || !tagOpID || !dateFrom || !dateTo) {
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

            const url = `http://localhost:9115/api/passesCost/${tollOpID}/${tagOpID}/${formattedDateFrom}/${formattedDateTo}`;

            const response = await axios.get(url, {
                params: { format },
                headers: {
                    'Content-Type': 'application/json',
                    'x-observatory-auth': token,
                },
                responseType: format === 'csv' ? 'blob' : 'json',
            });

            if (response.status === 200) {
                if (format === 'json') {
                    setPassesCostState((prevState) => ({
                        ...prevState,
                        data: response.data,
                    }));
                } else if (format === 'csv') {
                    if (response.data instanceof Blob) {
                        const csvUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
                        setPassesCostState((prevState) => ({
                            ...prevState,
                            csvData: csvUrl,
                        }));
                    } else {
                        setError('Μη αναμενόμενη μορφή δεδομένων CSV.');
                    }
                }
            } else if (response.status === 204) {
                setError('Δεν επιστράφηκαν δεδομένα για τα κριτήρια που δώσατε.');
            }
        } catch (err) {
            if (err.response) {
                switch (err.response.status) {
                    case 400:
                        setError('Άκυρο αίτημα. Παρακαλώ ελέγξτε τις εισροές σας.');
                        break;
                    case 401:
                        setError('Μη εξουσιοδοτημένο αίτημα. Παρακαλώ συνδεθείτε ξανά.');
                        handleLogout();
                        break;
                    case 404:
                        setError('Η ζητούμενη πόρος δεν βρέθηκε. Παρακαλώ ελέγξτε τις παραμέτρους σας.');
                        break;
                    case 500:
                        setError('Προέκυψε σφάλμα στον διακομιστή. Παρακαλώ δοκιμάστε ξανά αργότερα.');
                        break;
                    default:
                        setError(err.response.data?.error || 'Προέκυψε μη αναμενόμενο σφάλμα.');
                }
            } else if (err.request) {
                setError('Δεν ήταν δυνατή η σύνδεση με τον διακομιστή. Παρακαλώ ελέγξτε τη σύνδεσή σας.');
            } else {
                setError('Προέκυψε σφάλμα κατά την εκκίνηση του αιτήματος.');
            }
        } finally {
            setLoading(false);
        }
    };

    // ==================== TollStationPasses States and Handlers ====================
    const [tollStationPassesState, setTollStationPassesState] = useState({
        tollStationID: '',
        dateFrom: null, // Changed from '' to null
        dateTo: null,   // Changed from '' to null
        data: null,
        csvData: '',
    });

    const handleTollStationPassesChange = (e) => {
        const { name, value } = e.target;
        setTollStationPassesState((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleTollStationPassesDateChange = (name, date) => {
        setTollStationPassesState((prevState) => ({
            ...prevState,
            [name]: date,
        }));
    };

    const handleTollStationPassesSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setTollStationPassesState((prevState) => ({
            ...prevState,
            data: null,
            csvData: '',
        }));
        setLoading(true);

        const { tollStationID, dateFrom, dateTo } = tollStationPassesState;

        // Validate form inputs
        if (!tollStationID || !dateFrom || !dateTo) {
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

            const url = `http://localhost:9115/api/tollStationPasses/${tollStationID}/${formattedDateFrom}/${formattedDateTo}`;

            const response = await axios.get(url, {
                params: { format },
                headers: {
                    'Content-Type': 'application/json',
                    'x-observatory-auth': token,
                },
                responseType: format === 'csv' ? 'blob' : 'json',
            });

            if (response.status === 200) {
                if (format === 'json') {
                    setTollStationPassesState((prevState) => ({
                        ...prevState,
                        data: response.data,
                    }));
                } else if (format === 'csv') {
                    if (response.data instanceof Blob) {
                        const csvUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
                        setTollStationPassesState((prevState) => ({
                            ...prevState,
                            csvData: csvUrl,
                        }));
                    } else {
                        setError('Μη αναμενόμενη μορφή δεδομένων CSV.');
                    }
                }
            } else if (response.status === 204) {
                setError('Δεν επιστράφηκαν δεδομένα για τα κριτήρια που δώσατε.');
            }
        } catch (err) {
            if (err.response) {
                switch (err.response.status) {
                    case 400:
                        setError('Άκυρο αίτημα. Παρακαλώ ελέγξτε τις εισροές σας.');
                        break;
                    case 401:
                        setError('Μη εξουσιοδοτημένο αίτημα. Παρακαλώ συνδεθείτε ξανά.');
                        handleLogout();
                        break;
                    case 404:
                        setError('Η ζητούμενη πόρος δεν βρέθηκε. Παρακαλώ ελέγξτε τις παραμέτρους σας.');
                        break;
                    case 500:
                        setError('Προέκυψε σφάλμα στον διακομιστή. Παρακαλώ δοκιμάστε ξανά αργότερα.');
                        break;
                    default:
                        setError(err.response.data?.error || 'Προέκυψε μη αναμενόμενο σφάλμα.');
                }
            } else if (err.request) {
                setError('Δεν ήταν δυνατή η σύνδεση με τον διακομιστή. Παρακαλώ ελέγξτε τη σύνδεσή σας.');
            } else {
                setError('Προέκυψε σφάλμα κατά την εκκίνηση του αιτήματος.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="analysis-dashboard-container">
            <h2>Δεδομένα</h2>
            <div className="tabs">
                <button
                    className={activeTab === 'PassAnalysis' ? 'active' : ''}
                    onClick={() => handleTabClick('PassAnalysis')}
                >
                    Ανάλυση Διελεύσεων
                </button>
                <button
                    className={activeTab === 'ChargesBy' ? 'active' : ''}
                    onClick={() => handleTabClick('ChargesBy')}
                >
                    Ανάλυση Χρεώσεων
                </button>
                <button
                    className={activeTab === 'PassesCost' ? 'active' : ''}
                    onClick={() => handleTabClick('PassesCost')}
                >
                    Κόστος Διέλευσης
                </button>
                <button
                    className={activeTab === 'TollStationPasses' ? 'active' : ''}
                    onClick={() => handleTabClick('TollStationPasses')}
                >
                    Διελεύσεις Σταθμών Διοδίων
                </button>
            </div>

            <div className="tab-content">
                {/* ==================== PassAnalysis Tab ==================== */}
                {activeTab === 'PassAnalysis' && (
                    <div className="analysis-section">
                        <h3>Ανάλυση Διελεύσεων</h3>
                        <form onSubmit={handlePassAnalysisSubmit}>
                            <div className="form-group">
                                <label>Κωδικός Λειτουργού Σταθμού:</label>
                                <select
                                    name="stationOpID"
                                    value={passAnalysisState.stationOpID}
                                    onChange={handlePassAnalysisChange}
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
                                    name="tagOpID"
                                    value={passAnalysisState.tagOpID}
                                    onChange={handlePassAnalysisChange}
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
                                <ReactDatePicker
                                    selected={passAnalysisState.dateFrom}
                                    onChange={(date) => handlePassAnalysisDateChange('dateFrom', date)}
                                    dateFormat="dd/MM/yyyy" // Updated format
                                    placeholderText="dd/mm/yyyy"
                                    className="date-picker-input"
                                    maxDate={new Date()}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Ημερομηνία Έως:</label>
                                <ReactDatePicker
                                    selected={passAnalysisState.dateTo}
                                    onChange={(date) => handlePassAnalysisDateChange('dateTo', date)}
                                    dateFormat="dd/MM/yyyy" // Updated format
                                    placeholderText="dd/mm/yyyy"
                                    className="date-picker-input"
                                    minDate={passAnalysisState.dateFrom}
                                    maxDate={new Date()}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Μορφή:</label>
                                <select
                                    value={format}
                                    onChange={(e) => setFormat(e.target.value)}
                                >
                                    <option value="json">JSON</option>
                                    <option value="csv">CSV</option>
                                </select>
                            </div>

                            <button type="submit" disabled={loading}>
                                {loading ? 'Φόρτωση...' : 'Εμφάνιση Δεδομένων'}
                            </button>
                        </form>

                        {error && <div className="error-message">{error}</div>}

                        {format === 'json' && passAnalysisState.data && (
                            <div className="results-section">
                                <h4>Δεδομένα Ανάλυσης Περασμάτων</h4>
                                <p><strong>ID Λειτουργού Σταθμού:</strong> {passAnalysisState.data.stationOpID}</p>
                                <p><strong>ID Παρόχου Ετικέτας:</strong> {passAnalysisState.data.tagOpID}</p>
                                <p><strong>Χρονική Σήμανση Αιτήματος:</strong> {passAnalysisState.data.requestTimestamp}</p>
                                <p><strong>Περίοδος Από:</strong> {displayDate(passAnalysisState.data.periodFrom)}</p>
                                <p><strong>Περίοδος Έως:</strong> {displayDate(passAnalysisState.data.periodTo)}</p>
                                <p><strong>Αριθμός Διελεύσεων:</strong> {passAnalysisState.data.nPasses}</p>
                                {Array.isArray(passAnalysisState.data.passList) && passAnalysisState.data.passList.length > 0 ? (
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Δείκτης Διέλευσης</th>
                                                <th>ID Διέλευσης</th>
                                                <th>ID Σταθμού</th>
                                                <th>Χρονική Σήμανση</th>
                                                <th>ID Ετικέτας</th>
                                                <th>Κόστος Διέλευσης</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {passAnalysisState.data.passList.map((pass) => (
                                                <tr key={pass.passID}>
                                                    <td>{pass.passIndex}</td>
                                                    <td>{pass.passID}</td>
                                                    <td>{pass.stationID}</td>
                                                    <td>{pass.timestamp}</td>
                                                    <td>{pass.tagID}</td>
                                                    <td>
                                                        {typeof pass.passCharge === 'number'
                                                            ? pass.passCharge.toFixed(2)
                                                            : '0.00'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p>Δεν υπάρχουν διαθέσιμα δεδομένα περασμάτων.</p>
                                )}
                            </div>
                        )}

                        {format === 'csv' && passAnalysisState.csvData && (
                            <div className="csv-download-section">
                                <h4>Λήψη CSV</h4>
                                <a
                                    href={passAnalysisState.csvData}
                                    download={`analysis_${passAnalysisState.stationOpID}_${passAnalysisState.tagOpID}_${formatDate(passAnalysisState.dateFrom)}_${formatDate(passAnalysisState.dateTo)}.csv`}
                                    className="download-link"
                                >
                                    Κατεβάστε το CSV
                                </a>
                            </div>
                        )}
                    </div>
                )}

                {/* ==================== ChargesBy Tab ==================== */}
                {activeTab === 'ChargesBy' && (
                    <div className="analysis-section">
                        <h3>Ανάλυση Χρεώσεων</h3>
                        <form onSubmit={handleChargesBySubmit}>
                            <div className="form-group">
                                <label>Κωδικός Λειτουργού Εισόδου:</label>
                                <select
                                    name="tollOpID"
                                    value={chargesByState.tollOpID}
                                    onChange={handleChargesByChange}
                                    required
                                >
                                    <option value="">-- Επιλέξτε Λειτουργό --</option>
                                    {operationOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Ημερομηνία Από:</label>
                                <ReactDatePicker
                                    selected={chargesByState.dateFrom}
                                    onChange={(date) => handleChargesByDateChange('dateFrom', date)}
                                    dateFormat="dd/MM/yyyy" // Updated format
                                    placeholderText="dd/mm/yyyy"
                                    className="date-picker-input"
                                    maxDate={new Date()}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Ημερομηνία Έως:</label>
                                <ReactDatePicker
                                    selected={chargesByState.dateTo}
                                    onChange={(date) => handleChargesByDateChange('dateTo', date)}
                                    dateFormat="dd/MM/yyyy" // Updated format
                                    placeholderText="dd/mm/yyyy"
                                    className="date-picker-input"
                                    minDate={chargesByState.dateFrom}
                                    maxDate={new Date()}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Μορφή:</label>
                                <select
                                    value={format}
                                    onChange={(e) => setFormat(e.target.value)}
                                >
                                    <option value="json">JSON</option>
                                    <option value="csv">CSV</option>
                                </select>
                            </div>

                            <button type="submit" disabled={loading}>
                                {loading ? 'Φόρτωση...' : 'Εμφάνιση Δεδομένων'}
                            </button>
                        </form>

                        {error && <div className="error-message">{error}</div>}

                        {format === 'json' && chargesByState.data && (
                            <div className="results-section">
                                <h4>Δεδομένα Χρεώσεων</h4>
                                <p><strong>ID Λειτουργού Εισόδου:</strong> {chargesByState.data.tollOpID}</p>
                                <p><strong>Χρονική Σήμανση Αιτήματος:</strong> {chargesByState.data.requestTimestamp}</p>
                                <p><strong>Περίοδος Από:</strong> {displayDate(chargesByState.data.periodFrom)}</p>
                                <p><strong>Περίοδος Έως:</strong> {displayDate(chargesByState.data.periodTo)}</p>
                                <h5>Λίστα Επισκέψεων:</h5>
                                {Array.isArray(chargesByState.data.vOpList) && chargesByState.data.vOpList.length > 0 ? (
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>ID Επισκέπτη Λειτουργού</th>
                                                <th>Αριθμός Διελεύσεων</th>
                                                <th>Κόστος Διέλευσης</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {chargesByState.data.vOpList.map((vOp, index) => (
                                                <tr key={index}>
                                                    <td>{vOp.visitingOpID}</td>
                                                    <td>{vOp.nPasses}</td>
                                                    <td>
                                                        {typeof vOp.passesCost === 'number'
                                                            ? vOp.passesCost.toFixed(2)
                                                            : '0.00'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p>Δεν υπάρχουν διαθέσιμα δεδομένα επισκέψεων.</p>
                                )}
                            </div>
                        )}

                        {format === 'csv' && chargesByState.csvData && (
                            <div className="csv-download-section">
                                <h4>Λήψη CSV</h4>
                                <a
                                    href={chargesByState.csvData}
                                    download={`chargesBy_${chargesByState.tollOpID}_${formatDate(chargesByState.dateFrom)}_${formatDate(chargesByState.dateTo)}.csv`}
                                    className="download-link"
                                >
                                    Κατεβάστε το CSV
                                </a>
                            </div>
                        )}
                    </div>
                )}

                {/* ==================== PassesCost Tab ==================== */}
                {activeTab === 'PassesCost' && (
                    <div className="analysis-section">
                        <h3>Κόστος Διέλευσης</h3>
                        <form onSubmit={handlePassesCostSubmit}>
                            <div className="form-group">
                                <label>Κωδικός Λειτουργού Εισόδου:</label>
                                <select
                                    name="tollOpID"
                                    value={passesCostState.tollOpID}
                                    onChange={handlePassesCostChange}
                                    required
                                >
                                    <option value="">-- Επιλέξτε Λειτουργό --</option>
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
                                    name="tagOpID"
                                    value={passesCostState.tagOpID}
                                    onChange={handlePassesCostChange}
                                    required
                                >
                                    <option value="">-- Επιλέξτε Παρόχο Ετικέτας --</option>
                                    {operationOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Ημερομηνία Από:</label>
                                <ReactDatePicker
                                    selected={passesCostState.dateFrom}
                                    onChange={(date) => handlePassesCostDateChange('dateFrom', date)}
                                    dateFormat="dd/MM/yyyy" // Updated format
                                    placeholderText="Επιλέξτε ημερομηνία"
                                    className="date-picker-input"
                                    maxDate={new Date()}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Ημερομηνία Έως:</label>
                                <ReactDatePicker
                                    selected={passesCostState.dateTo}
                                    onChange={(date) => handlePassesCostDateChange('dateTo', date)}
                                    dateFormat="dd/MM/yyyy" // Updated format
                                    placeholderText="dd/mm/yyyy"
                                    className="date-picker-input"
                                    minDate={passesCostState.dateFrom}
                                    maxDate={new Date()}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Μορφή:</label>
                                <select
                                    value={format}
                                    onChange={(e) => setFormat(e.target.value)}
                                >
                                    <option value="json">JSON</option>
                                    <option value="csv">CSV</option>
                                </select>
                            </div>

                            <button type="submit" disabled={loading}>
                                {loading ? 'Φόρτωση...' : 'Εμφάνιση Δεδομένων'}
                            </button>
                        </form>

                        {error && <div className="error-message">{error}</div>}

                        {format === 'json' && passesCostState.data && (
                            <div className="results-section">
                                <h4>Δεδομένα Κόστους Διέλευσης</h4>
                                <p><strong>ID Λειτουργού Εισόδου:</strong> {passesCostState.data.tollOpID}</p>
                                <p><strong>ID Παρόχου Ετικέτας:</strong> {passesCostState.data.tagOpID}</p>
                                <p><strong>Χρονική Σήμανση Αιτήματος:</strong> {passesCostState.data.requestTimestamp}</p>
                                <p><strong>Περίοδος Από:</strong> {displayDate(passesCostState.data.periodFrom)}</p>
                                <p><strong>Περίοδος Έως:</strong> {displayDate(passesCostState.data.periodTo)}</p>
                                <p><strong>Αριθμός Διέλευσεων:</strong> {passesCostState.data.nPasses}</p>
                                <p><strong>Κόστος Διέλευσης:</strong> 
                                    {typeof passesCostState.data.passesCost === 'number'
                                        ? passesCostState.data.passesCost.toFixed(2)
                                        : '0.00'}
                                </p>
                            </div>
                        )}

                        {format === 'csv' && passesCostState.csvData && (
                            <div className="csv-download-section">
                                <h4>Λήψη CSV</h4>
                                <a
                                    href={passesCostState.csvData}
                                    download={`passesCost_${passesCostState.tollOpID}_${passesCostState.tagOpID}_${formatDate(passesCostState.dateFrom)}_${formatDate(passesCostState.dateTo)}.csv`}
                                    className="download-link"
                                >
                                    Κατεβάστε το CSV
                                </a>
                            </div>
                        )}
                    </div>
                )}

                {/* ==================== TollStationPasses Tab ==================== */}
                {activeTab === 'TollStationPasses' && (
                    <div className="analysis-section">
                        <h3>Διελεύσεις Σταθμών Διοδίων</h3>
                        <form onSubmit={handleTollStationPassesSubmit}>
                            <div className="form-group">
                                <label>Σταθμός Διοδίου:</label>
                                <select
                                    name="tollStationID"
                                    value={tollStationPassesState.tollStationID}
                                    onChange={handleTollStationPassesChange}
                                    required
                                >
                                    <option value="">-- Επιλέξτε Σταθμό Διοδίου --</option>
                                    {operationOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Ημερομηνία Από:</label>
                                <ReactDatePicker
                                    selected={tollStationPassesState.dateFrom}
                                    onChange={(date) => handleTollStationPassesDateChange('dateFrom', date)}
                                    dateFormat="dd/MM/yyyy" // Updated format
                                    placeholderText="dd/mm/yyyy"
                                    className="date-picker-input"
                                    maxDate={new Date()}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Ημερομηνία Έως:</label>
                                <ReactDatePicker
                                    selected={tollStationPassesState.dateTo}
                                    onChange={(date) => handleTollStationPassesDateChange('dateTo', date)}
                                    dateFormat="dd/MM/yyyy" // Updated format
                                    placeholderText="dd/mm/yyyy"
                                    className="date-picker-input"
                                    minDate={tollStationPassesState.dateFrom}
                                    maxDate={new Date()}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Μορφή:</label>
                                <select
                                    value={format}
                                    onChange={(e) => setFormat(e.target.value)}
                                >
                                    <option value="json">JSON</option>
                                    <option value="csv">CSV</option>
                                </select>
                            </div>

                            <button type="submit" disabled={loading}>
                                {loading ? 'Φόρτωση...' : 'Εμφάνιση Δεδομένων'}
                            </button>
                        </form>

                        {error && <div className="error-message">{error}</div>}

                        {format === 'json' && tollStationPassesState.data && (
                            <div className="results-section">
                                <h4>Δεδομένα Διελεύσεων Σταθμών Διοδίων</h4>
                                <p><strong>ID Σταθμού :</strong> {tollStationPassesState.data.stationID}</p>
                                <p><strong>Λειτουργός Σταθμού:</strong> {tollStationPassesState.data.stationOperator}</p>
                                <p><strong>Χρονική Σήμανση Αιτήματος:</strong> {tollStationPassesState.data.requestTimestamp}</p>
                                <p><strong>Περίοδος Από:</strong> {displayDate(tollStationPassesState.data.periodFrom)}</p>
                                <p><strong>Περίοδος Έως:</strong> {displayDate(tollStationPassesState.data.periodTo)}</p>
                                <p><strong>Αριθμός Διέλευσεων:</strong> {tollStationPassesState.data.nPasses}</p>
                                {Array.isArray(tollStationPassesState.data.passList) && tollStationPassesState.data.passList.length > 0 ? (
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Δείκτης Διέλευσης</th>
                                                <th>ID Διέλευσης</th>
                                                <th>Χρονική Σήμανση</th>
                                                <th>ID Ετικέτας</th>
                                                <th>Πάροχος Ετικέτας</th>
                                                <th>Τύπος Διέλευσης</th>
                                                <th>Κόστος Διέλευσης</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tollStationPassesState.data.passList.map((pass) => (
                                                <tr key={pass.passID}>
                                                    <td>{pass.passIndex}</td>
                                                    <td>{pass.passID}</td>
                                                    <td>{pass.timestamp}</td>
                                                    <td>{pass.tagID}</td>
                                                    <td>{pass.tagProvider}</td>
                                                    <td>{pass.passType}</td>
                                                    <td>
                                                        {typeof pass.passCharge === 'number'
                                                            ? pass.passCharge.toFixed(2)
                                                            : '0.00'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p>Δεν υπάρχουν διαθέσιμα δεδομένα περασμάτων.</p>
                                )}
                            </div>
                        )}

                        {format === 'csv' && tollStationPassesState.csvData && (
                            <div className="csv-download-section">
                                <h4>Λήψη CSV</h4>
                                <a
                                    href={tollStationPassesState.csvData}
                                    download={`tollStationPasses_${tollStationPassesState.tollStationID}_${formatDate(tollStationPassesState.dateFrom)}_${formatDate(tollStationPassesState.dateTo)}.csv`}
                                    className="download-link"
                                >
                                    Κατεβάστε το CSV
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalysisDashboard;
