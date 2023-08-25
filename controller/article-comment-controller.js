const db = require("../db/db");
const {
  articleCommentTable,
} = require("../db/queries/set-up-article-comment-table");
const {
  STATUSCODE,
  STATUS,
  successResponse,
  errorResponse,
} = require("../utilities/response-utility");

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
     // Fetch the commentor name 
     const userQuery = `
     SELECT firstName, lastName FROM users 
     WHERE id = $1;
     `;  
     // Article variables
    const articleResult = await db.query(articleQuery, [articleId]);
    const articleTitle = articleResult.rows[0].title;
    const articleContent = articleResult.rows[0].article;
    // User variables
    const userResult = await db.query(userQuery, [userId]);
    const AuthorName = userResult.rows[0].firstName + ' ' + userResult.rows[0].lastName;

    if (!articleResult.rows.length) {
      return res
        .status(STATUSCODE.NOT_FOUND)
        .json(errorResponse(STATUS.Error, "Article not found"));
    }
    if (!userResult.rows.length) {
      return res
        .status(STATUSCODE.NOT_FOUND)
        .json(errorResponse(STATUS.Error, "User not found"));
    }


    // Insert the comment into the comments table
    const insertCommentQuery = `
          INSERT INTO article_comments (user_id, article_id, user_name, comment)
          VALUES ($1, $2, $3, $4)
          RETURNING created_on;
        `;
    const insertCommentValues = [userId, articleId, AuthorName, comment];
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

module.exports = { createArticleComment };
