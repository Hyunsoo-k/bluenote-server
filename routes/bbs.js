const express = require("express");

const { getModel, subCategoryMap } = require("../variable/mapping.js");
const { getTokenAndPayload } = require("../variable/certification.js");
const { asyncHandler } = require("../variable/asyncHandler.js");
const commentRoutes = require("./comment.js");

const router = express.Router();

// 게시글 목록 GET

router.route("/:mainCategory").get(
  asyncHandler(async (req, res) => {
    const { mainCategory } = req.params;
    const { subCategory = "All", page = 1 } = req.query;
    const filter = subCategory === "All" ? {} : { subCategory: subCategoryMap[subCategory] };
    const totalPostCount = await getModel(mainCategory).countDocuments(filter);
    const postList = await getModel(mainCategory)
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * 15)
      .limit(15)
      .populate({ path: "writer", select: "_id nickname" })
      .populate({
        path: "comment.writer",
        select: "_id nickname",
      })
      .lean();

    return res.send({
      mainCategory,
      subCategory,
      postList,
      totalPostCount,
      page: parseInt(page),
      totalPageCount: Math.ceil(totalPostCount / 15),
    });
  })
);

// 게시글 GET, PATCH, DELETE

router
  .route("/:mainCategory/post/:post_id")
  .get(
    asyncHandler(async (req, res) => {
      const { mainCategory, post_id } = req.params;
      const post = await getModel(mainCategory)
        .findById(post_id)
        .populate({ path: "writer", select: "_id nickname" })
        .populate({ path: "comment.writer", select: "_id nickname" })
        .lean();

      if (!post) {
        return res.status(404).send({ message: "게시글을 찾을 수 없습니다." });
      }

      return res.send({ ...post });
    })
  )
  .patch(
    asyncHandler(async (req, res) => {
      const { mainCategory, post_id } = req.params;
      const { token, payload } = getTokenAndPayload(req);
      const post = await getModel(mainCategory)
        .findById(post_id)
        .populate({ path: "writer", select: "_id nickname" });

      if (!post) {
        return res.status(404).send({ message: "게시글을 찾을 수 없습니다." });
      }

      if (!token || post.writer._id.toString() !== payload._id) {
        return res.status(401).send({ message: "Unauthorized." });
      }

      const editedPost = await getModel(mainCategory)
        .findByIdAndUpdate(post_id, { $set: req.body }, { new: true })
        .lean();

      return res.send(editedPost);
    })
  )
  .delete(
    asyncHandler(async (req, res) => {
      const { mainCategory, post_id } = req.params;
      const { token, payload } = getTokenAndPayload(req);
      const post = await getModel(mainCategory).findById(post_id);
      console.log(post);

      if (!post) {
        return res.status(404).send({ message: "게시글을 찾을 수 없습니다." });
      }

      if (payload.role) {
        await getModel(mainCategory).findByIdAndDelete(post_id);

        return res.sendStatus(204);
      }

      await post.populate("writer");

      if (!token || post.writer._id.toString() !== payload._id) {
        return res.status(401).send({ message: "Unauthorized" });
      }

      getModel(mainCategory).findByIdAndDelete(post_id);
      return res.sendStatus(204);
    })
  );

// 게시글 POST

router.route("/:mainCategory/post").post(
  asyncHandler(async (req, res) => {
    const { mainCategory } = req.params;
    const { token, payload } = getTokenAndPayload(req);

    if (!token) {
      return res.status(401).send({ message: "Unauthorized." });
    }

    const newPost = await getModel(mainCategory).create({ ...req.body, writer: payload._id });

    await newPost.populate("writer");

    return res.status(201).send(newPost);
  })
);

// 댓글 라우터
router.use("/:mainCategory/:post_id/comment", commentRoutes);

module.exports = router;
