import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { paperAPI, analysisAPI } from '../services/api';
import { ArrowLeft, FileText, Users, Calendar } from 'lucide-react';
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
                to={`/projects/${paper?.projectId}`}
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
                            <div className="space-y-6">
                                <div className="glass-card p-6 border-l-4 border-primary-600">
                                    <h3 className="text-xl font-bold mb-4 text-gray-900">Overall Score: {review.score}/10</h3>
                                    <p className="text-gray-700">{review.justification}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                        <h3 className="font-bold text-green-700 mb-4">Strengths</h3>
                                        <ul className="space-y-2">
                                            {review.strengths.map((item, i) => (
                                                <li key={i} className="flex items-start text-gray-700">
                                                    <span className="mr-2 text-green-600">•</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                        <h3 className="font-bold text-red-700 mb-4">Weaknesses</h3>
                                        <ul className="space-y-2">
                                            {review.weaknesses.map((item, i) => (
                                                <li key={i} className="flex items-start text-gray-700">
                                                    <span className="mr-2 text-red-600">•</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                                    <h3 className="font-bold mb-3 text-primary-700">Summary</h3>
                                    <p className="text-gray-700 leading-relaxed">{review.summary}</p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                                    <h3 className="font-bold mb-3 text-primary-700">Novelty & Significance</h3>
                                    <p className="text-gray-700 leading-relaxed">{review.novelty}</p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                                    <h3 className="font-bold mb-3 text-primary-700">Soundness</h3>
                                    <p className="text-gray-700 leading-relaxed">{review.soundness}</p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                                    <h3 className="font-bold mb-3 text-primary-700">Clarity</h3>
                                    <p className="text-gray-700 leading-relaxed">{review.clarity}</p>
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
                    <QABot paperId={id} projectId={paper?.projectId} />
                )}
            </div>
        </div>
    );
}
