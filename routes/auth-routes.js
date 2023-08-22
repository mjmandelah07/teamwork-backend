const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/db");
require("dotenv").config();

const router = express.Router();

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (!result.rows.length) {
      return res.status(400).json({ 
        status: 'error',
        error: "Invalid email" });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ 
        status: 'error',
        error: "Invalid password" });
    }

    //  user data in the payload for token
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    // sign the payload
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Send the token and user details in the response
    res.status(200).json({
      status: "success",
      data: {
        message: "Logged in successfully",
        token: token,
        userId: user.id,
        userRole: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({
      status: "error",
      error: "An error occurred while login attempt",
    });
  }
});

module.exports = router;

