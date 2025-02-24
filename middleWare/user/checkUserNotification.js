const { Notification } = require("../../model/notification.js");
const { getTokenAndPayload } = require("../../utils/getTokenAndPayload.js");
const { asyncHandler } = require("../../utils/asyncHandler.js");

const checkUserNotification = asyncHandler(async (req, res) => {
  const { notification_id } = req.params;
  const { accessToken, payload } = getTokenAndPayload(req);

  if (!accessToken || !payload) {
    return res.status(401).send({ message: "Unauthorized." });
  }

  await Notification.findOneAndUpdate(
    { user: payload._id, "list._id": notification_id },
    { $set: { "list.$.isChecked": true } }
  );

  return res.send();
});

module.exports = checkUserNotification;
