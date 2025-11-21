import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { analysisAPI, projectAPI } from '../services/api';
import { CheckCircle, AlertTriangle, XCircle, Sparkles } from 'lucide-react';

export default function CitationChecker() {
    const { id: projectId } = useParams();
    const [papers, setPapers] = useState([]);
    const [selectedPapers, setSelectedPapers] = useState([]);
    const [userText, setUserText] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingPapers, setLoadingPapers] = useState(true);

    useEffect(() => {
        if (projectId) {
            loadPapers();
        }
    }, [projectId]);

    const loadPapers = async () => {
        try {
            const response = await projectAPI.getOne(projectId);
            setPapers(response.data.papers || []);
        } catch (error) {
            console.error('Failed to load papers:', error);
        } finally {
            setLoadingPapers(false);
        }
    };

    const handleCheck = async () => {
        if (!userText.trim() || selectedPapers.length === 0) {
            alert('Please enter text and select at least one paper');
            return;
        }

        setLoading(true);
        try {
            const response = await analysisAPI.checkCitations(userText, selectedPapers);
            setResults(response.data);
        } catch (error) {
            console.error('Citation check failed:', error);
            alert('Failed to check citations. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const togglePaper = (paperId) => {
        setSelectedPapers(prev =>
            prev.includes(paperId)
                ? prev.filter(id => id !== paperId)
                : [...prev, paperId]
        );
    };

    const getRiskColor = (level) => {
        switch (level) {
            case 'low': return 'text-green-400 bg-green-500/10 border-green-500/30';
            case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
            case 'high': return 'text-red-400 bg-red-500/10 border-red-500/30';
            default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
        }
    };

    const getRiskIcon = (level) => {
        switch (level) {
            case 'low': return <CheckCircle className="w-5 h-5" />;
            case 'medium': return <AlertTriangle className="w-5 h-5" />;
            case 'high': return <XCircle className="w-5 h-5" />;
            default: return null;
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center mb-8">
                <Sparkles className="w-8 h-8 text-primary-400 mr-3" />
                <h1 className="text-4xl font-bold text-gradient">Citation Checker</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel - Input */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-6">
                        <h2 className="text-xl font-bold mb-4">Your Draft Text</h2>
                        <textarea
                            value={userText}
                            onChange={(e) => setUserText(e.target.value)}
                            placeholder="Paste your draft text with citations here. Use [1], [2], etc. to reference papers..."
                            className="w-full h-64 bg-slate-900 border border-white/20 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
                        />
                        <div className="mt-4 flex justify-between items-center">
                            <span className="text-sm text-gray-400">
                                {userText.length} characters • {selectedPapers.length} papers selected
                            </span>
                            <button
                                onClick={handleCheck}
                                disabled={loading || !userText.trim() || selectedPapers.length === 0}
                                className="btn-gradient disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Checking...' : 'Check Citations'}
                            </button>
                        </div>
                    </div>

                    {/* Results */}
                    {results && (
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-bold mb-4">Citation Analysis</h2>

                            {/* Overall Assessment */}
                            <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10">
                                <h3 className="font-bold text-primary-300 mb-2">Overall Assessment</h3>
                                <p className="text-gray-300 leading-relaxed">{results.overallAssessment}</p>
                            </div>

                            {/* Claims */}
                            <div className="space-y-4">
                                {results.claims?.map((claim, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-lg border ${getRiskColor(claim.riskLevel)}`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center space-x-2">
                                                {getRiskIcon(claim.riskLevel)}
                                                <span className="font-bold uppercase text-xs tracking-wider">
                                                    {claim.riskLevel} Risk
                                                </span>
                                            </div>
                                            <span className="text-xs opacity-70">{claim.citation}</span>
                                        </div>

                                        <div className="mb-3">
                                            <span className="text-xs font-bold text-gray-400 uppercase">Original Text:</span>
                                            <p className="text-sm mt-1 italic">"{claim.originalText}"</p>
                                        </div>

                                        {claim.issue && (
                                            <div className="mb-3">
                                                <span className="text-xs font-bold text-gray-400 uppercase">Issue:</span>
                                                <p className="text-sm mt-1">{claim.issue}</p>
                                            </div>
                                        )}

                                        {claim.suggestion && (
                                            <div className="bg-black/20 p-3 rounded border border-white/5">
                                                <span className="text-xs font-bold text-green-400 uppercase">Suggested Improvement:</span>
                                                <p className="text-sm mt-1 text-gray-200">"{claim.suggestion}"</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel - Paper Selection */}
                <div className="glass-card p-6 h-fit sticky top-6">
                    <h2 className="text-xl font-bold mb-4">Referenced Papers</h2>

                    {loadingPapers ? (
                        <div className="flex justify-center py-8">
                            <div className="spinner"></div>
                        </div>
                    ) : papers.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No papers in this project</p>
                    ) : (
                        <div className="space-y-3">
                            {papers.map((paper, index) => (
                                <label
                                    key={paper._id}
                                    className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${selectedPapers.includes(paper._id)
                                            ? 'bg-primary-500/20 border-primary-500/50'
                                            : 'bg-white/5 border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedPapers.includes(paper._id)}
                                        onChange={() => togglePaper(paper._id)}
                                        className="mt-1 mr-3"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center mb-1">
                                            <span className="text-xs font-bold text-primary-400 mr-2">[{index + 1}]</span>
                                            <span className="text-sm font-semibold line-clamp-2">{paper.title}</span>
                                        </div>
                                        {paper.authors && paper.authors.length > 0 && (
                                            <p className="text-xs text-gray-400 line-clamp-1">
                                                {paper.authors.slice(0, 2).join(', ')}
                                                {paper.authors.length > 2 && ' et al.'}
                                            </p>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}

                    <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-xs text-blue-300">
                            <strong>Tip:</strong> Use [1], [2], etc. in your text to reference the papers in the order shown here.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
