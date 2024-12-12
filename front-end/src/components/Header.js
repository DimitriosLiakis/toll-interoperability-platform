import React from "react";
import { NavLink } from "react-router-dom";
import "./Header.css";

function Header() {
  return (
    <header className="header">
      <h1 className="header-title">TollAnalysis</h1>

      {/* Navigation menu */}
      <nav className="header-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? "active" : "inactive")}
        >
          Αρχική
        </NavLink>
        <NavLink
          to="/stats"
          className={({ isActive }) => (isActive ? "active" : "inactive")}
        >
          Στατιστικά
        </NavLink>
        <NavLink
          to="/map"
          className={({ isActive }) => (isActive ? "active" : "inactive")}
        >
          Χάρτης
        </NavLink>
        <NavLink
          to="/upload"
          className={({ isActive }) => (isActive ? "active" : "inactive")}
        >
          Διελεύσεις
        </NavLink>
        <NavLink
          to="/debts"
          className={({ isActive }) => (isActive ? "active" : "inactive")}
        >
          Οφειλές
        </NavLink>
      </nav>
    </header>
  );
}

export default Header;
