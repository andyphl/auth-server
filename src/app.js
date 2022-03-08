const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const routes = require("./routes/routes");
const { sequelize } = require("./models");

const app = express();

app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_HOST,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use("/api", routes);

app.listen(process.env.PORT || 5000, async () => {
  console.log(`Server listening on port ${process.env.PORT || 5000}`);

  // load up database
  await sequelize.authenticate();
});
