import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

    const connectDB = async () => {
        try {
            const connectionInstance = await  mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
            console.log(`\n mongoDB connected ! DB host : ${connectionInstance.connection.host}`);
            
            
        } catch (error) {
            console.error("Error : MONGO-DB connection error",error);
            process.exit(1); // process exiting 

        }
    }

export default connectDB;