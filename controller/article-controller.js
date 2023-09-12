const db = require("../db/db");
const {
  STATUSCODE,
  STATUS,
  successResponse,
  errorResponse,
} = require("../utilities/response-utility");

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
  const { page } = req.query;
  const itemsPerPage = 10; // Number of comments per page

  // Calculate offset based on the page query parameter
  const validatePage = page && /^\d+$/.test(page) ? parseInt(page) : 1;
  const offset = page ? (validatePage - 1) * itemsPerPage : 0;

  try {
    // Fetch article details
    const selectQuery = `
      SELECT *, (
        SELECT COUNT(*) FROM article_comments WHERE article_id = $1
      ) as comment_count
      FROM articles WHERE id = $1;
    `;
    const selectValues = [articleId];
    const result = await db.query(selectQuery, selectValues);

    if (result.rows.length === 0) {
      return res
        .status(STATUSCODE.NOT_FOUND)
        .json(errorResponse(STATUS.Error, "Article not found"));
    }

    // returned article from the database
    const article = result.rows[0];

    // Fetch comments for the article with pagination
    let commentsQuery = `
      SELECT * FROM article_comments WHERE article_id = $1
      ORDER BY created_on DESC
    `;

    // valuues for query
    const commentValues = [articleId];

    // Append LIMIT to the query only when page is specified
    if (page) {
      commentsQuery += `
      LIMIT $${commentValues.length + 1} OFFSET $${commentValues.length + 2};
    `;

      // Add itemsPerPage and offset to the queryParams array
      commentValues.push(itemsPerPage, offset);
    }

    const commentsResult = await db.query(commentsQuery, commentValues);
    const commentRows = commentsResult.rows;
    const comments = commentRows.map((data) => {
      return {
        id: data.id,
        comment: data.comment,
        authorId: data.user_id,
        authorName: data.user_name,
        flagged: data.flagged,
        flaggedReason: data.flag_reason,
        createdOn: data.created_on,
      };
    });

    // Determine if there are more comments to load
    const hasMore = comments.length === itemsPerPage;

    const responseData = {
      id: article.id,
      title: article.title,
      article: article.article,
      category: article.category,
      flagged: article.flagged,
      flaggedReason: article.flag_reason,
      createdOn: article.created_on,
      commentCount: article.comment_count, // Count of comments
      hasMore: hasMore,
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

  // get  page query parameters
  const { page } = req.query;

  // Number of articles per page
  const itemsPerPage = 10;

  // Calculate offset based on the page query parameter
  const validatePage = page && /^\d+$/.test(page) ? parseInt(page) : 1;
  const offset = page ? (validatePage - 1) * itemsPerPage : 0;

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
    // query the database to get the articles, comments for specified user and count the comments associated with the articles
    let selectQuery = `
  SELECT articles.*, COALESCE(comment_counts.comment_count, 0) AS comment_count
  FROM articles
  LEFT JOIN (
    SELECT article_id, COUNT(*) AS comment_count
    FROM article_comments
    GROUP BY article_id
  ) AS comment_counts
  ON articles.id = comment_counts.article_id
  WHERE user_id = $1
  ORDER BY created_on DESC
`;

    // valuues for query
    const selectValues = [userId];

    // Append LIMIT to the query only when page is specified
    if (page) {
      selectQuery += `
      LIMIT $${selectValues.length + 1} OFFSET $${selectValues.length + 2};
    `;

      // Add itemsPerPage and offset to the queryParams array
      selectValues.push(itemsPerPage, offset);
    }

    const result = await db.query(selectQuery, selectValues);
    // all articles posted by the user
    const articles = result.rows;

    // Fetch the total count of articles posted by the user for calculating totalPages
    const totalCountQuery = `
      SELECT COUNT(*) as total_count
      FROM articles
      WHERE user_id = $1;
    `;
    const totalCountValues = [userId];
    const totalCountResult = await db.query(totalCountQuery, totalCountValues);
    const totalArticleCount = totalCountResult.rows[0].total_count;

    // return all the articles and their comments
    const articlesData = await Promise.all(
      articles.map(async (article) => {
        // Extract the article id
        let articleId = article.id;
        // Fetch comments for the articles
        const commentsQuery = `
    SELECT *
    FROM article_comments
    WHERE article_id = $1
    ORDER BY created_on DESC
   ;
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
            flagged: data.flagged,
            flaggedReason: data.flag_reason,
            createdOn: data.created_on,
          };
        });

        const data = {
          id: article.id,
          title: article.title,
          article: article.article,
          category: article.category,
          flagged: article.flagged,
          flaggedReason: article.flag_reason,
          createdOn: article.created_on,
          commentCounts: article.comment_count,
          comments: comments,
        };

        return data;
      })
    );

    // Calculate totalPages based on totalArticleCount and itemsPerPage for paginations
    const totalPages = Math.ceil(totalArticleCount / itemsPerPage);

    // All responses for the client
    const responseData = {
      articles: articlesData,
      currentPage: page,
      totalPages: totalPages,
    };

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

// GET articles by category or all articles with pagination
const getAllArticles = async (req, res) => {
  try {
    // get category and page query parameters
    const { category, page } = req.query;

    // Number of articles per page
    const itemsPerPage = 10;

    // Calculate offset based on the page query parameter
    const validatePage = page && /^\d+$/.test(page) ? parseInt(page) : 1;
    const offset = page ? (validatePage - 1) * itemsPerPage : 0;

    // Query to get articles and count the comments associated with the article
    let selectQuery = `
        SELECT articles.*, COUNT(article_comments.id) AS comment_count
        FROM articles 
        LEFT JOIN article_comments ON articles.id = article_comments.article_id
      `;

    // Initialize an array to hold query parameters
    const queryParams = [];

    // If category query is added to the endpoint, append it to the selectQuery and add it to the queryParams array
    if (category) {
      selectQuery += `WHERE category = $1 `;
      queryParams.push(category);
    }
    // Add ORDER BY to sort by created_on
    selectQuery += `
    GROUP BY articles.id
    ORDER BY articles.created_on DESC
    `;

    // Append LIMIT to the query only when page is specified
    if (page) {
      selectQuery += `
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2};
    `;

      // Add itemsPerPage and offset to the queryParams array
      queryParams.push(itemsPerPage, offset);
    }

    const result = await db.query(selectQuery, queryParams);

    const articles = result.rows; // the articles returned from the query

    // query the articles to get the total number of articles returned
    let totalCountQuery = `
  SELECT COUNT(*) as total_count
  FROM articles
`;
    let countParams = [];

    if (category) {
      totalCountQuery += `
    WHERE category = $1
  `;
      queryParams.push(category);
    }
    const totalCountResult = await db.query(totalCountQuery, countParams);
    const totalCount = totalCountResult.rows[0].total_count;

    // return the articles and their comments
    const articlesData = await Promise.all(
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
            flagged: data.flagged,
            flaggedReason: data.flag_reason,
            createdOn: data.created_on,
          };
        });

        const data = {
          id: article.id,
          title: article.title,
          article: article.article,
          category: article.category,
          userId: article.user_id,
          flagged: article.flagged,
          flaggedReason: article.flag_reason,
          createdOn: article.created_on,
          commentCounts: article.comment_count,
          comments: comments,
        };

        return data;
      })
    );

    // Calculate the total number of pages based on the total count and itemsPerPage
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // All responses for the client
    const responseData = {
      articles: articlesData,
      currentPage: page,
      totalPages: totalPages,
    };

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
