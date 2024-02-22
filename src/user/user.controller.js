const ErrorHandler = require("../../utils/errorHandler");
const { userModel, otpModel } = require("./user.model");
const catchAsyncError = require("../../utils/catchAsyncError");
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

  const user = await userModel
    .scope("withPassword")
    .findOne({ where: { email } });

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

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  console.log("forgot password", req.body);

  if (!req.body.email) {
    return next(
      new ErrorHandler("Please provide a valid email.", StatusCodes.BAD_REQUEST)
    );
  }

  const user = await userModel.findOne({ where: { email: req.body.email } });

  if (!user) {
    return next(
      new ErrorHandler(
        "User not found with entered credentials",
        StatusCodes.NOT_FOUND
      )
    );
  }

  const otp = generateOTP();

  await otpModel.create({
    otp,
    userId: user.id,
  });

  const message = `<b>Your password reset OTP is :- <h2>${otp}</h2></b><div>If you have not requested this email then, please ignore it.</div>`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset",
      message,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    await otpModel.destroy({ where: { otp, userId: user.id } });
    return next(
      new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
});

exports.verifyOtp = catchAsyncError(async (req, res, next) => {
  const { otp } = req.body;
  if (!otp) {
    return next(new ErrorHandler("Missing OTP", StatusCodes.BAD_REQUEST));
  }

  const otpInstance = await otpModel.findOne({ where: { otp } });

  if (!otpInstance || !otpInstance.isValid()) {
    if (otpInstance) {
      await otpModel.destroy({ where: { id: otpInstance.id } });
    }

    return next(
      new ErrorHandler(
        "OTP is invalid or has been expired",
        StatusCodes.BAD_REQUEST
      )
    );
  }

  await otpModel.destroy({ where: { id: otpInstance.id } });

  res
    .status(StatusCodes.OK)
    .json({ message: "OTP verified successfully", userId: otpInstance.userId });
});

exports.updatePassword = catchAsyncError(async (req, res, next) => {
  console.log("Update Password", req.body);

  const userId = req.userId || req.body.userId;

  const { password } = req.body;

  const user = await userModel.findOne({ where: { id: userId } });

  if (!user) {
    return next(new ErrorHandler("User not found", StatusCodes.NOT_FOUND));
  }

  user.password = password;

  await user.save();

  res.status(StatusCodes.OK).json({ message: "Password Updated Successfully" });
});

exports.getProfile = catchAsyncError(async (req, res, next) => {
  console.log("User profile", req.userId);

  const { userId } = req;

  const user = await userModel.findByPk(userId);

  if (!user)
    return next(new ErrorHandler("User not found", StatusCodes.NOT_FOUND));

  res.status(StatusCodes.OK).json({ user });
});
