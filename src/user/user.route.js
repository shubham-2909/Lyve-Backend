const express = require("express");
const router = express.Router();
const { auth } = require("../../middlewares/auth");
const { register } = require("./user.controller");
const { user } = require("../../middlewares/validate");

router.post("/register", register);

module.exports = router;
