const express = require("express");
const router = express.Router();
const authMiddleware = require("../auth/auth-middle-ware");
const {
  createArticle,
  updateArticlebyId,
  deleteArticleById,
  getArticleById,
  getAllArticlesByUserId,
  getAllArticles,
} = require("../controller/article-controller");
const {
  createArticleComment,
  deleteArticleCommentById,
  updateArticleCommentById,
} = require("../controller/article-comment-controller");

const {
  flagArticle,
  flagArticleComment,
} = require("../controller/flag-controller");

// employees create articles
router.post("/articles", authMiddleware, createArticle);

// employees can edit articles
router.patch("/articles/:articleId", authMiddleware, updateArticlebyId);

// employees can delete articles
router.delete("/articles/:articleId", authMiddleware, deleteArticleById);

// GET /articles BY ID
router.get("/articles/:articleId", authMiddleware, getArticleById);

// get all articles by a certain user
router.get("/articles/user/:userId", authMiddleware, getAllArticlesByUserId);

// get all articles in the database
router.get("/articles", authMiddleware, getAllArticles);

// post  articles comments in the database
router.post(
  "/articles/:articleId/comments",
  authMiddleware,
  createArticleComment
);

// employees and admin can delete article comments
router.delete(
  "/articles/:articleId/comments/:commentId",
  authMiddleware,
  deleteArticleCommentById
);

// employees can update their article comments
router.patch(
  "/articles/:articleId/comments/:commentId",
  authMiddleware,
  updateArticleCommentById
);

// Endpoint to flag an article by ID
router.patch("/flag-article/:articleId", authMiddleware, flagArticle);

// Endpoint to flag a comment by ID
router.patch("/flag-article-comment/:commentId", authMiddleware, flagArticleComment);

module.exports = router;
