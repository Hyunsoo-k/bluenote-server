const { User } = require("../model/user.js");
const { NoticePost, NewsPost, BoardPost, PromotePost, JobPost } = require("../model/bbs.js");

const modelMap = {
  user: User,
  notice: NoticePost,
  news: NewsPost,
  board: BoardPost,
  promote: PromotePost,
  job: JobPost
}

const subCategoryMap = {
  All: "All",
  notification: "공지",
  domestic: "국내",
  overseas: "국외",
  common: "일반",
  record: "녹음",
  tip: "팁",
  bandPromotion: "밴드홍보",
  albumPromotion: "앨범홍보",
  jazzbarPromotion: "재즈바홍보",
  jobPosting: "구인",
  jobSeeking: "구직",
};

const selectMap = {
  titleAndContent: "제목 + 내용"
}


module.exports = { modelMap, subCategoryMap };