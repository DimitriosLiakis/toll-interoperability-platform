const dbService = require('../dbService');

const passing_toll = (req, res) => {
    const {tranid, tollid } = req.body; // Accept the input from the request body
    const db = dbService.getDbServiceInstance();

    if ((!tranid) || (!tollid)) {
        console.log("An identifier (transceiver_id) must be provided");
        return res.status(400).send('An identifier (transceiver_id) must be provided');
    }

    const isNumber = !isNaN(tranid);
    if (!isNumber) {
        console.log("The identifier (transceiver_id) must be an integer");
        return res.status(400).send('The identifier (transceiver_id) must be an integer');
    }

    isNumber = !isNaN(tollid);
    if (!isNumber) {
        console.log("The identifier (tollid) must be an integer");
        return res.status(400).send('The identifier (tollid) must be an integer');
    }


    const transceiverId = parseInt(tranid, 10);
    const toll_id = parseInt(tollid, int)

    const result = db.createDebt(transceiverId, toll_id);

    result
        .then(data => {
            if (!data) {
                return res.status(404).send('Transceiver not found');
            }
            res.json({ data });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('An error occurred while fetching the Transceiver');
        });
};

module.exports = { passing_toll };
