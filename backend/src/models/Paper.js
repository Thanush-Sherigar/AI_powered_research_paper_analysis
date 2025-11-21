import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
}, { _id: false });

const paperSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: [true, 'Paper title is required'],
            trim: true,
        },
        authors: [
            {
                type: String,
                trim: true,
            },
        ],
        abstract: {
            type: String,
            trim: true,
        },
        keywords: [
            {
                type: String,
                trim: true,
            },
        ],
        sourceType: {
            type: String,
            enum: ['upload', 'doi', 'arxiv', 'url'],
            required: true,
        },
        sourceId: {
            type: String,
            trim: true,
        },
        sections: [sectionSchema],
        rawText: {
            type: String,
            required: true,
        },
        cleanText: {
            type: String,
            required: true,
        },
        metadata: {
            year: Number,
            venue: String,
            doi: String,
            arxivId: String,
            url: String,
            pageCount: Number,
            wordCount: Number,
            tokenCount: Number,
            uploadedFileName: String,
        },
        // Cached AI analyses (optional, to avoid regenerating)
        cachedAnalyses: {
            tldrSummary: String,
            paragraphSummary: String,
            detailedSummary: String,
            review: mongoose.Schema.Types.Mixed,
            conceptGraph: mongoose.Schema.Types.Mixed,
            resourcesSummary: mongoose.Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for search and filtering
paperSchema.index({ projectId: 1, createdAt: -1 });
paperSchema.index({ title: 'text', abstract: 'text' });

const Paper = mongoose.model('Paper', paperSchema);

export default Paper;
