const db = require("../db/db");
const {
  STATUSCODE,
  STATUS,
  successResponse,
  errorResponse,
} = require("../utilities/response-utility");

// get all the article and gifs from the database in descending order
const getAllArticlesGifs = async (req, res) => {
  try {
    // Query the database to fetch articles and gifs in descending order of creation date
    const feedQuery = `
      SELECT id, created_on, title,
             CASE
               WHEN article IS NOT NULL THEN article
               WHEN url IS NOT NULL THEN url
             END AS "article/url",
             user_id, category
      FROM (
        SELECT id, created_on, title, article, null AS url, user_id, category
        FROM articles
        UNION ALL
        SELECT id, created_on, title, null AS article, url, user_id, category
        FROM gifs
      ) AS feed_items
      ORDER BY created_on DESC;
    `;

    const result = await db.query(feedQuery);

    // map the feed items
    const feedData = result.rows.map((row) => ({
      id: row.id,
      createdOn: row.created_on,
      title: row.title,
      "article/url": row["article/url"],
      authorId: row.user_id,
      category: row.category
    }));
    res.status(STATUSCODE.OK).json(successResponse(STATUS.Success, feedData));
  } catch (error) {
    console.error("Error fetching feed:", error);
    res
      .status(STATUSCODE.SERVER)
      .json(
        errorResponse(STATUS.Error, "An error occurred while fetching the feed")
      );
  }
};

module.exports = getAllArticlesGifs;
