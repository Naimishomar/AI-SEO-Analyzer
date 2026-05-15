import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import authRoute from "./routes/auth.route.js";
import rankRoute from "./routes/rank.route.js";
import analysisRoute from "./routes/analysis.route.js";
dotenv.config({quiet: true});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: "*",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/rank", rankRoute);
app.use("/api/analysis", analysisRoute);

app.get("/", (req,res)=>{
    res.send("Server never gets down!");
})

const startServer = async () => {
   try {
      await connectDB();
      app.listen(PORT, () => {
         console.log(`Server is listening at PORT:${PORT}🚀`);
      });
   } catch (error) {
      console.log("DB connection failed", error);
   }
};

startServer();