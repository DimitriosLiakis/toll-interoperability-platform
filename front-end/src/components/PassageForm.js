import React, { useState } from "react";

function PassageForm({ onAddPassage }) {
  const [transponderId, setTransponderId] = useState("");
  const [stationId, setStationId] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [time, setTime] = useState("");
  const [submittedPrice, setSubmittedPrice] = useState(null);

  // State for debts, passage logs, and transponder ownerships
  const [transmitterData, setTransmitterData] = useState({});
  const [companyDebts, setCompanyDebts] = useState({});
  const [transponderOwners, setTransponderOwners] = useState({}); // Dynamic ownership mapping

  const stationCompanies = {
    aodos: "aodos",
    gefyra: "gefyra",
    egnatia: "egnatia",
    "kentriki odos": "kentriki odos",
    moreas: "moreas",
    "nea odos": "nea odos",
    "olympia odos": "olympia odos",
  };

  const tollPrices = {
    aodos: { car: 2.8, truck: 7.0, motorcycle: 1.4 },
    gefyra: { car: 13.3, truck: 20.0, motorcycle: 2.5 },
    egnatia: { car: 2.4, truck: 5.5, motorcycle: 1.2 },
    "kentriki odos": { car: 3.5, truck: 8.0, motorcycle: 1.8 },
    moreas: { car: 2.5, truck: 6.5, motorcycle: 1.3 },
    "nea odos": { car: 2.9, truck: 7.2, motorcycle: 1.5 },
    "olympia odos": { car: 3.1, truck: 7.8, motorcycle: 1.6 },
  };

  const calculatePrice = (station, vehicle) => {
    if (station && vehicle) {
      return tollPrices[station]?.[vehicle] || 0;
    }
    return 0;
  };

  const handleDebtUpdate = (fromCompany, toCompany, amount) => {
    setCompanyDebts((prevDebts) => {
      const updatedDebts = { ...prevDebts };

      if (!updatedDebts[fromCompany]) {
        updatedDebts[fromCompany] = {};
      }
      if (!updatedDebts[toCompany]) {
        updatedDebts[toCompany] = {};
      }

      const currentDebt = updatedDebts[fromCompany][toCompany] || 0;
      const reverseDebt = updatedDebts[toCompany][fromCompany] || 0;

      if (reverseDebt > 0) {
        const offset = Math.min(amount, reverseDebt);
        updatedDebts[toCompany][fromCompany] -= offset;
        if (updatedDebts[toCompany][fromCompany] === 0) {
          delete updatedDebts[toCompany][fromCompany];
        }
        amount -= offset;
      }

      if (amount > 0) {
        updatedDebts[fromCompany][toCompany] =
          (updatedDebts[fromCompany][toCompany] || 0) + amount;
      }

      return updatedDebts;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const calculatedPrice = calculatePrice(stationId, vehicleType);
    const ownerCompany = transponderOwners[transponderId];
    const stationCompany = stationCompanies[stationId];

    if (!ownerCompany || !stationCompany) {
      alert("Invalid transponder or station.");
      return;
    }

    if (ownerCompany !== stationCompany) {
      handleDebtUpdate(ownerCompany, stationCompany, calculatedPrice);
    }

    setTransmitterData((prevData) => {
      const updatedData = { ...prevData };

      if (!updatedData[transponderId]) {
        updatedData[transponderId] = { debts: {}, passages: [] };
      }

      updatedData[transponderId].passages.push({
        transponderId,
        stationId,
        vehicleType,
        time,
        price: calculatedPrice,
      });

      return updatedData;
    });

    onAddPassage({
      transponderId,
      stationId,
      vehicleType,
      time,
      price: calculatedPrice,
    });

    setSubmittedPrice(calculatedPrice);

    setTransponderId("");
    setStationId("");
    setVehicleType("");
    setTime("");
  };

  const handleAssignTransponder = (e) => {
    e.preventDefault();

    const transponder = e.target.transponderId.value.trim();
    const company = e.target.companyId.value;

    if (transponder && company) {
      setTransponderOwners((prevOwners) => ({
        ...prevOwners,
        [transponder]: company,
      }));
      e.target.reset();
    }
  };

  return (
    <div>
      <h3>Αντιστοίχιση Πομποδεκτών σε Εταιρείες</h3>
      <form onSubmit={handleAssignTransponder}>
        <label>
          Αριθμός Πομποδέκτη:
          <input type="text" name="transponderId" required />
        </label>
        <label>
          Εταιρεία:
          <select name="companyId" required>
            <option value="">Επιλογή Εταιρείας</option>
            <option value="aodos">aodos</option>
            <option value="gefyra">gefyra</option>
            <option value="egnatia">egnatia</option>
            <option value="kentriki odos">kentriki odos</option>
            <option value="moreas">moreas</option>
            <option value="nea odos">nea odos</option>
            <option value="olympia odos">olympia odos</option>
          </select>
        </label>
        <button type="submit">Καταχώρηση</button>
      </form>

      <h3>Καταγραφή Διελεύσεων</h3>
      <form onSubmit={handleSubmit}>
        <label>
          Αριθμός Πομποδέκτη:
          <input
            type="text"
            value={transponderId}
            onChange={(e) => setTransponderId(e.target.value)}
            required
          />
        </label>
        <label>
          Σταθμός Διοδίων:
          <select
            value={stationId}
            onChange={(e) => setStationId(e.target.value)}
            required
          >
            <option value="">Επιλογή Σταθμού</option>
            {Object.keys(stationCompanies).map((station) => (
              <option key={station} value={station}>
                {station}
              </option>
            ))}
          </select>
        </label>
        <label>
          Τύπος Οχήματος:
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            required
          >
            <option value="">Επιλογή Οχήματος</option>
            <option value="car">Αυτοκίνητο</option>
            <option value="truck">Φορτηγό</option>
            <option value="motorcycle">Μοτοσικλέτα</option>
          </select>
        </label>
        <label>
          Ώρα Διέλευσης:
          <input
            type="datetime-local"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </label>
        <button type="submit">Καταγραφή</button>
      </form>

      <h3>Χρέη Εταιρειών</h3>
      <ul>
        {Object.entries(companyDebts).map(([fromCompany, debts]) => (
          <li key={fromCompany}>
            <strong>{fromCompany}:</strong>
            <ul>
              {Object.entries(debts).map(([toCompany, amount]) => (
                <li key={toCompany}>
                  Χρωστάει στη {toCompany}: {amount.toFixed(2)} €
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <h3>Ιδιοκτησία Πομποδεκτών</h3>
      <ul>
        {Object.entries(transponderOwners).map(([transponder, company]) => (
          <li key={transponder}>
            Πομποδέκτης {transponder}: Ανήκει στην {company}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PassageForm;
