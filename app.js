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

app
  .route("/bbs/:main_category")
  .get(
    asyncHandler(async (req, res) => {
      const subCategoryMap = {
        all: "All",
        domestic: "국내",
        overseas: "국외",
        common: "일반",
        record: "녹음",
        tip: "팁",
        band_promotion: "밴드홍보",
        album_promotion: "앨범홍보",
        jazzbar_promotion: "재즈바홍보",
        job_posting: "구인",
        job_seeking: "구직",
      };

      const { sub_category, page = 1 } = req.query;
      const subCategory = subCategoryMap[sub_category];
      const query = subCategory === "All" ? {} : { subCategory };
      const pageSize = 15;
      const totalPostCount = await getModel(req.params.main_category).countDocuments(query);
      const postList = await getModel(req.params.main_category)
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize);

      res.send({
        postList,
        totalPostCount,
        currentPage: parseInt(page),
        totalPageCount: Math.ceil(totalPostCount / pageSize),
      });
    })
  )
  .post(
    asyncHandler(async (req, res) => {
      const newPost = await getModel(req.params.main_category).create(req.body);
      res.status(201).send(newPost);
    })
  );

// 게시글 조회, 게시글 수정, 게시글 삭제

app
  .route("/bbs/:main_category/:id")
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

app
  .route("/bbs/:main_category/:id/comment")
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
  );

// 게시글 댓글 수정, 게시글 댓글 삭제

app
  .route("/bbs/:main_category/:id/comment/:comment_id")
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
