import express from "express"
import cors from "cors";
import cookieParser from  "cookie-parser";
import dotenv from "dotenv";
import compression from "compression";
import fs from "fs";
import path from "path";
import morgan from "morgan";
import mainRouter from "./routes/index";
import {connectdb} from "./database/index";

dotenv.config({path:".env"})
connectdb();
const app = express();
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(cors({origin: true, credentials: true}));
app.use(express.urlencoded({ extended: true }));
const accessLogStream = fs.createWriteStream(path.join(__dirname, '../logs/access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

//global routing
app.use("/api",mainRouter)

const PORT:string | number = process.env.PORT || 4000;

app.listen(PORT,()=>{
     console.log(`sercer running on port ${PORT}`)
})