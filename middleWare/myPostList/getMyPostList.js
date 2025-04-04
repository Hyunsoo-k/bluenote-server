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
  
    // postList에서 조건 필터
    {
      $project: {
        postList: cursor
          ? {
              $filter: {
                input: "$postList",
                as: "post",
                cond: {
                  $lt: [
                    "$$post.post_id",
                    new mongoose.Types.ObjectId(String(cursor)),
                  ],
                },
              },
            }
          : "$postList",
      },
    },
  
    // 최신순 정렬 & 슬라이스
    {
      $project: {
        postList: {
          $sortArray: { input: "$postList", sortBy: { post_id: -1 } },
        },
      },
    },
    {
      $project: {
        postList: { $slice: ["$postList", limit + 1] },
      },
    },
  
    // postList를 unwind해서 각각 처리 가능하게 만듦
    { $unwind: "$postList" },
  
    // 각 post_id로 실제 post 데이터 조인 (5개 타입)
    {
      $lookup: {
        from: "noticeposts",
        localField: "postList.post_id",
        foreignField: "_id",
        as: "noticePost"
      }
    },
    {
      $lookup: {
        from: "newsposts",
        localField: "postList.post_id",
        foreignField: "_id",
        as: "newsPost"
      }
    },
    {
      $lookup: {
        from: "boardposts",
        localField: "postList.post_id",
        foreignField: "_id",
        as: "boardPost"
      }
    },
    {
      $lookup: {
        from: "promoteposts",
        localField: "postList.post_id",
        foreignField: "_id",
        as: "promotePost"
      }
    },
    {
      $lookup: {
        from: "jobposts",
        localField: "postList.post_id",
        foreignField: "_id",
        as: "jobPost"
      }
    },
  
    // 하나로 합치기
    {
      $project: {
        post: {
          $first: {
            $concatArrays: [
              "$noticePost",
              "$newsPost",
              "$boardPost",
              "$promotePost",
              "$jobPost"
            ]
          }
        }
      }
    },
  
    // post.writer에 대해 user 정보 가져오기
    {
      $lookup: {
        from: "users",
        let: { writerId: "$post.writer" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$writerId"] } } },
          { $project: { _id: 1, nickname: 1 } } // ✅ 필요한 필드만 선택
        ],
        as: "post.writer"
      }
    },
    {
      $unwind: {
        path: "$post.writer",
        preserveNullAndEmptyArrays: true
      }
    },
  
    // 다시 배열로 재조립
    {
      $group: {
        _id: "$_id",
        postList: { $push: "$post" }
      }
    },
  
    // 최종 정렬
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
    hasNextPage,
  });
});

module.exports = { getMyPostList };
