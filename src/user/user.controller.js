const ErrorHandler = require("../../utils/errorHandler");
const { userModel, otpModel } = require("./user.model");
const catchAsyncError = require("../../utils/catchAsyncError");
const { Op } = require("sequelize");
const sendEmail = require("../../utils/sendEmail");
const generateOTP = require("../../utils/otpGenerator");
const { StatusCodes } = require("http-status-codes");

exports.register = catchAsyncError(async (req, res, next) => {
  console.log("register", req.body);
  const { dob } = req.body;
  let user = await userModel.create({
    ...req.body,
    dob: new Date(dob),
  });
  const token = user.getJWTToken();
  res.status(StatusCodes.CREATED).json({ user, token });
});
