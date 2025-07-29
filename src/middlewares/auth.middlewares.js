import { User } from "../models/user.model.js";
import { APIerror } from "../utils/Api_ErrorHandler.js";
import { asyncHandler } from "../utils/async_handler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const accessToken =
      req.cookies?. accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    // we get this header  {Authorization : Bearer <Token>}   so removeing the beater part to get token only
  
    if (!accessToken) {
      throw new APIerror(401, "Unauthorized ", ["token required"]);
    }
  
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded?._id).select("-password -refreshToken");
  
    if (!user) {
      throw new APIerror(401, "Invalid Access Token");
    }
  
    req.user = user; // making my request have the user before going to the controller
    next();   
  } catch (error) {
    throw new APIerror(401,error?.message || "Invalid Access Token")
  }
});
