const jwt = require("jsonwebtoken");
const db = require("../db/db");
require("dotenv").config();
const {
  STATUSCODE,
  STATUS,
  errorResponse,
} = require("../utilities/response-utility");

module.exports = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res
      .status(STATUSCODE.UNAUTHORIZED)
      .json(errorResponse(STATUS.Error, "Access denied"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await db.query("SELECT * FROM users WHERE id = $1", [
      decoded.userId,
    ]);
    if (!result.rows.length) {
      return res
        .status(STATUSCODE.NOT_FOUND)
        .json(errorResponse(STATUS.Error, "User not found"));
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error("Error authenticating user:", error);
    res
      .status(STATUSCODE.UNAUTHORIZED)
      .json(errorResponse(STATUS.Error, "Error authenticating user"));
  }
};
