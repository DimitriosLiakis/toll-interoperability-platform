const dbService = require('../dbService');

const passing_toll = async (req, res) => {
    const { tranid, tollid } = req.body; // Accept the input from the request body
    const db = dbService.getDbServiceInstance();

    // Validate input
    if (!tranid || !tollid) {
        console.log("An identifier (transceiver_id) and toll_id must be provided");
        return res.status(400).send('An identifier (transceiver_id) and toll_id must be provided');
    }

    // Check if tranid is a number
    if (isNaN(tranid)) {
        console.log("The identifier (transceiver_id) must be an integer");
        return res.status(400).send('The identifier (transceiver_id) must be an integer');
    }

    // Check if tollid is a number
    if (isNaN(tollid)) {
        console.log("The identifier (tollid) must be an integer");
        return res.status(400).send('The identifier (tollid) must be an integer');
    }

    const transceiverId = parseInt(tranid, 10);
    const tollId = parseInt(tollid, 10); // Corrected to use 10 as the radix

    try {
        const result = await db.passing_toll(transceiverId, tollId); // Await the database call

        // Check if result is empty
        if (!result) {
            return res.status(404).send('Transceiver not found or no action taken');
        }
        
        // Respond with the data
        res.json({ data: result });
    } catch (err) {
        console.error(err);
        return res.status(500).send('An error occurred while processing the request');
    }
};

module.exports = { passing_toll };
