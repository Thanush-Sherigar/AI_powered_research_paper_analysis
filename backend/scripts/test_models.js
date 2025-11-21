import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

const modelsToTest = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'models/gemini-1.5-flash',
    'models/gemini-1.5-pro',
    'models/gemini-pro',
];

async function testModels() {
    console.log('🔍 Testing Gemini 2.0 and alternative model names...\n');

    for (const modelName of modelsToTest) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say 'OK'");
            const response = await result.response;
            const text = response.text();
            console.log(`✅ ${modelName} - WORKS! Response: "${text.trim()}"`);
            console.log(`   👉 USE THIS MODEL IN YOUR .env FILE\n`);
            break; // Stop after finding first working model
        } catch (error) {
            const errorMsg = error.message.split('\n')[0];
            if (errorMsg.includes('429')) {
                console.log(`⚠️  ${modelName} - QUOTA EXCEEDED (model exists but rate limited)`);
                console.log(`   👉 This model works but you've hit the quota. Wait or upgrade plan.\n`);
            } else if (errorMsg.includes('404')) {
                console.log(`❌ ${modelName} - NOT AVAILABLE\n`);
            } else {
                console.log(`❌ ${modelName} - ERROR: ${errorMsg}\n`);
            }
        }
    }
}

testModels();
