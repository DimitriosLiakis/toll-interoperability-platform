import React from "react";
import { Link } from "react-router-dom";
import '../styles/WelcomePage.css';

function WelcomePage() {
  return (
    <div className="welcome-container">
      <h1>Καλωσήρθατε στη Διαχείριση Διοδίων!</h1>
      <p>Χρησιμοποιήστε την εφαρμογή για να δείτε στατιστικά, χάρτες και να διαχειριστείτε πληροφορίες διοδίων.</p>
      <Link to="/home" className="welcome-button">Μετάβαση στην Εφαρμογή</Link>
    </div>
  );
}

export default WelcomePage;
