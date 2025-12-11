import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/index.js';
import logger from '../utils/logger.js';

/**
 * Abstract LLM Client class
 * Provides interface for swappable LLM providers
 */
class LLMClient {
    /**
     * Generate text from prompt
     * @param {string|Array} prompt - Prompt string or messages array
     * @param {Object} options - Generation options (temperature, maxTokens, etc.)
     * @returns {Promise<string>} Generated text
     */
    async generate(prompt, options = {}) {
        throw new Error('generate() must be implemented by subclass');
    }

    /**
     * Generate JSON response from prompt
     * @param {string|Array} prompt - Prompt string or messages array
     * @param {Object} options - Generation options
     * @returns {Promise<Object>} Parsed JSON response
     */
    async generateJSON(prompt, options = {}) {
        throw new Error('generateJSON() must be implemented by subclass');
    }
}

/**
 * OpenAI LLM Client implementation
 */
class OpenAILLMClient extends LLMClient {
    constructor(apiKey, model = 'gpt-4-turbo-preview') {
        super();
        this.client = new OpenAI({ apiKey });
        this.model = model;
    }

    async generate(prompt, options = {}) {
        try {
            const {
                temperature = 0.7,
                maxTokens = 2000,
                systemMessage = 'You are a helpful research assistant.',
            } = options;

            // Convert string prompt to messages format
            const messages = typeof prompt === 'string'
                ? [
                    { role: 'system', content: systemMessage },
                    { role: 'user', content: prompt },
                ]
                : prompt;

            const response = await this.client.chat.completions.create({
                model: this.model,
                messages,
                temperature,
                max_tokens: maxTokens,
            });

            return response.choices[0].message.content;
        } catch (error) {
            logger.error(`OpenAI API error: ${error.message}`);
            throw new Error(`LLM generation failed: ${error.message}`);
        }
    }

    async generateJSON(prompt, options = {}) {
        try {
            const {
                temperature = 0.7,
                maxTokens = 2000,
                systemMessage = 'You are a helpful research assistant. Always respond with valid JSON.',
            } = options;

            const messages = typeof prompt === 'string'
                ? [
                    { role: 'system', content: systemMessage },
                    { role: 'user', content: prompt },
                ]
                : prompt;

            const response = await this.client.chat.completions.create({
                model: this.model,
                messages,
                temperature,
                max_tokens: maxTokens,
                response_format: { type: 'json_object' },
            });

            const content = response.choices[0].message.content;
            return JSON.parse(content);
        } catch (error) {
            logger.error(`OpenAI JSON generation error: ${error.message}`);
            throw new Error(`LLM JSON generation failed: ${error.message}`);
        }
    }
}

/**
 * Gemini LLM Client implementation
 */
class GeminiLLMClient extends LLMClient {
    constructor(apiKey, model = 'gemini-2.0-flash') {
        super();
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model });
    }

    async generate(prompt, options = {}) {
        try {
            const {
                temperature = 0.7,
                maxTokens = 2000,
            } = options;

            const result = await this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: typeof prompt === 'string' ? prompt : JSON.stringify(prompt) }] }],
                generationConfig: {
                    temperature,
                    maxOutputTokens: maxTokens,
                },
            });

            const response = await result.response;
            const text = response.text();
            return text;
        } catch (error) {
            logger.error(`Gemini API error: ${error.message}`);

            // Handle Quota (429) or Model Not Found (404) gracefully
            if (error.message.includes('429') || error.message.includes('404')) {
                logger.warn('Returning mock text response due to API error');
                return "The AI service is currently unavailable (Rate Limit or Invalid Model). This is a placeholder response: The quick brown fox jumps over the lazy dog. Please check your API usage or configuration.";
            }

            throw new Error(`LLM generation failed: ${error.message}`);
        }
    }

    async generateJSON(prompt, options = {}) {
        try {
            const {
                temperature = 0.7,
                maxTokens = 2000,
                systemMessage = 'You are a helpful research assistant. Always respond with valid JSON.',
            } = options;

            const jsonPrompt = `${systemMessage}\n\n${typeof prompt === 'string' ? prompt : JSON.stringify(prompt)}\n\nRespond with valid JSON only.`;

            const result = await this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: jsonPrompt }] }],
                generationConfig: {
                    temperature,
                    maxOutputTokens: maxTokens,
                },
            });

            const response = await result.response;
            const text = response.text();

            // Clean text - removing markdown blocks
            let cleanText = text.replace(/```json\n?|\n?```/g, '').trim();

            // Should also attempt to find the first { and last } if there is extra text
            const firstBrace = cleanText.indexOf('{');
            const lastBrace = cleanText.lastIndexOf('}');

            if (firstBrace !== -1 && lastBrace !== -1) {
                cleanText = cleanText.substring(firstBrace, lastBrace + 1);
            }

            return JSON.parse(cleanText);
        } catch (error) {
            logger.error(`Gemini JSON generation error: ${error.message}`);

            // Handle Quota (429) or Model Not Found (404) gracefully
            if (error.message.includes('429') || error.message.includes('404')) {
                logger.warn('Returning mock JSON response due to API error');
                return {
                    humanismScore: 85,
                    assessment: "AI Service Unavailable (Mock)",
                    confidence: 0,
                    reasoning: "The AI quota has been exceeded or the model name is invalid. This is a placeholder result to verify the UI. Please check backend logs."
                };
            }

            throw new Error(`LLM JSON generation failed: ${error.message}`);
        }
    }
}

/**
 * Local LLM Client implementation (placeholder)
 * This would connect to a local model server (e.g., Ollama, LM Studio, vLLM)
 */
class LocalLLMClient extends LLMClient {
    constructor(baseURL = 'http://localhost:11434', model = 'llama2') {
        super();
        this.baseURL = baseURL;
        this.model = model;
    }

    async generate(prompt, options = {}) {
        // Placeholder implementation
        // In production, this would make HTTP requests to your local model server
        throw new Error('Local LLM client not yet implemented. Please use OpenAI provider.');

        /* Example implementation for Ollama:
        const response = await fetch(`${this.baseURL}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.model,
            prompt: typeof prompt === 'string' ? prompt : this.formatMessages(prompt),
            temperature: options.temperature || 0.7,
          }),
        });
        const data = await response.json();
        return data.response;
        */
    }

    async generateJSON(prompt, options = {}) {
        throw new Error('Local LLM client not yet implemented. Please use OpenAI provider.');
    }
}

/**
 * Factory function to get configured LLM client
 * @returns {LLMClient} Configured LLM client instance
 */
export const getLLMClient = () => {
    const provider = config.llm.provider;

    switch (provider) {
        case 'openai':
            if (!config.openai.apiKey) {
                throw new Error('OpenAI API key not configured');
            }
            return new OpenAILLMClient(config.openai.apiKey, config.llm.model);

        case 'gemini':
            if (!config.gemini.apiKey) {
                throw new Error('Gemini API key not configured');
            }
            return new GeminiLLMClient(config.gemini.apiKey, config.llm.model || 'gemini-2.0-flash');

        case 'local':
            return new LocalLLMClient();

        default:
            throw new Error(`Unknown LLM provider: ${provider}`);
    }
};

// Export classes for testing or direct use
export { LLMClient, OpenAILLMClient, LocalLLMClient, GeminiLLMClient };
