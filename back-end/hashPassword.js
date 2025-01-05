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
//also it is a way to show you the passwords that we use
const bcrypt = require('bcryptjs');

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

const saltRounds = 10; // Adjust salt rounds for security

// Function to hash the password for each user and return the updated data
function hashPasswords(users) {
  users.forEach((user, index) => {
    bcrypt.hash(user.user_password, saltRounds, (err, hashedPassword) => {
      if (err) {
        console.error('Error hashing password for user', user.user_email, err);
        return;
      }
      
      // Here we update the user object with the hashed password
      users[index].user_password = hashedPassword;
      console.log(`User ${user.user_email} hashed password: ${hashedPassword}`);
      
      // Store the user in the database with hashed password
      // Database code should be here (e.g., an SQL query or a NoSQL insert)
    });
  });
}

// Call the function to hash passwords
hashPasswords(users);
