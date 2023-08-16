const db = require('./db/queries/insertNewUser');
const express = require('express');



// create a port to listen on
const app = express();
const PORT = process.env.PORT || 4000;

// Define a route handler for the root URL
app.get('/', (req, res) => {
  res.send('We are live now!');
});

// connect to the database
const database = async () => {
  try {
    await db.connect();
    await db.insertUserData();
  } catch (err) {
    console.error(err);
  } finally {
    db.end();
  }
};
database();



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
