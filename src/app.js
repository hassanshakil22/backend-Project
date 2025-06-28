import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express();
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit:"16kb"})) // accept json
app.use(express.urlencoded({extended:true , limit:"20kb"})) // url usage can be encoded udnerstand it
app.use(express.static("public")) // giving directory name wher we want to save assets for our server 
app.use(cookieParser())

    
// Routes 
import userRouter from "./routes/user.routes.js"
app.use("/api/v1/users",userRouter)

export { app }