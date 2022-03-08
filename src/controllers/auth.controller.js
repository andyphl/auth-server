const { sequelize, User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.signUp = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    const saltRound = Number(process.env.SALT_ROUND) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRound);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "standard",
    });

    res.setHeader("set-cookie", [
      `token=${generateRefreshToken(user.uuid)}; httpOnly; samesite=lax`,
    ]);
    return res.status(201).json({
      message: "Signup success",
      user,
      token: generateAccessToken(user.uuid),
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      error,
    });
  }
};

exports.signIn = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      where: {
        email,
      },
      attributes: { exclude: ["password", "id"] },
      raw: true,
    });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.setHeader("set-cookie", [
        `refresh_token=${generateRefreshToken(
          user.uuid
        )}; httpOnly; samesite=lax`,
      ]);
      return res.status(200).json({
        message: "Signin successfully",

        token: generateAccessToken(user.uuid),
      });
    }

    return res.status(401).json({
      message: "Incorrect username or password, please try again",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Failed to signin",
      error,
    });
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refresh_token } = req.cookies;
    if (!refresh_token) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    const decode = jwt.verify(
      refresh_token,
      process.env.JWT_REFRESH_TOKEN_SECRET
    );

    // TODO: Rotate refresh token & blacklist previous refresh token
    res.status(200).send({
      message: "Token successfully refreshed",
      token: generateAccessToken(decode.uuid),
    });
  } catch (error) {
    return res.status(401).json({
      message: "Not authenticated",
    });
  }
};

exports.signout = async (req, res, next) => {
  res.setHeader("set-cookie", [`refresh_token=; httpOnly;`]);

  return res.status(200).send({
    message: "Logout successfully",
  });
};

exports.protected = async (req, res, next) => {
  return res.json({ ...req.user });
};

const generateRefreshToken = (uuid) => {
  return jwt.sign({ uuid }, process.env.JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.JWT_REFRESH_TOKEN_LIFE,
  });
};

const generateAccessToken = (uuid) => {
  return jwt.sign({ uuid }, process.env.JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_LIFE,
  });
};
