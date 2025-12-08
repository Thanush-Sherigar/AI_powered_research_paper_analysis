import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { analysisAPI } from '../services/api';
import { ArrowLeft, BookOpen, Clock, Target, Zap, ChevronRight } from 'lucide-react';

export default function ReadingPath() {
    const { projectId } = useParams();
    const [topic, setTopic] = useState('');
    const [level, setLevel] = useState('intermediate');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await analysisAPI.getReadingPath(projectId, topic, level);
            setResult(response.data);
        } catch (err) {
            console.error('Failed to generate reading path:', err);
            setError('Failed to generate reading path. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="mb-8">
                <Link to={`/projects/${projectId}`} className="text-gray-500 hover:text-gray-900 flex items-center mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Project
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Reading Path Generator</h1>
                <p className="text-gray-600">Get an AI-curated reading sequence tailored to your expertise level.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-6">
                        <form onSubmit={handleGenerate} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Research Topic
                                </label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g., Transformer Architectures"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Expertise Level
                                </label>
                                <div className="grid grid-cols-1 gap-3">
                                    {['beginner', 'intermediate', 'advanced'].map((l) => (
                                        <button
                                            key={l}
                                            type="button"
                                            onClick={() => setLevel(l)}
                                            className={`px-4 py-3 rounded-lg border text-left transition-all ${level === l
                                                ? 'bg-primary-50 border-primary-500 text-primary-700 ring-1 ring-primary-500'
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="font-medium capitalize">{l}</div>
                                            <div className="text-xs opacity-75 mt-1">
                                                {l === 'beginner' && 'New to the field'}
                                                {l === 'intermediate' && 'Some prior knowledge'}
                                                {l === 'advanced' && 'Deep technical understanding'}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !topic.trim()}
                                className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                        Generating Path...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5 mr-2" />
                                        Generate Path
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-2">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 mb-6">
                            {error}
                        </div>
                    )}

                    {!result && !loading && (
                        <div className="bg-gray-50 rounded-xl border border-gray-200 border-dashed p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <BookOpen className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reading Path Yet</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                Enter a topic and select your level to generate a customized reading path from your project's papers.
                            </p>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-8">
                            <div className="bg-primary-50 border border-primary-100 rounded-xl p-6">
                                <h2 className="text-xl font-bold text-primary-900 mb-2">
                                    Reading Path: {result.topic}
                                </h2>
                                <div className="flex items-center text-primary-700 text-sm">
                                    <Target className="w-4 h-4 mr-2" />
                                    Level: <span className="font-medium capitalize ml-1">{result.level}</span>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                                <div className="space-y-12">
                                    {result.path.map((step, index) => (
                                        <div key={index} className="relative pl-20">
                                            {/* Step Number */}
                                            <div className="absolute left-0 top-0 w-16 h-16 flex items-center justify-center bg-white border-4 border-primary-100 rounded-full z-10 shadow-sm">
                                                <span className="text-2xl font-bold text-primary-600">{step.order}</span>
                                            </div>

                                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                                <div className="p-6">
                                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>

                                                    <div className="flex items-center text-sm text-gray-500 mb-4">
                                                        <Clock className="w-4 h-4 mr-1" />
                                                        {step.estimatedTime}
                                                    </div>

                                                    <div className="mb-4">
                                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Rationale</h4>
                                                        <p className="text-gray-600 leading-relaxed">{step.rationale}</p>
                                                    </div>

                                                    <div>
                                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Key Takeaways</h4>
                                                        <ul className="space-y-2">
                                                            {step.keyTakeaways.map((takeaway, i) => (
                                                                <li key={i} className="flex items-start text-gray-600">
                                                                    <ChevronRight className="w-4 h-4 mr-2 text-primary-500 mt-0.5 flex-shrink-0" />
                                                                    <span>{takeaway}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
