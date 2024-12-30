import React, { useEffect, useState } from 'react';

const DebtsPage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [views, setViews] = useState({
    initial: 'image',
    final: 'image'
  });

  useEffect(() => {
    fetch('http://localhost:9115/api/get_debts_optimization')
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

  const DebtSection = ({ title, image, html, sectionKey }) => (
    <div className="mb-8 p-6 border rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="mb-4">
        <button
          onClick={() => setViews(prev => ({ ...prev, [sectionKey]: 'image' }))}
          className={`px-4 py-2 mr-2 rounded ${
            views[sectionKey] === 'image' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200'
          }`}
        >
          Image View
        </button>
        <button
          onClick={() => setViews(prev => ({ ...prev, [sectionKey]: 'html' }))}
          className={`px-4 py-2 rounded ${
            views[sectionKey] === 'html' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200'
          }`}
        >
          HTML View
        </button>
      </div>
      <div className="mt-4">
        {views[sectionKey] === 'image' ? (
          <img
            src={image}
            alt={title}
            style={{ maxWidth: '100%', height: 'auto', margin: '0 auto' }}
          />
        ) : (
          <div
            className="border rounded p-4 bg-white"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </div>
  );

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '1rem',
        color: 'red' 
      }}>
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold', 
        textAlign: 'center', 
        marginBottom: '2rem' 
      }}>
        Debts Analysis
      </h1>
      
      <DebtSection
        title="Initial Debts"
        image={data.figures.figure1}
        html={data.html.html1}
        sectionKey="initial"
      />
      
      <DebtSection
        title="Final Debts"
        image={data.figures.figure2}
        html={data.html.html2}
        sectionKey="final"
      />
    </div>
  );
};

export default DebtsPage;
