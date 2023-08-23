const db = require("../db/db");
const cloudinary = require("../cloudinary-config");
const { createGifTable } = require("../db/queries/set-up-gif-table");

createGifTable();

const createGif = async (req, res) => {
  // get the token details from the authmiddleware
  const userId = req.user?.id;
  // get user id from the authenticated user details

  const { base64EncodedGif, title } = req.body;

  try {
    const uploadResult = await cloudinary.v2.uploader.upload(base64EncodedGif, {
      resource_type: "auto",
    });

    // Insert the URL from cloudinary, title, and user ID into the gifs table
    const insertQuery = `
    INSERT INTO gifs (url, title, user_id)
    VALUES ($1, $2, $3) RETURNING *;
    `;
    const uploadedImageUrl = uploadResult.secure_url;
    const insertValues = [uploadedImageUrl, title, userId];
    const insertResult = await db.query(insertQuery, insertValues);
    const result = insertResult.rows[0];
    const gifId = result.id;
    const createdOn = result.created_on;

    // Send the response if successful
    res.status(201).json({
      status: "success",
      data: {
        gifId: gifId,
        message: "GIF image successfully posted",
        createdOn: createdOn,
        title: title,
        imageUrl: uploadedImageUrl,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      error: "An error occurred while creating gif",
    });
  }
};

const getAllGifs = async (req, res) => {
  try {
    const selectQuery = "SELECT * FROM gifs";
    const result = await db.query(selectQuery);
    const gifsData = result.rows.map((row) => {
      return {
        gifId: row.id,
        imageUrl: row.url,
        title: row.title,
        userId: row.user_id,
        createdOn: row.created_on,
      };
    });

    res.json({
      status: "success",
      data: gifsData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      error: "An error occurred while fetching gif",
    });
  }
};

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
        return res.status(403).json({
          status: "error",
          error: "Access denied: You are not authorized to delete this gif",
        });
      }
    }
    const deleteQuery = `
        DELETE FROM gifs
        WHERE id = $1;
      `;
    const deleteValues = [gifId];
    const deleteResult = await db.query(deleteQuery, deleteValues);

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({
        status: "error",
        error: "Gif not found or not authorized to delete",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        message: "gif post successfully deleted",
      },
    });
  } catch (error) {
    console.error("Error deleting Gif:", error);
    res.status(500).json({
      status: "error",
      error: "An error occurred while deleting Gif",
    });
  }
};


module.exports = { createGif, getAllGifs, deleteGifById };
