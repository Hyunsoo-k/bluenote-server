const mongoose = require("mongoose");
const dotenv = require("dotenv");

const { RecommendedNews } = require("../model/recommendedNews.js");

dotenv.config();

mongoose.connect(process.env.DATABASE_URL).then(() => console.log("Connected to DB to seed"));

const seedingRecommendedNews = async () => {
  try {
    await RecommendedNews.create({
      recommendedNewsList: []
    });

    console.log("Seeding completed successfully");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedingRecommendedNews();