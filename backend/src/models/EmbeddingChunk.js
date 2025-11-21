import mongoose from 'mongoose';

const embeddingChunkSchema = new mongoose.Schema(
    {
        paperId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Paper',
            required: true,
            index: true,
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
            index: true,
        },
        section: {
            type: String,
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        embedding: {
            type: [Number],
            required: true,
        },
        chunkIndex: {
            type: Number,
            default: 0,
        },
        metadata: {
            tokenCount: Number,
            charCount: Number,
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes for efficient queries
embeddingChunkSchema.index({ paperId: 1, chunkIndex: 1 });
embeddingChunkSchema.index({ projectId: 1 });

// For MongoDB Atlas Vector Search, you would create a vector search index
// on the 'embedding' field through the Atlas UI or API
// This allows for efficient similarity search

const EmbeddingChunk = mongoose.model('EmbeddingChunk', embeddingChunkSchema);

export default EmbeddingChunk;
