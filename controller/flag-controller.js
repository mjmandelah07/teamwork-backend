const db = require("../db/db");
const {
  STATUSCODE,
  STATUS,
  successResponse,
  errorResponse,
} = require("../utilities/response-utility");

// Function to flag an article by ID
const flagArticle = async (req, res) => {
  const { articleId } = req.params;
  const { flagStatus, flagReason } = req.body;

  // Validate the flag status (e.g., checking if it's a valid boolean value)
  if (typeof flagStatus !== "boolean") {
    return res
      .status(STATUSCODE.BAD_REQUEST)
      .json(errorResponse(STATUS.Error, "Invalid flag status."));
  }

  // Validate the flagReason (e.g., checking for length, sanitize, or any other validation)
  if (
    (flagStatus === true &&
      (!flagReason ||
        flagReason.length === 0 ||
        typeof flagReason !== "string")) ||
    (flagStatus === false && flagReason !== null)
  ) {
    return res
      .status(STATUSCODE.BAD_REQUEST)
      .json(
        errorResponse(
          STATUS.Error,
          "Flag reason is required and must be a string."
        )
      );
  }

  try {
    // Check if the article exists
    const checkArticleQuery = "SELECT * FROM articles WHERE id = $1";
    const checkArticleResult = await db.query(checkArticleQuery, [articleId]);

    if (checkArticleResult.rows.length === 0) {
      return res
        .status(STATUSCODE.NOT_FOUND)
        .json(errorResponse(STATUS.Error, "Article not found"));
    }

    // Flag the article if exists
    const flagArticleQuery =
      "UPDATE articles SET flagged = $2, flag_reason = $3 WHERE id = $1";
    await db.query(flagArticleQuery, [articleId, flagStatus, flagReason]);

    res
      .status(STATUSCODE.OK)
      .json(successResponse(STATUS.Success, "Article flag status updated"));
  } catch (error) {
    console.error("Error updating article flag status:", error);
    res
      .status(STATUSCODE.SERVER)
      .json(
        errorResponse(
          STATUS.Error,
          "An error occurred while updating the article flag status"
        )
      );
  }
};

// Function to flag an gif by ID
const flagGif = async (req, res) => {
  const { gifId } = req.params;
  const { flagStatus, flagReason } = req.body;

  // Trim the flagReason property to remove empty spaces or set it to null if flagStatus is false
  const cleanedFlagReason =
    flagStatus === false ? null : flagReason ? flagReason.trim() : null;

  // Validate the flag status (e.g., checking if it's a valid boolean value)
  if (typeof flagStatus !== "boolean") {
    return res
      .status(STATUSCODE.BAD_REQUEST)
      .json(errorResponse(STATUS.Error, "Invalid flag status."));
  }

  // Validate the flagReason (e.g., checking for length, sanitize, or any other validation)
  if (
    (flagStatus === true &&
      (!cleanedFlagReason ||
        cleanedFlagReason.length === 0 ||
        typeof cleanedFlagReason !== "string")) ||
    (flagStatus === false && cleanedFlagReason !== null)
  ) {
    return res
      .status(STATUSCODE.BAD_REQUEST)
      .json(
        errorResponse(
          STATUS.Error,
          "Flag reason is required and must be a string."
        )
      );
  }

  try {
    // Check if the gif exists
    const checkGifQuery = "SELECT * FROM gifs WHERE id = $1";
    const checkGifResult = await db.query(checkGifQuery, [gifId]);

    if (checkGifResult.rows.length === 0) {
      return res
        .status(STATUSCODE.NOT_FOUND)
        .json(errorResponse(STATUS.Error, "Gif not found"));
    }

    // Flag the gif if exists
    const flagGifQuery =
      "UPDATE gifs SET flagged = $2, flag_reason = $3 WHERE id = $1";
    await db.query(flagGifQuery, [gifId, flagStatus, cleanedFlagReason]);

    res
      .status(STATUSCODE.OK)
      .json(successResponse(STATUS.Success, "Gif flag status updated"));
  } catch (error) {
    console.error("Error updating gif flag status:", error);
    res
      .status(STATUSCODE.SERVER)
      .json(
        errorResponse(
          STATUS.Error,
          "An error occurred while updating the gif flag status"
        )
      );
  }
};

