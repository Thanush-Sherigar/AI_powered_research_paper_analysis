// Simple script to clear concept graph cache for a paper
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const paperId = process.argv[2] || '69208e521ffdfa81cff2f016';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const Paper = mongoose.model('Paper', new mongoose.Schema({}, { strict: false }));

    const result = await Paper.findByIdAndUpdate(
        paperId,
        { $unset: { 'cachedAnalyses.conceptGraph': 1 } },
        { new: true }
    );

    console.log('✅ Cleared concept graph cache for paper:', paperId);
    console.log('Cached analyses remaining:', Object.keys(result?.cachedAnalyses || {}));

    process.exit(0);
}).catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
