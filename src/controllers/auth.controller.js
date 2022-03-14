const { User } = require("../models");
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

    return res.status(201).json({
      message: "Signup success",
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
  if (!email || !password)
    return res.status(400).json({
      message: "Email and password are required",
    });

  const user = await User.findOne({
    where: {
      email,
    },
  });

  if (user && (await bcrypt.compare(password, user.password))) {
    const refresh_token = generateRefreshToken(user.uuid);

    user.refresh_token = refresh_token;
    await user.save();

    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Signin successfully",
      user: {
        ...user.dataValues,
        id: undefined,
        password: undefined,
      },
      token: generateAccessToken(user.uuid),
    });
  }

  return res.status(401).json({
    message: "Incorrect email or password, please try again",
  });
};

exports.refreshToken = async (req, res, next) => {
  const { refresh_token } = req.cookies;
  if (!refresh_token) {
    return res.status(401).json({
      message: "Not authenticated",
    });
  }

  const user = await User.findOne({
    where: {
      refresh_token,
    },
  });

  if (!user) {
    return res.sendStatus(403);
  }

  try {
    const decode = jwt.verify(
      refresh_token,
      process.env.JWT_REFRESH_TOKEN_SECRET
    );

    if (decode.uuid !== user.uuid) {
      return res.sendStatus(403);
    }

    // TODO: Rotate refresh token & blacklist previous refresh token
    res.status(200).send({
      message: "Token successfully refreshed",
      token: generateAccessToken(decode.uuid),
    });
  } catch (error) {
    return res.sendStatus(403);
  }
};

exports.signout = async (req, res, next) => {
  const { refresh_token } = req.cookies;
  if (!refresh_token) {
    return res.sendStatus(204);
  }

  const user = await User.findOne({
    where: {
      refresh_token,
    },
  });

  if (!user) {
    res.clearCookie("refresh_token", {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.sendStatus(204);
  }

  user.refresh_token = null;
  await user.save();

  res.clearCookie("refresh_token", {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  return res.status(204);
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
