const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    list: [
      {
        triggeredBy: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "User"
        },
        type: {
          type: String,
          enum: ["댓글", "답글", "추천"],
          required: true
        },
        targetTitle: {
          type: String,
          required: true
        },
        targetUrl: {
          type: String,
          required: true
        },
        isChecked: {
          type: Boolean,
          default: false,
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  }
);

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = { Notification }