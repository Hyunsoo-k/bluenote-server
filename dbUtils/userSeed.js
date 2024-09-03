const mongoose = require("mongoose");
const dotenv = require("dotenv");

const { User } = require("../model/user.js");
const { seedUser } = require("./mock.js");

dotenv.config();
mongoose.connect(process.env.DATABASE_URL).then(() => console.log("seed data"));

User.deleteMany();

User.insertMany(seedUser)