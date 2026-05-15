import express from "express";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const generateToken = async(id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "30d"});
}

export const register = async(req,res)=>{
    try {
        const {name, email, password} = req.body;
        if(!name || !email || !password){
            return res.status(400).json({message: "Please provide all the required fields", success: false});
        }
        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({message: "Email already exists", success: false});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({
            name, 
            email,
            password: hashedPassword
        });
        const token = await generateToken(newUser._id);
        return res.status(201).json({message: "User created successfully", success: true, user: newUser, token});
    } catch (error) {
        console.log("Internal server error:", error.message);
        return res.status(500).json({message: "Internal server error", success: false});
    }
}

export const login = async(req,res)=>{
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({message: "Please provide all the required fields", success: false});
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "Invalid email or password", success: false});
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return res.status(400).json({message: "Invalid email or password", success: false});
        }
        const token = await generateToken(user._id);
        return res.status(200).json({message: "Login successful", success: true, user, token});
    } catch (error) {
        console.log("Internal server error:", error.message);
        return res.status(500).json({message: "Internal server error", success: false});
    }
}

export const getUser = async(req,res)=>{
    try {
        const user = await User.findById(req.user.id).select("-password");
        if(!user){
            return res.status(404).json({message: "User not found", success: false});
        }
        return res.status(200).json({message: "User found", success: true, user});
    } catch (error) {
        console.log("Internal server error:", error.message);
        return res.status(500).json({message: "Internal server error", success: false});
    }
}