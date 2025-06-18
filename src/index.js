// require('dotenv').config({path : "/.env"})
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";



dotenv.config({path : "./env"})
connectDB().then(
    ()=>{
        app.on("error",(err)=>{
            console.log("Error : " , err);
            throw err; 
            
        })
        app.listen(process.env.PORT || 8000 , ()=>
        {
            `SERVER IS RUNNING AT PORT ${process.env.PORT}`
        }
        )
    }
)
.catch((err)=>{console.log("MONGO db connection failed ! ", err);
}); 

 /*
 FIRST APPRAOCH
import express, { application } from "express";

const app = express();

IFEE DOWN BELOW NOT IFELSE IFEE 
( async ()=>{
    try {
        db = await  mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error" , (error)=>{
            console.log("Error : ", error );
            throw error;
        })
        app.listen(process.env.PORT , ()=>{
            console.log(`application is listening on ${process.env.PORT}` )
        })
    } catch (error) {
        console.error("ERROR : ", error);
        throw error

    }
} )() */