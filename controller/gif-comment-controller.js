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

module.exports = { createGifComment };
