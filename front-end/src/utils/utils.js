// src/utils/utils.js
export const getPrefix = (id) => {
    const match = id.match(/^[A-Za-z]+/);
    return match ? match[0] : '';
  };
  
  export const fetchCsvData = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const csvText = await response.text();
      return csvText;
    } catch (error) {
      throw error;
    }
  };
  