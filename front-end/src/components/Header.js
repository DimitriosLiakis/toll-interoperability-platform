import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Header.css';

function Header({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/'); // Redirect to home page
    alert('You have been logged out.');
  };

  return (
    <header className="header">
      <h1 className="header-title">TollAnalysis</h1>
      <nav className="header-nav">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : 'inactive')}>
          Αρχική
        </NavLink>
        <NavLink to="/map" className={({ isActive }) => (isActive ? 'active' : 'inactive')}>
          Χάρτης
        </NavLink>
        <NavLink to="/upload" className={({ isActive }) => (isActive ? 'active' : 'inactive')}>
          Διελεύσεις
        </NavLink>
        {isLoggedIn && (
          <>
            <NavLink to="/stats" className={({ isActive }) => (isActive ? 'active' : 'inactive')}>
              Στατιστικά
            </NavLink>
            <NavLink to="/debts" className={({ isActive }) => (isActive ? 'active' : 'inactive')}>
              Οφειλές
            </NavLink>
            <NavLink
              to="/machine"
              className={({ isActive }) => (isActive ? 'active' : 'inactive')}
            >
              Machine Learning
            </NavLink>
          </>
        )}
        {isLoggedIn ? (
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        ) : (
          <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : 'inactive')}>
            Login
          </NavLink>
        )}
      </nav>
    </header>
  );
}

export default Header;
