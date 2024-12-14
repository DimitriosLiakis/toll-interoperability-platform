import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import "./MapPage.css";

function Map() {
  const mapRef = useRef(null);
  const markersRef = useRef(null);
  const [tolls, setTolls] = useState([]);
  const [filters, setFilters] = useState({ operator: "", name: "" });

  const customIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  useEffect(() => {
    if (mapRef.current === null) {
      // Initialize the map with default controls disabled
      mapRef.current = L.map("map", {
        zoomControl: false, // Disable zoom control
        attributionControl: false, // Disable attribution control
      }).setView([38.246639, 21.734573], 8);

      // Add the tile layer without attribution since attributionControl is false
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        // No attribution here
      }).addTo(mapRef.current);

      markersRef.current = L.layerGroup().addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const fetchTolls = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/tolls");
        setTolls(response.data);
      } catch (error) {
        console.error("Error fetching tolls:", error);
      }
    };

    fetchTolls();
  }, []);

  const filteredTolls = tolls.filter((toll) => {
    const matchesOperator = filters.operator
      ? toll.operator.toLowerCase().includes(filters.operator.toLowerCase())
      : true;
    const matchesName = filters.name
      ? toll.name.toLowerCase().includes(filters.name.toLowerCase())
      : true;
    return matchesOperator && matchesName;
  });

  useEffect(() => {
    if (mapRef.current && markersRef.current) {
      markersRef.current.clearLayers();

      filteredTolls.forEach((toll) => {
        const marker = L.marker([toll.latitude, toll.longitude], { icon: customIcon })
          .bindPopup(
            `
              <div class="popup-content">
                <button class="close-button" onclick="this.parentElement.parentElement.style.display='none';">×</button>
                <strong>${toll.name}</strong>
                <span>Operator:</span> ${toll.operator}<br/>
                <span>Email:</span> <a href="mailto:${toll.email}">${toll.email}</a><br/>
                <span>Prices:</span> ${toll.prices.join(", ")}
              </div>
            `,
            {
              maxWidth: 400, // Increased width for better readability
              autoPan: true,
              closeButton: false, // Disable default close button
              keepInView: true,
            }
          );

        markersRef.current.addLayer(marker);
      });
    }
  }, [filteredTolls]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h3>Φίλτρα</h3>
        <label>
          Εταιρεία:
          <input
            type="text"
            name="operator"
            value={filters.operator}
            onChange={handleFilterChange}
            placeholder="Εταιρεία..."
            style={{ marginLeft: "10px" }}
          />
        </label>
        <label style={{ marginLeft: "20px" }}>
          Όνομα:
          <input
            type="text"
            name="name"
            value={filters.name}
            onChange={handleFilterChange}
            placeholder="Αναζήτηση..."
            style={{ marginLeft: "10px" }}
          />
        </label>
      </div>
      <div id="map" style={{ height: "500px", width: "100%" }}></div>
    </div>
  );
}

export default Map;
