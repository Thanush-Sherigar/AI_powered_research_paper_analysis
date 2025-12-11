import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { paperAPI, analysisAPI } from '../services/api';
import { ArrowLeft, FileText, Users, Calendar, CheckCircle, XCircle, Award, BookOpen, Zap, Layout, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import ConceptGraph from '../components/ConceptGraph';
import QABot from '../components/QABot';
import NotesPanel from '../components/NotesPanel';

export default function PaperDetail() {
    const { id } = useParams();
    const [paper, setPaper] = useState(null);
    const [activeTab, setActiveTab] = useState('summary');
    const [summary, setSummary] = useState(null);
    const [review, setReview] = useState(null);
    const [summaryMode, setSummaryMode] = useState('tldr');
    const [loading, setLoading] = useState(true);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [loadingReview, setLoadingReview] = useState(false);

    console.log('PaperDetail render, review:', review);

    useEffect(() => {
        loadPaper();
    }, [id]);

    useEffect(() => {
        if (activeTab === 'summary') {
            loadSummary();
        } else if (activeTab === 'review' && !review) {
            // Optional: Auto-load review or wait for user click
            // loadReview();
        }
    }, [activeTab, summaryMode]);

    const loadPaper = async () => {
        try {
            const response = await paperAPI.getOne(id);
            setPaper(response.data);
        } catch (error) {
            console.error('Failed to load paper:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadSummary = async () => {
        setLoadingSummary(true);
        try {
            const response = await analysisAPI.getSummaries(id, summaryMode);
            setSummary(response.data.summary);
        } catch (error) {
            console.error('Failed to load summary:', error);
        } finally {
            setLoadingSummary(false);
        }
    };

    const loadReview = async () => {
        setLoadingReview(true);
        try {
            const response = await analysisAPI.getReview(id);
            setReview(response.data.review);
        } catch (error) {
            console.error('Failed to load review:', error);
        } finally {
            setLoadingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="spinner"></div>
            </div>
        );
    }

    const tabs = [
        { id: 'summary', label: 'Summaries' },
        { id: 'review', label: 'Review' },
        { id: 'graph', label: 'Concept Graph' },
        { id: 'notes', label: 'Notes' },
        { id: 'ask', label: 'Ask Questions' },
    ];

    return (
        <div className="container mx-auto p-6">
            <Link
                to={`/projects/${paper?.projectId?._id || paper?.projectId}`}
                className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Project
            </Link>

            <div className="glass-card p-8 mb-6">
                <div className="flex items-start space-x-4 mb-6">
                    <FileText className="w-12 h-12 text-primary-400 flex-shrink-0" />
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold mb-3">{paper?.title}</h1>
                        {paper?.authors && paper.authors.length > 0 && (
                            <div className="flex items-center text-gray-400 mb-2">
                                <Users className="w-4 h-4 mr-2" />
                                {paper.authors.join(', ')}
                            </div>
                        )}
                        {paper?.metadata?.year && (
                            <div className="flex items-center text-gray-400">
                                <Calendar className="w-4 h-4 mr-2" />
                                {paper.metadata.year}
                            </div>
                        )}
                    </div>
                </div>

                {paper?.abstract && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <h3 className="font-semibold mb-2 text-gray-900">Abstract</h3>
                        <p className="text-gray-700 text-sm leading-relaxed">
                            {paper.abstract}
                        </p>
                    </div>
                )}
            </div>

            <div className="glass-card p-6">
                <div className="flex space-x-2 mb-6 border-b border-white/10">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 font-medium transition-colors ${activeTab === tab.id
                                ? 'text-primary-600 border-b-2 border-primary-600'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'summary' && (
                    <div>
                        <div className="flex space-x-2 mb-4">
                            {['tldr', 'paragraph', 'detailed'].map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setSummaryMode(mode)}
                                    className={`px-4 py-2 rounded-lg transition-colors ${summaryMode === mode
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                >
                                    {mode.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        {loadingSummary ? (
                            <div className="flex justify-center py-12">
                                <div className="spinner"></div>
                            </div>
                        ) : summary ? (
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {summary}
                                </p>
                            </div>
                        ) : null}
                    </div>
                )}

                {activeTab === 'review' && (
                    <div>
                        {!review ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 mb-6">
                                    Generate a comprehensive conference-style peer review for this paper.
                                </p>
                                <button
                                    onClick={loadReview}
                                    disabled={loadingReview}
                                    className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
                                >
                                    {loadingReview ? (
                                        <>
                                            <div className="spinner w-5 h-5 mr-2 border-white/20 border-t-white"></div>
                                            Generating Review...
                                        </>
                                    ) : (
                                        'Generate Review'
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-fadeIn">
                                {/* Score Section */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="bg-slate-900 text-white p-6 flex flex-col md:flex-row items-center gap-8">
                                        <div className="relative">
                                            {/* Score Ring SVG */}
                                            <svg className="w-32 h-32 transform -rotate-90">
                                                <circle
                                                    className="text-slate-700"
                                                    strokeWidth="8"
                                                    stroke="currentColor"
                                                    fill="transparent"
                                                    r="58"
                                                    cx="64"
                                                    cy="64"
                                                />
                                                <circle
                                                    className={review.overallScore >= 7 ? "text-green-500" : review.overallScore >= 5 ? "text-yellow-500" : "text-red-500"}
                                                    strokeWidth="8"
                                                    strokeDasharray={365}
                                                    strokeDashoffset={365 - (365 * review.overallScore) / 10}
                                                    strokeLinecap="round"
                                                    stroke="currentColor"
                                                    fill="transparent"
                                                    r="58"
                                                    cx="64"
                                                    cy="64"
                                                />
                                            </svg>
                                            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                                                <span className="text-4xl font-bold">{review.overallScore}</span>
                                                <span className="text-xs text-slate-400 uppercase tracking-wider">Score</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                                <Award className="w-5 h-5 text-yellow-500" />
                                                <h3 className="text-xl font-bold">Reviewer's Assessment</h3>
                                            </div>
                                            <p className="text-slate-300 leading-relaxed text-lg">
                                                "{review.justification}"
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Strengths & Weaknesses Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Strengths */}
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition-shadow">
                                        <div className="bg-green-50/50 p-4 border-b border-green-100 flex items-center gap-2">
                                            <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                                <ThumbsUp className="w-5 h-5" />
                                            </div>
                                            <h3 className="font-bold text-gray-800 text-lg">Key Strengths</h3>
                                        </div>
                                        <div className="p-6">
                                            <ul className="space-y-4">
                                                {review.strengths.map((item, i) => (
                                                    <li key={i} className="flex gap-4 group/item">
                                                        <div className="mt-1 flex-shrink-0">
                                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                                        </div>
                                                        <span className="text-gray-600 leading-relaxed group-hover/item:text-gray-900 transition-colors">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Weaknesses */}
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition-shadow">
                                        <div className="bg-red-50/50 p-4 border-b border-red-100 flex items-center gap-2">
                                            <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                                <ThumbsDown className="w-5 h-5" />
                                            </div>
                                            <h3 className="font-bold text-gray-800 text-lg">Areas for Improvement</h3>
                                        </div>
                                        <div className="p-6">
                                            <ul className="space-y-4">
                                                {review.weaknesses.map((item, i) => (
                                                    <li key={i} className="flex gap-4 group/item">
                                                        <div className="mt-1 flex-shrink-0">
                                                            <XCircle className="w-5 h-5 text-red-500" />
                                                        </div>
                                                        <span className="text-gray-600 leading-relaxed group-hover/item:text-gray-900 transition-colors">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Analysis Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                                        <div className="flex items-center gap-2 mb-4 text-blue-600">
                                            <BookOpen className="w-5 h-5" />
                                            <h3 className="font-bold text-gray-900">Summary</h3>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed text-sm">
                                            {review.summary}
                                        </p>
                                    </div>

                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-purple-300 transition-colors">
                                        <div className="flex items-center gap-2 mb-4 text-purple-600">
                                            <Zap className="w-5 h-5" />
                                            <h3 className="font-bold text-gray-900">Novelty & Significance</h3>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed text-sm">
                                            {review.novelty}
                                        </p>
                                    </div>

                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors">
                                        <div className="flex items-center gap-2 mb-4 text-indigo-600">
                                            <Layout className="w-5 h-5" />
                                            <h3 className="font-bold text-gray-900">Soundness & Methodology</h3>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed text-sm">
                                            {review.soundness}
                                        </p>
                                    </div>

                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-amber-300 transition-colors">
                                        <div className="flex items-center gap-2 mb-4 text-amber-600">
                                            <MessageSquare className="w-5 h-5" />
                                            <h3 className="font-bold text-gray-900">Clarity & Presentation</h3>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed text-sm">
                                            {review.clarity}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'graph' && (
                    <ConceptGraph paperId={id} />
                )}

                {activeTab === 'notes' && (
                    <NotesPanel paperId={id} />
                )}

                {activeTab === 'ask' && (
                    <QABot paperId={id} projectId={paper?.projectId?._id || paper?.projectId} />
                )}
            </div>
        </div>
    );
}
