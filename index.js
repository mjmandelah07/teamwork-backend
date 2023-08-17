const { createUsersAccount } = require("./db/queries/createUsersAccount.js");
const express = require("express");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes"); // Import the user routes module
const db = require("./db/db.js");


// create a port to listen on
const app = express();
const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());

// Define a route handler for the root URL
app.get("/", (req, res) => {
  res.send("We are live now!");
});

//  routes
app.use("/api/users", userRoutes);


// // connect to the database
// const database = async () => {
//   try {
//     // await db.connect();
//     await createUsersAccount();
//   } catch (err) {
//     console.error(err);
//   }
// };
// database();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
