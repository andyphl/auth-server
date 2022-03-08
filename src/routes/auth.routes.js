const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { isAuthenticated } = require("../middleware/auth.middleware");

router.post("/signup", authController.signUp);
router.post("/signin", authController.signIn);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authController.signout);
router.get("/protected", isAuthenticated, authController.protected);

module.exports = router;
