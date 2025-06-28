import { v2 as cloudinary } from "cloudinary";
import { error } from "console";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const uploadOnCloudinary = async (localfilePath) => {
  try {
    if (!localfilePath) {
      throw error("could not find path", localfilePath);
    } else {
     const uploadResponse = await cloudinary.uploader.upload(localfilePath, {
        resource_type: "auto",
      });

      console.log( "file uploaded successfully on cloudinary " ,  uploadResponse , "URL:", uploadResponse.url);
      return uploadResponse;
    }
  } catch (error) {
    console.log(error);
    fs.unlinkSync(localfilePath) // removes the locally saved temp file as the upload operation failed
    return null;
    
}
};


export  {uploadOnCloudinary} 
