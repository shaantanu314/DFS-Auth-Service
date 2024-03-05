const APIError = require("../../utils/APIError");

const { deleteRefreshToken, getRefreshToken } = require("./helpers");

const logoutUser = async (req, res, next) => {
  try {
    const refreshTokenCookie = getRefreshToken(req);

    if (!refreshTokenCookie) {
      throw new APIError(400, "Invalid Request");
    }

    await deleteRefreshToken(refreshTokenCookie);

    res.clearCookie("dfs-auth-refresh-token", { path: "/" });

    res.status(200).send({
      message: "user logged out",
      error: false,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = logoutUser;
