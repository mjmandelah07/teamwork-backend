const db = require("../db");

const gifCommentTable = async () => {
  // Drop the gifs comment table if it exists
  const dropGifCommentTable = "DROP TABLE IF EXISTS gif_comments";

  const createGifCommentTable = `
  CREATE TABLE IF NOT EXISTS gif_comments (
    id SERIAL PRIMARY KEY,
    user_id INT,
    gif_id INT,
    comment TEXT,
    created_on TIMESTAMP DEFAULT NOW()
  );
`;
  // Insert dummy data
  const insertDummyData = `
  INSERT INTO gif_comments (user_id, gif_id, comment)
  VALUES
    ($1, $2, $3); 
`;
  const insertGifCommentValues = [1, 1, "very fantastic"];
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