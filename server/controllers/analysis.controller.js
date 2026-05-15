import Analysis from "../models/analysis.model.js";


export const analyseUrl = async(req,res)=>{
    try {
        const { url } = req.body;
        if(!url){
            return res.status(400).json({message: "Please provide a URL", success: false});
        }
        //validate url
        let validUrl;
        try {
            validUrl = new URL(url.startWith("http") ? url : `http://${url}`);
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
            if(scrapeResult.success){
                analysis.status = "failed";
                await analysis.save();
                return;
            }
            //Analyse with Gemini AI
            
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
        
    } catch (error) {
        console.error("Analysis error:", error.message);
        return res.status(500).json({message: "Internal server error", success: false});
    }
}

export const getAnalyses = async(req,res)=>{
    try {
        
    } catch (error) {
        console.error("Analysis error:", error.message);
        return res.status(500).json({message: "Internal server error", success: false});
    }
}

export const deleteAnalysis = async(req,res)=>{
    try {
        
    } catch (error) {
        console.error("Analysis error:", error.message);
        return res.status(500).json({message: "Internal server error", success: false});
    }
}