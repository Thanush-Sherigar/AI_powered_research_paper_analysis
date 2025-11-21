import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
    {
        paperId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Paper',
            required: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        content: {
            type: String,
            required: [true, 'Note content is required'],
        },
        type: {
            type: String,
            enum: ['manual', 'ai'],
            default: 'manual',
        },
        section: {
            type: String,
            trim: true,
        },
        metadata: {
            prompt: String, // For AI-generated notes
            model: String,  // Which model generated this
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient queries
noteSchema.index({ paperId: 1, userId: 1, createdAt: -1 });

const Note = mongoose.model('Note', noteSchema);

export default Note;
