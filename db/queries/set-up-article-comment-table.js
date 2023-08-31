const db = require("../db");

const articleCommentTable = async () => {
  // Drop the articles comment table if it exists
  const dropArticleCommentTable = "DROP TABLE IF EXISTS article_comments";

  // Create the articles comment table
  const createArticleCommentTable = `
  CREATE TABLE IF NOT EXISTS article_comments (
    id SERIAL PRIMARY KEY,
    user_id INT,
    article_id INT,
    user_name TEXT,
    comment TEXT,
    created_on TIMESTAMP DEFAULT NOW()
  );
`;
  // Insert dummy data
  const insertDummyData = `
  INSERT INTO article_comments (user_id, article_id, user_name, comment)
  VALUES
    ($1, $2, $3, $4); 
`;
  const insertArticleCommentValues = [1, 1, "Yemi seun", "very fantastic"];

  try {
    // Drop the table if it exists
    await db.query(dropArticleCommentTable);

    // Create the article comment table
    await db.query(createArticleCommentTable);
    console.log("articles comment table created");

    // Insert dummy user data
    await db.query(insertDummyData, insertArticleCommentValues);
    console.log("Dummy article comment data inserted");
  } catch (error) {
    console.error("Error:", error);
  }
};

module.exports = { articleCommentTable };
