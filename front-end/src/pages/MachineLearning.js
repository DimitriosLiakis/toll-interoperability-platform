// src/pages/MachineLearning.js

import React, { useState } from 'react';
import { Chart, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Εγγραφή των components που χρειάζονται
Chart.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const MachineLearning = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stationCode, setStationCode] = useState('');
  const [date, setDate] = useState('');

  // Συνάρτηση για την ανάκτηση δεδομένων από το API
  const fetchCarForecast = async (stationCode, date) => {
    const apiUrl = `http://localhost:9115/api/forecast/${stationCode}/${date}`;
    
    try {
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Δεδομένα από το API:', data);
      return data;
    } catch (error) {
      console.error('Σφάλμα κατά την ανάκτηση των δεδομένων:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setChartData(null);

    if (!stationCode || !date) {
      setError('Παρακαλώ εισάγετε και τον κωδικό σταθμού και την ημερομηνία.');
      setLoading(false);
      return;
    }

    try {
      const data = await fetchCarForecast(stationCode, date);
      
      if (data && Array.isArray(data)) {
        console.log('Επιβεβαίωση ότι τα δεδομένα είναι πίνακας:', data);
        if (data.length > 0) {
          console.log('Πρώτο στοιχείο δεδομένων:', data[0]);
        }

        const stations = data.map(entry => entry.stationName);
        const carCounts = data.map(entry => entry.carCount);
        
        setChartData({
          labels: stations,
          datasets: [{
            label: 'Προβλεπόμενος Αριθμός Αυτοκινήτων',
            data: carCounts,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        });
      } else {
        console.error('Δεδομένα δεν είναι πίνακας ή είναι κενά:', data);
        setError('Δεν ήταν δυνατή η δημιουργία του διαγράμματος λόγω μη έγκυρων δεδομένων.');
      }
    } catch (err) {
      setError(err.message || 'Σφάλμα κατά την ανάκτηση των δεδομένων.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Πρόβλεψη Αυτοκινήτων ανά Σταθμό Διοδίων</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="stationCode">Κωδικός Σταθμού:</label>
          <input 
            type="text" 
            id="stationCode" 
            value={stationCode} 
            onChange={(e) => setStationCode(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label htmlFor="date">Ημερομηνία (YYYYMMDD):</label>
          <input 
            type="text" 
            id="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            pattern="\d{8}" 
            title="Παρακαλώ εισάγετε την ημερομηνία σε μορφή YYYYMMDD." 
            required 
          />
        </div>
        <button type="submit">Φόρτωση Δεδομένων</button>
      </form>

      {loading && <div>Φόρτωση δεδομένων...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      
      {chartData && (
        <Bar 
          data={chartData}
          options={{
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Αριθμός Αυτοκινήτων'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Σταθμοί Διοδίων'
                }
              }
            },
            plugins: {
              title: {
                display: true,
                text: 'Προβλέψεις Αυτοκινήτων ανά Σταθμό'
              },
              tooltip: {
                enabled: true
              },
              legend: {
                display: true,
                position: 'top'
              }
            }
          }}
        />
      )}
    </div>
  );
};

export default MachineLearning;
