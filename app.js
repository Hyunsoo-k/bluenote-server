const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const { NoticePost, NewsPost, BoardPost, PromotePost, JobPost } = require("./model/bbs.js");

dotenv.config();
mongoose.connect(process.env.DATABASE_URL).then(() => console.log("Connected to DB"));

const app = express();
app.use(express.json());
app.use(cors({ origin: ["http://localhost:3000", "https://bluenote-server.onrender.com"] }));

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
};

// 게시글 목록 조회, 게시글 등록

app.route("/bbs/:main_category")
  .get(
    asyncHandler(async (req, res) => {
      let subCategory;

      switch (req.query.sub_category){ 
        case ("all" || undefined):
          subCategory = "All";
          break;
        case ("domestic"):
          subCategory = "국내";
          break;
        case ("overseas"):
          subCategory = "국외";
          break;
        case ("common"):
          subCategory = "일반";
          break;
        case ("record"):
          subCategory = "녹음";
          break;
        case ("tip"):
          subCategory = "팁";
          break;
        case ("band_promotion"):
          subCategory = "밴드홍보";
          break;
        case ("album_promotion"):
          subCategory = "앨범홍보";
          break;
        case ("jazzbar_promotion"):
          subCategory = "재즈바홍보";
          break;
        case ("job_posting"):
          subCategory = "구인";
          break;
        case ("job_seeking"):
          subCategory = "구직";
          break;
      }

      const posts = subCategory === "All" ?
        await getModel(req.params.main_category).find().sort({ createdAt: -1 }) :
        await getModel(req.params.main_category).find({ sub: subCategory }).sort({ createdAt: -1 });    
      const count = posts.length;
      const resData = {
        posts: posts,
        count: count,
      };
      res.send(resData);
    })
  )
  .post(
    asyncHandler(async (req, res) => {
      const newPost = await getModel(req.params.main_category).create(req.body);
      res.status(201).send(newPost);
    })
  );

// 게시글 조회, 게시글 수정, 게시글 삭제

app.route("/bbs/:main_category/:id")
  .get(
    asyncHandler(async (req, res) => {
      const post = await getModel(req.params.main_category).findById(req.params.id);
      if (post) {
        res.send(post);
      } else {
        res.status(404).send({ message: "Cannot find given id." });
      }
    })
  )
  .patch(
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
  )
  .delete(
    asyncHandler(async (req, res) => {
      const post = await getModel(req.params.main_category).findByIdAndDelete(req.params.id);
      if (post) {
        res.sendStatus(204);
      } else {
        res.status(404).send({ message: "Cannot find given id." });
      }
    })
  );

// 게시글 댓글 목록 조회, 게시글 댓글 등록

app.route("/bbs/:main_category/:id/comment")
  .get(
    asyncHandler(async (req, res) => {
      const post = await getModel(req.params.main_category).findById(req.params.id);
      if (post.comment) {
        res.send(post.comment);
      } else {
        res.status(404).send({ message: "there no comments." });
      }
    })
  )
  .post(
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
  )

// 게시글 댓글 수정, 게시글 댓글 삭제

app.route("/bbs/:main_category/:id/comment/:comment_id")
  .patch(
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
  )
  .delete(
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
