const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const mainPageRouter = require("./routes/mainPage.js");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user.js");
const bbsRouter = require("./routes/bbs");
const photoNewsRouter = require("./routes/photoNews.js");
const recommendedNewsRouter = require("./routes/recommendedNews.js");
const myPostListRouter = require("./routes/myPostList.js")

dotenv.config();

mongoose
  .connect(process.env.DATABASE_URL, { autoIndex: false })
  .then(() => console.log("Connected to MONGO DB"));

const app = express();

app.use(cors(
  {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://bluenote-server.onrender.com",
      "https://blue-note-silk.vercel.app"
    ]
  }
));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/mainPage", mainPageRouter);
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/bbs", bbsRouter);
app.use("/photoNews", photoNewsRouter);
app.use("/recommendedNews", recommendedNewsRouter);
app.use("/myPostList", myPostListRouter);

app.listen(process.env.PORT || 3000 || 3001, () => console.log("Server Started"));
