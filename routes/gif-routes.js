const express = require("express");
const router = express.Router();
const { createGif, getAllGifs, deleteGifById  } = require("../controller/gif-controller");

const authMiddleware = require("../auth/auth-middle-ware");

// Route to upload GIF and store URL in database
router.post("/gifs", authMiddleware, createGif);

// Route to get list of GIFs data
router.get("/", getAllGifs);

// employees can delete gifs
router.delete("/gifs/:gifId", authMiddleware, deleteGifById);


module.exports = router;

