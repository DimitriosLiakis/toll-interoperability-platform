import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster"; // Import the markercluster plugin
import axios from "axios";
import "./MapPage.css";

// Fix for default icon issues in Leaflet when using with React
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Set default icon (optional if you use custom icons)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

function Map() {
  const mapRef = useRef(null);
  const markersRef = useRef(null); // This will hold the MarkerClusterGroup
  const [tolls, setTolls] = useState([]);
  const [filters, setFilters] = useState({ operator: "all", name: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Operator translation mapping
  const operatorTranslations = {
    aegeanmotorway: "Αυτοκινητόδρομος Αιγαίου",
    egnatia: "Εγνατία Οδός",
    gefyra: "Γέφυρα",
    kentrikiodos: "Κεντρική Οδός",
    moreas: "Μορέας",
    naodos: "Αττική Οδός",
    neaodos: "Νέα Οδός",
    olympiaodos: "Ολυμπία Οδός",
  };

  // Define a custom icon with corrected anchor points
  const customIcon = L.icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    iconSize: [25, 41], // Size of the icon
    iconAnchor: [0, 0], // Point of the icon which will correspond to marker's location (bottom center)
    popupAnchor: [0, 0], // Point from which the popup should open relative to the iconAnchor
  });

  // Initialize the map
  useEffect(() => {
    if (mapRef.current === null) {
      // Initialize the map with default controls disabled
      mapRef.current = L.map("map", {
        zoomControl: false,
        attributionControl: false,
        center: [38.246639, 21.734573],
        zoom: 8,
      });

      // Add the tile layer without attribution since attributionControl is false
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        // No attribution included
      }).addTo(mapRef.current);

      // Add zoom controls manually if needed
      L.control.zoom({
        position: "topright",
      }).addTo(mapRef.current);

      // Initialize MarkerClusterGroup
      markersRef.current = L.markerClusterGroup();
      mapRef.current.addLayer(markersRef.current);
    }

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Fetch toll data from API
  useEffect(() => {
    const fetchTolls = async () => {
      try {
        const response = await axios.get("http://localhost:9115/api/tolls");
        setTolls(response.data);
      } catch (error) {
        console.error("Error fetching tolls:", error);
        setError("Failed to load toll data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTolls();
  }, []);

  // List of operator options
  const operatorOptions = ["all", ...Object.keys(operatorTranslations)];

  // Filter tolls based on user input
  const filteredTolls = tolls.filter((toll) => {
    const matchesOperator =
      filters.operator === "all"
        ? true
        : toll.operator.toLowerCase() === filters.operator.toLowerCase();
    const matchesName = filters.name
      ? toll.name.toLowerCase().includes(filters.name.toLowerCase())
      : true;
    return matchesOperator && matchesName;
  });

  // Update markers whenever filteredTolls changes
  useEffect(() => {
    if (mapRef.current && markersRef.current) {
      markersRef.current.clearLayers();

      filteredTolls.forEach((toll) => {
        const marker = L.marker(
          [toll.latitude, toll.longitude],
          { icon: customIcon }
        ).bindPopup(
          `<div class="popup-content">
            <button onclick="this.closest('.leaflet-popup').remove()" class="popup-close">×</button>
            <strong>${toll.name}</strong><br/>
            <strong>Operator:</strong> ${
              operatorTranslations[toll.operator] || toll.operator
            }<br/>
            <strong>Email:</strong> <a href="mailto:${toll.email}">${toll.email}</a><br/>
            <strong>Prices:</strong><br/>
            ${toll.prices.map((price) => `${price}<br/>`).join("")}
          </div>`,
          {
            closeButton: false, // Disable default close button
            autoPan: true,
            className: "custom-popup",
          }
        );

        markersRef.current.addLayer(marker);
      });
    }
  }, [filteredTolls, customIcon]);

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Handle map resize to ensure proper rendering
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div>
      {/* Filter Controls */}
      <div style={{ marginBottom: "20px" }}>
        {/* Operator Filter as Dropdown */}
        <label>
          Διαλέξτε Εταιρεία:
          <select
            name="operator"
            value={filters.operator}
            onChange={handleFilterChange}
            style={{ marginLeft: "10px" }}
          >
            {operatorOptions.map((operator) => (
              <option key={operator} value={operator.toLowerCase()}>
                {operator === "all"
                  ? "Όλες"
                  : operatorTranslations[operator] || operator}
              </option>
            ))}
          </select>
        </label>
        {/* Name Filter as Text Input */}
        <label style={{ marginLeft: "20px" }}>
          Όνομα διοδίου:
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

      {/* Loading Indicator */}
      {loading && <p>Loading toll data...</p>}

      {/* Error Message */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Map Container */}
      <div id="map" style={{ height: "700px", width: "100%" }}></div>
    </div>
  );
}

export default Map;
