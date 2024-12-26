import React, { useEffect, useState } from 'react';

const DebtsPage = () => {
  const [images, setImages] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:9115/api/get_debts_optimization')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setImages(data.figures);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h1>Debts Figures</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {images ? (
        <div>
          <div>
            <h2>Initial Debts</h2>
            <img
              src={images.figure1}
              alt="Initial Debts"
              style={{ maxWidth: '80%', maxHeight: '400px', marginBottom: '20px' }}
            />
          </div>
          <div>
            <h2>Final Debts</h2>
            <img
              src={images.figure2}
              alt="Final Debts"
              style={{ maxWidth: '80%', maxHeight: '400px' }}
            />
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default DebtsPage;
