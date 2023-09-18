const db = require("../db/db");
const cloudinary = require("../cloudinary-config");
const {
  STATUSCODE,
  STATUS,
  successResponse,
  errorResponse,
} = require("../utilities/response-utility");

const createGif = async (req, res) => {
  // get the token details from the authmiddleware
  const userId = req.user?.id;
  // get user id from the authenticated user details

  const { base64EncodedGif, title, category } = req.body;

  try {
    const uploadResult = await cloudinary.v2.uploader.upload(base64EncodedGif, {
      resource_type: "auto",
    });

    // Insert the URL from cloudinary, title, and user ID into the gifs table
    const insertQuery = `
    INSERT INTO gifs (url, title, category, user_id)
    VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const uploadedImageUrl = uploadResult.secure_url;
    const insertValues = [uploadedImageUrl, title, category, userId];
    const insertResult = await db.query(insertQuery, insertValues);
    const result = insertResult.rows[0];
    const gifId = result.id;
    const createdOn = result.created_on;
    const responseData = {
      id: gifId,
      message: "GIF image successfully posted",
      createdOn: createdOn,
      title: title,
      category: category,
      imageUrl: uploadedImageUrl,
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
        errorResponse(STATUS.Error, "An error occurred while creating gif")
      );
  }
};

// get all the gifs
const getAllGifs = async (req, res) => {
  try {
    // get category and page query parameters
    const { category, page } = req.query;

    // Number of gifs per page
    const itemsPerPage = 10;

    // Calculate offset based on the page query parameter
    const validatePage = page && /^\d+$/.test(page) ? parseInt(page) : 1;
    const offset = page ? (validatePage - 1) * itemsPerPage : 0;

    // query to get all columns in the gif table
    let selectQuery = `
        SELECT gifs.*, COUNT(gif_comments.id) AS comment_count
        FROM gifs 
        LEFT JOIN gif_comments ON gifs.id = gif_comments.gif.id
      `;
    // Initialize an array to hold query parameters
    const queryParams = [];

    // if category query is added to the endpoint, append it to the selectQuery otherwise skip it
    if (category) {
      selectQuery += `WHERE category = $1 `;
      queryParams.push(category);
    }

    // Add ORDER BY to sort by created_on
    selectQuery += `
    GROUP BY gifs.id
    ORDER BY gifs.created_on DESC
    `;

    // Append LIMIT to the query only when page is specified
    if (page) {
      selectQuery += `
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2};
    `;

      // Add itemsPerPage and offset to the queryParams array
      queryParams.push(itemsPerPage, offset);
    }

    const gifsResult = await db.query(selectQuery, queryParams);

    // query the gifs to get the total number of gifs returned
    let totalCountQuery = `
  SELECT COUNT(*) as total_count
  FROM gifs
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

    const gifsData = await Promise.all(
      gifsResult.rows.map(async (row) => {
        // Fetch comments for the articles
        const commentsQuery = `
        SELECT *
        FROM gif_comments
        WHERE gif_id = $1
        ORDER BY created_on DESC;
      `;

        const commentsResult = await db.query(commentsQuery, [row.id]);
        const comments = commentsResult.rows.map((commentRow) => ({
          id: commentRow.id,
          gif_comment: commentRow.comment,
          authorId: commentRow.user_id,
        }));
        const gifData = {
          id: row.id,
          imageUrl: row.url,
          title: row.title,
          url: row.url,
          category: row.category,
          userId: row.user_id,
          flagged: row.flagged,
          flaggedReason: row.flag_reason,
          createdOn: row.created_on,
          commentCounts: row.comment_count,
          comments: comments,
        };

        return gifData;
      })
    );

    // Calculate the total number of pages based on the total count and itemsPerPage
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const responseData = {
      gifs: gifsData,
      currentPage: page,
      totalPages: totalPages,
    };

    res
      .status(STATUSCODE.OK)
      .json(successResponse(STATUS.Success, responseData));
  } catch (error) {
    console.error(error);
    res
      .status(STATUSCODE.SERVER)
      .json(
        errorResponse(STATUS.Error, "An error occurred while fetching gif")
      );
  }
};

// delete the gif from the server by its id
const deleteGifById = async (req, res) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const gifId = req.params.gifId;

  try {
    // Check if the GIF exists and get its owner's ID
    const gifQuery = `
      SELECT user_id
      FROM gifs
      WHERE id = $1;
    `;
    const gifResult = await db.query(gifQuery, [gifId]);

    if (gifResult.rows.length === 0) {
      return res
        .status(STATUSCODE.NOT_FOUND)
        .json(errorResponse(STATUS.Error, "GIF not found"));
    }
    // Gif owner if it exist
    const gifOwnerId = gifResult.rows[0].user_id;

    // Check if the deleter is an admin or the owner of the GIF
    if (userRole !== "admin" && gifOwnerId !== userId) {
      return res
        .status(STATUSCODE.FORBIDDEN)
        .json(
          errorResponse(
            STATUS.Error,
            "Access denied: You are not authorized to delete this GIF"
          )
        );
    }

    // Query and delete the comments associated with the gif
    const deleteCommentsQuery = `
        DELETE FROM gif_comments
        WHERE gif_id = $1;
        `;

    await db.query(deleteCommentsQuery, [gifId]);

    // delete the gif from the server
    const deleteQuery = `
        DELETE FROM gifs
        WHERE id = $1;
      `;
    const deleteValues = [gifId];
    const deleteResult = await db.query(deleteQuery, deleteValues);

    if (deleteResult.rowCount === 0) {
      return res
        .status(STATUSCODE.NOT_FOUND)
        .json(
          errorResponse(
            STATUS.Error,
            "Gif not found or not authorized to delete"
          )
        );
    }

    res
      .status(STATUSCODE.OK)
      .json(successResponse(STATUS.Success, "gif post successfully deleted"));
  } catch (error) {
    console.error("Error deleting Gif:", error);
    res
      .status(STATUSCODE.SERVER)
      .json(
        errorResponse(STATUS.Error, "An error occurred while deleting Gif")
      );
  }
};

module.exports = { createGif, getAllGifs, deleteGifById };
