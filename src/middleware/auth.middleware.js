const jwt = require("jsonwebtoken");
const { User } = require("../models");
require("dotenv").config();

exports.isAuthenticated = async (req, res, next) => {
  try {
    // Authorization: Bearer token
    if (req.headers.authorization?.startsWith("Bearer")) {
      const token = req.headers.authorization.split(" ")[1];
      const decode = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);

      req.user = await User.findOne({
        where: {
          uuid: decode.uuid,
        },
        attributes: { exclude: ["password", "id"] },
        raw: true,
      });

      next();
    } else {
      throw new Error();
    }
  } catch (error) {
    res.status(401).json({
      message: "Not authenticated",
    });
  }
};
