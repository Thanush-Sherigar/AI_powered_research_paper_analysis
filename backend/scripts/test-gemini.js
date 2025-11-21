import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root
dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env');
    process.exit(1);
}

console.log('🔑 Found API Key:', apiKey.substring(0, 8) + '...');

const genAI = new GoogleGenerativeAI(apiKey);

async function testGeneration() {
    try {
        const modelName = 'gemini-2.5-flash';
        console.log(`🧪 Testing generation with model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent('Hello, are you working? Reply with "Yes, I am working!"');
        const response = await result.response;
        const text = response.text();
        console.log('✅ Success! Response:', text);

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Details:', JSON.stringify(error.response, null, 2));
        }
    }
}

testGeneration();
