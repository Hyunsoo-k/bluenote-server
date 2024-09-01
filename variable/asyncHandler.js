const asyncHandler = (handler) => {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Server Error" });
    }
  };
};

module.exports = { asyncHandler };