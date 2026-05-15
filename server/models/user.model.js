import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    password:{
        type: String,
        required: true,
        minLength: 5,
        trim: true
    },
    plan:{
        type: String,
        enum: ["free", "pro"],
        default: "free"
    },
    analysisCount:{
        type: Number,
        default: 0
    },
    lastAnalysisDate:{
        type: Date,
        default: null
    }
},{timestamps: true});

const User = mongoose.model("User", UserSchema);
export default User;