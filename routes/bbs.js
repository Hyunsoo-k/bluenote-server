const express = require("express");

const { getModel, subCategoryMap } = require("../utils/mapping.js");
const { getTokenAndPayload } = require("../utils/getTokenAndPayload.js");
const { asyncHandler } = require("../utils/asyncHandler.js");
const commentRoutes = require("./comment.js");

const router = express.Router();

// 게시글 목록 GET

router.route("/:mainCategory").get(
  asyncHandler(async (req, res) => {
    const { mainCategory } = req.params;
    const { subCategory = "All", page = 1 } = req.query;
    const filter = subCategory === "All" ? {} : { subCategory: subCategoryMap[subCategory] };
    const totalPostCount = await getModel(mainCategory).countDocuments(filter);
    const postLimit = mainCategory === "news" || mainCategory === "promote" ? 12 : 15;
    const postList = await (mainCategory === "news" || "promote"
      ? getModel(mainCategory)
          .find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * postLimit)
          .limit(postLimit)
          .populate({ path: "writer", select: "_id nickname" })
          .populate({
            path: "commentList.writer",
            select: "_id nickname",
          })
          .lean()
      : getModel(mainCategory)
          .find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * postLimit)
          .limit(postLimit)
          .populate({ path: "writer", select: "_id nickname" })
          .populate({
            path: "commentList.writer",
            select: "_id nickname",
          }));

    return res.send({
      mainCategory,
      subCategory,
      postList,
      totalPostCount,
      page: parseInt(page),
      totalPageCount: Math.ceil(totalPostCount / postLimit),
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
        .populate({ path: "commentList.writer", select: "_id nickname" })
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
      const { accessToken, payload } = getTokenAndPayload(req);
      const post = await getModel(mainCategory).findById(post_id).populate({ path: "writer", select: "_id nickname" });

      if (!post) {
        return res.status(404).send({ message: "게시글을 찾을 수 없습니다." });
      }

      if (!accessToken || post.writer._id.toString() !== payload._id) {
        return res.status(401).send({ message: "Unauthorized." });
      }

      console.log(req.body);

      if (!req.body.title) {
        return res.status(400).send({ message: "제목을 입력해 주세요." });
      }

      if (req.body.content === "<p><br></p>") {
        return res.status(400).send({ message: "내용을 입력해 주세요." });
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
      const { accessToken, payload } = getTokenAndPayload(req);
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

      if (!accessToken || post.writer._id.toString() !== payload._id) {
        return res.status(401).send({ message: "Unauthorized" });
      }

      await getModel(mainCategory).findByIdAndDelete(post_id);
      return res.sendStatus(204);
    })
  );

// 게시글 POST

router.route("/:mainCategory/post").post(
  asyncHandler(async (req, res) => {
    const { mainCategory } = req.params;
    const { accessToken, payload } = getTokenAndPayload(req);

    if (!accessToken) {
      return res.status(401).send({ message: "Unauthorized." });
    }

    if (!req.body.title) {
      return res.status(401).send({ message: "제목을 입력해 주세요." });
    }

    if (req.body.content === "<p><br></p>") {
      return res.statue(401).send({ message: "내용을 입력해 주세요." });
    }

    const newPost = await getModel(mainCategory).create({ ...req.body, writer: payload._id });

    await newPost.populate("writer");

    return res.status(201).send(newPost);
  })
);

// 게시글 조회수

router.route("/:mainCategory/post/:post_id/views").post(
  asyncHandler(async (req, res) => {
    const { mainCategory, post_id } = req.params;
    const post = await getModel(mainCategory).findById(post_id);

    if (!post) {
      return res.status.send({ message: "게시글을 찾을 수 없습니다." });
    }

    post.views += 1;
    await post.save();

    res.send(post);
  })
);

// 게시글 추천

router.route("/:mainCategory/post/:post_id/recommend").post(
  asyncHandler(async (req, res) => {
    const { mainCategory, post_id } = req.params;
    const { accessToken, payload } = getTokenAndPayload(req);

    if (!accessToken) {
      return res.status(401).send({ message: "Unauthorized." });
    }

    const post = await getModel(mainCategory).findById(post_id);

    if (!post) {
      return res.status(404).send({ message: "게시글을 찾을 수 없습니다." });
    }

    if (post.recommend.includes(payload._id)) {
      await getModel(mainCategory).findByIdAndUpdate(post_id, {
        $pull: { recommend: payload._id }
      });
      return res.send({ message: "추천이 취소되었습니다." });
    } else {
      await getModel(mainCategory).findByIdAndUpdate(post_id, {
        $push: { recommend: payload._id }
      });
      return res.send({ message: "추천이 성공적으로 완료되었습니다." });
    }
  })
);

// 댓글 라우터

router.use("/:mainCategory/:post_id/comment", commentRoutes);

module.exports = router;
