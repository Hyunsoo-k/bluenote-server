const mongoose = require("mongoose");

const SiteInformationSchema = new mongoose.Schema(
  {
    cumulatedPostsCount: {
      type: Number,
      required: true,
      default: 0
    }
  }
);

const SiteInformation = mongoose.model("SiteInformation", SiteInformationSchema);

module.exports = { SiteInformation };