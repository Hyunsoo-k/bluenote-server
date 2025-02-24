const cheerio = require("cheerio");

const optimizePostList = async (post) => {
  const $ = cheerio.load(post.content || "");
  const firstImage = $("img").first();
  const thumbnailSrc = firstImage.length ? firstImage.attr("src") : null;
  
  const textContent = $("body").text().trim().slice(0, 100);
  
  const commentCount = (post.commentList || []).reduce((acc, comment) => {
    const replies = comment.reply ? comment.reply.length : 0;
    return acc + (comment.deletedHavingReply ? replies : 1 + replies);
  }, 0);
  
  const { commentList, ...rest } = post;
  return { ...rest, content: textContent, commentCount, thumbnailSrc };
};

module.exports = optimizePostList;
