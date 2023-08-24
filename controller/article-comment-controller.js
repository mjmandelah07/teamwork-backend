const db = require("../db/db");
const { articleCommentTable } = require("../db/queries/set-up-article-comment-table");
const { STATUSCODE, successResponse, errorResponse } = require("../utilities/response-utility");

articleCommentTable();

// function to create comments for an article
const createArticleComment = async (req, res) => {
  const { comment } = req.body;
  const userId = req.user?.id;
  const articleId = req.params.articleId;

  try {
    // Fetch the article details
    const articleQuery = `
          SELECT title, article
          FROM articles
          WHERE id = $1;
        `;
    const articleResult = await db.query(articleQuery, [articleId]);

    if (!articleResult.rows.length) {
      return res.status(404).json({
        status: "error",
        error: "Article not found",
      });
    }

    const articleTitle = articleResult.rows[0].title;
    const articleContent = articleResult.rows[0].article;

    // Insert the comment into the comments table
    const insertCommentQuery = `
          INSERT INTO article_comments (user_id, article_id, comment)
          VALUES ($1, $2, $3)
          RETURNING created_on;
        `;
    const insertCommentValues = [userId, articleId, comment];
    const insertCommentResult = await db.query(
      insertCommentQuery,
      insertCommentValues
    );

    const createdOn = insertCommentResult.rows[0].created_on;

    res.status(201).json({
      status: "success",
      data: {
        message: "Comment successfully created",
        createdOn: createdOn,
        articleTitle: articleTitle,
        article: articleContent,
        comment: comment,
      },
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({
      status: "error",
      error: "An error occurred while creating comment",
    });
  }
};

module.exports = { createArticleComment };
