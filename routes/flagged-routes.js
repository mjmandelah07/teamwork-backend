const express = require("express");
const router = express.Router();
const authMiddleware = require("../auth/auth-middle-ware");
const {
  flagGif,
  flagGifComment,
  flagArticleComment,
  flagArticle,
  getAllFlagged,
  deleteFlagged,
} = require("../controller/flag-controller");

// Endpoint to flag an article by ID
router.patch("/flag-article/:articleId", authMiddleware, flagArticle);

// Endpoint to flag a comment by ID
router.patch(
  "/flag-article-comment/:commentId",
  authMiddleware,
  flagArticleComment
);

// Endpoint to flag an gif by ID
router.patch("/flag-gif/:gifId", authMiddleware, flagGif);

// Endpoint to flag a comment by ID
router.patch("/flag-gif-comment/:commentId", authMiddleware, flagGifComment);

// Endpoint to GET all flagged [comments, gifs, and articles]
router.get("/flagged", authMiddleware, getAllFlagged);

// Endpoint to delete all flagged [comments, gifs, and articles]
router.delete("/flagged", authMiddleware, deleteFlagged);

module.exports = router;
