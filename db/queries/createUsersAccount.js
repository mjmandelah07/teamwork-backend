const db = require('../db');
require('dotenv').config();
const bcrypt = require("bcrypt");



const createUsersAccount = async () => {
  
  const dropTableQuery = `DROP TABLE IF EXISTS users;`;

  const createUsersQuery = `
    CREATE TABLE IF NOT EXISTS allUsers (
      id SERIAL PRIMARY KEY,
      firstName VARCHAR(255) NOT NULL,
      lastName VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      gender VARCHAR(50),
      job_role VARCHAR(255),
      department VARCHAR(255),
      address VARCHAR(255),
      role VARCHAR(20) NOT NULL,
      created_on TIMESTAMP NOT NULL,
      last_login TIMESTAMP
    );
  `;

  const insertUserDataQuery = `
    INSERT INTO allUsers (
      firstName, lastName, email, password, gender, job_role, department, address, role, created_on
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
    );
  `;
  const hashedPassword = await bcrypt.hash('admin88888', 10);
  const userData = {
    firstName: "Mojisola oluwadamilola",
    lastName: "Aramide",
    email: "mojisolaaramide7@gmail.com",
    password: hashedPassword,
    gender: "Female",
    job_role: "Developer",
    department: "IT",
    address: "123 olukokun street",
    role: "admin",
  };
  const values = [
    userData.firstName,
    userData.lastName,
    userData.email,
    userData.password,
    userData.gender,
    userData.job_role,
    userData.department,
    userData.address,
    userData.role,
    new Date(),
  ];

  try {
    // connect to database
    await db.connect();

    // Drop the table if it exists
    await db.query(dropTableQuery);

    // Create the users table
    await db.query(createUsersQuery);
    console.log('Users table created or already exists');

    // Insert dummy user data
    await db.query(insertUserDataQuery, values);
    console.log('Dummy user data inserted');
  } catch (error) {
    console.error('Error:', error);
  }
}

module.exports = { createUsersAccount };