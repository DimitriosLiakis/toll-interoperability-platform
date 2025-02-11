import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import axios from "axios";
import "./MapPage.css";
import { useNavigate } from "react-router-dom";

// Leaflet icon setup
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

function Map() {
  const mapRef = useRef(null);
  const markersRef = useRef(null);
  const [tolls, setTolls] = useState([]);
  const [filters, setFilters] = useState({ operator: "all", name: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  const customIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
  });

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map", {
        zoomControl: false,
        attributionControl: false,
        center: [38.246639, 21.734573],
        zoom: 8,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(mapRef.current);
      L.control.zoom({ position: "topright" }).addTo(mapRef.current);
      markersRef.current = L.markerClusterGroup();
      mapRef.current.addLayer(markersRef.current);
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
       

        const response = await axios.get("http://localhost:9115/api/tolls", {
        });

        if (response.status === 200) {
          setTolls(response.data);
        } else if (response.status === 204) {
          setError("Δεν επιστράφηκαν δεδομένα");
        }
      } catch (err) {
        if (err.response) {
          switch (err.response.status) {
            case 400: setError("Άκυρο αίτημα"); break;
            case 401:  setError("Ανεπαρκή δικαιώματα πρόσβασης"); break;
            case 404: setError("Δεν βρέθηκε ο πόρος"); break;
            case 500: setError("Σφάλμα διακομιστή"); break;
            default: setError(err.response.data?.error || "Σφάλμα");
          }
        } else if (err.request) {
          setError("Δεν ήταν δυνατή η σύνδεση");
        } else {
          setError("Σφάλμα αιτήματος");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTolls();
  }, [navigate]);

  const filteredTolls = tolls.filter(toll => {
    const matchesOperator = filters.operator === "all" 
      ? true 
      : toll.operator.toLowerCase() === filters.operator.toLowerCase();
    const matchesName = filters.name 
      ? toll.name.toLowerCase().includes(filters.name.toLowerCase())
      : true;
    return matchesOperator && matchesName;
  });

  useEffect(() => {
    if (mapRef.current && markersRef.current) {
      markersRef.current.clearLayers();
      filteredTolls.forEach(toll => {
        const marker = L.marker([toll.latitude, toll.longitude], { icon: customIcon })
          .bindPopup(
            `<div class="popup-content">
              <button class="popup-close">×</button>
              <strong>${toll.name}</strong><br/>
              <strong>Operator:</strong> ${operatorTranslations[toll.operator] || toll.operator}<br/>
              <strong>Email:</strong> <a href="mailto:${toll.email}">${toll.email}</a><br/>
              <strong>Prices:</strong><br/>
              ${toll.prices.map((price, index) => 
                `Κατηγορία ${index + 1}: ${parseFloat(price).toFixed(2)}€<br/>`
              ).join("")}
            </div>`,
            { closeButton: false, className: "custom-popup" }
          );

        marker.on("popupopen", () => {
          const closeButton = document.querySelector(".popup-close");
          if (closeButton) {
            closeButton.addEventListener("click", () => mapRef.current.closePopup());
          }
        });

        markersRef.current.addLayer(marker);
      });
    }
  }, [filteredTolls, customIcon, operatorTranslations]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const handleResize = () => mapRef.current?.invalidateSize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      <div className="filters-container">
        <div className="filter-group">
          <label className="filter-label">
            Εταιρεία:
            <select
              name="operator"
              value={filters.operator}
              onChange={handleFilterChange}
              className="filter-select"
            >
              {["all", ...Object.keys(operatorTranslations)].map(operator => (
                <option key={operator} value={operator.toLowerCase()}>
                  {operator === "all" ? "Όλες" : operatorTranslations[operator]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="filter-group">
          <label className="filter-label">
            Όνομα Διοδίου:
            <input
              type="text"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              placeholder="Αναζήτηση..."
              className="filter-input"
            />
          </label>
        </div>
      </div>

      {loading && <p className="loading-message">Φόρτωση δεδομένων διοδίων...</p>}
      {error && <p className="error-message">{error}</p>}

      <div id="map" className="map-container"></div>
    </div>
  );
}

export default Map;
