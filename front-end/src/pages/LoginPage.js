import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css"; // Optional styling
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function LoginPage({ setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  // Helper function for client-side validation
  const validateForm = () => {
    if (!email) {
      toast.error("Παρακαλώ εισάγετε το email σας.");
      return false;
    }
    // Simple email regex for validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Παρακαλώ εισάγετε ένα έγκυρο email.");
      return false;
    }
    if (!password) {
      toast.error("Παρακαλώ εισάγετε τον κωδικό σας.");
      return false;
    }
    if (password.length < 6) {
      toast.error("Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.");
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) return; // Perform client-side validation

    setLoading(true); // Start loading
    try {
      // Make a POST request to the /api/login endpoint
      const response = await fetch("http://localhost:9115/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_email: email,
          user_password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the token securely
        localStorage.setItem("token", data.token);

        // Update the parent state (if you’re using a parent App component)
        setIsLoggedIn(true);

        toast.success("Σύνδεση επιτυχής!");
        // Redirect to a protected page (e.g., home/dashboard)
        navigate("/");
      } else {
        // Handle specific server-side errors
        switch (response.status) {
          case 400:
            toast.error(data.error || "Άκυρο αίτημα. Παρακαλώ δοκιμάστε ξανά.");
            break;
          case 401:
            toast.error(data.error || "Μη εξουσιοδοτημένη πρόσβαση. Ελέγξτε τα διαπιστευτήριά σας.");
            break;
          case 403:
            toast.error(data.error || "Δεν έχετε δικαίωμα πρόσβασης σε αυτό το τμήμα.");
            break;
          case 404:
            toast.error(data.error || "Ο χρήστης δεν βρέθηκε.");
            break;
          case 500:
            toast.error(data.error || "Σφάλμα διακομιστή. Παρακαλώ δοκιμάστε αργότερα.");
            break;
          default:
            toast.error(data.error || "Σφάλμα κατά τη διαδικασία σύνδεσης.");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Παρουσιάστηκε σφάλμα κατά τη σύνδεση. Παρακαλώ προσπαθήστε ξανά.");
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className="login-page">
      <h2>Καλώς ήρθατε στην Υπηρεσία TollAnalysis</h2>
      <form onSubmit={handleLogin} className="login-form">
        <div className="input-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <input
            type="password"
            placeholder="Κωδικός"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Σύνδεση..." : "Σύνδεση"}
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar />
    </div>
  );
}

export default LoginPage;
