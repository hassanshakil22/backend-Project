import { asyncHandler } from "../utils/async_handler.js";
import { APIerror } from "../utils/Api_ErrorHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/file_upload.js";
import { ApiResponse } from "../utils/Api_response.js";

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
  if (!username || !email || !fullName || !password) {
    throw new APIerror(400, "All fields are required");
  }

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
  //   console.log(`   req.files
  // ${req.files}`);

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
  const coverImage =  await uploadOnCloudinary(coverImageLocalPath)


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

export { registerUser };
