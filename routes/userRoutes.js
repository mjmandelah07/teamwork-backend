const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/db");
require("dotenv").config();

const router = express.Router();
const authMiddleware = require("../auth/authMiddlewarejs");

// Middleware to handle database connection
const withDBConnection = (handler) => async (req, res, next) => {
  const client = await db.connect();
  try {
    await handler(req, res, next, client);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  } finally {
    db.end();
  }
};

// Get all users
router.get(
  "/get-user",
  authMiddleware,
  withDBConnection(async (req, res, client) => {
    const user = req.user;

    const result = await db.query("SELECT * FROM allUsers");
    res.send(result.rows);
  })
);

// admin create new user
router.post(
  "/create-user",
  authMiddleware,
  withDBConnection(async (req, res, client) => {
    const user = req.user;
    const userData = req.body;

    // Check if the authenticated user is an admin
    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admin users can create account" });
    }

    // Check if email already exists
    const emailCheckQuery = "SELECT COUNT(*) FROM allUsers WHERE email = $1";
    const emailCheckValues = [userData.email];
    const emailCheckResult = await db.query(emailCheckQuery, emailCheckValues);
    const emailExists = emailCheckResult.rows[0].count > 0;

    if (emailExists) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const insertUserDataQuery = `
    INSERT INTO allUsers (
      firstName, lastName, email, password, gender, job_role, department, address, role, created_on
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
    ) RETURNING id;             
  `;
    const values = [
      userData.firstName,
      userData.lastName,
      userData.email,
      hashedPassword,
      userData.gender,
      userData.job_role,
      userData.department,
      userData.address,
      userData.role,
      new Date(),
    ];

    try {
      const result = await db.query(insertUserDataQuery, values);
      const createdUserId = result.rows[0].id;

      // Create a payload for token
      const tokenPayload = {
        userId: createdUserId,
        email: userData.email,
        role: userData.role,
      };

      // Sign the payload with the secret key and generate the token
      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      // Send the token and user details in the response
      res.status(201).json({
        status: "success",
        data: {
          message: "User account successfully created",
          token: token,
          userId: createdUserId,
        },
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "An error occurred while creating user" });
    }
  })
);

module.exports = router;
