import mongoose from "mongoose";

const RankEntrySchema = new mongoose.Schema({
    date:{
        type: Date,
        required: true
    },
    position:{
        type: Number,
        default: null
    },
    page:{
        type: Number,
        default: null
    },
    title:{
        type: String,
        default: ""
    },
    snippet:{
        type: String,
        default: ""
    }
}, { _id: false});

const CompetitorSchema = new mongoose.Schema({
    position:{
        type: Number,
        default: null
    },
    url:{
        type: String,
        required: true,
        trim: true,
    },
    domain:{
        type: String,
        required: true,
    },
    title:{
        type: String,
        default: ""
    },
    snippet:{
        type: String,
        default: ""
    }
}, { _id: false});

const KeywordTrackingSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    keyword:{
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    url:{
        type: String,
        required: true,
        trim: true,
    },
    domain:{
        type: String,
        required: true,
    },
    currentPosition:{
        type: Number,
        default: null
    },
    currentPage:{
        type: Number,
        default: null
    },
    bestPosition:{
        type: Number,
        default: null
    },
    positionChange:{
        type: Number,
        default: 0
    },
    rankHistory:[ RankEntrySchema ],
    competitors: [ CompetitorSchema ],
    active:{
        type: Boolean,
        default: true
    },
    lastChecked:{
        type: Date,
        default: null
    },
    status:{
        type: String,
        enum: ["pending", "checking", "completed", "failed"],
        default: "pending"
    }
}, {timestamps: true});

KeywordTrackingSchema.index({ userId: 1, keyword: 1, domain: 1 }, { unique: true });

const KeywordTracking = mongoose.model("KeywordTracking", KeywordTrackingSchema);
export default KeywordTracking;