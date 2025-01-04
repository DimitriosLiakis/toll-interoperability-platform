const db = require('../dbService.js'); // Database service
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

const dbService = db.getDbServiceInstance();

const authenticate = async (req, res) => {
    const { user_email, user_password } = req.body;    
    if (!user_email || !user_password) {
      return res.status(400).json({error: 'Please enter both email and password'}) ;
    }

    try {
        const user = await dbService.getUser(user_email);
        console.log('User fetched:', user); // Debugging
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const isMatch = await bcrypt.compare(user_password, user.user_password);
        console.log('Password match:', isMatch); // Debugging
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const payload = {
            user_id: user.user_id,
            user_email: user.user_email
        };

        const token = jwt.sign(payload, process.env.SECRET_KEY || 'mySuperSecretKey', { expiresIn: '1h' });
        return res.status(200).json({ message: 'Authentication successful', token });
    } catch (err) {
        //console.error(err);
        console.error('Error during authentication:', err); // Debugging
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const logout = (req, res) => {
  const token = req.headers['x-observatory-auth'];
  console.log(token)

  if(!token) {
    return res.status(400).json({ error: 'Token not found' });
  }

  try {
    jwt.verify(token, process.env.SECRET_KEY);

    return res.status(200).json({ message: 'Logout Successful' });
  } catch(error) {
    return res.status(400).json({ error: 'Invalid Token' });
  }
}

module.exports = { authenticate, logout };