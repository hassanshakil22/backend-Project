import { Router } from "express";
import { logoutUser, refreshAccessToken, registerUser, userLogin } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
router.route("/login").post(userLogin)

// region : secured  routes

router.route("/logout").post( verifyJWT ,logoutUser)
router.route("/refreshToken").post(refreshAccessToken)


export default router;
