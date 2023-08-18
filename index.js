const express = require("express");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const gifRoutes = require('./routes/gifRoutes.js'); 


// create a port to listen on
const app = express();
const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());

// Define a route handler for the root URL
app.get("/", (req, res) => {
  res.send("We are live now!");
});

//  routes
app.use("/api", userRoutes);
app.use("/api", gifRoutes);
app.use("/api", authRoutes);



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
