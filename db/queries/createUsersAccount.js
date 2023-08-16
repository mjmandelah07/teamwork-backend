require('dotenv').config();
const db = require('./db');


async function createUsersAccount() {
  const createUsersQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      firstName VARCHAR(255) NOT NULL,
      lastName VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password VARCHAR(50) NOT NULL,
      gender VARCHAR(50),
      job_role VARCHAR(255),
      department VARCHAR(255),
      address VARCHAR(255),
      role VARCHAR(20) NOT NULL,
      created_on TIMESTAMP NOT NULL,
      last_login TIMESTAMP
    );
  `;

  try {
    await db.connect();
    const client = db.getClient(); 
    await client.query(createUsersQuery);
    console.log('Users table created or already exists');
  } catch (error) {
    console.error('Error creating users table:', error);
  } finally {
    await db.end();
  }
}

createUsersAccount();
