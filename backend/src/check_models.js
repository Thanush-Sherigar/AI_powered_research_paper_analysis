import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY not found in .env');
        return;
    }

    console.log('Checking available models for your API key...');

    // Note: The Node.js SDK for Gemini (GoogleGenerativeAI) mainly focuses on getGenerativeModel.
    // There isn't a direct "listModels" helper in the high-level generic client easily accessible 
    // without using the direct REST API or specific manager classes.
    // So we will try to fetch the REST API endpoint manually for the list.

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log('\n--- Available Gemini Models ---');
            data.models.forEach(model => {
                if (model.name.includes('gemini')) {
                    console.log(`- ${model.name.replace('models/', '')}`);
                    console.log(`  Description: ${model.description}`);
                    console.log(`  Supported: ${model.supportedGenerationMethods.join(', ')}`);
                    console.log('');
                }
            });
        } else {
            console.log('No models found or error in response:', data);
        }
    } catch (error) {
        console.error('Failed to list models:', error.message);
    }
}

listModels();
