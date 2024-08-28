const mongoose = require("mongoose");
const dotenv = require("dotenv");

const { NoticePost, NewsPost, BoardPost, PromotePost, JobPost } = require("../model/bbs.js");

dotenv.config();
mongoose.connect(process.env.DATABASE_URL);

async function addMainCategoryToPosts() {
  try {
    await NoticePost.updateMany(
      { mainCategory: { $exists: false } },
      { $set: { mainCategory: "notice" } }
    );

    await NewsPost.updateMany(
      { mainCategory: { $exists: false } },
      { $set: { mainCategory: "news" } }
    );

    await BoardPost.updateMany(
      { mainCategory: { $exists: false } },
      { $set: { mainCategory: "board" } }
    );

    await PromotePost.updateMany(
      { mainCategory: { $exists: false } },
      { $set: { mainCategory: "promote" } }
    );

    await JobPost.updateMany(
      { mainCategory: { $exists: false } },
      { $set: { mainCategory: "job" } }
    );

    console.log("Successfully updated all documents with `mainCategory` field.");
  } catch (error) {
    console.error("Error updating documents:", error);
  }
}

addMainCategoryToPosts();
