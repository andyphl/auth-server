const jwt = require("jsonwebtoken");
const { User } = require("../models");
require("dotenv").config();

exports.isAuthenticated = async (req, res, next) => {
  // Check if authorization header exist
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.sendStatus(401);
  }

  const token = authHeader.split(" ")[1];
  try {
    const decode = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);

    // Attach user's details to request
    req.user = await User.findOne({
      where: {
        uuid: decode.uuid,
      },
      attributes: { exclude: ["password", "id"] },
      raw: true,
    });

    next();
  } catch (error) {
    return res.sendStatus(403);
  }
};
