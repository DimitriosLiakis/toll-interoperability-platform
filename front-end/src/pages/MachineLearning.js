import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './MachineLearning.css';
import { useNavigate } from 'react-router-dom';

// Helper function to format dates as dd/mm/yyyy
const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

// Helper function to format hour to 24-hour format (HH:MM)
const formatHourTo24h = (hour) => {
  const totalMinutes = Math.round(hour * 60);
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const minutes = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Helper function to format datetime string to date only (dd/mm/yyyy)
const formatToDateOnly = (dateTimeString) => {
  if (!dateTimeString) return '';
  
  // Split the date and time
  const [datePart] = dateTimeString.split(' ');
  
  // Reformat from yyyy-mm-dd to dd/mm/yyyy
  const [year, month, day] = datePart.split('-');
  return `${day}/${month}/${year}`;
};

// Helper function to convert time (e.g., "09:08") to minutes since midnight
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper function to convert minutes since midnight back to 24-hour format
const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

// Helper function to parse a date string "yyyy-mm-dd" as a local Date
const parseLocalDate = (dateString) => {
  const [year, month, day] = dateString.split('-');
  return new Date(year, month - 1, day);
};

// Full toll name mapping
const tollNameMapping = {
  AM01: "Σταθμός Διοδίων Κλειδίου Μετωπικά (Προς Αθήνα)",
  AM02: "Σταθμός Διοδίων Κλειδίου Μετωπικά (Προς Θεσσαλονίκη)",
  AM03: "Σταθμός Διοδίων Μακρυχωρίου Μετωπικά (Προς Αθήνα)",
  AM04: "Σταθμός Διοδίων Μακρυχωρίου Μετωπικά (Προς Θεσσαλονίκη)",
  AM05: "Σταθμός Διοδίων Μοσχοχωρίου Μετωπικά (Προς Αθήνα)",
  AM06: "Σταθμός Διοδίων Μοσχοχωρίου Μετωπικά (Προς Θεσσαλονίκη)",
  AM07: "Σταθμός Διοδίων Λεπτοκαρυάς Μετωπικά (Προς Αθήνα)",
  AM08: "Σταθμός Διοδίων Λεπτοκαρυάς Μετωπικά (Προς Θεσσαλονίκη)",
  AM09: "Σταθμός Διοδίων Πελασγίας Μετωπικά (Προς Αθήνα)",
  AM10: "Σταθμός Διοδίων Πελασγίας Μετωπικά (Προς Θεσσαλονίκη)",
  AM11: "Σταθμός Διοδίων Γυρτώνης Πλευρικά (Από Αθήνα)",
  AM12: "Σταθμός Διοδίων Γυρτώνης Πλευρικά (Προς Αθήνα)",
  AM13: "Σταθμός Διοδίων Ευαγγελισμού Πλευρικά (Από Θεσσαλονίκη)",
  AM14: "Σταθμός Διοδίων Ευαγγελισμού Πλευρικά (Προς Θεσσαλονίκη)",
  AM15: "Σταθμός Διοδίων Κιλελέρ Πλευρικά (Από Αθήνα)",
  AM16: "Σταθμός Διοδίων Κιλελέρ Πλευρικά (Προς Αθήνα)",
  AM17: "Σταθμός Διοδίων Μακρυχωρίου Πλευρικά (Από Αθήνα)",
  AM18: "Σταθμός Διοδίων Μεγάλου Μοναστηρίου Πλευρικά (Από Αθήνα)",
  AM19: "Σταθμός Διοδίων Μεγάλου Μοναστηρίου Πλευρικά (Προς Αθήνα)",
  AM20: "Σταθμός Διοδίων Πυργετού Πλευρικά (Προς Αθήνα)",
  AM21: "Σταθμός Διοδίων Πυργετού Πλευρικά (Προς Θεσσαλονίκη)",
  AM22: "Σταθμός Διοδίων Βελεστίνου Πλευρικά (Από Αθήνα)",
  AM23: "Σταθμός Διοδίων Βελεστίνου Πλευρικά (Προς Αθήνα)",
  AM24: "Σταθμός Διοδίων Βελεστίνου Πλευρικά (Προς Αθήνα)",
  AM25: "Σταθμός Διοδίων Λεπτοκαρυάς Πλευρικά (Από Θεσσαλονίκη)",
  AM26: "Σταθμός Διοδίων Λεπτοκαρυάς Πλευρικά (Προς Θεσσαλονίκη)",
  AM27: "Σταθμός Διοδίων Πλαταμώνα Πλευρικά (Από Αθήνα)",
  AM28: "Σταθμός Διοδίων Πλαταμώνα Πλευρικά (Προς Αθήνα)",
  AM29: "Σταθμός Διοδίων Γλύφας Πλευρικά (Από Θεσσαλονίκη)",
  AM30: "Σταθμός Διοδίων Γλύφας Πλευρικά (Προς Θεσσαλονίκη)",
  EG01: "Σταθμός Διοδίων Σήραγγας Ακτίου Μετωπικά (Προς Αγρίνιο)",
  EG02: "Σταθμός Διοδίων Σήραγγας Ακτίου Μετωπικά (Προς Πρέβεζα)",
  EG03: "Σταθμός Διοδίων Αρδανίου Μετωπικά (Προς Ηγουμενίτσα)",
  EG04: "Σταθμός Διοδίων Αρδανίου Μετωπικά (Προς Κήπους)",
  EG05: "Σταθμός Διοδίων Μεστής Μετωπικά (Προς Αλεξ/πολη)",
  EG06: "Σταθμός Διοδίων Μεστής Μετωπικά (Προς Ηγουμενίτσα)",
  EG07: "Σταθμός Διοδίων Ανάληψης Μετωπικά (Προς Αλεξ/πολη)",
  EG08: "Σταθμός Διοδίων Ανάληψης Μετωπικά (Προς Ηγουμενίτσα)",
  EG09: "Σταθμός Διοδίων Ασπροβάλτας Μετωπικά (Προς Αλεξανδρούπολη)",
  EG10: "Σταθμός Διοδίων Ασπροβάλτας Μετωπικά (Προς Ηγουμενίτσα)",
  EG11: "Σταθμός Διοδίων Θεσσαλονίκης Μετωπικά (Προς Αλεξανδρούπολη)",
  EG12: "Σταθμός Διοδίων Θεσσαλονίκης Μετωπικά (Προς Ηγουμενίτσα)",
  EG13: "Σταθμός Διοδίων Μαλγάρων Μετωπικά (Προς Αθήνα)",
  EG14: "Σταθμός Διοδίων Μαλγάρων Μετωπικά (Προς Θεσσαλονίκη)",
  EG15: "Σταθμός Διοδίων Παμβώτιδας Μετωπικά (Προς Αλεξ/πολη)",
  EG16: "Σταθμός Διοδίων Παμβώτιδας Μετωπικά (Προς Ηγουμενίτσα)",
  EG17: "Σταθμός Διοδίων Τύριας Μετωπικά (Προς Αλεξ/πολη)",
  EG18: "Σταθμός Διοδίων Τύριας Μετωπικά (Προς Ηγουμενίτσα)",
  EG19: "Σταθμός Διοδίων Καβάλας Μετωπικά (Προς Αλεξ/πολη)",
  EG20: "Σταθμός Διοδίων Καβάλας Μετωπικά (Προς Ηγουμενίτσα)",
  EG21: "Σταθμός Διοδίων Μουσθένης Μετωπικά (Προς Αλεξ/πολη)",
  EG22: "Σταθμός Διοδίων Μουσθένης Μετωπικά (Προς Ηγουμενίτσα)",
  EG23: "Σταθμός Διοδίων Ιεροπηγής Μετωπικά (Προς Κρυσταλλοπηγή)",
  EG24: "Σταθμός Διοδίων Ιεροπηγής Μετωπικά (Προς Σιάτιστα)",
  EG25: "Σταθμός Διοδίων Ευζώνων Μετωπικά (Προς Μάλγαρα)",
  EG26: "Σταθμός Διοδίων Ευζώνων Μετωπικά (Προς Σύνορα)",
  EG27: "Σταθμός Διοδίων Πολύμυλου Μετωπικά (Προς Αλεξ/πολη)",
  EG28: "Σταθμός Διοδίων Πολύμυλου Μετωπικά (Προς Ηγουμενίτσα)",
  EG29: "Σταθμός Διοδίων Σιάτιστας Μετωπικά (Προς Αλεξ/πολη)",
  EG30: "Σταθμός Διοδίων Σιάτιστας Μετωπικά (Προς Ηγουμενίτσα)",
  EG31: "Σταθμός Διοδίων Ίασμου Μετωπικά (Προς Αλεξ/πολη)",
  EG32: "Σταθμός Διοδίων Ίασμου Μετωπικά (Προς Ηγουμενίτσα)",
  EG33: "Σταθμός Διοδίων Προμαχώνα Μετωπικά (Προς Προμαχώνα)",
  EG34: "Σταθμός Διοδίων Προμαχώνα Μετωπικά (Προς Σέρρες)",
  EG35: "Σταθμός Διοδίων Στρυμονικού Μετωπικά (Προς Θεσσαλονίκη)",
  EG36: "Σταθμός Διοδίων Στρυμονικού Μετωπικά (Προς Σέρρες)",
  EG37: "Σταθμός Διοδίων Μαλακασίου Μετωπικά (Προς Αλεξ/πολη)",
  EG38: "Σταθμός Διοδίων Μαλακασίου Μετωπικά (Προς Ηγουμενίτσα)",
  EG39: "Σταθμός Διοδίων Μεστής Πλευρικά (Από Αλεξ/πολη)",
  EG40: "Σταθμός Διοδίων Μεστής Πλευρικά (Προς Αλεξ/πολη)",
  EG41: "Σταθμός Διοδίων Βαϊοχωρίου Πλευρικά (Από Αλεξ/πολη)",
  EG42: "Σταθμός Διοδίων Βαϊοχωρίου Πλευρικά (Προς Αλεξ/πολη)",
  EG43: "Σταθμός Διοδίων Λαγκαδά Πλευρικά (Είσοδος Προς Ηγουμενίτσα)",
  EG44: "Σταθμός Διοδίων Λαγκαδά Πλευρικά (Είσοδος Προς Ηγουμενίτσα)",
  EG45: "Σταθμός Διοδίων Λαγκαδά Πλευρικά (Έξοδος Από Ηγουμενίτσα)",
  EG46: "Σταθμός Διοδίων Ασπροβάλτας Πλευρικά (Από Ηγουμενίτσα)",
  EG47: "Σταθμός Διοδίων Ασπροβάλτας Πλευρικά (Προς Ηγουμενίτσα)",
  EG48: "Σταθμός Διοδίων Προφήτη Πλευρικά (Από Αλεξ/πολη)",
  EG49: "Σταθμός Διοδίων Προφήτη Πλευρικά (Προς Αλεξ/πολη)",
  EG50: "Σταθμός Διοδίων Αγίου Ανδρέα Πλευρικά (Από Αλεξ/πολη)",
  EG51: "Σταθμός Διοδίων Αγίου Ανδρέα Πλευρικά (Προς Αλεξ/πολη)",
  EG52: "Σταθμός Διοδίων Άσπρων Χωμάτων Πλευρικά (Από Ηγουμενίτσα)",
  EG53: "Σταθμός Διοδίων Άσπρων Χωμάτων Πλευρικά (Προς Ηγουμενίτσα)",
  EG54: "Σταθμός Διοδίων Ελευθερούπολης Πλευρικά (Από Αλεξ/πολη)",
  EG55: "Σταθμός Διοδίων Ελευθερούπολης Πλευρικά (Προς Αλεξ/πολη)",
  EG56: "Σταθμός Διοδίων Μουσθένης Πλευρικά (Από Ηγουμενίτσα)",
  EG57: "Σταθμός Διοδίων Μουσθένης Πλευρικά (Προς Ηγουμενίτσα)",
  EG58: "Σταθμός Διοδίων Γαληψού Ορφανίου Πλευρικά (Από Ηγουμενίτσα)",
  EG59: "Σταθμός Διοδίων Γαληψού Ορφανίου Πλευρικά (Προς Ηγουμενίτσα)",
  EG60: "Σταθμός Διοδίων Πολυκάστρου Πλευρικά (Από Πολύκαστρο)",
  EG61: "Σταθμός Διοδίων Πολυκάστρου Πλευρικά (Προς Πολύκαστρο)",
  EG62: "Σταθμός Διοδίων Καλαμιάς Πλευρικά (Από Αλεξ/πολη)",
  EG63: "Σταθμός Διοδίων Καλαμιάς Πλευρικά (Προς Αλεξ/πολη)",
  EG64: "Σταθμός Διοδίων Σιάτιστας Ανατολικά Πλευρικά (Από Ηγουμενίτσα)",
  EG65: "Σταθμός Διοδίων Σιάτιστας Ανατολικά Πλευρικά (Προς Ηγουμενίτσα)",
  EG66: "Σταθμός Διοδίων Βαφέικων Πλευρικά (Από Ηγουμενίτσα Προς Ξάνθη)",
  EG67: "Σταθμός Διοδίων Βαφέικων Πλευρικά (Από Ηγουμενίτσα Προς Πόρτο Λάγος)",
  EG68: "Σταθμός Διοδίων Βαφέικων Πλευρικά (Από Ξάνθη Προς Ηγουμενίτσα)",
  EG69: "Σταθμός Διοδίων Βαφέικων Πλευρικά (Από Πόρτο Λάγος Προς Ηγουμενίτσα)",
  EG70: "Σταθμός Διοδίων Ίασμου Πλευρικά (Από Αλεξ/πολη)",
  EG71: "Σταθμός Διοδίων Ίασμου Πλευρικά (Προς Αλεξ/πολη)",
  EG72: "Σταθμός Διοδίων ΒΙ.ΠΕ. Κομοτηνής Πλευρικά (Από Ηγουμενίτσα)",
  EG73: "Σταθμός Διοδίων ΒΙ.ΠΕ. Κομοτηνής Πλευρικά (Προς Ηγουμενίτσα)",
  EG74: "Σταθμός Διοδίων Παναγιάς Πλευρικά",
  GE01: "Σταθμός Διοδίων Γέφυρας Ρίου Αντιρρίου Μετωπικά (Προς Αντίρριο)",
  GE02: "Σταθμός Διοδίων Γέφυρας Ρίου Αντιρρίου Μετωπικά (Προς Ρίο)",
  KO01: "Σταθμός Διοδίων Σοφάδων Μετωπικά (Προς Λαμία)",
  KO02: "Σταθμός Διοδίων Σοφάδων Μετωπικά (Προς Τρίκαλα)",
  KO03: "Σταθμός Διοδίων Τρικάλων Μετωπικά (Προς Λαμία)",
  KO04: "Σταθμός Διοδίων Τρικάλων Μετωπικά (Προς Τρίκαλα)",
  KO05: "Σταθμός Διοδίων Αγίας Τριάδας Μετωπικά (Προς Αθήνα)",
  KO06: "Σταθμός Διοδίων Αγίας Τριάδας Μετωπικά (Προς Θεσσαλονίκη)",
  KO07: "Σταθμός Διοδίων Λειανοκλαδίου Μετωπικά (Προς Λαμία)",
  KO08: "Σταθμός Διοδίων Λειανοκλαδίου Μετωπικά (Προς Τρίκαλα)",
  KO09: "Σταθμός Διοδίων Μαυρομαντήλας Μετωπικά (Προς Αθήνα)",
  KO10: "Σταθμός Διοδίων Μαυρομαντήλας Μετωπικά (Προς Θεσσαλονίκη)",
  KO11: "Σταθμός Διοδίων Ανάβρας Πλευρικά (Από Λαμία)",
  KO12: "Σταθμός Διοδίων Ανάβρας Πλευρικά (Προς Λαμία)",
  KO13: "Σταθμός Διοδίων Προαστίου Πλευρικά (Από Λαμία)",
  KO14: "Σταθμός Διοδίων Προαστίου Πλευρικά (Προς Λαμία)",
  KO15: "Σταθμός Διοδίων Καλαμπάκας Πλευρικά (Από Καλαμπάκα)",
  KO16: "Σταθμός Διοδίων Καλαμπάκας Πλευρικά (Προς Καλαμπάκα)",
  KO17: "Σταθμός Διοδίων Τρικάλων Πλευρικά (Από Τρίκαλα)",
  KO18: "Σταθμός Διοδίων Τρικάλων Πλευρικά (Προς Τρίκαλα)",
  KO19: "Σταθμός Διοδίων Αγίας Μαρίνας Πλευρικά (Από Θεσ/νίκη)",
  KO20: "Σταθμός Διοδίων Αγίας Μαρίνας Πλευρικά (Προς Θεσ/νίκη)",
  KO21: "Σταθμός Διοδίων Θερμοπυλών Πλευρικά (Από Θεσσαλονίκη)",
  KO22: "Σταθμός Διοδίων Θερμοπυλών Πλευρικά (Προς Θεσσαλονίκη)",
  KO23: "Σταθμός Διοδίων Μώλου Πλευρικά (Από Αθήνα)",
  KO24: "Σταθμός Διοδίων Μώλου Πλευρικά (Προς Αθήνα)",
  KO25: "Σταθμός Διοδίων Στυλίδας Πλευρικά (Από Θεσσαλονίκη)",
  KO26: "Σταθμός Διοδίων Στυλίδας Πλευρικά (Προς Θεσσαλονίκη)",
  MO01: "Σταθμός Διοδίων Βελιγοστής Μετωπικά (Προς Καλαμάτα)",
  MO02: "Σταθμός Διοδίων Βελιγοστής Μετωπικά (Προς Κόρινθο)",
  MO03: "Σταθμός Διοδίων Γέφυρας Μάναρη Μετωπικά (Προς Καλαμάτα)",
  MO04: "Σταθμός Διοδίων Γέφυρας Μάναρη Μετωπικά (Προς Κόρινθο)",
  MO05: "Σταθμός Διοδίων Νεστάνης Μετωπικά (Προς Καλαμάτα)",
  MO06: "Σταθμός Διοδίων Νεστάνης Μετωπικά (Προς Κόρινθο)",
  MO07: "Σταθμός Διοδίων Πετρίνας Μετωπικά (Προς Κόρινθο-Καλαμάτα)",
  MO08: "Σταθμός Διοδίων Πετρίνας Μετωπικά (Προς Σπάρτη)",
  MO09: "Σταθμός Διοδίων Σπαθοβουνίου Μετωπικά (Προς Καλαμάτα)",
  MO10: "Σταθμός Διοδίων Σπαθοβουνίου Μετωπικά (Προς Κόρινθο)",
  MO11: "Σταθμός Διοδίων Καλαμάτας Μετωπικά (Προς Καλαμάτα)",
  MO12: "Σταθμός Διοδίων Καλαμάτας Μετωπικά (Προς Κόρινθο)",
  MO13: "Σταθμός Διοδίων Αρφαρών Πλευρικά (Από Κόρινθο)",
  MO14: "Σταθμός Διοδίων Αρφαρών Πλευρικά (Προς Κόρινθο)",
  MO15: "Σταθμός Διοδίων Θουρίας Πλευρικά (Από Καλαμάτα)",
  MO16: "Σταθμός Διοδίων Θουρίας Πλευρικά (Προς Καλαμάτα)",
  MO17: "Σταθμός Διοδίων Παραδείσιων Πλευρικά (Από Καλαμάτα)",
  MO18: "Σταθμός Διοδίων Παραδείσιων Πλευρικά (Προς Καλαμάτα)",
  NAO01: "Σταθμός Διοδίων Αγίας Παρασκευής Πλευρικά (Προς Καρέα)",
  NAO02: "Σταθμός Διοδίων Αγίας Παρασκευής Πλευρικά (Προς Παλλήνη)",
  NAO03: "Σταθμός Διοδίων Δημόκριτου Πλευρικά (Προς Παλλήνη)",
  NAO04: "Σταθμός Διοδίων Ανθούσας Πλευρικά (Προς Ελευσίνα)",
  NAO05: "Σταθμός Διοδίων Περιφεριακής Αιγάλεω Πλευρικά (Προς Αεροδρόμιο)",
  NAO06: "Σταθμός Διοδίων Περιφεριακής Αιγάλεω Πλευρικά (Προς Ελευσίνα)",
  NAO07: "Σταθμός Διοδίων Ασπροπύργου Πλευρικά (Προς Αεροδρόμιο)",
  NAO08: "Σταθμός Διοδίων Ασπροπύργου Πλευρικά (Προς Ελευσίνα)",
  NAO09: "Σταθμός Διοδίων Λεωφ. Δουκίσσης Πλακεντίας Πλευρικά (Προς Αεροδρόμιο)",
  NAO10: "Σταθμός Διοδίων Λεωφ. Δουκίσσης Πλακεντίας Πλευρικά (Προς Ελευσίνα)",
  NAO11: "Σταθμός Διοδίων Λεωφ. Δουκίσσης Πλακεντίας Πλευρικά (Προς Καρέα)",
  NAO12: "Σταθμός Διοδίων Λεωφ. Πεντέλης Πλευρικά (Προς Αεροδρόμιο)",
  NAO13: "Σταθμός Διοδίων Λεωφ. Πεντέλης Πλευρικά (Προς Ελευσίνα)",
  NAO14: "Σταθμός Διοδίων Γλυκών Νερών Πλευρικά (Προς Καρέα)",
  NAO15: "Σταθμός Διοδίων Γλυκών Νερών Πλευρικά (Προς Παλλήνη)",
  NAO16: "Σταθμός Διοδίων Λεωφ. Δημοκρατίας Πλευρικά (Προς Αεροδρόμιο)",
  NAO17: "Σταθμός Διοδίων Λεωφ. Δημοκρατίας Πλευρικά (Προς Ελευσίνα)",
  NAO18: "Σταθμός Διοδίων Λεωφ. Ηρακλείου Πλευρικά (Προς Αεροδρόμιο)",
  NAO19: "Σταθμός Διοδίων Λεωφ. Ηρακλείου Πλευρικά (Προς Ελευσίνα)",
  NAO20: "Σταθμός Διοδίων Λεωφ. Κύμης Πλευρικά (Προς Αεροδρόμιο)",
  NAO21: "Σταθμός Διοδίων Λεωφ. Κύμης Πλευρικά (Προς Ελευσίνα)",
  NAO22: "Σταθμός Διοδίων Λεωφ. Φυλής Πλευρικά (Προς Αεροδρόμιο)",
  NAO23: "Σταθμός Διοδίων Λεωφ. Φυλής Πλευρικά (Προς Ελευσίνα)",
  NAO24: "Σταθμός Διοδίων Κορωπίου Μετωπικά (Προς Ελευσίνα)",
  NAO25: "Σταθμός Διοδίων Λεωφ. Κηφισίας Πλευρικά (Προς Αεροδρόμιο)",
  NAO26: "Σταθμός Διοδίων Λεωφ. Κηφισίας Πλευρικά (Προς Ελευσίνα)",
  NAO27: "Σταθμός Διοδίων Αθηνών-Λαμίας Πλευρικά (Από Αθήνα Προς Αεροδρόμιο)",
  NAO28: "Σταθμός Διοδίων Αθηνών-Λαμίας Πλευρικά (Από Αθήνα Προς Ελευσίνα)",
  NAO29: "Σταθμός Διοδίων Αθηνών-Λαμίας Πλευρικά (Από Λαμία Προς Αεροδρόμιο)",
  NAO30: "Σταθμός Διοδίων Αθηνών-Λαμίας Πλευρικά (Από Λαμία Προς Ελευσίνα)",
  NAO31: "Σταθμός Διοδίων Παιανίας Πλευρικά (Προς Αεροδρόμιο)",
  NAO32: "Σταθμός Διοδίων Παιανίας Πλευρικά (Προς Ελευσίνα)",
  NAO33: "Σταθμός Διοδίων Λεωφ. Μαραθώνος Πλευρικά (Προς Αεροδρόμιο)",
  NAO34: "Σταθμός Διοδίων Λεωφ. Μαραθώνος Πλευρικά (Προς Ελευσίνα)",
  NAO35: "Σταθμός Διοδίων Παλλήνης Πλευρικά (Προς Καρέα)",
  NAO36: "Σταθμός Διοδίων Κατεχάκη Μετωπικά (Προς Παλλήνη)",
  NAO37: "Σταθμός Διοδίων Παπάγου Πλευρικά (Προς Καρέα)",
  NAO38: "Σταθμός Διοδίων Παπάγου Πλευρικά (Προς Παλλήνη)",
  NAO39: "Σταθμός Διοδίων Ρουπακίου Μετωπικά (Προς Αεροδρόμιο)",
  NAO40: "Σταθμός Διοδίων Κάντζας Πλευρικά (Προς Αεροδρόμιο)",
  NAO41: "Σταθμός Διοδίων Κάντζας Πλευρικά (Προς Ελευσίνα)",
  NO01: "Σταθμός Διοδίων Αγγελόκαστρου Μετωπικά (Προς Ιωάννινα)",
  NO02: "Σταθμός Διοδίων Αγγελόκαστρου Μετωπικά (Προς Ρίο)",
  NO03: "Σταθμός Διοδίων Κλόκοβας Μετωπικά (Προς Ιωάννινα)",
  NO04: "Σταθμός Διοδίων Κλόκοβας Μετωπικά (Προς Ρίο)",
  NO05: "Σταθμός Διοδίων Μενιδίου Μετωπικά (Προς Ιωάννινα)",
  NO06: "Σταθμός Διοδίων Μενιδίου Μετωπικά (Προς Ρίο)",
  NO07: "Σταθμός Διοδίων Αφιδνών Μετωπικά (Προς Αθήνα)",
  NO08: "Σταθμός Διοδίων Αφιδνών Μετωπικά (Προς Θεσσαλονίκη)",
  NO09: "Σταθμός Διοδίων Θήβας Μετωπικά (Προς Αθήνα)",
  NO10: "Σταθμός Διοδίων Θήβας Μετωπικά (Προς Θεσσαλονίκη)",
  NO11: "Σταθμός Διοδίων Τερόβου Μετωπικά (Προς Ιωάννινα)",
  NO12: "Σταθμός Διοδίων Τερόβου Μετωπικά (Προς Ρίο)",
  NO13: "Σταθμός Διοδίων Τραγάνας Μετωπικά (Προς Αθήνα)",
  NO14: "Σταθμός Διοδίων Τραγάνας Μετωπικά (Προς Θεσσαλονίκη)",
  NO15: "Σταθμός Διοδίων Γαβρολίμνης Πλευρικά (Από Ιωάννινα)",
  NO16: "Σταθμός Διοδίων Γαβρολίμνης Πλευρικά (Προς Ιωάννινα)",
  NO17: "Σταθμός Διοδίων Μεσολογγίου Πλευρικά (Από Ιωάννινα)",
  NO18: "Σταθμός Διοδίων Μεσολογγίου Πλευρικά (Προς Ιωάννινα)",
  NO19: "Σταθμός Διοδίων Κουβαρά Πλευρικά (Από Ιωάννινα)",
  NO20: "Σταθμός Διοδίων Κουβαρά Πλευρικά (Προς Ιωάννινα)",
  NO21: "Σταθμός Διοδίων Άρτας Πλευρικά (Από Ιωάννινα)",
  NO22: "Σταθμός Διοδίων Άρτας Πλευρικά (Προς Ιωάννινα)",
  NO23: "Σταθμός Διοδίων Καπανδριτίου Πλευρικά (Από Θεσσαλονίκη)",
  NO24: "Σταθμός Διοδίων Καπανδριτίου Πλευρικά (Προς Θεσσαλονίκη)",
  NO25: "Σταθμός Διοδίων Μαλακάσας Πλευρικά (Από Θεσσαλονίκη)",
  NO26: "Σταθμός Διοδίων Μαλακάσας Πλευρικά (Προς Θεσσαλονίκη)",
  NO27: "Σταθμός Διοδίων Θήβας Πλευρικά (Από Θεσσαλονίκη)",
  NO28: "Σταθμός Διοδίων Θήβας Πλευρικά (Προς Θεσσαλονίκη)",
  NO29: "Σταθμός Διοδίων Οινοφύτων Πλευρικά (Από Θεσσαλονίκη)",
  NO30: "Σταθμός Διοδίων Οινοφύτων Πλευρικά (Προς Θεσσαλονίκη)",
  NO31: "Σταθμός Διοδίων Γοργόμυλου Πλευρικά (Από Ρίο)",
  NO32: "Σταθμός Διοδίων Γοργόμυλου Πλευρικά (Προς Ρίο)",
  NO33: "Σταθμός Διοδίων Τραγάνας Πλευρικά (Από Θεσσαλονίκη)",
  NO34: "Σταθμός Διοδίων Τραγάνας Πλευρικά (Προς Θεσσαλονίκη)",
  OO01: "Σταθμός Διοδίων Ελευσίνας Μετωπικά (Προς Αθήνα)",
  OO02: "Σταθμός Διοδίων Ελευσίνας Μετωπικά (Προς Πάτρα)",
  OO03: "Σταθμός Διοδίων Ρίου Μετωπικά (Προς Αθήνα)",
  OO04: "Σταθμός Διοδίων Ρίου Μετωπικά (Προς Πάτρα)",
  OO05: "Σταθμός Διοδίων Ελαιώνα Μετωπικά (Προς Αθήνα)",
  OO06: "Σταθμός Διοδίων Ελαιώνα Μετωπικά (Προς Πάτρα)",
  OO07: "Σταθμός Διοδίων Ισθμίων Μετωπικά (Προς Αθήνα)",
  OO08: "Σταθμός Διοδίων Ισθμίων Μετωπικά (Προς Πάτρα)",
  OO09: "Σταθμός Διοδίων Κιάτου Μετωπικά (Προς Αθήνα)",
  OO10: "Σταθμός Διοδίων Κιάτου Μετωπικά (Προς Πάτρα)",
  OO11: "Σταθμός Διοδίων Νέας Περάμου Πλευρικά (Από Πάτρα)",
  OO12: "Σταθμός Διοδίων Νέας Περάμου Πλευρικά (Προς Πάτρα)",
  OO13: "Σταθμός Διοδίων Πάχης Πλευρικά (Από Πάτρα)",
  OO14: "Σταθμός Διοδίων Πάχης Πλευρικά (Προς Πάτρα)",
  OO15: "Σταθμός Διοδίων Δρεπάνου Πλευρικά (Από Αθήνα)",
  OO16: "Σταθμός Διοδίων Δρεπάνου Πλευρικά (Προς Αθήνα)",
  OO17: "Σταθμός Διοδίων Ακράτας Πλευρικά (Από Αθήνα)",
  OO18: "Σταθμός Διοδίων Ακράτας Πλευρικά (Προς Αθήνα)",
  OO19: "Σταθμός Διοδίων Καλαβρύτων Πλευρικά (Από Αθήνα)",
  OO20: "Σταθμός Διοδίων Καλαβρύτων Πλευρικά (Προς Αθήνα)",
  OO21: "Σταθμός Διοδίων Αγίων Θεοδώρων Πλευρικά (Από Αθήνα)",
  OO22: "Σταθμός Διοδίων Αγίων Θεοδώρων Πλευρικά (Προς Αθήνα)",
  OO23: "Σταθμός Διοδίων Δερβενίου Πλευρικά (Από Αθήνα)",
  OO24: "Σταθμός Διοδίων Δερβενίου Πλευρικά (Προς Αθήνα)",
  OO25: "Σταθμός Διοδίων Ζευγολατιού Πλευρικά (Από Αθήνα)",
  OO26: "Σταθμός Διοδίων Ζευγολατιού Πλευρικά (Προς Αθήνα)",
  OO27: "Σταθμός Διοδίων Κιάτου Πλευρικά (Από Πάτρα)",
  OO28: "Σταθμός Διοδίων Κιάτου Πλευρικά (Προς Πάτρα)",
};

export default function MLDashboard() {
  const [loading, setLoading] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState('');
  const [error, setError] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('AM');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [forecastDate, setForecastDate] = useState('');
  const [selectedFunctionality, setSelectedFunctionality] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const navigate = useNavigate();

  const companies = [
    { value: 'AM', label: 'Αυτοκινητόδρομος Αιγαίου' },
    { value: 'EG', label: 'Εγνατία Οδός' },
    { value: 'KO', label: 'Κεντρική Οδός' },
    { value: 'MO', label: 'Μορέας' },
    { value: 'NAO', label: 'Αττική Οδός' },
    { value: 'NO', label: 'Νέα Οδός' },
    { value: 'OO', label: 'Ολυμπία Οδός' },
    { value: 'GE', label: 'Γέφυρα' },
  ];

  const functionalities = [
    { value: 'predictions', label: 'Πρόβλεψη ώρας αιχμής' },
    { value: 'forecast', label: 'Πρόβλεψη μέγιστης ροής οχημάτων' },
  ];

  // Function to handle logout (remove token and redirect to login)
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Check token validity on component mount
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;

        if (payload.exp && payload.exp < currentTime) {
          alert('Η συνεδρία σας έχει λήξει. Παρακαλώ συνδεθείτε ξανά.');
          handleLogout();
          return;
        }

        if (payload.user_email === 'admin@yme.gov.gr') {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error('Invalid token:', err);
        alert('Μη έγκυρο token. Παρακαλώ συνδεθείτε ξανά.');
        handleLogout();
      }
    };

    checkToken();
  }, [navigate]);

  const token = localStorage.getItem('token');

  const trainModels = async () => {
    setLoading(true);
    setTrainingStatus('Training models...');
    setError('');
    try {
      const response = await fetch('http://localhost:9115/api/training', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-observatory-auth': token,
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        setTrainingStatus('Training completed successfully');
      } else if (response.status === 204) {
        setError('Η εκπαίδευση ολοκληρώθηκε, αλλά δεν επέστρεψε δεδομένα.');
      } else {
        switch (response.status) {
          case 400:
            throw new Error('Άκυρο αίτημα. Παρακαλώ ελέγξτε τις εισροές σας.');
          case 401:
            throw new Error('Μη εξουσιοδοτημένο αίτημα. Παρακαλώ συνδεθείτε ξανά.');
          case 404:
            throw new Error('Η ζητούμενη πόρος δεν βρέθηκε.');
          case 500:
            throw new Error('Προέκυψε σφάλμα στον διακομιστή. Παρακαλώ δοκιμάστε ξανά αργότερα.');
          default:
            throw new Error('Προέκυψε μη αναμενόμενο σφάλμα.');
        }
      }
    } catch (err) {
      console.error('Error during training:', err);
      setError('Failed to train models: ' + err.message);
      if (err.message.includes('Unauthorized')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const getPredictions = async () => {
    if (!dateRange.from || !dateRange.to) {
      setError('Παρακαλώ επιλέξτε εύρος ημερομηνιών.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const fromDate = dateRange.from.replace(/-/g, '');
      const toDate = dateRange.to.replace(/-/g, '');
      const response = await fetch(
        `http://localhost:9115/api/peak_hour/${selectedCompany}/${fromDate}/${toDate}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-observatory-auth': token,
          },
        }
      );

      if (response.status === 200) {
        const data = await response.json();

        // Μετατροπή των αποτελεσμάτων
        const formattedData = data.map((item) => ({
          ...item,
          passage_date: formatToDateOnly(item.passage_date),
          predicted_hour: formatHourTo24h(item.predicted_hour),
          predicted_hour_minutes: timeToMinutes(formatHourTo24h(item.predicted_hour)), // για το γράφημα
        }));

        // Φίλτρο για να απομακρύνουμε τις διπλές εγγραφές (βάσει passage_date)
        const uniqueData = formattedData.filter((item, index, self) =>
          index === self.findIndex((t) => t.passage_date === item.passage_date)
        );

        setPredictions(uniqueData);
      } else if (response.status === 204) {
        setError('Δεν επιστράφηκαν δεδομένα για τα κριτήρια που δώσατε.');
      } else {
        switch (response.status) {
          case 400:
            throw new Error('Άκυρο αίτημα. Παρακαλώ ελέγξτε τις εισροές σας.');
          case 401:
            throw new Error('Μη εξουσιοδοτημένο αίτημα. Παρακαλώ συνδεθείτε ξανά.');
          case 404:
            throw new Error('Η ζητούμενη πόρος δεν βρέθηκε.');
          case 500:
            throw new Error('Προέκυψε σφάλμα στον διακομιστή. Παρακαλώ δοκιμάστε ξανά αργότερα.');
          default:
            throw new Error('Προέκυψε μη αναμενόμενο σφάλμα.');
        }
      }
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setError('Failed to get predictions: ' + err.message);
      if (err.message.includes('Unauthorized')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const getForecast = async () => {
    if (!forecastDate) {
      setError('Παρακαλώ επιλέξτε ημερομηνία πρόβλεψης.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const formattedDate = forecastDate.replace(/-/g, '');
      const response = await fetch(
        `http://localhost:9115/api/forecast/${selectedCompany}/${formattedDate}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-observatory-auth': token,
          },
        }
      );

      if (response.status === 200) {
        const data = await response.json();
        const formattedData = data.predictions.map((predictedHour, index) => {
          const tollID = `${selectedCompany}${String(index + 1).padStart(2, '0')}`;
          return {
            tollID: tollID,
            tollName: tollNameMapping[tollID] || tollID,
            predicted_hour: Math.round(predictedHour),
          };
        });

        setForecastData(formattedData);
      } else if (response.status === 204) {
        setError('Δεν επιστράφηκαν δεδομένα για την επιλεγμένη ημερομηνία.');
      } else {
        switch (response.status) {
          case 400:
            throw new Error('Άκυρο αίτημα. Παρακαλώ ελέγξτε τις εισροές σας.');
          case 401:
            throw new Error('Μη εξουσιοδοτημένο αίτημα. Παρακαλώ συνδεθείτε ξανά.');
          case 404:
            throw new Error('Η ζητούμενη πόρος δεν βρέθηκε.');
          case 500:
            throw new Error('Προέκυψε σφάλμα στον διακομιστή. Παρακαλώ δοκιμάστε ξανά αργότερα.');
          default:
            throw new Error('Προέκυψε μη αναμενόμενο σφάλμα.');
        }
      }
    } catch (err) {
      console.error('Error fetching forecast:', err);
      setError('Failed to fetch forecast: ' + err.message);
      if (err.message.includes('Unauthorized')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Αποθήκευση της ημερομηνίας σε μορφή "yyyy-mm-dd"
  const handleDatePickerChange = (field, date) => {
    if (!date) return;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedValue = `${year}-${month}-${day}`;
    setDateRange((prev) => ({ ...prev, [field]: formattedValue }));
  };

  const handleForecastDateChange = (date) => {
    if (!date) return;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedValue = `${year}-${month}-${day}`;
    setForecastDate(formattedValue);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Προβλέψεις Κυκλοφορίας</h1>

      {/* Εκπαίδευση Μοντέλων (μόνο για διαχειριστές) */}
      {isAdmin && (
        <div className="mb-8 p-6 border rounded bg-white">
          <h2 className="text-xl font-bold mb-4">Εκπαίδευση Μοντέλων</h2>
          <button
            onClick={trainModels}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Εκπαίδευση...' : 'Εκπαίδευση'}
          </button>
          {trainingStatus && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
              <p>{trainingStatus}</p>
            </div>
          )}
        </div>
      )}

      {/* Επιλογή Πρόβλεψης / Πρόβλεψης */}
      <div className="p-6 border rounded bg-white">
        <h2 className="text-xl font-bold mb-4">Επιλογή Πρόβλεψης</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Πρόβλεψεις</label>
          <select
            value={selectedFunctionality}
            onChange={(e) => setSelectedFunctionality(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Επιλέξτε πρόβλεψη</option>
            {functionalities.map((func) => (
              <option key={func.value} value={func.value}>
                {func.label}
              </option>
            ))}
          </select>
        </div>

        {/* Πρόβλεψη Ώρας Αιχμής */}
        {selectedFunctionality === 'predictions' && (
          <>
            <h2 className="text-xl font-bold mb-4">Πρόβλεψη Ώρας Αιχμής</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Εταιρεία</label>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  {companies.map((company) => (
                    <option key={company.value} value={company.value}>
                      {company.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="date-inputs">
                <div>
                  <label className="block text-sm font-medium mb-1">Από</label>
                  <ReactDatePicker
                    selected={dateRange.from ? parseLocalDate(dateRange.from) : null}
                    onChange={(date) => handleDatePickerChange('from', date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="dd/mm/yyyy"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Έως</label>
                  <ReactDatePicker
                    selected={dateRange.to ? parseLocalDate(dateRange.to) : null}
                    onChange={(date) => handleDatePickerChange('to', date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="dd/mm/yyyy"
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={getPredictions}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Γίνεται πρόβλεψη...' : 'Αποτελέσματα πρόβλεψης'}
            </button>
          </>
        )}

        {/* Πρόβλεψη Μέγιστης Ροής Οχημάτων */}
        {selectedFunctionality === 'forecast' && (
          <>
            <h2 className="text-xl font-bold mb-4">Πρόβλεψη Μέγιστης Ροής Οχημάτων</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Εταιρεία</label>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  {companies.map((company) => (
                    <option key={company.value} value={company.value}>
                      {company.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ημερομηνία</label>
                <ReactDatePicker
                  selected={forecastDate ? parseLocalDate(forecastDate) : null}
                  onChange={handleForecastDateChange}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="dd/mm/yyyy"
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <button
              onClick={getForecast}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Γίνεται πρόβλεψη...' : 'Αποτελέσματα πρόβλεψης'}
            </button>
          </>
        )}

        {/* Εμφάνιση σφάλματος */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded text-red-700">
            {error}
          </div>
        )}

        {/* Αποτελέσματα Πρόβλεψης */}
        {predictions.length > 0 && selectedFunctionality === 'predictions' && (
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-4">Αποτελέσματα Πρόβλεψης</h3>
            <table className="table-auto w-full border-collapse border border-gray-200 text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-200 px-4 py-2">Ημερομηνία</th>
                  <th className="border border-gray-200 px-4 py-2">Προβλεπόμενη Ώρα Αιχμής</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((entry, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2">{entry.passage_date}</td>
                    <td className="border border-gray-200 px-4 py-2">{entry.predicted_hour}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Γράφημα για τις προβλέψεις */}
            <div className="mt-6">
              <LineChart width={800} height={400} data={predictions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="passage_date" />
                <YAxis domain={[0, 1440]} tickFormatter={minutesToTime} />
                <Tooltip formatter={(value) => minutesToTime(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="predicted_hour_minutes"
                  stroke="#10B981"
                  name="Προβλεπόμενη Ώρα Αιχμής"
                />
              </LineChart>
            </div>

            {/* Disclaimer */}
            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded text-yellow-700">
              <p>
                <strong>Προσοχή:</strong> Οι προβλέψεις για ημερομηνίες που απέχουν πολύ από την σημερινή ημερομηνία μπορεί να έχουν χαμηλή ακρίβεια.
              </p>
            </div>
          </div>
        )}

        {/* Αποτελέσματα Πρόβλεψης Ροής Οχημάτων */}
        {forecastData.length > 0 && selectedFunctionality === 'forecast' && (
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-4">
              Αποτελέσματα Πρόβλεψης για {formatDate(forecastDate)}
            </h3>
            <table className="table-auto w-full border-collapse border border-gray-200 text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-200 px-4 py-2">Όνομα διοδίου</th>
                  <th className="border border-gray-200 px-4 py-2">Προβλεπόμενος αριθμός οχημάτων</th>
                </tr>
              </thead>
              <tbody>
                {forecastData.map((entry, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2">{entry.tollName}</td>
                    <td className="border border-gray-200 px-4 py-2">{entry.predicted_hour}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-6">
              <LineChart width={800} height={400} data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tollName" tick={false} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="predicted_hour"
                  stroke="#10B981"
                  name="Προβλεπόμενος αριθμός οχημάτων"
                />
              </LineChart>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
