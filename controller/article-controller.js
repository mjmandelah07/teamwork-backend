const db = require("../db/db");
const { createArticles } = require("../db/queries/set-up-article-table");
const {
  STATUSCODE,
  STATUS,
  successResponse,
  errorResponse,
} = require("../utilities/response-utility");

// create article table for testing purposes
createArticles();

// Function to create and store articles
const createArticle = async (req, res) => {
  const userId = req.user?.id;
  const articleData = req.body;

  // Extract article data from the request body
  const { title, article, category } = articleData;

  // Insert the article data into the articles table
  const insertArticleQuery = `
  INSERT INTO articles (title, article, category, user_id) 
  VALUES ($1, $2, $3, $4) RETURNING *;
`;

  const articleValues = [title, article, category, userId];

  try {
    const result = await db.query(insertArticleQuery, articleValues);
    const createdArticle = result.rows[0];
    const responseData = {
      message: "Article successfully posted",
      id: createdArticle.id,
      createdOn: createdArticle.created_on,
      title: createdArticle.title,
      category: createdArticle.category,
      article: createdArticle.article,
      userId: createdArticle.user_id,
    };

    // Send the response if successful
    res
      .status(STATUSCODE.CREATED)
      .json(successResponse(STATUS.Success, responseData));
  } catch (error) {
    console.error(error);
    res
      .status(STATUSCODE.SERVER)
      .json(
        errorResponse(
          STATUS.Error,
          "An error occurred while posting the article"
        )
      );
  }
};

const updateArticlebyId = async (req, res) => {
  const { title, article, category } = req.body;
  const userId = req.user?.id;
  const articleId = req.params.articleId;

  try {
    const updateQuery = `
        UPDATE articles 
        SET title = $1, article = $2, category = $3, updated_on = $4
        WHERE id = $5 AND user_id = $6
        RETURNING *;
      `;

    const updatedOn = new Date();
    const updateValues = [
      title,
      article,
      category,
      updatedOn,
      articleId,
      userId,
    ];
    const updateResult = await db.query(updateQuery, updateValues);

    if (updateResult.rowCount === 0) {
      return res
        .status(STATUSCODE.NOT_FOUND)
        .json(
          errorResponse(
            STATUS.Error,
            "Article not found or not authorized to edit"
          )
        );
    }

    const updatedArticle = updateResult.rows[0];
    const responseData = {
      message: "Article successfully updated",
      id: articleId,
      createdOn: updatedArticle.created_on,
      title: updatedArticle.title,
      article: updatedArticle.article,
      category: updatedArticle.category,
      updated_on: updatedArticle.updated_on,
    };

    res.status(200).json(successResponse(STATUS.Success, responseData));
  } catch (error) {
    console.error("Error updating article:", error);
    res
      .status(STATUSCODE.SERVER)
      .json(
        errorResponse(STATUS.Error, "An error occurred while updating article")
      );
  }
};

// admin can delete articles and employees can delete article that belongs to them
const deleteArticleById = async (req, res) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const articleId = req.params.articleId;

  try {
    // If the user is not an admin, check if the user is the article owner
    if (userRole !== "admin") {
      const authorQuery = "SELECT user_id FROM articles WHERE id = $1";
      const authorResult = await db.query(authorQuery, [articleId]);

      if (
        authorResult.rows.length === 0 ||
        authorResult.rows[0].user_id !== userId
      ) {
        return res.status(STATUSCODE.FORBIDDEN).json({
          status: STATUS.Error,
          error: "Access denied: You are not authorized to delete this article",
        });
      }
    }

    // Delete the article itself
    const deleteQuery = `
      DELETE FROM articles
      WHERE id = $1;
    `;
    const deleteValues = [articleId];
    const deleteResult = await db.query(deleteQuery, deleteValues);

    if (deleteResult.rowCount === 0) {
      return res.status(STATUSCODE.NOT_FOUND).json({
        status: STATUS.Error,
        error: "Article not found or not authorized to delete",
      });
    }

    res.status(STATUSCODE.OK).json({
      status: STATUS.Success,
      message: "Article successfully deleted",
    });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(STATUSCODE.SERVER).json({
      status: STATUS.Error,
      error: "An error occurred while deleting article",
    });
  }
};

