import React from "react";
import { NavLink } from "react-router-dom";
import "./Header.css";

function Header() {
  return (
    <header className="header">
      <h1>TollAnalysis</h1>
      <nav>
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
          Αρχική
        </NavLink>
       
        <NavLink
          to="/stats"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Στατιστικά
        </NavLink>
        <NavLink
          to="/map"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Χάρτης
        </NavLink>
        <NavLink
          to="/upload"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Διελεύσεις
        </NavLink>
      </nav>
    </header>
  );
}

export default Header;
