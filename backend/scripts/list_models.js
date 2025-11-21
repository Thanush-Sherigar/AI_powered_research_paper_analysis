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
    console.error('GEMINI_API_KEY not found in .env');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // Note: getGenerativeModel doesn't list models, it just gets a reference.
        // We need to use the model manager if available, or just try a simple generation to test.
        // Actually, the SDK doesn't have a direct 'listModels' method exposed easily in the high-level client 
        // without using the lower-level API.

        // Let's try a simple generation with 'gemini-pro' as a fallback test, 
        // and also try to hit the REST API directly to list models if possible, 
        // but for now let's just test a few common names.

        const modelsToTest = [
            'gemini-1.5-flash',
            'gemini-1.5-flash-001',
            'gemini-1.5-pro',
            'gemini-pro',
            'gemini-1.0-pro'
        ];

        console.log('Testing models...');

        for (const modelName of modelsToTest) {
            console.log(`\nTesting ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello, are you working?");
                const response = await result.response;
                console.log(`✅ ${modelName} is WORKING! Response: ${response.text().substring(0, 20)}...`);
            } catch (error) {
                console.log(`❌ ${modelName} failed: ${error.message.split('\n')[0]}`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

listModels();
