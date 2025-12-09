import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getLLMClient } from './services/llmService.js';
import logger from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

async function verifyLLM() {
    console.log('--- Verifying LLM Configuration ---');
    console.log(`Provider: ${process.env.LLM_PROVIDER}`);
    console.log(`Model: ${process.env.LLM_MODEL}`);
    console.log(`API Key set: ${!!process.env.GEMINI_API_KEY}`);

    try {
        const llm = getLLMClient();
        console.log('\nAttempting generation...');
        const result = await llm.generate('Hello, are you working? Respond with "Yes".');
        console.log('\n✅ Success! Response:');
        console.log(result);
    } catch (error) {
        console.log('\n❌ Verification Failed!');
        console.error(error.message);

        if (error.message.includes('404')) {
            console.log('\n--> TIP: "404 Not Found" usually means the model name is wrong. Try "gemini-1.5-flash".');
        } else if (error.message.includes('429')) {
            console.log('\n--> TIP: "429 Too Many Requests" means you hit the rate limit. Wait a minute.');
        }
    }
}

verifyLLM();
