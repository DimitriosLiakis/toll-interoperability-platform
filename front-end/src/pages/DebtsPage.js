import React, { useEffect, useState } from 'react';

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
            height: "500px",
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

const DebtsPage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:9115/api/get_debts_optimization")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      })
      .catch((err) => {
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
        Debts Analysis
      </h1>

      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
        <DebtSection
          title="Initial Debts"
          html={data.html.html1}
          sectionKey="initial"
        />

        <DebtSection
          title="Final Debts"
          html={data.html.html2}
          sectionKey="final"
        />
      </div>
    </div>
  );
};

export default DebtsPage;
