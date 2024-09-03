const mongoose = require("mongoose");
const dotenv = require("dotenv");

const { NoticePost, NewsPost, BoardPost, PromotePost, JobPost } = require("../model/bbs.js");

dotenv.config();
mongoose.connect(process.env.DATABASE_URL);

async function renameCommentField() {
  try {
    await NoticePost.updateMany(
      { comment: { $exists: true } }, // comment 필드가 존재하는 문서만 업데이트
      { $rename: { comment: "commentList" } } // comment 필드명을 commentList로 변경
    );

    await NewsPost.updateMany(
      { comment: { $exists: true } },
      { $rename: { comment: "commentList" } }
    );

    await BoardPost.updateMany(
      { comment: { $exists: true } },
      { $rename: { comment: "commentList" } }
    );

    await PromotePost.updateMany(
      { comment: { $exists: true } },
      { $rename: { comment: "commentList" } }
    );

    await JobPost.updateMany(
      { comment: { $exists: true } },
      { $rename: { comment: "commentList" } }
    );

    console.log("Successfully renamed `comment` field to `commentList` in all documents.");
  } catch (error) {
    console.error("Error renaming fields:", error);
  } finally {
    mongoose.connection.close(); // 작업이 끝나면 DB 연결을 종료합니다.
  }
}

renameCommentField();
