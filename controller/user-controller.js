const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/db");
require("dotenv").config();
const { createUsersAccount } = require("../db/queries/set-up-user-table");

// create user table for testing purposes
createUsersAccount();

const createUser = async (req, res) => {
  const user = req.user;
  const userData = req.body;

  // Check if the authenticated user is an admin
  if (user.role !== "admin") {
    return res.status(403).json({
      status: "error",
      error: "Only admin users can create account",
    });
  }

  // Check if email already exists
  const emailCheckQuery = "SELECT COUNT(*) FROM users WHERE email = $1";
  const emailCheckValues = [userData.email];
  const emailCheckResult = await db.query(emailCheckQuery, emailCheckValues);
  const emailExists = emailCheckResult.rows[0].count > 0;

  if (emailExists) {
    return res.status(400).json({
      status: "error",
      error: "Email already exists",
    });
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const insertUserDataQuery = `
      INSERT INTO users (
        firstName, lastName, email, password, gender, job_role, department, address, role, created_on
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      ) RETURNING *;             
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
    const createdUser = result.rows[0];

    // Create a payload for token
    const tokenPayload = {
      userId: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
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
        userId: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        password: createdUser.password,
        gender: createdUser.gender,
        job_role: createdUser.job_role,
        department: createdUser.department,
        address: createdUser.address,
        created_on: createdUser.created_on,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      error: "An error occurred while creating users",
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM users");
    res.status(200).json({
      status: "success",
      data: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      error: "An error occurred while fetching users",
    });
  }
};

module.exports = { createUser, getAllUsers };
