const { asyncHandler } = require("../../utils/asyncHandler.js");
const { RecentSearch } = require("../../model/recentSearch.js");
const { getTokenAndPayload } = require("../../utils/getTokenAndPayload.js");

const deleteRecentSearch = asyncHandler(async (req, res) => {
  const { accessToken, payload } = getTokenAndPayload(req);

  if (!accessToken || !payload) {
    return res.status(401).send({ message: "Unauthorized." });
  }

  const recentSearch = await RecentSearch.findOne({ user: payload._id });

  if (!recentSearch) {
    return res.status(404).send({ message: "Can not find recent search." });
  }

  await RecentSearch.updateOne(
    { user: payload._id },
    { $pull: {
        queryList: req.body.query.trim()
      }
    }
  );

  res.send();
});

module.exports = deleteRecentSearch;
