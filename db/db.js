require('dotenv').config();
const { Client } = require('pg');

const dbConfig = {
  user: process.env.DB_USER,
  host: 'localhost',
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: 5432, 
};

const client = new Client(dbConfig);

module.exports = {
  connect: async () => {
    try {
      await client.connect();
      console.log(`Connected to PostgreSQL database, ${process.env.DB_USER}`);
    } catch (error) {
      console.error('Error connecting to PostgreSQL:', error);
    }
  },
  end: () => {
    client.end();
    console.log('Disconnected from PostgreSQL database');
  },
  query: (query, values) => {
    return client.query(query, values);
  }
 
};
