const express = require("express");

const { modelMap, subCategoryMap } = require("../utils/mapping.js");
const { Notification } = require("../model/notification.js");
const { SiteInformation } = require("../model/siteInformation.js");
const { getTokenAndPayload } = require("../utils/getTokenAndPayload.js");
const { asyncHandler } = require("../utils/asyncHandler.js");
const optimizePostList = require("../utils/optimizePostList.js");
const commentRoutes = require("./comment.js");

const router = express.Router();

// 게시글 목록 GET

router.route("/:mainCategory").get(
  asyncHandler(async (req, res) => {
    const { mainCategory } = req.params;
    const { subCategory = "All", page = 1, select, query } = req.query;
    let filter = subCategory === "All" ? {} : { subCategory: subCategoryMap[subCategory] };

    if (query) {
      if (select === "writer") {
        const userList = await modelMap["user"].find({ nickname: { $regex: query, $options: "i" } }).select("_id");
        const user_idList = userList.map((user) => user._id);
        
        filter = { ...filter, writer: { $in: user_idList } };
      } else if (select === "titleAndContent") {
        filter = {
          ...filter,
          titleAndContent: {
            $or: [
              { title: { $regex: query, $options: "i" } },
              { content: { $regex: query, $options: "i" } }
            ]
          }
        };
      } else if (select === "title") {
        filter = {
          ...filter,
          title: { $regex: query, $options: "i" }
        };
      } else if (select === "content") {
        filter = {
          ...filter,
          content: { $regex: query, $options: "i" }
        };
      }
    };

    const postLimit = mainCategory === "news" || mainCategory === "promote" ? 12 : 15;

    const mainCategoryModel = modelMap[mainCategory];

    const [postList, totalPostCount] = await Promise.all([
      mainCategoryModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * postLimit)
        .limit(postLimit)
        .populate({ path: "writer", select: "_id nickname" })
        .populate({ path: "commentList.writer", select: "_id nickname" })
        .lean(),
        mainCategoryModel.countDocuments(filter),
    ]);

    const responsePostList = await Promise.all(postList.map(optimizePostList));

    return res.send({
      mainCategory,
      subCategory,
      postList: responsePostList,
      totalPostCount,
      page: parseInt(page),
      totalPage: Math.ceil(totalPostCount / postLimit),
    });
  })
);

// 게시글 GET, PATCH, DELETE

router
  .route("/:mainCategory/post/:post_id")
  .get(
    asyncHandler(async (req, res) => {
      const { mainCategory, post_id } = req.params;
      const post = await modelMap[mainCategory]
        .findById(post_id)
        .populate({ path: "writer", select: "_id nickname" })
        .populate({ path: "commentList.writer", select: "_id nickname profileImage" })
        .populate({ path: "commentList.reply.writer", select: "_id nickname profileImage" })
        .lean();

      if (!post) {
        return res.status(404).send({ message: "게시글을 찾을 수 없습니다." });
      };

      const previousPost = await modelMap[mainCategory]
        .findOne({ createdAt: { $lt: post.createdAt } })
        .sort({ createdAt: -1 })
        .select("_id title createdAt")
        .lean();

      const nextPost = await modelMap[mainCategory]
        .findOne({ createdAt: { $gt: post.createdAt } })
        .sort({ createdAt: 1 })
        .select("_id title createdAt")
        .lean();

      return res.send({
        ...post,
        previousPost,
        nextPost,
      });
    })
  )
  .patch(
    asyncHandler(async (req, res) => {
      const { mainCategory, post_id } = req.params;
      const { accessToken, payload } = getTokenAndPayload(req);
      const post = await modelMap[mainCategory].findById(post_id).populate({ path: "writer", select: "_id nickname" });

      if (!post) {
        return res.status(404).send({ message: "게시글을 찾을 수 없습니다." });
      };

      if (!accessToken || post.writer._id.toString() !== payload._id) {
        return res.status(401).send({ message: "Unauthorized." });
      };

      if (!req.body.title) {
        return res.status(400).send({ message: "제목을 입력해 주세요." });
      };

      if (req.body.content === "<p><br></p>") {
        return res.status(400).send({ message: "내용을 입력해 주세요." });
      };

      const editedPost = await modelMap[mainCategory]
        .findByIdAndUpdate(post_id, { $set: req.body }, { new: true })
        .lean();

      return res.send(editedPost);
    })
  )
  .delete(
    asyncHandler(async (req, res) => {
      const { mainCategory, post_id } = req.params;
      const { accessToken, payload } = getTokenAndPayload(req);
      const post = await modelMap[mainCategory].findById(post_id);

      if (!post) {
        return res.status(404).send({ message: "게시글을 찾을 수 없습니다." });
      };

      if (payload.role) {
        await modelMap[mainCategory].findByIdAndDelete(post_id);

        return res.sendStatus(204);
      };

      await post.populate("writer");

      if (!accessToken || post.writer._id.toString() !== payload._id) {
        return res.status(401).send({ message: "Unauthorized" });
      };

      await modelMap[mainCategory].findByIdAndDelete(post_id);
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
    };

    if (!req.body.title) {
      return res.status(401).send({ message: "제목을 입력해 주세요." });
    };

    if (req.body.content === "<p><br></p>") {
      return res.statue(401).send({ message: "내용을 입력해 주세요." });
    };
    
    const siteInformation = await SiteInformation.findOneAndUpdate(
      {},
      { $inc: { cumulatedPostsCount: 1 } },
      { new: true }
    );

    const newPost = await modelMap[mainCategory].create({ ...req.body, writer: payload._id, number: siteInformation.cumulatedPostsCount });

    await newPost.populate("writer");

    return res.status(201).send(newPost);
  })
);

// 게시글 조회수

router.route("/:mainCategory/post/:post_id/views").post(
  asyncHandler(async (req, res) => {
    const { mainCategory, post_id } = req.params;
    const post = await modelMap[mainCategory].findById(post_id);

    if (!post) {
      return res.status.send({ message: "게시글을 찾을 수 없습니다." });
    };

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
    };

    const post = await modelMap[mainCategory].findById(post_id);

    if (!post) {
      return res.status(404).send({ message: "게시글을 찾을 수 없습니다." });
    };

    if (post.recommend.includes(payload._id)) {
      await modelMap[mainCategory].findByIdAndUpdate(post_id, {
        $pull: { recommend: payload._id },
      });

      await Notification.findOneAndUpdate(
        { user: post.writer._id },
        { $pull: { list: { triggeredBy: payload._id, type: "추천" } } }
      );

      return res.send({ message: "게시글 추천을 취소했습니다." });
    } else {
      await modelMap[mainCategory].findByIdAndUpdate(post_id, {
        $push: { recommend: payload._id },
      });

      await Notification.findOneAndUpdate(
        { user: post.writer._id },
        {
          $push: {
            list: { 
              triggeredBy: payload._id,
              type: "추천",
              targetTitle: post.title,
              targetUrl: req.body.targetUrl
            },
          },
        }
      );

      return res.send({ message: "게시글을 추천했습니다." });
    }
  })
);

// 인기 게시글 GET

router.route("/:mainCategory/popular").get(
  asyncHandler(async (req, res) => {
    const { mainCategory } = req.params;
    const dateRange = new Date();
    dateRange.setDate(dateRange.getDate() - 60);

    const postList = await modelMap[mainCategory]
      .find({ createdAt: { $gte: dateRange } })
      .sort({ views: -1 })
      .limit(10);

    res.send(postList);
  })
);

// 댓글 라우터

router.use("/:mainCategory/post/:post_id/comment", commentRoutes);

module.exports = router;
