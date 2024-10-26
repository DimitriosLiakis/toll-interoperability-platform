const dbService = require('../dbService');

// Controller function for getting a provider by name or number
const getProvider = (req, res) => {
    const { input } = req.body; // Accept the input from the request body
    const db = dbService.getDbServiceInstance();

    // Check if input is provided
    if (!input) {
        return res.status(400).send('An identifier (name or number) must be provided');
    }

    // Determine if the input is a number or a string
    const isNumber = !isNaN(input);

    // Fetch provider based on the type of input
    const result = isNumber 
        ? db.getProvider(parseInt(input, 10)) // Convert to an integer if it's a number
        : db.getProvider(input); // Treat as a string if it's not a number

    result
        .then(data => {
            if (!data) {
                return res.status(404).send('Provider not found');
            }
            res.json({ data });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('An error occurred while fetching the provider');
        });
};

module.exports = { getProvider };
