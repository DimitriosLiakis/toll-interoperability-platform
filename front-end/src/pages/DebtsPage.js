import React, { useEffect, useState } from 'react';

// Reusable components (DebtSection, CsvSection) remain the same
// as in your original code — no need to change them unless you want
// additional checks/behavior based on authentication.

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

  useEffect(() => {
    // 1. Retrieve the token from localStorage
    const token = localStorage.getItem("token");

    // 2. Make an authenticated request including the token in headers
    fetch("http://localhost:9115/api/get_debts_optimization", {
      headers: {
        "Content-Type": "application/json",
        "x-observatory-auth": token, // <-- Attach the JWT here
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          // For 401/403, you might handle unauthorized or forbidden response
          if (response.status === 401 || response.status === 403) {
            throw new Error(`Unauthorized request (status ${response.status}).`);
          } else {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
        }
        const result = await response.json();
        console.log(result); // Debugging line
        setData(result);
      })
      .catch((err) => {
        console.error(err); // Debugging line
        setError(err.message);
      });
  }, []);

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