// Function to flag the gif comment by ID
const flagGifComment = async (req, res) => {
  const { commentId } = req.params;
  const { flagStatus, flagReason } = req.body;

  // Trim the flagReason property to remove empty spaces or set it to null if flagStatus is false
  const cleanedFlagReason =
    flagStatus === false ? null : flagReason ? flagReason.trim() : null;

  // Validate the flag status (e.g., checking if it's a valid boolean value)
  if (typeof flagStatus !== "boolean") {
    return res
      .status(STATUSCODE.BAD_REQUEST)
      .json(errorResponse(STATUS.Error, "Invalid flag status."));
  }
  // Validate the flagReason (e.g., checking for length, sanitize, or any other validation)
  if (
    (flagStatus === true &&
      (!cleanedFlagReason ||
        cleanedFlagReason.length === 0 ||
        typeof cleanedFlagReason !== "string")) ||
    (flagStatus === false && cleanedFlagReason !== null)
  ) {
    return res
      .status(STATUSCODE.BAD_REQUEST)
      .json(
        errorResponse(
          STATUS.Error,
          "Flag reason is required and must be a string."
        )
      );
  }

  try {
    // Check if the comment exists
    const checkCommentQuery = "SELECT * FROM gif_comments WHERE id = $1";
    const checkCommentResult = await db.query(checkCommentQuery, [commentId]);

    if (checkCommentResult.rows.length === 0) {
      return res
        .status(STATUSCODE.NOT_FOUND)
        .json(errorResponse(STATUS.Error, "Comment not found"));
    }

    // Flag the comment
    const flagCommentQuery =
      "UPDATE gif_comments SET flagged = $2, flag_reason = $3 WHERE id = $1";
    await db.query(flagCommentQuery, [
      commentId,
      flagStatus,
      cleanedFlagReason,
    ]);

    res
      .status(STATUSCODE.OK)
      .json(successResponse(STATUS.Success, "Comment flag status updated"));
  } catch (error) {
    console.error("Error updating comment flag status:", error);
    res
      .status(STATUSCODE.SERVER)
      .json(
        errorResponse(
          STATUS.Error,
          "An error occurred while updating the comment flag status"
        )
      );
  }
};

// Function to flag the gif comment by ID
const flagArticleComment = async (req, res) => {
  const { commentId } = req.params;
  const { flagStatus, flagReason } = req.body;

  // Trim the flagReason property to remove empty spaces or set it to null if flagStatus is false
  const cleanedFlagReason =
    flagStatus === false ? null : flagReason ? flagReason.trim() : null;

  // Validate the flag status (e.g., checking if it's a valid boolean value)
  if (typeof flagStatus !== "boolean") {
    return res
      .status(STATUSCODE.BAD_REQUEST)
      .json(errorResponse(STATUS.Error, "Invalid flag status."));
  }

  // Validate the flagReason (e.g., checking for length, sanitize, or any other validation)
  if (
    (flagStatus === true &&
      (!cleanedFlagReason ||
        cleanedFlagReason.length === 0 ||
        typeof cleanedFlagReason !== "string")) ||
    (flagStatus === false && cleanedFlagReason !== null)
  ) {
    return res
      .status(STATUSCODE.BAD_REQUEST)
      .json(
        errorResponse(
          STATUS.Error,
          "Flag reason is required and must be a string."
        )
      );
  }

  try {
    // Check if the comment exists
    const checkCommentQuery = "SELECT * FROM article_comments WHERE id = $1";
    const checkCommentResult = await db.query(checkCommentQuery, [commentId]);

    if (checkCommentResult.rows.length === 0) {
      return res
        .status(STATUSCODE.NOT_FOUND)
        .json(errorResponse(STATUS.Error, "Comment not found"));
    }

    // Flag the comment
    const flagCommentQuery =
      "UPDATE article_comments SET flagged = $2, flag_reason = $3 WHERE id = $1";
    await db.query(flagCommentQuery, [
      commentId,
      flagStatus,
      cleanedFlagReason,
    ]);

    res
      .status(STATUSCODE.OK)
      .json(successResponse(STATUS.Success, "Comment flag status updated"));
  } catch (error) {
    console.error("Error updating comment flag status:", error);
    res
      .status(STATUSCODE.SERVER)
      .json(
        errorResponse(
          STATUS.Error,
          "An error occurred while updating the comment flag status"
        )
      );
  }
};

