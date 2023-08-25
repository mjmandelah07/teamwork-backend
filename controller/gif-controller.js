const db = require("../db/db");
const cloudinary = require("../cloudinary-config");
const { createGifTable } = require("../db/queries/set-up-gif-table");
const {
  STATUSCODE,
  STATUS,
  successResponse,
  errorResponse,
} = require("../utilities/response-utility");

createGifTable();

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
    const selectQuery = "SELECT * FROM gifs ORDER BY created_on DESC";
    const result = await db.query(selectQuery);
    const gifsData = result.rows.map((row) => {
      return {
        id: row.id,
        imageUrl: row.url,
        title: row.title,
        url: row.url,
        category: row.category,
        userId: row.user_id,
        createdOn: row.created_on,
      };
    });

    res.status(STATUSCODE.OK).json(successResponse(STATUS.Success, gifsData));
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
    if (userRole !== "admin") {
      const authorQuery = "SELECT user_id FROM gifs WHERE id = $1";
      const authorResult = await db.query(authorQuery, [gifId]);

      if (
        authorResult.rows.length === 0 ||
        authorResult.rows[0].user_id !== userId
      ) {
        return res
          .status(STATUSCODE.FORBIDDEN)
          .json(
            errorResponse(
              STATUS.Error,
              "Access denied: You are not authorized to delete this gif"
            )
          );
      }
    }

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
