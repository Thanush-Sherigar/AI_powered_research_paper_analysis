import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from '../src/models/Project.js';
import User from '../src/models/User.js';
import Paper from '../src/models/Paper.js';

dotenv.config();

const debugProjects = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne();
        if (!user) {
            console.log('No users found');
            return;
        }

        console.log('Testing with user:', user.email, user._id);

        const projects = await Project.find({ userId: user._id })
            .populate('papers', 'title authors createdAt')
            .sort({ 'metadata.lastActivity': -1 });

        console.log('Projects found:', projects.length);

        if (projects.length > 0) {
            const p = projects[0];
            console.log('First Project ID:', p._id);
            console.log('First Project ID type:', typeof p._id);
            console.log('First Project ID constructor:', p._id.constructor.name);

            const json = JSON.stringify(p);
            console.log('JSON stringified:', json);

            const parsed = JSON.parse(json);
            console.log('Parsed ID:', parsed._id);
            console.log('Parsed ID type:', typeof parsed._id);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

debugProjects();
