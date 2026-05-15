import mongoose from "mongoose";
import { configDotenv } from "dotenv";

configDotenv({quiet: true});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI);
        console.log("Connected to Database✅");
    } catch (error) {
        console.log(error);
    }
};

export default connectDB;