// get all flagged
const getAllFlagged = async (req, res) => {
  // funtion to get all flagged from their tables
  const getAllItems = async (tableName) => {
    const query = `
    SELECT *
    FROM ${tableName}
    WHERE flagged = true
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

  try {
    // Get the flagged articles, gifs, comments separately
    const flaggedArticles = await getAllItems("articles");
    const flaggedGifs = await getAllItems("gifs");
    const flaggedArticleComments = await getAllItems("article_comments");
    const flaggedGifComments = await getAllItems("gif_comments");

    // Combine all flagged content into one array
    const flaggedContent = combineAndSortItems([
      ...flaggedArticles,
      ...flaggedArticleComments,
      ...flaggedGifs,
      ...flaggedGifComments,
    ]);

    res
      .status(STATUSCODE.OK)
      .json(successResponse(STATUS.Success, flaggedContent));
  } catch (err) {
    console.error("Error fetching flagged content:", err);
    res
      .status(STATUSCODE.SERVER)
      .json(
        errorResponse(
          STATUS.Error,
          "An error occurred while fetching flagged content"
        )
      );
  }
};

// admin can delete flagged content
const deleteFlagged = async (req, res) => {
  // get the user role
  const userRole = req.user?.role;
  // Get the content type and content ID from query parameters
  const contentType = req.query.content_type;
  const contentId = req.query.content_id;

  // If the user is not an admin, check if the user is the article owner
  if (userRole !== "admin") {
    return res.status(STATUSCODE.FORBIDDEN).json({
      status: STATUS.Error,
      error: "Access denied: You are not authorized to delete this content",
    });
  }

  // Function to validate content type
  function isValidContentType(contentType) {
    const validTypes = ["article", "gif", "article_comment", "gif_comment"];
    return validTypes.includes(contentType);
  }
  // Function to validate content ID
  function isValidContentId(contentId) {
    // Check if contentId is a valid integer and is greater than zero
    return Number.isInteger(Number(contentId)) && Number(contentId) > 0;
  }

  try {
    // Validate the content type (e.g., check if it's valid)
    if (!isValidContentType(contentType)) {
      return res
        .status(STATUSCODE.BAD_REQUEST)
        .json(errorResponse(STATUS.Error, "Invalid content type."));
    }
    // Validate the content ID (e.g., check if it's a valid integer)
    if (!isValidContentId(contentId)) {
      return res
        .status(STATUSCODE.BAD_REQUEST)
        .json(errorResponse(STATUS.Error, "Invalid content ID."));
    }

    // query to check if the content exists
    let checkQuery;

    switch (contentType) {
      case "article":
        checkQuery = "SELECT 1 FROM articles WHERE id = $1";
        break;
      case "gif":
        checkQuery = "SELECT 1 FROM gifs WHERE id = $1";
        break;
      case "article_comment":
        checkQuery = "SELECT 1 FROM article_comments WHERE id = $1";
        break;
      case "gif_comment":
        checkQuery = "SELECT 1 FROM gif_comments WHERE id = $1";
        break;
      default:
        return res
          .status(STATUSCODE.BAD_REQUES)
          .json({ message: "Invalid content type." });
    }

    // Execute the  query to check if the content exists
    const result = await db.query(checkQuery, [contentId]);

    // If no rows are returned, the content or ID does not exist
    if (result.rows.length === 0) {
      return res
        .status(STATUSCODE.BAD_REQUEST)
        .json(errorResponse(STATUS.Error, "Content not found."));
    }

    //  query based on the content type and content ID
    let deleteQuery;

    switch (contentType) {
      case "article":
        deleteQuery = "DELETE FROM articles WHERE id = $1 AND flagged = true";
        break;
      case "gif":
        deleteQuery = "DELETE FROM gifs WHERE id = $1 AND flagged = true";
        break;
      case "article_comment":
        deleteQuery =
          "DELETE FROM article_comments WHERE id = $1 AND flagged = true";
        break;
      case "gif_comment":
        deleteQuery =
          "DELETE FROM gif_comments WHERE id = $1 AND flagged = true";
        break;
      default:
        return res
          .status(STATUSCODE.BAD_REQUEST)
          .json(errorResponse(STATUS.Error, "Invalid content type."));
    }

    // Execute the query to delete the flagged content by content ID
    await db.query(deleteQuery, [contentId]);

    res
      .status(STATUSCODE.OK)
      .json(
        successResponse(STATUS.Success, "Flagged content deleted successfully.")
      );
  } catch (error) {
    console.error("Error deleting flagged content:", error);
    res
      .status(STATUSCODE.SERVER)
      .json(
        errorResponse(
          STATUS.Error,
          "An error occurred while deleting flagged content."
        )
      );
  }
};

module.exports = {
  flagArticle,
  flagGif,
  flagGifComment,
  flagArticleComment,
  getAllFlagged,
  deleteFlagged,
};
