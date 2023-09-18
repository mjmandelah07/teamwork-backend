const express = require("express");
const router = express.Router();
const authMiddleware = require("../auth/auth-middle-ware");
const getAllArticlesGifs = require("../controller/feed-controller");

// GET /feed (articles and gifs together) endpoint
router.get('/feed', authMiddleware, getAllArticlesGifs);

module.exports = router;
