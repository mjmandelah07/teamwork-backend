require("dotenv").config();
const { Client } = require("pg");
const bcrypt = require("bcrypt");

const dbConfig = {
  user: process.env.DB_USER,
  host: "localhost",
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: 5432,
};

const client = new Client(dbConfig);


module.exports = {
  connect: async () => {
    try {
      await client.connect();
      console.log(
        "Connected to PostgreSQL in insertNewUser",
        process.env.DB_PASSWORD,
        process.env.DB_DATABASE,
        process.env.DB_USER
      );
    } catch (error) {
      console.error("Error connecting to PostgreSQL:", error);
    }
  },
  end: async () => {
    try {
      await client.end();
      console.log("Disconnected from PostgreSQL database");
    } catch (error) {
      console.error("Error disconnecting from PostgreSQL:", error);
    }
  },
  insertUserData: async () => {
    try {
      const insertUser = `
        INSERT INTO users
        (firstName, lastName, email, password, gender, job_role, department, address, role, created_on)
        VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;
      const hashedPassword = await bcrypt.hash('admin88888', 10);
      const userData = {
        firstName: "Mojisola",
        lastName: "Aramide",
        email: "jmojisolaaramide7@gmail.com",
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

      await client.query(insertUser, values);
      console.log("Data inserted successfully");
    } catch (error) {
      console.error("Error inserting data:", error);
    }
  },
};
