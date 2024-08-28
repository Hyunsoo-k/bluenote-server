const { NoticePost, NewsPost, BoardPost, PromotePost, JobPost } = require("../model/bbs.js");

async function getAllPosts(user_id, page) {
  const noticePosts = await NoticePost.find({ writer: user_id }).sort({ createdAt: -1 }).lean();
  const newsPosts = await NewsPost.find({ writer: user_id }).sort({ createdAt: -1 }).lean();
  const boardPosts = await BoardPost.find({ writer: user_id }).sort({ createdAt: -1 }).lean();
  const promotePosts = await PromotePost.find({ writer: user_id }).sort({ createdAt: -1 }).lean();
  const jobPosts = await JobPost.find({ writer: user_id }).sort({ createdAt: -1 }).lean();

  const allPosts = [
    ...noticePosts,
    ...newsPosts,
    ...boardPosts,
    ...promotePosts,
    ...jobPosts,
  ];

  allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const limit = 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedPosts = allPosts.slice(startIndex, endIndex);

  return paginatedPosts;
}

module.exports = { getAllPosts };
