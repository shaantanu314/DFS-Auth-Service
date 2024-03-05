const bcrypt = require("bcrypt");
const { eq, and, lt } = require("drizzle-orm");
const _omit = require("lodash/omit");
const crypto = require("crypto");

const APIError = require("../../utils/APIError");
const { signToken } = require("../../utils/jwt");

const { users } = require("../../db/schemas/userSchema");
const {
  refreshToken: refreshTokenSchema,
} = require("../../db/schemas/refreshTokenSchema");
const db = require("../../db");

const {
  hasRefreshTokenExpired,
  getRefreshToken,
  getUserPermissions,
} = require("./helpers");

const config = require("../../config");

const signin = async (req, res, next) => {
  try {
    const refreshTokenCookie = getRefreshToken(req),
      hasExpired = await hasRefreshTokenExpired(refreshTokenCookie);

    // In case the token has not expired
    if (refreshTokenCookie && !hasExpired) {
      throw new APIError(400, "User already signed in");
    }

    const { user_email, user_password } = req.body;

    const user = (
      await db.select().from(users).where(eq(users.user_email, user_email))
    )[0];

    if (!user) {
      throw new APIError(400, "Invalid Credentials");
    }

    const should_authenticate = await bcrypt.compare(
      user_password,
      user.user_password
    );

    if (!should_authenticate) {
      throw new APIError(400, "Invalid Credentials");
    }

    // get user permissions
    const user_permissions = await getUserPermissions(user.user_id);

    // Create a refresh token
    const refreshToken = crypto.randomBytes(64).toString("base64");
    const expires_at = new Date().getTime() + config.refresh_token_expiry_time;

    await db.insert(refreshTokenSchema).values({
      user_id: user.user_id,
      token: refreshToken,
      expires_at: new Date(expires_at),
    });

    // Create an access token
    const accessToken = signToken({
      user,
      user_permissions,
      expires_at: new Date().getTime() + config.access_token_expiry_time,
    }); // Todo: add user roles here

    // set the cookie with the response
    res.cookie("dfs-auth-refresh-token", refreshToken, {
      secure: false,
      httpOnly: true,
      sameSite: "Lax",
      expire: expires_at,
    });

    res.status(200).send({
      data: {
        user: _omit(user, ["user_password", "created_at"]),
        user_permissions,
        accessToken,
      },
      message: "user logged-in successfully",
      error: false,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = signin;
