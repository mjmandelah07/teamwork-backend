const db = require("../db/db");
const { gifCommentTable } = require("../db/queries/set-up-gif-comment-table");
const {
  STATUSCODE,
  STATUS,
  successResponse,
  errorResponse,
} = require("../utilities/response-utility");

gifCommentTable();

const createGifComment = async (req, res) => {
  const { comment } = req.body;
  const userId = req.user?.id;
  const gifId = req.params.gifId;

  try {
    // Fetch the gif details
    const gifQuery = `
      SELECT title
      FROM gifs
      WHERE id = $1;
    `;
    const gifResult = await db.query(gifQuery, [gifId]);

    if (!gifResult.rows.length) {
      return res
        .status(STATUSCODE.NOT_FOUND)
        .json(errorResponse(STATUS.Error, "Gif not found"));
    }

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


    const gifTitle = gifResult.rows[0].title;

    // Insert the comment into the gif_comments table
    const insertCommentQuery = `
      INSERT INTO gif_comments (user_id, gif_id, user_name, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING created_on;
    `;
    const insertCommentValues = [userId, gifId, authorName, comment];
    const insertCommentResult = await db.query(
      insertCommentQuery,
      insertCommentValues
    );

    const createdOn = insertCommentResult.rows[0].created_on;
    const responseData = {
      message: "Comment successfully created",
      createdOn: createdOn,
      gifTitle: gifTitle,
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
          "An error occurred while creating the comment"
        )
      );
  }
};

// employee and admin can delete comments
const deleteGifCommentById = async (req, res) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const commentId = req.params.commentId;
  const gifId = req.params.gifId;

  try {
    // Check if the article exists
    const gifQuery = `
      SELECT *
      FROM gifs
      WHERE id = $1;
    `;
    const gifResult = await db.query(gifQuery, [gifId]);

    if (!gifResult.rows.length) {
      return res
        .status(STATUSCODE.NOT_FOUND)
        .json(errorResponse(STATUS.Error, "Gif not found"));
    }

    // Check if the user is an admin
    if (userRole === "admin") {
      const deleteQuery = `
        DELETE FROM gif_comments
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
      const authorQuery = "SELECT user_id FROM gif_comments WHERE id = $1";
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
        DELETE FROM gif_comments
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

module.exports = { createGifComment, deleteGifCommentById };
