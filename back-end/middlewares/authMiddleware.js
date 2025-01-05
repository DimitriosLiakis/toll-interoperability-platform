const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

/**
 * Middleware για την επικύρωση του JWT token στο header X-OBSERVATORY-AUTH.
 */
const authenticateToken = (req, res, next) => {
    // Ανάκτηση του token από το custom header
    const token = req.headers['x-observatory-auth'];

    // Αν λείπει το token, επιστρέφουμε 401 Unauthorized
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: Token missing' });
    }

    try {
        // Επικύρωση του token με το secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mySuperSecretKey');
        req.user = decoded; // Αποθήκευση των πληροφοριών του χρήστη στο request
        next(); // Προχωράμε στο επόμενο middleware ή endpoint
    } catch (err) {
        // Επιστρέφουμε 401 Unauthorized αν το token είναι άκυρο ή έχει λήξει
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
};

const authorizeRole = (requiredRoles) => {
    return (req, res, next) => {
        if(requiredRoles.includes(req.user.user_role)) {
            next();
        } else {
            res.status(403).json({ error: "Access Denied - Insufficient Permissions" });
        }
    }
};

module.exports = { 
    authenticateToken,
    authorizeRole
  };  