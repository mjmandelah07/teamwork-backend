const db = require("../db/db");
const {
  STATUSCODE,
  STATUS,
  successResponse,
  errorResponse,
} = require("../utilities/response-utility");

// Function to get all items (articles or gifs) from the database
const getAllItems = async (tableName) => {
  const query = `
    SELECT *
    FROM ${tableName}
    ORDER BY created_on DESC;
  `;
  const result = await db.query(query);
  return result.rows;
};

// Function to combine and sort items by date
const combineAndSortItems = (items) => {
  // Sort the items by created_on date in descending order
  items.sort((a, b) => b.created_on - a.created_on);
  return items;
};

// get all the articles and gifs from the database
const getAllArticlesGifs = async (req, res) => {
  try {
    // Get all articles and gifs separately
    const allArticles = await getAllItems("articles");
    const allGifs = await getAllItems("gifs");

    // Combine and sort the articles and gifs
    const combinedItems = combineAndSortItems([...allArticles, ...allGifs]);

    // Map the combined items
    const feedData = combinedItems;

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
