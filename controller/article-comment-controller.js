const db = require("../db/db");

const {
  STATUSCODE,
  STATUS,
  successResponse,
  errorResponse,
} = require("../utilities/response-utility");

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
      return res
        .status(STATUSCODE.NOT_FOUND)
        .json(errorResponse(STATUS.Error, "Article not found"));
    }
    const articleTitle = articleResult.rows[0].title;
    const articleContent = articleResult.rows[0].article;

    // Fetch the commentor name
    const userQuery = `
          SELECT *
          FROM users 
          WHERE id = $1;
 `;
    const userResult = await db.query(userQuery, [userId]);

    if (!userResult.rows.length) {
      return res
        .status(STATUSCODE.NOT_FOUND)
        .json(errorResponse(STATUS.Error, "User not found"));
    }

    // User variables
    const authorName = `${userResult.rows[0].firstname}  ${userResult.rows[0].lastname}`;

    // Insert the comment into the comments table
    const insertCommentQuery = `
          INSERT INTO article_comments (user_id, article_id, user_name, comment)
          VALUES ($1, $2, $3, $4)
          RETURNING created_on;
        `;
    const insertCommentValues = [userId, articleId, authorName, comment];
    const insertCommentResult = await db.query(
      insertCommentQuery,
      insertCommentValues
    );

    const createdOn = insertCommentResult.rows[0].created_on;
    const responseData = {
      message: "Comment successfully created",
      createdOn: createdOn,
      articleTitle: articleTitle,
      article: articleContent,
      comment: comment,
    };
    res
      .status(STATUSCODE.CREATED)
      .json(successResponse(STATUS.Success, responseData));
  } catch (error) {
    console.error("Error creating comment:", error);
    res
      .status(STATUSCODE.SERVER)
      .json(
        errorResponse(
          STATUS.Error,
          "An error occurred while posting the comment"
        )
      );
  }
};

// employee and admin can delete comments
const deleteArticleCommentById = async (req, res) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const commentId = req.params.commentId;
  const articleId = req.params.articleId;

  try {
    // Check if the article exists
    const articleQuery = `
      SELECT *
      FROM articles
      WHERE id = $1;
    `;
    const articleResult = await db.query(articleQuery, [articleId]);

    if (!articleResult.rows.length) {
      return res
        .status(STATUSCODE.NOT_FOUND)
        .json(errorResponse(STATUS.Error, "Article not found"));
    }
    // Check if the user is an admin
    if (userRole === "admin") {
      const deleteQuery = `
        DELETE FROM article_comments
        WHERE id = $1;
      `;
      const deleteValues = [commentId];
      const deleteResult = await db.query(deleteQuery, deleteValues);

      if (deleteResult.rowCount === 0) {
        return res
          .status(STATUSCODE.NOT_FOUND)
          .json(
            errorResponse(
              STATUS.Error,
              "Comment not found or not authorized to delete"
            )
          );
      }

      res
        .status(STATUSCODE.OK)
        .json(
          successResponse(
            STATUS.Success,
            "Comment successfully deleted by admin"
          )
        );
    } else {
      // Check if the user owns the comment
      const authorQuery = "SELECT user_id FROM article_comments WHERE id = $1";
      const authorResult = await db.query(authorQuery, [commentId]);

      if (
        authorResult.rows.length === 0 ||
        authorResult.rows[0].user_id !== userId
      ) {
        return res
          .status(STATUSCODE.FORBIDDEN)
          .json(
            errorResponse(
              STATUS.Error,
              "Access denied: You are not authorized to delete this comment"
            )
          );
      }

      const deleteQuery = `
        DELETE FROM article_comments
        WHERE id = $1;
      `;
      const deleteValues = [commentId];
      const deleteResult = await db.query(deleteQuery, deleteValues);

      if (deleteResult.rowCount === 0) {
        return res
          .status(STATUSCODE.NOT_FOUND)
          .json(
            errorResponse(
              STATUS.Error,
              "Comment not found or not authorized to delete"
            )
          );
      }

      res
        .status(STATUSCODE.OK)
        .json(
          successResponse(
            STATUS.Success,
            "Comment successfully deleted by author"
          )
        );
    }
  } catch (error) {
    console.error("Error deleting comment:", error);
    res
      .status(STATUSCODE.SERVER)
      .json(
        errorResponse(STATUS.Error, "An error occurred while deleting comment")
      );
  }
};

// employees can update their comments
const updateArticleCommentById = async (req, res) => {
  const userId = req.user?.id;
  const commentId = req.params.commentId;
  const articleId = req.params.articleId;
  const { comment } = req.body;

  try {
    // Check if the article exists
    const articleQuery = `
     SELECT *
     FROM articles
     WHERE id = $1;
   `;
    const articleResult = await db.query(articleQuery, [articleId]);

    if (!articleResult.rows.length) {
      return res
        .status(STATUSCODE.NOT_FOUND)
        .json(errorResponse(STATUS.Error, "Article not found"));
    }

    const commentQuery = `
      SELECT user_id, comment
      FROM article_comments
      WHERE id = $1;
    `;
    const commentResult = await db.query(commentQuery, [commentId]);

    if (!commentResult.rows.length) {
      return res
        .status(STATUSCODE.NOT_FOUND)
        .json(errorResponse(STATUS.Error, "Comment not found"));
    }

    const commentData = commentResult.rows[0];

    if (commentData.user_id !== userId) {
      return res
        .status(STATUSCODE.FORBIDDEN)
        .json(
          errorResponse(
            STATUS.Error,
            "Access denied: You are not authorized to update this comment"
          )
        );
    }

    const updateQuery = `
      UPDATE article_comments
      SET comment = $1, updated_on = $2
      WHERE id = $3
      RETURNING *;
    `;
    const updatedOn = new Date();
    // values to update the query with
    const updateValues = [comment, updatedOn, commentId];
    const updateResult = await db.query(updateQuery, updateValues);
    const updatedValues = updateResult.rows[0];
    const responseData = {
      message: "Comment successfully updated",
      id: commentId,
      createdOn: updatedValues.created_on,
      comment: updatedValues.comment,
      updated_on: updatedValues.updated_on,
    };

    res
      .status(STATUSCODE.OK)
      .json(successResponse(STATUS.Success, responseData));
  } catch (error) {
    console.error("Error updating comment:", error);
    res
      .status(STATUSCODE.SERVER)
      .json(
        errorResponse(STATUS.Error, "An error occurred while updating comment")
      );
  }
};

module.exports = {
  createArticleComment,
  deleteArticleCommentById,
  updateArticleCommentById,
};
