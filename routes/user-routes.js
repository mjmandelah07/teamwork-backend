const express = require("express");

const { createUser, getAllUsers } = require("../controller/user-controller");

const router = express.Router();
const authMiddleware = require("../auth/auth-middle-ware");

// Get all users
router.get("/get-users", authMiddleware, getAllUsers);
// admin create new user
router.post("/auth/create-user", authMiddleware, createUser);

module.exports = router;
