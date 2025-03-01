const { asyncHandler } = require("../../utils/asyncHandler.js");
const { RecentSearch } = require("../../model/recentSearch.js");
const { getTokenAndPayload } = require("../../utils/getTokenAndPayload.js");

const createRecentSearch = asyncHandler(async (req, res) => {
  const { accessToken, payload } = getTokenAndPayload(req);

  if (!accessToken || !payload) {
    return res.status(401).send({ message: "Unauthorized." });
  };

  const recentSearch = await RecentSearch.findOne({ user: payload._id });

  if (!recentSearch) {
    return res.status(404).send({ message: "Can not find recent search." });
  };
  
  let updatedQueryList = recentSearch.queryList.filter(q => q !== req.body.query);
  
  updatedQueryList.unshift(req.body.query);
  
  updatedQueryList = updatedQueryList.slice(0, 20);
  
  await RecentSearch.updateOne(
    { user: payload._id },
    { $set: { queryList: updatedQueryList } }
  );

  res.status(201).send();
});

module.exports = createRecentSearch;
