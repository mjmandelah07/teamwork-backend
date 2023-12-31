const express = require("express");
const router = express.Router();
const authMiddleware = require("../auth/auth-middle-ware");
const {
  createGif,
  getAllGifs,
  deleteGifById,
} = require("../controller/gif-controller");

const {
  createGifComment,
  deleteGifCommentById,
  updateGifCommentById,
} = require("../controller/gif-comment-controller");

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

// employees can update comment on gifs
router.patch(
  "/gifs/:gifId/comments/:commentId",
  authMiddleware,
  updateGifCommentById
);

module.exports = router;
