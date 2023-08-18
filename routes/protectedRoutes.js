const express = require('express');
const authMiddleware = require('../auth/authMiddlewarejs');
const db = require('../db/db');

const router = express.Router();

// This route requires authentication
router.get('/protected', authMiddleware, async (req, res) => {
  const user = req.user;
  
  if (user.role === 'admin') {
    // Handle admin permissions
    res.json({ message: 'Admin protected route' });
  } else {
    // Handle employees permissions
    res.json({ message: 'Employee protected route' });
  }
});

module.exports = router;
