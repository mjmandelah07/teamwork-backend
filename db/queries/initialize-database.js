const { createArticles } = require("./set-up-article-table");
const { createGifTable } = require("./set-up-gif-table");
const { articleCommentTable } = require("./set-up-article-comment-table");
const { gifCommentTable } = require("./set-up-gif-comment-table");

(async () => {
  try {
    await createArticles();
    await createGifTable();
    await articleCommentTable();
    await gifCommentTable();
    console.log("Tables created successfully");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
})();
