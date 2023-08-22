const db = require("../db/db");
const { createArticles } = require("../db/queries/set-up-article-table");

// create article table for testing purposes
createArticles();

// Function to create and store articles
const createArticle = async (req, res) => {
  const userId = req.user?.id;
  const articleData = req.body;

  // Extract article data from the request body
  const { title, article } = articleData;

  // Insert the article data into the articles table
  const insertArticleQuery = `
  INSERT INTO articles (title, article, user_id) 
  VALUES ($1, $2, $3) RETURNING *;
`;


  const articleValues = [title, article, userId] ;

  try {
    const result = await db.query(insertArticleQuery, articleValues);
    const createdArticle = result.rows[0];

    // Send the response if successful
    res.status(201).json({
      status: "success",
      data: {
        message: "Article successfully posted",
        articleId: createdArticle.id,
        createdOn: createdArticle.created_on,
        title: createdArticle.title,
        article: createdArticle.article,
        userId: createdArticle.user_id,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      error: "An error occurred while posting the article",
    });
  }
};

const updateArticlebyId = async (req, res) => {
  const { title, article } = req.body;
  const userId = req.user?.id;
  const articleId = req.params.articleId;

  try {
    const updateQuery = `
        UPDATE articles 
        SET title = $1, article = $2, updated_on = $3
        WHERE id = $4 AND user_id = $5
        RETURNING *;
      `;

    const updatedOn = new Date();
    const updateValues = [title, article, updatedOn, articleId, userId];
    const updateResult = await db.query(updateQuery, updateValues);

    if (updateResult.rowCount === 0) {
      return res.status(404).json({
        status: "error",
        error: "Article not found or not authorized to edit",
      });
    }

    const updatedArticle = updateResult.rows[0];

    res.status(200).json({
      status: "success",
      data: {
        message: "Article successfully updated",
        articleId: articleId,
        updatedOn: updatedArticle.created_on,
        title: updatedArticle.title,
        article: updatedArticle.article,
        updated_on: updatedArticle.updated_on,
      },
    });
  } catch (error) {
    console.error("Error updating article:", error);
    res.status(500).json({
      status: "error",
      error: "An error occurred while updating article",
    });
  }
};

const deleteArticleById = async (req, res) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const articleId = req.params.articleId;

  try {
    if (userRole !== "admin") {
      const authorQuery = "SELECT user_id FROM articles WHERE id = $1";
      const authorResult = await db.query(authorQuery, [articleId]);

      if (
        authorResult.rows.length === 0 ||
        authorResult.rows[0].user_id !== userId
      ) {
        return res.status(403).json({
          status: "error",
          error: "Access denied: You are not authorized to delete this article",
        });
      }
    }
    const deleteQuery = `
        DELETE FROM articles
        WHERE id = $1;
      `;
    const deleteValues = [articleId];
    const deleteResult = await db.query(deleteQuery, deleteValues);

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({
        status: "error",
        error: "Article not found or not authorized to delete",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        message: "Article successfully deleted",
      },
    });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({
      status: "error",
      error: "An error occurred while deleting article",
    });
  }
};

const getArticleById = async (req, res) => {
  const userId = req.user?.id;
  const articleId = req.params.articleId;

  try {
    const selectQuery = `
        SELECT *
        FROM articles
        WHERE id = $1 AND user_id = $2;
      `;
    const selectValues = [articleId, userId];
    const result = await db.query(selectQuery, selectValues);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        error: "Article not found or not authorized to access",
      });
    }

    const article = result.rows[0];

    res.status(200).json({
      status: "success",
      data: {
        articleId: article.id,
        title: article.title,
        article: article.article,
        createdOn: article.created_on,
      },
    });
  } catch (error) {
    console.error("Error retrieving article:", error);
    res.status(500).json({
      status: "error",
      error: "An error occurred while retrieving article",
    });
  }
};

const getAllArticlesByUserId = async (req, res) => {
  const userId = req.user?.id;

  try {
    const selectQuery = `
        SELECT *
        FROM articles
        WHERE user_id = $1;
      `;
    const selectValues = [userId];
    const result = await db.query(selectQuery, selectValues);

    const articles = result.rows;

    res.status(200).json({
      status: "success",
      data: articles.map((article) => ({
        articleId: article.id,
        title: article.title,
        article: article.article,
        createdOn: article.created_on,
      })),
    });
  } catch (error) {
    console.error("Error retrieving articles:", error);
    res.status(500).json({
      status: "error",
      error: "An error occurred while retrieving articles",
    });
  }
};

const getAllArticles = async (req, res) => {
  try {
    const selectQuery = `
        SELECT *
        FROM articles;
      `;
    const result = await db.query(selectQuery);

    const articles = result.rows;

    res.status(200).json({
      status: "success",
      data: articles.map((article) => ({
        articleId: article.id,
        title: article.title,
        article: article.article,
        userId: article.user_id,
        createdOn: article.created_on,
      })),
    });
  } catch (error) {
    console.error("Error retrieving articles:", error);
    res.status(500).json({
      status: "error",
      error: "An error occurred while retrieving articles",
    });
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

