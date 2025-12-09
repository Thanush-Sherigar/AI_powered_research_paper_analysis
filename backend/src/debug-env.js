import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly point to the .env file in the root backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('--- Environment Variable Debug (Retry) ---');
console.log('GOOGLE_SEARCH_API_KEY:', process.env.GOOGLE_SEARCH_API_KEY ? '✅ PRESENT' : '❌ MISSING');
console.log('GOOGLE_SEARCH_ENGINE_ID:', process.env.GOOGLE_SEARCH_ENGINE_ID ? '✅ PRESENT' : '❌ MISSING');
console.log('------------------------------------------');
