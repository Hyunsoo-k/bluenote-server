const { asyncHandler } = require("../../utils/asyncHandler.js");
const { getTokenAndPayload } = require("../../utils/getTokenAndPayload.js");
const { RecentSearch } = require("../../model/recentSearch.js");

const getRecentSearches = asyncHandler(async (req, res) => {
  const { accessToken, payload } = getTokenAndPayload(req);

  if (!accessToken || !payload) {
    return res.status(401).send({ message: "Unauthorized." });
  };

  const recentSearch = await RecentSearch.findOne({ user: payload._id }).lean();

  if (!recentSearch) {
    return res.status(404).send({ message: "Can not find recent search." });
  };

  res.send({ queryList: recentSearch.queryList });
});

module.exports = getRecentSearches;
