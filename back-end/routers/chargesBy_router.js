const express = require('express');
const router = express.Router();
const chargesBy_controller = require('../controllers/chargesBy_controller'); 
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

/**
 * @openapi
 * /api/chargesBy/{tollOpID}/{date_from}/{date_to}:
 *   get:
 *     summary: Επιστροφή δεδομένων διέρξεων και κόστους μεταξύ εταιρειών.
 *     description: |
 *       Επιστρέφει τα δεδομένα των διέρξεων και του κόστους για έναν επιλεγμένο toll operator (tollOpID) και μια χρονική περίοδο.
 *       Οι ημερομηνίες πρέπει να παρέχονται σε μορφή YYYYMMDD. Το query parameter "format" μπορεί να χρησιμοποιηθεί για
 *       την επιστροφή της απάντησης σε μορφή CSV (π.χ. format=csv) ή JSON (προεπιλογή).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tollOpID
 *         required: true
 *         schema:
 *           type: string
 *         description: Ο κωδικός του toll operator. Επιτρεπόμενες τιμές: AM, EG, GE, KO, MO, NAO, NO, OO.
 *       - in: path
 *         name: date_from
 *         required: true
 *         schema:
 *           type: string
 *         description: Η αρχική ημερομηνία της περιόδου σε μορφή YYYYMMDD.
 *       - in: path
 *         name: date_to
 *         required: true
 *         schema:
 *           type: string
 *         description: Η τελική ημερομηνία της περιόδου σε μορφή YYYYMMDD.
 *       - in: query
 *         name: format
 *         required: false
 *         schema:
 *           type: string
 *           default: json
 *         description: Ορίζει τη μορφή της απόκρισης. Επιλογές: "json" ή "csv".
 *     responses:
 *       200:
 *         description: Επιτυχής απόκριση με τα δεδομένα.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tollOpID:
 *                   type: string
 *                 requestTimestamp:
 *                   type: string
 *                   format: date-time
 *                 periodFrom:
 *                   type: string
 *                 periodTo:
 *                   type: string
 *                 vOpList:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       visitingOpID:
 *                         type: string
 *                       nPasses:
 *                         type: integer
 *                       passesCost:
 *                         type: number
 *       400:
 *         description: Λανθασμένη αίτηση λόγω ελλιπών ή μη έγκυρων παραμέτρων.
 *       500:
 *         description: Εσωτερικό σφάλμα του server.
 */
router.get('/:tollOpID?/:date_from?/:date_to?', authenticateToken, authorizeRole(["users","admin"]), chargesBy_controller);

router.get('*', (req, res) => {
    console.log("400 - Route not found");
    res.status(400).json({ error: "Missing required parameters." });
});

module.exports = router;