// get article by the article ID
const getArticleById = async (req, res) => {
  const articleId = req.params.articleId;

  try {
    // Fetch the articles from the database
    const selectQuery = `
        SELECT *
        FROM articles
        WHERE id = $1;
      `;
    const selectValues = [articleId];
    const result = await db.query(selectQuery, selectValues);

    if (result.rows.length === 0) {
      return res
        .status(STATUSCODE.NOT_FOUND)
        .json(errorResponse(STATUS.Error, "Article not found"));
    }

    const article = result.rows[0];

    // Fetch comments for the article
    const commentsQuery = `
      SELECT *
      FROM article_comments
      WHERE article_id = $1
      ORDER BY created_on DESC;
    `;
    const commentsResult = await db.query(commentsQuery, [articleId]);
    const commentRows = commentsResult.rows;
    const comments = commentRows.map((data) => {
      return {
        id: data.id,
        comment: data.comment,
        authorId: data.user_id,
        authorName: data.user_name,
        createdOn: data.created_on,
      };
    });

    const responseData = {
      id: article.id,
      title: article.title,
      article: article.article,
      category: article.category,
      createdOn: article.created_on,
      comments: comments,
    };

    res
      .status(STATUSCODE.OK)
      .json(successResponse(STATUS.Success, responseData));
  } catch (error) {
    console.error("Error retrieving article:", error);
    res
      .status(STATUSCODE.SERVER)
      .json(
        errorResponse(
          STATUS.Error,
          "An error occurred while retrieving article"
        )
      );
  }
};

// GET Article using the user id to fetch all articles posted by the user
const getAllArticlesByUserId = async (req, res) => {
  const userId = req.params.userId;

  // check if user exists first before getting articles
  const userQuery =
    "SELECT EXISTS (SELECT 1 FROM users WHERE id = $1) AS id_exists;";
  const userValue = [userId];
  const userExistResult = await db.query(userQuery, userValue);
  const userExist = userExistResult.rows[0].id_exists;

  if (!userExist) {
    return res
      .status(STATUSCODE.NOT_FOUND)
      .json(errorResponse(STATUS.Error, "User not found"));
  }

  try {
    const selectQuery = `
        SELECT *
        FROM articles
        WHERE user_id = $1 
        ORDER BY created_on DESC;
      `;
    const selectValues = [userId];
    const result = await db.query(selectQuery, selectValues);
    // all articles
    const articles = result.rows;

    const responseData = await Promise.all(
      articles.map(async (article) => {
        // Extract the article id
        let articleId = article.id;
        // Fetch comments for the articles
        const commentsQuery = `
    SELECT *
    FROM article_comments
    WHERE article_id = $1
    ORDER BY created_on DESC;
  `;
        const commentsResult = await db.query(commentsQuery, [articleId]);
        const commentRows = commentsResult.rows;

        // Extract the comments for each article
        const comments = commentRows.map((data) => {
          return {
            id: data.id,
            comment: data.comment,
            authorId: data.user_id,
            authorName: data.user_name,
            createdOn: data.created_on,
          };
        });

        const data = {
          id: article.id,
          title: article.title,
          article: article.article,
          category: article.category,
          createdOn: article.created_on,
          comments: comments,
        };

        return data;
      })
    );
    res
      .status(STATUSCODE.OK)
      .json(successResponse(STATUS.Success, responseData));
  } catch (error) {
    console.error("Error retrieving articles:", error);
    res
      .status(STATUSCODE.SERVER)
      .json(
        errorResponse(
          STATUS.Error,
          "An error occurred while retrieving article"
        )
      );
  }
};

// GET all articles
const getAllArticles = async (req, res) => {
  try {
    const selectQuery = `
        SELECT *
        FROM articles 
        ORDER BY created_on DESC;
      `;
    const result = await db.query(selectQuery);

    const articles = result.rows;
    const responseData = await Promise.all(
      articles.map(async (article) => {
        // Extract the article id
        let articleId = article.id;
        // Fetch comments for the articles
        const commentsQuery = `
    SELECT *
    FROM article_comments
    WHERE article_id = $1
    ORDER BY created_on DESC;
  `;
        const commentsResult = await db.query(commentsQuery, [articleId]);
        const commentRows = commentsResult.rows;

        // Extract the comments for each article
        const comments = commentRows.map((data) => {
          return {
            id: data.id,
            comment: data.comment,
            authorId: data.user_id,
            authorName: data.user_name,
            createdOn: data.created_on,
          };
        });

        const data = {
          id: article.id,
          title: article.title,
          article: article.article,
          category: article.category,
          userId: article.user_id,
          createdOn: article.created_on,
          comments: comments,
        };

        return data;
      })
    );

    res
      .status(STATUSCODE.OK)
      .json(successResponse(STATUS.Success, responseData));
  } catch (error) {
    console.error("Error retrieving articles:", error);
    res
      .status(STATUSCODE.SERVER)
      .json(
        errorResponse(
          STATUS.Error,
          "An error occurred while retrieving article"
        )
      );
  }
};
module.exports = {
  createArticle,
  updateArticlebyId,
  deleteArticleById,
  getArticleById,
  getAllArticlesByUserId,
  getAllArticles,
};
