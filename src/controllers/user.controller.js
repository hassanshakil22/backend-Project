import { asyncHandler } from "../utils/async_handler.js";
import { APIerror } from "../utils/Api_ErrorHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/file_upload.js";
import { ApiResponse } from "../utils/Api_response.js";
import jwt from "jsonwebtoken";
import e from "cors";
const generateTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAcessToken();
    const refreshToken = await user.generateRefreshToken();
    console.log(
      `refresh token before saving !!  ${JSON.stringify(refreshToken)}`
    );
    console.log(
      `access token before sending !!  ${JSON.stringify(accessToken)}`
    );
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    throw new APIerror(
      500,
      `some error occured while creating tokens ${error}`
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // GET USER DETAILS
  //VALIDATION
  // CEHCK EXISTANCE
  // CHECK FOR IMAGES , avatar required
  //UPLOAD CLOUDINARY

  console.log("request body:", req.body);
  console.log("request files:", req.files);

  const { username, email, fullName, password } = req.body;

  //validation
  // if (!username || !email || !fullName || !password) {
  //   throw new APIerror(400, "All fields are required");
  // }

  if ([username, email, fullName, password].some((field) => field == "")) {
    throw new APIerror(400, "All fields are required");
  }

  // checking existance
  const userExists = await User.findOne({
    $or: [{ username }, { email }],
  });
  console.log(`User Exists  ${userExists}`);

  if (userExists) {
    throw new APIerror(409, "User with email or username already exist ");
  }
  //check images
  console.log(`   req.files?.avatar[0]?.path
${req.files?.avatar?.[0]?.path}`);
  console.log(`   req.files
  ${JSON.stringify(req.files)}`);

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  // let coverImageLocalPath ;
  // if (
  // doing like this as it can be null and would giving an error for undefined as we were trying to access 0th element of an undefined array
  //   req.files &&
  //   Array.isArray(req.files.coverImage) &&
  //   req.files.coverImage.length > 0
  // ) {
  //   coverImageLocalPath = req.files.coverImage[0].path;
  // }

  if (!avatarLocalPath) {
    throw new APIerror(400, "Avatar is required");
  }

  // uploading on cloudinary

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // checking on cloudinary

  if (!avatar) {
    throw new APIerror(400, "Avatar is required");
  }

  // now create object in db

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  //check if user is created actually

  const isUserCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  // user not created
  if (!isUserCreated) {
    throw new APIerror(500, "Something went wrong wile registering the user ");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, isUserCreated, "User created Successfully"));
});

const userLogin = asyncHandler(async (req, res) => {
  console.log(req.body);

  const { email, username, password } = req.body;

  // Use either email or username, whichever is provided
  // const identifier = req.body.email || req.body.username;

  // if (!identifier) {
  //   throw new APIerror(400, "username or email is required");
  // }

  if (!(username || email)) {
    throw new APIerror(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username: username }, { email: email }],
  });
  if (!user) {
    throw new APIerror(404, "username or email Not Found");
  }

  const ispasswordValid = user.isPasswordCorrect(password);
  if (!ispasswordValid) {
    throw new APIerror(404, "Incorrect password ");
  }

  const { refreshToken, accessToken } = await generateTokens(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accesstoken: accessToken,
          refreshToken: refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new APIerror(401, "Unauthorized Request");
  }
  try {
    const decode = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = User.findById(decode?._id);

    if (!user) {
      throw new APIerror(401, "Invalid Refresh token");
    }

    if (user?.refreshToken !== incomingRefreshToken) {
      throw new APIerror(401, "Invalid Refresh token");
    }

    const { refreshToken, accessToken } = await generateTokens(user._id);
    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: user,
            accesstoken: accessToken,
            refreshToken: refreshToken,
          },
          "User logged in successfully"
        )
      );
  } catch (error) {
    throw new APIerror(401, `Invalid Refresh token ${error.message}`);
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.body._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new APIerror(400, "Incorrect Old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;
  res.status(200).json(new ApiResponse(200, user, "User Fetched Successfully"));
});

const updateUser = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!(fullName || email)) {
    throw new APIerror(400, "fullName or email required");
  }

  const updateObject = {};

  if (email) updateObject.email = email;
  if (fullName) updateObject.fullName = fullName;

  const user = User.findByIdAndUpdate(req.user._id, updateObject, {
    new: true,
  }).select("-password");
  return res
    .status(200)
    .json(
      new ApiResponse(200, user, `User ${updateObject} updated successfully`)
    );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const localavatarPath = req.file?.avatar?.[0]?.path;

  if (!localavatarPath) {
    throw new APIerror(400, "Avatar Required");
  }

  const avatar = await uploadOnCloudinary(localavatarPath);

  if (!avatar) {
    throw new APIerror(400, "Error while uploading avatar on Cloud");
  }

  const user = User.findByIdAndUpdate(
    req.user._id,
    {
      avatar: avatar.url,
    },
    {
      new: true,
    }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const localCoverImagePath = req.file?.coverImage?.[0]?.path;

  if (!localCoverImagePath) {
    throw new APIerror(400, "Avatar Required");
  }

  const coverImage = await uploadOnCloudinary(localCoverImagePath);

  if (!coverImage) {
    throw new APIerror(400, "Error while uploading coverImage on Cloud");
  }

  const user = User.findByIdAndUpdate(
    req.user._id,
    {
      coverImage: coverImage.url,
    },
    {
      new: true,
    }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "coverImage updated successfully"));
});

export {
  registerUser,
  userLogin,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateUser,
  updateUserAvatar,
  updateUserCoverImage,
};
