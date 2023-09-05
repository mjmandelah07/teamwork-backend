const db = require("../db");

const gifCommentTable = async () => {
  // Drop the gifs comment table if it exists
  const dropGifCommentTable = "DROP TABLE IF EXISTS gif_comments";

  const createGifCommentTable = `
  CREATE TABLE IF NOT EXISTS gif_comments (
    id SERIAL PRIMARY KEY,
    user_id INT,
    gif_id INT REFERENCES gifs(id) ON DELETE CASCADE,
    comment TEXT,
    user_name TEXT,
    created_on TIMESTAMP DEFAULT NOW()
  );
`;
  // Insert dummy data
  const insertDummyData = `
  INSERT INTO gif_comments (user_id, gif_id, user_name, comment)
  VALUES
    ($1, $2, $3, $4); 
`;
  const insertGifCommentValues = [1, 1, "mojisola ayomi", "very fantastic"];
  try {
    // Drop the table if it exists
    await db.query(dropGifCommentTable);

    // Create the gif comment table
    await db.query(createGifCommentTable);
    console.log("gifs comment table created");

    // Insert dummy user data
    await db.query(insertDummyData, insertGifCommentValues);
    console.log("Dummy gif comment data inserted");
  } catch (error) {
    console.error("Error:", error);
  }
};

module.exports = { gifCommentTable };
