const ErrorHandler = require("../../utils/errorHandler");
const { userModel, otpModel } = require("./user.model");
const catchAsyncError = require("../../utils/catchAsyncError");
const { Op } = require("sequelize");
const sendEmail = require("../../utils/sendEmail");
const generateOTP = require("../../utils/otpGenerator");
const { StatusCodes } = require("http-status-codes");
const { s3Uploadv2 } = require("../../utils/s3");

exports.register = catchAsyncError(async (req, res, next) => {
  console.log("register", req.body);
  const { dob } = req.body;
  const imageFile = req.file;
  const imageUrl = imageFile && (await s3Uploadv2(imageFile));
  let user;

  user = imageUrl
    ? await userModel.create({
        ...req.body,
        dob: new Date(dob),
        avatar: imageUrl.Location,
      })
    : await userModel.create({
        ...req.body,
        dob: new Date(dob),
      });

  const token = user.getJWTToken();
  res.status(StatusCodes.CREATED).json({ user, token });
});

exports.login = catchAsyncError(async (req, res, next) => {
  console.log("login", req.body);
  const { email, password } = req.body;
  const user = await userModel.scope("withPassword").findOne({ email: email });

  if (!user) {
    return next(
      new ErrorHandler(
        "User not found with entered credentials",
        StatusCodes.NOT_FOUND
      )
    );
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return next(
      new ErrorHandler("Invalid Credentials", StatusCodes.BAD_REQUEST)
    );
  }

  const token = user.getJWTToken();
  res.status(StatusCodes.OK).json({ user, token });
});
