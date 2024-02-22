const express = require("express");
const router = express.Router();
const { auth } = require("../../middlewares/auth");
const {
  register,
  login,
  forgotPassword,
  verifyOtp,
  updatePassword,
  getProfile,
} = require("./user.controller");
const { user } = require("../../middlewares/validate");
const { upload } = require("../../utils/s3");

router.post("/register", upload.single("image"), user.post, register);
router.post("/login", user.login, login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.put("/change-password", user.updatePassword, auth, updatePassword);
router.put("/reset-password", user.updatePassword, updatePassword);
router.get("/profile", auth, getProfile);

module.exports = router;
