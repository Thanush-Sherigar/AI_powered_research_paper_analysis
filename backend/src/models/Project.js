import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Project name is required'],
            trim: true,
            maxlength: [200, 'Project name cannot exceed 200 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
        },
        papers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Paper',
            },
        ],
        metadata: {
            paperCount: {
                type: Number,
                default: 0,
            },
            lastActivity: {
                type: Date,
                default: Date.now,
            },
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
projectSchema.index({ userId: 1, createdAt: -1 });

// Update lastActivity on save
projectSchema.pre('save', function (next) {
    this.metadata.lastActivity = new Date();
    next();
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
