import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { plagiarismAPI, projectAPI } from '../services/api';
import { Search, ShieldAlert, FileText, CheckCircle, AlertTriangle, Globe, Database } from 'lucide-react';

export default function PlagiarismCheck() {
    const { id: projectId } = useParams();
    const [text, setText] = useState('');
    const [project, setProject] = useState(null);
    const [activeTab, setActiveTab] = useState('web'); // 'web' or 'internal'
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (projectId) {
            loadProject();
        }
    }, [projectId]);

    const loadProject = async () => {
        try {
            const response = await projectAPI.getOne(projectId);
            setProject(response.data);
        } catch (err) {
            console.error('Failed to load project:', err);
        }
    };

    const handleCheck = async () => {
        if (!text || text.length < 50) {
            setError('Please enter at least 50 characters to check.');
            return;
        }

        setError(null);
        setLoading(true);
        setResults(null);

        try {
            let response;
            if (activeTab === 'web') {
                response = await plagiarismAPI.checkWeb(text);
            } else {
                response = await plagiarismAPI.checkInternal(text, projectId);
            }
            setResults(response.data);
        } catch (err) {
            console.error('Plagiarism check failed:', err);
            setError(err.response?.data?.message || 'Check failed. Please ensuring API keys are configured.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <Link
                to={`/projects/${projectId}`}
                className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors"
            >
                <div className="mr-2">←</div>
                Back to Project
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <ShieldAlert className="w-8 h-8 text-orange-500" />
                    Plagiarism & Similarity Check
                </h1>
                <p className="text-gray-600">
                    Verify content originality by checking against the web or your internal project papers.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Input */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex space-x-4 mb-6">
                            <button
                                onClick={() => { setActiveTab('web'); setResults(null); setError(null); }}
                                className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'web'
                                        ? 'bg-blue-50 text-blue-600 border border-blue-200 font-semibold shadow-sm'
                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                <Globe className="w-5 h-5" />
                                Web Check (Google)
                            </button>
                            <button
                                onClick={() => { setActiveTab('internal'); setResults(null); setError(null); }}
                                className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'internal'
                                        ? 'bg-purple-50 text-purple-600 border border-purple-200 font-semibold shadow-sm'
                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                <Database className="w-5 h-5" />
                                Internal Project Check
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Text to Analyze
                            </label>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="w-full h-64 p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm leading-relaxed"
                                placeholder="Paste the text you want to check for plagiarism or similarity here..."
                            />
                            <div className="mt-2 flex justify-between text-xs text-gray-500">
                                <span>Minimum 50 characters required</span>
                                <span>{text.length} characters</span>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-4 border border-red-200 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleCheck}
                            disabled={loading || text.length < 50}
                            className={`w-full py-3 px-6 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-all ${loading || text.length < 50
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : activeTab === 'web'
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:-translate-y-0.5'
                                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:-translate-y-0.5'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Running Analysis...
                                </>
                            ) : (
                                <>
                                    <Search className="w-5 h-5" />
                                    Run {activeTab === 'web' ? 'Web Check' : 'Internal Check'}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Right Panel: Results */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                Analysis Results
                            </h3>
                        </div>

                        <div className="p-4 flex-1 overflow-y-auto max-h-[600px]">
                            {!results ? (
                                <div className="text-center py-12 text-gray-400">
                                    <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>Run a check to see results here</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className={`p-4 rounded-lg flex items-center gap-3 ${results.foundMatches
                                            ? 'bg-amber-50 border border-amber-200 text-amber-800'
                                            : 'bg-green-50 border border-green-200 text-green-800'
                                        }`}>
                                        {results.foundMatches ? (
                                            <AlertTriangle className="w-6 h-6 flex-shrink-0 text-amber-500" />
                                        ) : (
                                            <CheckCircle className="w-6 h-6 flex-shrink-0 text-green-500" />
                                        )}
                                        <div>
                                            <p className="font-bold">
                                                {results.foundMatches
                                                    ? 'Matches Found'
                                                    : 'No Significant Matches'}
                                            </p>
                                            <p className="text-sm opacity-90">
                                                {results.foundMatches
                                                    ? `Found potential matches from the ${activeTab} source.`
                                                    : 'Original content appears unique based on this scan.'}
                                            </p>
                                        </div>
                                    </div>

                                    {results.matches && results.matches.length > 0 && (
                                        <div className="space-y-3 mt-4">
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Detailed Findings
                                            </h4>
                                            {results.matches.map((match, i) => (
                                                <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm border border-gray-200">
                                                    {activeTab === 'web' ? (
                                                        <>
                                                            <div className="mb-2">
                                                                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded mr-2">
                                                                    Chunk
                                                                </span>
                                                                <span className="italic text-gray-600">"{match.chunk}"</span>
                                                            </div>
                                                            {match.matches.map((m, j) => (
                                                                <div key={j} className="mt-2 pl-3 border-l-2 border-blue-200">
                                                                    <a
                                                                        href={m.link}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="font-medium text-blue-600 hover:underline block truncate"
                                                                    >
                                                                        {m.title}
                                                                    </a>
                                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                                        {m.snippet}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className="font-medium text-gray-900">
                                                                    {match.sourcePaper}
                                                                </span>
                                                                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded font-mono">
                                                                    {(match.similarity * 100).toFixed(1)}% Match
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-600 text-xs bg-white p-2 rounded border border-gray-100 italic">
                                                                "{match.text}"
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
