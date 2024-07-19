const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const { NoticePost, NewsPost, BoardPost, PromotePost, JobPost } = require("./model/bbs.js");

dotenv.config();
mongoose.connect(process.env.DATABASE_URL).then(() => console.log("Connected to DB"));

const app = express();
app.use(express.json());
app.use(cors({ origin: ["http://localhost:3000", "https://bluenote-server.onrender.com"]}));

const asyncHandler = (handler) => {
  return async (req, res) => {
    try {
      handler(req, res);
    } catch (err) {
      console.log(err.name);
      console.log(err.message);
    }
  };
};

const getModel = (mainCategory) => {
  const modelMap = {
    notice: NoticePost,
    news: NewsPost,
    board: BoardPost,
    promote: PromotePost,
    job: JobPost,
  };
  return modelMap[mainCategory];
}

// 게시판

app.get(
  "/bbs/:main_category",
  asyncHandler(async (req, res) => {
    const posts = await getModel(req.params.main_category).find().sort({ createdAt: -1 });
    const count = await getModel(req.params.main_category).countDocuments();
    const postsData = {
      posts: posts,
      count: count
    }
    res.send(postsData);
  })
);

app.post(
  "/bbs/:main_category",
  asyncHandler(async (req, res) => {
    const newPost = await getModel(req.params.main_category).create(req.body);
    res.status(201).send(newPost);
  })
);

app.patch(
  "/bbs/:main_category/:id",
  asyncHandler(async (req, res) => {
    const post = await getModel(req.params.main_category).findById(req.params.id);
    if (post) {
      Object.keys(req.body).forEach((key) => {
        post[key] = req.body[key];
      });
      await post.save();
      res.send(post);
    } else {
      res.status(404).send({ message: "Cannot find given id." });
    }
  })
);

app.delete(
  "/bbs/:main_category/:id",
  asyncHandler(async (req, res) => {
    const post = await getModel(req.params.main_category).findByIdAndDelete(req.params.id);
    if (post) {
      res.sendStatus(204);
    } else {
      res.status(404).send({ message: "Cannot find given id." });
    }
  })
);

// 게시판 댓글

app.post(
  "/bbs/:main_category/:id/comment",
  asyncHandler(async (req, res) => {
    const post = await getModel(req.params.main_category).findById(req.params.id);
    if (post) {
      post.comment.push(req.body);
      await post.save();
      res.status(201).send(post);
    } else {
      res.status(404).send({ message: "Cannot find given id." });
    }
  })
);

app.patch(
  "/bbs/:main_category/:id/comment/:comment_id",
  asyncHandler(async (req, res) => {
    const post = await getModel(req.params.main_category).findById(req.params.id);
    if (post) {
      const comment = post.comment.id(req.params.comment_id);
      if (comment) {
        Object.keys(req.body).forEach((key) => {
          comment[key] = req.body[key];
        });
        await post.save();
        res.send(comment);
      } else {
        res.status(404).send({ message: "Cannot find comment with given id." });
      }
    } else {
      res.status(404).send({ message: "Cannot find post with given id." });
    }
  })
);

app.delete(
  "/bbs/:main_category/:id/comment/:comment_id",
  asyncHandler(async (req, res) => {
    const post = await getModel(req.params.main_category).findById(req.params.id);
    if (post) {
      const comment = post.comment.id(req.params.comment_id);
      if (comment) {
        post.comment.pull(comment._id);
        await post.save();
        res.sendStatus(204);
      } else {
        res.status(404).send({ message: "Cannot find comment with given id." });
      }
    } else {
      res.status(404).send({ message: "Cannot find given id." });
    }
  })
);

app.listen(process.env.PORT || 3000, () => console.log("Server Started"));
