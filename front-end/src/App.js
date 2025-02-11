import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import WelcomePage from './pages/WelcomePage';
import MapPage from './pages/MapPage';
import DebtsPage from './pages/DebtsPage';
import StatsDashboard from './pages/StatsDashboard';
import MachineLearning from './pages/MachineLearning';
import LoginPage from './pages/LoginPage'; // Import LoginPage

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  // Monitor token changes to update login state
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  // PrivateRoute component to restrict access
  const PrivateRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <div className="App">
        <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<WelcomePage />} />
          <Route path="/map" element={<MapPage />} />

          {/* Protected Routes */}
          <Route
            path="/stats"
            element={
              <PrivateRoute>
                <StatsDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/debts"
            element={
              <PrivateRoute>
                <DebtsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/machine"
            element={
              <PrivateRoute>
                <MachineLearning />
              </PrivateRoute>
            }
          />

          {/* Login Route */}
          <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />

          {/* Redirect all unknown routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
