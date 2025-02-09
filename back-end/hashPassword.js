/**
 * This script hashes the passwords of users in the system using bcryptjs.
 * 
 * For each user in the database, the script takes their plain text password and
 * hashes it using bcrypt's hash function with a salt of 10 rounds for added security.
 * 
 * The hashed password replaces the plain text password in the user data.
 * After the hashing process, the updated user object (with the hashed password) is
 * ready to be stored in the database.
 * 
 * The hashed password cannot be decrypted, which increases the security of user data.
 * 
 * How it works:
 * 1. The plain password is taken from the user data.
 * 2. bcryptjs generates a hashed version of the password.
 * 3. The hashed password is stored in the database in place of the plain password.
 * 4. The user can log in by entering their password, which is then hashed again 
 *    and compared to the stored hashed value in the database.
 */

const bcrypt = require('bcryptjs');
const db = require('./dbService.js');
const dbService = db.getDbServiceInstance();

// Sample data from your table
const users = [
  { user_id: 3, user_email: 'admin@aodos.gr', user_password: 'Aodos123!', user_session_id: null },
  { user_id: 4, user_email: 'admin@gefyra.gr', user_password: 'Gefyra123!', user_session_id: null },
  { user_id: 5, user_email: 'admin@egnatia.eu', user_password: 'Egnatia123!', user_session_id: null },
  { user_id: 6, user_email: 'admin@kentrikiodos.gr', user_password: 'Kentriki123!', user_session_id: null },
  { user_id: 7, user_email: 'admin@moreas.com.gr', user_password: 'Moreas123!', user_session_id: null },
  { user_id: 8, user_email: 'admin@neaodos.gr', user_password: 'Neaodos123!', user_session_id: null },
  { user_id: 9, user_email: 'admin@olympiaodos.gr', user_password: 'Olympia123!', user_session_id: null },
  { user_id: 10, user_email: 'admin@yme.gov.gr', user_password: 'yme123!', user_session_id: null }
];

const saltRounds = 10;

// Δημιουργούμε μια promisified έκδοση της bcrypt.hash για να χρησιμοποιήσουμε async/await
function hashPassword(password) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, (err, hashed) => {
      if (err) {
        reject(err);
      } else {
        resolve(hashed);
      }
    });
  });
}

// Συνάρτηση που επεξεργάζεται κάθε χρήστη: κάνει hash του κωδικού και μετά καλεί το dbService για update ή insert.
async function processUsers(users) {
  for (const user of users) {
    try {
      // Hash του plain text κωδικού
      const hashedPassword = await hashPassword(user.user_password);
      console.log(`User ${user.user_email} hashed password: ${hashedPassword}`);
      
      // Κλήση της createOrUpdateUser για αποθήκευση του χρήστη στη βάση,
      // όπου περνάμε μόνο το email και τον hashed κωδικό (χωρίς να αγγίζουμε το user_role)
      const result = await dbService.createOrUpdateUser(user.user_email, hashedPassword);
      console.log(`Database result for ${user.user_email}:`, result);
    } catch (error) {
      console.error(`Error processing user ${user.user_email}:`, error);
    }
  }
}

// Ξεκινάμε την επεξεργασία των χρηστών
processUsers(users);
