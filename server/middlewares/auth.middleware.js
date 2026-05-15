import express from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = async(req,resizeBy,next)=>{
    try {
        const token = req.cookies.token || req.headers.authorization.split(" ")[1];
        if(!token){
            return res.status(401).json({message: "Unauthorized", success: false});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({message: "Unauthorized", success: false});
        }
        req.user = decoded;
        next();
    } catch (error) {
        console.log("Internal server error:", error.message);
        return res.status(500).json({message: "Internal server error", success: false});
    }
}