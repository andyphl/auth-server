const express = require("express");
const routes = express.Router();

routes.get("/healthcheck", (req, res, next) => {
  res.sendStatus(200);
});

module.exports = routes;
