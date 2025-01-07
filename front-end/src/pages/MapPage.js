// src/MapPage.js
import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster"; // Import the markercluster plugin
import axios from "axios";
import "./MapPage.css";
import { useNavigate } from "react-router-dom"; // Add this import

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
  const navigate = useNavigate(); // Hook for navigation (assuming react-router-dom is used)

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
    iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location (bottom center)
    popupAnchor: [0, -41], // Point from which the popup should open relative to the iconAnchor
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

  // Function to handle logout (remove token and redirect to login)
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Fetch toll data from API with enhanced error handling
  useEffect(() => {
    const fetchTolls = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Δεν βρέθηκε το token. Παρακαλώ συνδεθείτε ξανά.");
          handleLogout();
          return;
        }

        const response = await axios.get("http://localhost:9115/api/tolls", {
          headers: {
            "Content-Type": "application/json",
            "x-observatory-auth": token, // Attach JWT token here
          },
          // Optionally, set responseType if needed
        });

        if (response.status === 200) {
          setTolls(response.data);
        } else if (response.status === 204) {
          setError("Δεν επιστράφηκαν δεδομένα για τα κριτήρια που δώσατε.");
        }
      } catch (err) {
        if (err.response) {
          switch (err.response.status) {
            case 400:
              setError("Άκυρο αίτημα. Παρακαλώ ελέγξτε τις εισροές σας.");
              break;
            case 401:
              setError(
                "Μη εξουσιοδοτημένο αίτημα. Παρακαλώ συνδεθείτε ξανά."
              );
              handleLogout();
              break;
            case 404:
              setError(
                "Η ζητούμενη πόρος δεν βρέθηκε. Παρακαλώ ελέγξτε τις παραμέτρους σας."
              );
              break;
            case 500:
              setError(
                "Προέκυψε σφάλμα στον διακομιστή. Παρακαλώ δοκιμάστε ξανά αργότερα."
              );
              break;
            default:
              setError(
                err.response.data?.error ||
                  "Προέκυψε μη αναμενόμενο σφάλμα."
              );
          }
        } else if (err.request) {
          // The request was made but no response was received
          setError(
            "Δεν ήταν δυνατή η σύνδεση με τον διακομιστή. Παρακαλώ ελέγξτε τη σύνδεσή σας."
          );
        } else {
          // Something happened in setting up the request that triggered an Error
          setError("Προέκυψε σφάλμα κατά την εκκίνηση του αιτήματος.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTolls();
  }, [navigate]);

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
            <button class="popup-close">×</button>
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

        // Add event listener for the custom close button
        marker.on("popupopen", function () {
          const popupNode = document.querySelector(".custom-popup");
          if (popupNode) {
            const closeButton = popupNode.querySelector(".popup-close");
            if (closeButton) {
              closeButton.addEventListener("click", () => {
                mapRef.current.closePopup();
              });
            }
          }
        });

        markersRef.current.addLayer(marker);
      });
    }
  }, [filteredTolls, customIcon, operatorTranslations]);

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
      {loading && <p>Φόρτωση δεδομένων διοδίων...</p>}

      {/* Error Message */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Map Container */}
      <div id="map" style={{ height: "700px", width: "100%" }}></div>
    </div>
  );
}

export default Map;
