const express = require("express");
const router = express.Router();
const authMiddleware = require("../auth/auth-middle-ware");
const {
  createGifComment,
  deleteGifCommentById,
} = require("../controller/gif-comment-controller");
const {
  createGif,
  getAllGifs,
  deleteGifById,
} = require("../controller/gif-controller");
// Route to upload GIF and store URL in database
router.post("/gifs", authMiddleware, createGif);

// Route to get list of GIFs data
router.get("/", getAllGifs);

// employees can delete gifs
router.delete("/gifs/:gifId", authMiddleware, deleteGifById);

// employees can comment on gifs
router.post("/gifs/:gifId/comments", authMiddleware, createGifComment);

// employees and admin can delete comment on gifs
router.delete(
  "/gifs/:gifId/comments/:commentId",
  authMiddleware,
  deleteGifCommentById
);

module.exports = router;
