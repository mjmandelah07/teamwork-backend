const express = require("express");
const cloudinary = require("cloudinary");
const router = express.Router();
const db = require("../db/db");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_KEY_SECRET,
});

// Route to upload GIF and store URL in database
router.post("/gifs", authMiddleware, async (req, res) => {
  try {
    const { base64EncodedGif, title } = req.body;
    const { userId } = req.user.id; // Get user ID from authenticated user data [authMiddleware]
    const uploadResult = await cloudinary.v2.uploader.upload(base64EncodedGif, {
      resource_type: "auto",
    });

    // Create the gif table if it doesn't exist
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS gifs (
          id SERIAL PRIMARY KEY,
          url TEXT,
          title TEXT,
          user_id INT,
          created_on TIMESTAMP DEFAULT NOW()
        );
      `;
    await db.query(createTableQuery);

    // Insert the URL from cloudinary, title, and user ID into the gifs table
    const insertQuery =
      "INSERT INTO gifs (url, title, user_id) VALUES ($1, $2, $3) RETURNING id, created_on";
    const insertValues = [uploadResult.secure_url, title, userId];
    const insertResult = await db.query(insertQuery, insertValues);
    const gifId = insertResult.rows[0].id;
    const createdOn = insertResult.rows[0].created_on;

    // Send the response if successful
    res.status(201).json({
      status: "success",
      data: {
        gifId: gifId,
        message: "GIF image successfully posted",
        createdOn: createdOn,
        title: title,
        imageUrl: uploadResult.secure_url,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Route to get list of GIFs data
router.get("/", async (req, res) => {
  try {
    const selectQuery = "SELECT id, url, title, user_id, created_on FROM gifs"; 
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

    res.json({ gifsData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});


module.exports = router;
