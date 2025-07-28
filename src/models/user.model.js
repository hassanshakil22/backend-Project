import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: { type: String, required: true, trim: true, index: true },
    avatar: {
      type: String, // cloudinary url service will give url
      required: true,
    },
    coverImage: {
      type: String, // cloudinary url service will give url
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
      lowercase: true,
      trim: true,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);
//using pre hook to encrypt password just before saving to database (with check that password is modified)
userSchema.pre("save", async function (next) {
  // next as param becasue its a middleware and middlewares are executed in a sequence next manner
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
//making a custom method to mongoose to check the given user pw and the encrypted data base one
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};
//making a custom method to mongoose to generate acess token

userSchema.methods.generateAcessToken = async function () {
  return jwt.sign(
    //payload
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    // secret key
    process.env.ACCESS_TOKEN_SECRET,
    // object of expiry
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
//making a custom method to mongoose to generate Referesh token

userSchema.methods.generateRefereshToken = async function () {
  return jwt.sign(
    //payload
    {
      _id: this._id,
    },
    // secret key
    process.env.REFERESH_TOEKN_SECRET,
    // object of expiry
    {
      expiresIn: process.env.REFERESH_TOEKN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
