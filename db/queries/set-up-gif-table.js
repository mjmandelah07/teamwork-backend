const db = require("../db");

const createGifTable = async () => {
  // DROP GIFS TABLE IF EXISTS
  const dropTableQuery = `DROP TABLE IF EXISTS gifs CASCADE;`;

  // Create the gif table if it doesn't exist
  const createTableQuery = `
          CREATE TABLE IF NOT EXISTS gifs (
            id SERIAL PRIMARY KEY,
            url TEXT,
            title TEXT,
            category TEXT,
            user_id INT,
            flagged BOOLEAN DEFAULT false,
            flag_reason TEXT,
            created_on TIMESTAMP DEFAULT NOW()
          );
        `;

  // Insert the URL from cloudinary, title, and user ID into the gifs table
  const insertQuery = `
    INSERT INTO gifs (url, title, category, user_id)
    VALUES ($1, $2, $3, $4) RETURNING *;
    `;

  const values = [
    "https://i0.wp.com/www.galvanizeaction.org/wp-content/uploads/2022/06/muppets-we-belong.gif?resize=245%2C205&ssl=1",
    "belonging",
    "lOVE",
    1,
  ];
  try {
    // Drop the gifs table if it exists
    await db.query(dropTableQuery);

    // Create the users table
    await db.query(createTableQuery);
    console.log("Gif table created");

    // Insert dummy user data
    await db.query(insertQuery, values);
    console.log("Dummy gif data inserted");
  } catch (err) {
    console.error("Error:", err);
  }
};

module.exports = { createGifTable };
