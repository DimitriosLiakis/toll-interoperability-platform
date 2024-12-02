// Map.js
import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

function Map() {
  const mapRef = useRef(null);
  const [coordinates, setCoordinates] = useState([]);
  const [filters, setFilters] = useState({ category: '', name: '' });

  // Αρχικοποίηση του χάρτη
  useEffect(() => {
    if (mapRef.current === null) {
      mapRef.current = L.map("map").setView([38.246639, 21.734573], 8);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/coordinates', {
          params: filters,
        });
        setCoordinates(response.data);
      } catch (error) {
        console.error("Error fetching coordinates:", error);
      }
    };

    fetchCoordinates();
  }, [filters]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.eachLayer(layer => {
        if (layer instanceof L.Marker) {
          mapRef.current.removeLayer(layer);
        }
      });

      coordinates.forEach(coord => {
        L.marker([coord.lat, coord.lng])
          .addTo(mapRef.current)
          .bindPopup(coord.name);
      });
    }
  }, [coordinates]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h3>Φίλτρα</h3>
        <label>
          Κατηγορία:
          <select name="category" value={filters.category} onChange={handleFilterChange}>
            <option value="">Όλες</option>
            <option value="city">Πόλη</option>
            <option value="capital">Πρωτεύουσα</option>
            
          </select>
        </label>
        <label style={{ marginLeft: "20px" }}>
          Όνομα:
          <input
            type="text"
            name="name"
            value={filters.name}
            onChange={handleFilterChange}
            placeholder="Αναζήτηση..."
          />
        </label>
      </div>
      <div id="map" style={{ height: "500px", width: "100%" }}></div>
    </div>
  );
}

export default Map;
