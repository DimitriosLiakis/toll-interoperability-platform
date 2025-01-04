// const express = require('express');
// const path = require('path'); // Import 'path' for resolving file paths
// const app = express();
// const tollRouter = require('./routers/tollRouter');

// // Serve static files (Leaflet map and app.js) from the 'public' directory
// app.use(express.static(path.join(__dirname, 'public')));

// // Serve the index.html file for the root route
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// // Use the toll API route
// app.use('/api', tollRouter);

// // Set up the server to listen on a port
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });
