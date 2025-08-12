import { Router } from "express";
import {
  changePassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateUser,
  updateUserAvatar,
  updateUserCoverImage,
  userLogin,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const userRouter = Router();
userRouter.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
userRouter.route("/login").post(userLogin);

// region : secured  routes

userRouter.route("/logout").post(verifyJWT, logoutUser);
userRouter.route("/refreshToken").post(refreshAccessToken);
userRouter.route("/changePassword").post(verifyJWT, changePassword);
userRouter.route("/getCurrentUser").get(verifyJWT, getCurrentUser);
userRouter.route("/updateUserDetails").patch(verifyJWT, updateUser);
userRouter
  .route("/updateAvatar")
  .patch(verifyJWT, upload.single('avatar'), updateUserAvatar);
userRouter
  .route("/updateCoverImage")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
userRouter.route("/channel/:username").get(verifyJWT,getUserChannelProfile )

userRouter.route("/watchHistory").get(verifyJWT,getWatchHistory)

export default userRouter;
