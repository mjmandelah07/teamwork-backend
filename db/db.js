require("dotenv").config();
const { Pool } = require("pg");

const dbConfig = {
  user: process.env.DB_USER,
  host: "localhost",
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: 5432,
};

const db = new Pool(dbConfig);

const connect = async () => {
  try {
    const result = await db.query("SELECT $1::text as name", [
      `Connected to PostgreSQL database, ${process.env.DB_USER}`,
    ]);
    console.log(result.rows[0].name);
  } catch (error) {
    console.error("Error connecting to PostgreSQL:", error);
  }
};
connect();

module.exports = db;
