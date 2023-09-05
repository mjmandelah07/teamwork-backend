const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/user-routes");
const authRoutes = require("./routes/auth-routes");
const articleRoutes = require("./routes/article-routes");
const gifRoutes = require("./routes/gif-routes.js");
const initializeDatabase = require("./db/queries/initialize-database");

// create a port to listen on
const app = express();
const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());

//Enabled cors
app.use(cors());

// Define a route handler for the root URL
app.get("/", (req, res) => {
  res.send("We are live now!");
});

initializeDatabase;

//  routes
app.use("/api/v1", userRoutes);
app.use("/api/v1", authRoutes);
app.use("/api/v1", articleRoutes);
app.use("/api/v1", gifRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
