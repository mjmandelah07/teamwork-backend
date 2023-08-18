const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/db");
require("dotenv").config();

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    await db.connect();
    const result = await db.query("SELECT * FROM allUsers WHERE email = $1", [
      email,
    ]);

    if (!result.rows.length) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password" });
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
    res.status(201).json({
      status: "success",
      data: {
        message: "Logged in successfully",
        token: token,
        userId: user.id,
        userRole: user.role,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "An error occurred" });
  } finally {
    await db.end();
  }
});

module.exports = router;
