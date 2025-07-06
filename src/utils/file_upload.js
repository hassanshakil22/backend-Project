import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const uploadOnCloudinary = async (localfilePath) => {
  try {
    if (!localfilePath) {
      return null
    } else {
      const uploadResponse = await cloudinary.uploader.upload(localfilePath, {
        resource_type: "auto",
      });

      console.log(
        "file uploaded successfully on cloudinary ",
        uploadResponse,
        "URL:",
        uploadResponse.url
      );
      console.log("unlinking local file path ", localfilePath);
      
      fs.unlinkSync(localfilePath);
      return uploadResponse;
    }
  } catch (error) {
    console.log(error);
    fs.unlinkSync(localfilePath); // removes the locally saved temp file as the upload operation failed
    return null;
  }
};

export { uploadOnCloudinary };
