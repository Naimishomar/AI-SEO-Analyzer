import express from "express";
import KeywordTracking from "../models/keywordTracking.model.js";
import { keywordTracking } from "../services/keywordTracking.service.js";

export const addKeyword = async(req,res)=>{
    try {
        const {keyword, url} = req.body;
        if(!keyword || !url){
            return res.status(400).json({message: "Please provide a keyword and url", success: false});
        }
        let domain;
        try {
            const urlObj = new URL(url.startsWith("http") ? url : `http://${url}`);
            domain = urlObj.hostname.replace("www.", "");
        } catch (error) {
            return res.status(400).json({message: "Invalid url", success: false});
        }
        const existingKeyword = await KeywordTracking.findOne({userId: req.user.id, keyword: keyword.toLowerCase().trim(), domain});
        if(existingKeyword){
            return res.status(400).json({message: "Keyword already exists in this domain", success: false});
        }
        const tracking = await KeywordTracking.create({
            userId: req.user.id,
            keyword: keyword.toLowerCase().trim(),
            url : url.startsWith("http") ? url : `https://${url}`,
            domain,
            status: "checking"
        })
        keywordTracking(tracking);
        return res.status(201).json({message: "Keyword tracking started", success: true, tracking});
    } catch (error) {
        console.log("Internal server error:", error.message);
        if(error.code === 11000){
            return res.status(400).json({message: "Keyword already exists in this domain", success: false});
        }
        return res.status(500).json({message: "Internal server error", success: false, error: error.message});
    }
}

export const getKeywords = async(req,res)=>{
    try {
        const keywords = await KeywordTracking.find({userId: req.user.id}).sort({createdAt: -1}).select("-rankHistory");
        if(!keywords.length){
            return res.status(404).json({message: "No keywords found", success: false});
        }
        return res.json({message: "Keywords found", success: true, keywords});
    } catch (error) {
        console.error("Internal server error:", error.message);
        return res.status(500).json({message: "Internal server error", success: false});
    }
}

export const getKeyword = async(req,res)=>{
    try {
        const tracking = await KeywordTracking.findOne({_id: req.params.id, userId: req.user.id});
        if(!tracking){
            return res.status(404).json({message: "Keyword not found", success: false});
        }
        return res.json({message: "Keywords found", success: true, tracking});    
    } catch (error) {
        console.error("Internal server error:", error.message);
        return res.status(500).json({message: "Internal server error", success: false});      
    }
}

export const refreshKeyword = async(req,res)=>{
    try {
        const tracking = await KeywordTracking.findOne({_id: req.params.id, userId: req.user.id});
        if(!tracking){
            return res.status(404).json({message: "Keyword not found", success: false});
        }
        tracking.status = "checking";
        await tracking.save();
        res.json({message: "Keyword refreshed, rank check started", success: true, tracking});
        keywordTracking(tracking);
    } catch (error) {
        console.error("Internal server error:", error.message);
        return res.status(500).json({message: "Internal server error", success: false});        
    }
}

export const deleteKeyword = async(req,res)=>{
    try {
        const tracking = await KeywordTracking.findByIdAndDelete({_id: req.params.id, userId: req.user.id});
        if(!tracking){
            return res.status(404).json({message: "Keyword not found", success: false});
        }
        return res.json({message: "Keyword tracking deleted", success: true});
    } catch (error) {
        console.error("Internal server error:", error.message);
        return res.status(500).json({message: "Internal server error", success: false});        
    }
}

export const toggleTracking = async(req,res)=>{
    try {
        const tracking = await KeywordTracking.findOne({_id: req.params.id, userId: req.user.id});
        if(!tracking){
            return res.status(404).json({message: "Keyword not found", success: false});
        }
        tracking.active = !tracking.active;
        await tracking.save();
        return res.json({message: "Keyword tracking toggled", success: true, tracking});
    } catch (error) {
        console.error("Internal server error:", error.message);
        return res.status(500).json({message: "Internal server error", success: false});         
    }
}