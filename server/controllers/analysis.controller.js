import Analysis from "../models/analysis.model.js";
import { analyseSeoData } from "../services/gemini.service.js";
import { scrapeUrl } from "../services/scrapper.service.js";

export const analyseUrl = async(req,res)=>{
    try {
        const { url } = req.body;
        if(!url){
            return res.status(400).json({message: "Please provide a URL", success: false});
        }
        //validate url
        let validUrl;
        try {
            validUrl = new URL(url.startsWith("http") ? url : `http://${url}`);
        } catch (error) {
            return res.status(400).json({message: "Invalid URL", success: false});
        }
        //create analysis record with pending status
        const analysis = await Analysis.create({
            userId: req.user.id,
            url: validUrl.href,
            status: "processing"
        });
        res.status(201).json({message: "Analysis started", success: true, analysisId: analysis._id});

        try {
            const scrapeResult = await scrapeUrl(validUrl.href);
            if(!scrapeResult.success){
                analysis.status = "failed";
                await analysis.save();
                return;
            }
            //Analyse with Gemini AI
            const aiResult = await analyseSeoData(scrapeResult.data);
            if(!aiResult.success){
                analysis.status = "failed";
                await analysis.save();
                return;
            }
            analysis.overallScore = aiResult.data.overallScore || 0;
            analysis.categories = aiResult.data.categories || {};
            analysis.metaData = scrapeResult.data.metaData || {};
            analysis.headings = scrapeResult.data.headings || {};
            analysis.links = scrapeResult.data.links || {};
            analysis.images = scrapeResult.data.images || {};
            analysis.keywords = aiResult.data.keywords || [];
            analysis.issues = aiResult.data.issues || [];
            analysis.loadTime = scrapeResult.data.loadTime || 0;
            analysis.pageSize = scrapeResult.data.pageSize || 0;
            analysis.wordCount = scrapeResult.data.wordCount || 0;
            analysis.status = "completed";
            await analysis.save();
        } catch (bgError) {
            console.error("Background scrape error:", bgError.message);
            try {
                analysis.status = "failed";
                await analysis.save();
            } catch (saveError) {
                console.error("Error saving analysis:", saveError.message);
            }
        }
    } catch (error) {
        console.error("Analysis error:", error.message);
        if(!res.headersSent) res.status(500).json({message: "Internal server error", success: false});
    }
}

export const getAnalysis = async(req,res)=>{
    try {
        const analysis = await Analysis.findOne({_id: req.params.id, userId: req.user.id});
        if(!analysis){
            return res.status(404).json({message: "Analysis not found", success: false});
        }
        res.json({message: "Analysis found", success: true, analysis});
    } catch (error) {
        console.error("Analysis error:", error.message);
        return res.status(500).json({message: "Internal server error", success: false});
    }
}

export const getAnalyses = async(req,res)=>{
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page-1)*limit;
        const analyses = await Analysis.find({userId: req.user.id}).sort({createdAt: -1}).skip(skip).limit(limit).select("-issues -keywords");
        const total = await Analysis.countDocuments({userId: req.user.id});
        res.json({message: "Analyses found", success: true, analyses, pagination: {page, limit, total, totalPages: Math.ceil(total/limit)}});
    } catch (error) {
        console.error("Analyses error:", error.message);
        return res.status(500).json({message: "Internal server error", success: false});
    }
}

export const deleteAnalysis = async(req,res)=>{
    try {
        await Analysis.findOneAndDelete({_id: req.params.id, userId: req.user.id});
        res.json({message: "Analysis Deleted", success: true});    
    } catch (error) {
        console.error("Analysis error:", error.message);
        return res.status(500).json({message: "Internal server error", success: false});
    }
}