import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, BookOpen } from 'lucide-react';
import { analysisAPI } from '../services/api';

export default function QABot({ paperId, projectId }) {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hello! I can answer questions about this paper. What would you like to know?',
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await analysisAPI.ask(userMessage.content, projectId, paperId);

            const botMessage = {
                role: 'assistant',
                content: response.data.answer,
                citations: response.data.citations,
                evidence: response.data.supportingEvidence,
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'Sorry, I encountered an error while trying to answer your question. Please try again.' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user'
                                ? 'bg-primary-600 text-white rounded-tr-none'
                                : 'bg-gray-100 text-gray-800 rounded-tl-none'
                                }`}
                        >
                            <div className="flex items-center mb-2 opacity-70 text-xs uppercase tracking-wider font-bold">
                                {msg.role === 'user' ? (
                                    <>
                                        <User className="w-3 h-3 mr-1" /> You
                                    </>
                                ) : (
                                    <>
                                        <Bot className="w-3 h-3 mr-1" /> AI Assistant
                                    </>
                                )}
                            </div>
                            <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

                            {/* Citations */}
                            {msg.citations && msg.citations.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-gray-200">
                                    <div className="text-xs font-bold text-primary-700 mb-2 flex items-center">
                                        <BookOpen className="w-3 h-3 mr-1" /> Sources
                                    </div>
                                    <div className="space-y-2">
                                        {msg.citations.map((cit, i) => (
                                            <div key={i} className="text-xs bg-white p-2 rounded border border-gray-200">
                                                <span className="font-bold text-primary-600">[{cit.index}]</span>{' '}
                                                <span className="italic">{cit.section}</span>: "{cit.text}"
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-2xl rounded-tl-none p-4 flex items-center space-x-2">
                            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a specific question about this paper..."
                        className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-4 pr-12 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}
