const { NoticePost, NewsPost, BoardPost, PromotePost, JobPost } = require("../model/bbs.js");

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


module.exports = { getModel, subCategoryMap };