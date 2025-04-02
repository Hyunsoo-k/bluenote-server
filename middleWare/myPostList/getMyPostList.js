const mongoose = require("mongoose");

const { asyncHandler } = require("../../utils/asyncHandler");
const { getTokenAndPayload } = require("../../utils/getTokenAndPayload.js");
const { MyPost } = require("../../model/myPost.js");
const optimizeBbsList = require("../../utils/optimizeBbsList.js");

const getMyPostList = asyncHandler(async (req, res) => {
  const { accessToken, payload } = getTokenAndPayload(req);
  const { cursor } = req.query;

  if (!accessToken || !payload) {
    return res.status(401).send({ message: "Unauthorized." });
  }

  const limit = 15;
  const matchOption = {
    user_id: new mongoose.Types.ObjectId(String(payload._id)),
  };

  const pipeline = [
    { $match: matchOption },
    {
      $project: {
        postList: cursor
          ? {
              $filter: {
                input: "$postList",
                as: "post",
                cond: {
                  $lt: ["$$post.post_id", new mongoose.Types.ObjectId(String(cursor))]
                }
              }
            }
          : "$postList"
      }
    },
    {
      $project: {
        postList: {
          $sortArray: { input: "$postList", sortBy: { post_id: -1 } }
        }
      }
    },
    {
      $project: {
        postList: {
          $slice: ["$postList", limit + 1]
        }
      }
    },
    { 
      $lookup: {
        from: "noticeposts",
        localField: "postList.post_id",
        foreignField: "_id",
        as: "noticePosts"
      }
    },
    { 
      $lookup: {
        from: "newsposts",
        localField: "postList.post_id",
        foreignField: "_id",
        as: "newsPosts"
      }
    },
    { 
      $lookup: {
        from: "boardposts",
        localField: "postList.post_id",
        foreignField: "_id",
        as: "boardPosts"
      }
    },
    { 
      $lookup: {
        from: "promoteposts",
        localField: "postList.post_id",
        foreignField: "_id",
        as: "promotePosts"
      }
    },
    { 
      $lookup: {
        from: "jobposts",
        localField: "postList.post_id",
        foreignField: "_id",
        as: "jobPosts"
      }
    },
    { 
      $project: {
        postList: { 
          $concatArrays: [
            "$noticePosts",
            "$newsPosts",
            "$boardPosts",
            "$promotePosts",
            "$jobPosts"
          ] 
        } 
      } 
    },
    {
      $project: {
        postList: {
          $sortArray: {
            input: "$postList",
            sortBy: { _id: -1 }
          }
        }
      }
    }
  ];

  const [myPostListData] = await MyPost.aggregate(pipeline);

  const postList = myPostListData?.postList || [];
  const hasNextPage = postList.length > limit;

  if (hasNextPage) {
    postList.pop();
  }

  const responsePostList = await Promise.all(postList.map(optimizeBbsList));

  return res.send({
    postList: responsePostList,
    hasNextPage
  });
});

module.exports = { getMyPostList };
