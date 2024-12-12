import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import WelcomePage from './pages/WelcomePage';
import StatsPage from './pages/StatsPage';
import MapPage from './pages/MapPage';
import UploadPage from './pages/DisplayPassages'; 
import DebtsPage from './pages/DebtsPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/debts" element={<DebtsPage />} /> {/* Add this line */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
