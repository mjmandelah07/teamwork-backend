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

module.exports = { createGif, getAllGifs };
