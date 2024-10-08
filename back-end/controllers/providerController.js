const dbService = require('../dbService');

// Controller function for getting a provider by transceiver ID or driver name
const getProvider = (req, res) => {
    const { transceiver_id, driver_name } = req.body; // Extract transceiver_id or driver_name from request body
    const db = dbService.getDbServiceInstance();

    // Choose which input to use based on whether transceiver_id or driver_name is provided
    const result = transceiver_id 
        ? db.getProvider(transceiver_id) 
        : db.getProvider(driver_name);

    result
        .then(data => res.json({ data }))
        .catch(err => {
            console.error(err);
            res.status(500).send('An error occurred while fetching the provider');
        });
};

module.exports = { getProvider };
