const express = require("express");
const routes = express.Router();

routes.get("/healthcheck", (req, res, next) => {
  res.sendStatus(200);
});

const authRoutes = require("./auth.routes");
routes.use("/auth", authRoutes);

module.exports = routes;
