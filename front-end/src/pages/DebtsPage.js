// src/DebtsPage.js
import React, { useEffect, useState } from 'react';

// Reusable components (DebtSection, CsvSection)
const DebtSection = ({ title, html, sectionKey }) => {
  const handleDownload = () => {
    const blob = new Blob([html], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${sectionKey}_debts.html`;
    link.click();
  };

  return (
    <div className="p-6 border rounded-lg shadow-sm" style={{ flex: "1", margin: "0 8px" }}>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-green-500 text-white rounded shadow"
        >
          Download HTML
        </button>
      </div>
      <div className="mt-4">
        <iframe
          srcDoc={html}
          style={{
            width: "600px",
            height: "620px",
            border: "1px solid lightgray",
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
          title={`${title} View`}
        />
      </div>
    </div>
  );
};

const CsvSection = ({ title, csvData }) => {
  if (!csvData) {
    return <p>No CSV data available.</p>;
  }

  const rows = csvData
    .split('\n')
    .filter((row) => row.trim() !== '') // Remove empty rows
    .map((row) => row.split(','));

  if (rows.length === 0) {
    return <p>No CSV data available.</p>;
  }

  // Filter rows: Keep rows where at least one value is not zero
  const filteredRows = rows.filter((row, rowIndex) => {
    // Always keep the header row
    if (rowIndex === 0) return true;

    // Check if all cells in the row are "0"
    return row.some((cell) => cell.trim() !== "0");
  });

  if (filteredRows.length <= 1) {
    // If only the header row remains, show a message
    return <p>No data to display.</p>;
  }

  return (
    <div className="p-6 border rounded-lg shadow-sm" style={{ marginTop: "2rem" }}>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {filteredRows[0].map((header, index) => (
                <th
                  key={index}
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    backgroundColor: "#f2f2f2",
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.slice(1).map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {cell.trim() === "0" ? "" : cell} {/* Hide zero values */}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DebtsPage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    // Function to handle logout (remove token and redirect to login)
    const handleLogout = () => {
      localStorage.removeItem("token");
      window.location.href = "/login"; // Redirect to login page
    };

    // Function to check token validity
    const checkToken = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        // No token found, redirect to login
        handleLogout();
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

    // Fetch debt data from API with enhanced error handling
    const fetchDebtData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Δεν βρέθηκε το token. Παρακαλώ συνδεθείτε ξανά.");
          handleLogout();
          return;
        }

        const response = await fetch("http://localhost:9115/api/get_debts_optimization", {
          headers: {
            "Content-Type": "application/json",
            "x-observatory-auth": token, // Attach the JWT here
          },
        });

        if (response.status === 200) {
          const result = await response.json();
          console.log(result); // Debugging line
          setData(result);
        } else if (response.status === 204) {
          setError("Δεν επιστράφηκαν δεδομένα για τα κριτήρια που δώσατε.");
        } else {
          // Handle specific status codes
          switch (response.status) {
            case 400:
              throw new Error("Άκυρο αίτημα. Παρακαλώ ελέγξτε τις εισροές σας.");
            case 401:
              throw new Error("Μη εξουσιοδοτημένο αίτημα. Παρακαλώ συνδεθείτε ξανά.");
            case 404:
              throw new Error("Η ζητούμενη πόρος δεν βρέθηκε.");
            case 500:
              throw new Error("Προέκυψε σφάλμα στον διακομιστή. Παρακαλώ δοκιμάστε ξανά αργότερα.");
            default:
              throw new Error("Προέκυψε μη αναμενόμενο σφάλμα.");
          }
        }
      } catch (err) {
        console.error(err); // Debugging line
        setError(err.message);

        // Handle Unauthorized and Forbidden errors by logging out
        if (err.message.includes('Unauthorized') || err.message.includes('Forbidden')) {
          const handleLogout = () => {
            localStorage.removeItem("token");
            window.location.href = "/login"; // Redirect to login page
          };
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDebtData();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          color: "red",
        }}
      >
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!data) {
    return null; // Or some fallback UI
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "2rem",
        }}
      >
        Debt Figures
      </h1>

      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
        <DebtSection
          title="Αρχικές Οφειλές"
          html={data.html.html1}
          sectionKey="initial"
        />

        <DebtSection
          title="Τελικές Οφειλές"
          html={data.html.html2}
          sectionKey="final"
        />
      </div>

      <CsvSection
        title="Graph Data (graph2.csv)"
        csvData={data.csv}
      />
    </div>
  );
};

export default DebtsPage;
