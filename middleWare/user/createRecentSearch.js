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

  await RecentSearch.updateOne(
    { user: payload._id },
    {
      $push: {
        queryList: {
          $each: [req.body.query],
          $position: 0,
          $slice: 10,
        },
      },
    }
  );

  res.status(201).send();
});

module.exports = createRecentSearch;
