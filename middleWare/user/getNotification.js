const { asyncHandler } = require("../../utils/asyncHandler.js");
const { getTokenAndPayload } = require("../../utils/getTokenAndPayload.js");
const { Notification } = require("../../model/notification.js");

const getNotification = asyncHandler(async (req, res) => {
  const { accessToken, payload } = getTokenAndPayload(req);

  if (!accessToken || !payload) {
    return res.status(401).send({ message: "Unauthorized." });
  }

  const notification = await Notification.findOne({ user: payload._id })
    .populate({ path: "list.triggeredBy", select: "nickname profileImage" })
    .lean();

  notification.list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  let newNotificationCount = 0;

  notification.list.forEach((item) => {
    !item.isChecked && newNotificationCount++;
  });

  const response = { ...notification, newNotificationCount };

  res.send(response);
});

module.exports = getNotification;
