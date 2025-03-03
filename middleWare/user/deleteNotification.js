const { asyncHandler } = require("../../utils/asyncHandler.js");
const { getTokenAndPayload } = require("../../utils/getTokenAndPayload.js");
const { Notification } = require("../../model/notification.js");

const deleteNotification = asyncHandler(async (req, res) => {
  const { notification_id } = req.params;
  const { accessToken, payload } = getTokenAndPayload(req);

  if (!accessToken || !payload) {
    return res.status(401).send({ message: "Unauthorized." });
  }

  await Notification.findOneAndUpdate({ user: payload._id }, { $pull: { list: { _id: notification_id } } });

  return res.status(204).send();
});

module.exports = deleteNotification;
