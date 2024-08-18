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


module.exports = { getModel, subCategoryMap };