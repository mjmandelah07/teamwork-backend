const db = require("../db");

const createGifTable = async () => {
  const dropTableQuery = `DROP TABLE IF EXISTS gifs;`;

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

  // Insert the URL from cloudinary, title, and user ID into the gifs table
  const insertQuery = `
    INSERT INTO gifs (url, title, user_id)
    VALUES ($1, $2, $3) RETURNING *;
    `;

  const values = [
    "https://i0.wp.com/www.galvanizeaction.org/wp-content/uploads/2022/06/muppets-we-belong.gif?resize=245%2C205&ssl=1",
    "belonging",
    1,
  ];
  try {
    // Drop the table if it exists
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
