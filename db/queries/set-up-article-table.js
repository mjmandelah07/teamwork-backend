const db = require("../db");
require("dotenv").config();

const createArticles = async () => {
  // Drop the articles table if it exists
  const dropArticleTableQuery = "DROP TABLE IF EXISTS articles";

  // Create the articles table
  const createArticleTableQuery = `
  CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title TEXT,
    article TEXT,
    user_id INT,
    created_on TIMESTAMP DEFAULT NOW(),
    updated_on TIMESTAMP
  );
`;

  // Insert the articles
  const insertArticleQuery = `
      INSERT INTO articles (title, article, user_id) 
      VALUES ($1, $2, $3);
    `;

  // Dummy article data
  const articleData = {
    title: "Love is great",
    article:
      "Just one small positive thought in the morning can change your whole day. Just one small positive thought in the morning can change your whole day.",
  };

  const insertArticleValues = [articleData.title, articleData.article, 1];

  try {
    // Drop the table if it exists
    await db.query(dropArticleTableQuery);

    // Create the article table
    await db.query(createArticleTableQuery);
    console.log("articles table created");

    // Insert dummy user data
    await db.query(insertArticleQuery, insertArticleValues);
    console.log("Dummy article data inserted");
  } catch (error) {
    console.error("Error:", error);
  }
};

module.exports = { createArticles };
