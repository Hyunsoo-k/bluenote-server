const { User } = require("../model/user.js");
const { NoticePost, NewsPost, BoardPost, PromotePost, JobPost } = require("../model/bbs.js");

const modelMap = {
  user: User,
  notice: NoticePost,
  news: NewsPost,
  board: BoardPost,
  promote: PromotePost,
  job: JobPost
};

module.exports = { modelMap };