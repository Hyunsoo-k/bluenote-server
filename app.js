const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");

const { NoticePost, NewsPost, BoardPost, PromotePost, JobPost } = require("./model/bbs.js");

dotenv.config();
mongoose.connect(process.env.DATABASE_URL).then(() => console.log("Connected to DB"));

const app = express();
app.use(cors({ origin: ["http://localhost:3000", "https://bluenote-server.onrender.com"] }));
app.use(express.json());

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

const getModel = (main_category) => {
  const modelMap = {
    notice: NoticePost,
    news: NewsPost,
    board: BoardPost,
    promote: PromotePost,
    job: JobPost,
  };
  return modelMap[main_category];
};

// 게시글 목록 조회, 게시글 등록

const subCategoryMap = {
  all: "All",
  notification: "공지",
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

app
  .route("/bbs/:main_category")
  .get(
    asyncHandler(async (req, res) => {
      const { main_category } = req.params;
      const { sub_category = "all", page = 1 } = req.query;
      const query = sub_category === "all" ? {} : { subCategory: subCategoryMap[sub_category] };
      const pageSize = 15;
      const totalPostCount = await getModel(main_category).countDocuments(query);
      const postList = await getModel(main_category)
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize);
      res.send({
        mainCategory: main_category,
        subCategory: sub_category,
        postList,
        totalPostCount,
        page: parseInt(page),
        totalPageCount: Math.ceil(totalPostCount / pageSize),
      });
    })
  )
  .post(
    asyncHandler(async (req, res) => {
      const { main_category } = req.params;
      const newPost = await getModel(main_category).create(req.body);
      console.log("post done");
      res.status(201).send(newPost);
    })
  );

// 게시글 조회, 게시글 수정, 게시글 삭제

app
  .route("/bbs/:main_category/post")
  .get(
    asyncHandler(async (req, res) => {
      const { main_category } = req.params;
      const { post_id } = req.query;
      const post = await getModel(main_category).findById(post_id);
      
      if (!post) {
        res.status(404).send({ message: "Cannot find given id." });
      }

      res.send({
        post
      });
    })
  )
  .patch(
    asyncHandler(async (req, res) => {
      const { main_category } = req.params;
      const { post_id } = req.query;
      const post = await getModel(main_category).findById(post_id);

      if (!post) {
        res.status(404).send({ message: "Cannot find given id." });
      }

      Object.keys(req.body).forEach((key) => {
        post[key] = req.body[key];
      });
      await post.save();
      res.send(post);
    })
  )
  .delete(
    asyncHandler(async (req, res) => {
      const { main_category, post_id } = req.params;
      const post = await getModel(main_category).findByIdAndDelete(post_id);
      
      if (!post) {
        res.status(404).send({ message: "Cannot find given id." })
      }

      res.sendStatus(204);
    })
  );

// 게시글 댓글 목록 조회, 게시글 댓글 등록

app
  .route("/bbs/:main_category/:id/comment")
  .get(
    asyncHandler(async (req, res) => {
      const { main_category, post_id } = req.params;
      const post = await getModel(main_category).findById(post_id);

      if (!post.comment) {
        res.status(404).send({ message: "there no comments." });
      }

      res.send(post.comment);
    })
  )
  .post(
    asyncHandler(async (req, res) => {
      const { main_category: mainCategory, id: postId } = req.params;
      const post = await getModel(mainCategory).findById(postId);

      if(!post) {
        res.status(404).send({ message: "Cannot find given id." });
      }

      post.comment.push(req.body);
        await post.save();
        res.status(201).send(post);
    })
  );

// 게시글 댓글 수정, 게시글 댓글 삭제

app
  .route("/bbs/:main_category/:id/comment/:comment_id")
  .patch(
    asyncHandler(async (req, res) => {
      const { main_category: mainCategory, id: postId, comment_id: commentId } = req.params;

      const post = await getModel(mainCategory).findById(postId);
      if (!post) {
        return res.status(404).send({ message: "Cannot find post with given id." });
      }

      const comment = post.comment.id(commentId);
      if (!comment) {
        return res.status(404).send({ message: "Cannot find comment with given id." });
      }

      Object.keys(req.body).forEach((key) => {
        comment[key] = req.body[key];
      });

      await post.save();
      res.send(comment);
    })
  )
  .delete(
    asyncHandler(async (req, res) => {
      const { main_category: mainCategory, id: postId, comment_id: commentId } = req.params;

      const post = await getModel(mainCategory).findById(postId);
      if (!post) {
        res.status(404).send({ message: "Cannot find given id." });
      }

      const comment = post.id(commentId);
      if (!comment) {
        res.status(404).send({ message: "Cannot find comment with given id." });
      }
      post.comment.pull(comment._id);
      await post.save();
      res.sendStatus(204);
    })
  );

app.listen(process.env.PORT || 3000, () => console.log("Server Started"));
