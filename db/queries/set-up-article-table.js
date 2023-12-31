const db = require("../db");
require("dotenv").config();

const createArticles = async () => {
  // Drop the articles table if it exists
  const dropArticleTableQuery = "DROP TABLE IF EXISTS articles CASCADE";

  // Create the articles table
  const createArticleTableQuery = `
  CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title TEXT,
    article TEXT,
    category TEXT,
    user_id INT,
    flagged BOOLEAN DEFAULT false,
    flag_reason TEXT,
    created_on TIMESTAMP DEFAULT NOW(),
    updated_on TIMESTAMP
  );
`;

  // Insert the articles
  const insertArticleQuery = `
      INSERT INTO articles (title, article, category, user_id) 
      VALUES ($1, $2, $3, $4);
    `;

  // Dummy article data
  const articleData = {
    title: "Love is great",
    article:
      "Just one small positive thought in the morning can change your whole day. Just one small positive thought in the morning can change your whole day.",
    category: "Love",
  };

  const insertArticleValues = [
    articleData.title,
    articleData.article,
    articleData.category,
    1,
  ];

  try {
    // Drop the articles table if it exists
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
