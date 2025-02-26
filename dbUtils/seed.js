const mongoose = require("mongoose");
const dotenv = require("dotenv");

const { RecentSearch } = require("../model/userRecentSearch.js");
const { User } = require("../model/user.js");

dotenv.config();

mongoose.connect(process.env.DATABASE_URL).then(() => console.log("Connected to DB to seed"));

const seedingRecentSearch = async () => {
  try {
    const userList = await User.find();
    const user_idList = userList.map((doc) => doc._id);

    await Promise.all(user_idList.map((_id) => RecentSearch.create({ user: _id })));

    console.log("Seeding completed successfully");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedingRecentSearch();