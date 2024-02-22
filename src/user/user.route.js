const express = require("express");
const router = express.Router();
const { auth } = require("../../middlewares/auth");
const { register, login } = require("./user.controller");
const { user } = require("../../middlewares/validate");
const { upload } = require("../../utils/s3");

router.post("/register", upload.single("image"), user.post, register);
router.post("/login", login);
module.exports = router;
