const db = require('./db/db');
const express = require('express');



// create a port to listen on
const app = express();
const PORT = process.env.PORT || 4000;

// Define a route handler for the root URL
app.get('/', (req, res) => {
  res.send('We are live now!');
});

// Define a route handler for the database connection url
app.get('/test-db', async (req, res) => {
  try {
    await db.connect(); // Connect to the database
    res.send('Connected to PostgreSQL database');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    db.end(); // Disconnect from the database
  }
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
