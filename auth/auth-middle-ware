const jwt = require('jsonwebtoken');
const db = require('../db/db');
require('dotenv').config();

module.exports = async (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ 
      status: 'error',
      error: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await db.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    if (!result.rows.length) {
      return res.status(404).json({
        status: "error",
        error: 'User not found',
      });
    }
    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(401).json({
      status: "error",
      error: 'Error authenticating user',
    });
  }
};
