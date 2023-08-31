const bcrypt = require("bcrypt");
const db = require("../db/db");
require("dotenv").config();
const { createUsersAccount } = require("../db/queries/set-up-user-table");
const {
  STATUS,
  STATUSCODE,
  successResponse,
  errorResponse,
} = require("../utilities/response-utility");

// create user table for testing purposes
createUsersAccount();

const createUser = async (req, res) => {
  const userRole = req.user?.role;
  const userData = req.body;

  // Check if the authenticated user is an admin
  if (userRole !== "admin") {
    return res
      .status(STATUSCODE.FORBIDDEN)
      .json(errorResponse(STATUS.Error, "Only admin users can create account"));
  }

  // Check if email already exists
  const emailCheckQuery = "SELECT COUNT(*) FROM users WHERE email = $1";
  const emailCheckValues = [userData.email];
  const emailCheckResult = await db.query(emailCheckQuery, emailCheckValues);
  const emailExists = emailCheckResult.rows[0].count > 0;

  if (emailExists) {
    return res
      .status(STATUSCODE.BAD_REQUEST)
      .json(errorResponse(STATUS.Error, "Email already exists"));
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
    const reponseData = {
      message: "User account successfully created",
      userId: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      gender: createdUser.gender,
      job_role: createdUser.job_role,
      department: createdUser.department,
      address: createdUser.address,
      created_on: createdUser.created_on,
    };

    // Send the token and user details in the response
    res
      .status(STATUSCODE.CREATED)
      .json(successResponse(STATUS.Success, reponseData));
  } catch (error) {
    console.error(error);
    return res
      .status(STATUSCODE.SERVER)
      .json(
        errorResponse(STATUS.Error, "An error occurred while creating users")
      );
  }
};

const getAllUsers = async (req, res) => {
  const userRole = req.user?.role;

  // Check if the authenticated user is an admin
  if (userRole !== "admin") {
    return res
      .status(STATUSCODE.FORBIDDEN)
      .json(STATUS.Error, "Only admin users can access this resource");
  }
  try {
    const userQuery = `
    SELECT id, email, role, firstName, lastName, gender, job_role, department, address, created_on
    FROM users;
    `;
    const result = await db.query(userQuery);
    const responseData = result.rows;
    res
      .status(STATUSCODE.OK)
      .json(successResponse(STATUS.Success, responseData));
  } catch (error) {
    console.error(error);
    res
      .status(STATUSCODE.SERVER)
      .json(errorResponse(STATUS.Error, "An error occurred while fetching users"));
  }
};

module.exports = { createUser, getAllUsers };
