const { JSDOM } = require("jsdom");

const optimizePostList = async (post) => {
  const dom = new JSDOM(post.content);
  const document = dom.window.document;
    
  const firstImage = document.querySelector("img");
  const thumbnailSrc = firstImage ? firstImage.getAttribute("src") : null;
    
  const textContent = (document.body.textContent || "").trim().slice(0, 100);
    
  const commentCount = post.commentList.reduce((accumulator, comment) => {
    if (comment.deletedHavingReply) {
      return accumulator + (comment.reply ? comment.reply.length : 0);
    } else {
      return accumulator + 1 + (comment.reply ? comment.reply.length : 0);
    }
  }, 0);
    
    const { commentList, ...rest } = post;
    
    return { ...rest, content: textContent, commentCount, thumbnailSrc };
};

module.exports = optimizePostList;