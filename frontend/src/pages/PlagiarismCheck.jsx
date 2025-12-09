import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { plagiarismAPI, projectAPI, paperAPI } from '../services/api';
import { Search, ShieldAlert, FileText, CheckCircle, AlertTriangle, Globe, Database, Upload, File, Cpu } from 'lucide-react';

export default function PlagiarismCheck() {
    const { id: projectId } = useParams();
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [papers, setPapers] = useState([]);
    const [selectedPaperId, setSelectedPaperId] = useState('');
    const [project, setProject] = useState(null);
    const [activeTab, setActiveTab] = useState('web');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (projectId) {
            loadProject();
            loadPapers();
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

    const loadPapers = async () => {
        try {
            const response = await projectAPI.getPapers(projectId);
            setPapers(response.data);
        } catch (err) {
            console.error('Failed to load papers:', err);
        }
    };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.type === 'application/pdf') {
            setFile(selected);
            setSelectedPaperId(''); // Clear paper selection if file is chosen
            setError(null);
        } else {
            setFile(null);
            setError('Please select a valid PDF file.');
        }
    };

    const handlePaperSelect = async (e) => {
        const pId = e.target.value;
        setSelectedPaperId(pId);
        if (pId) {
            setFile(null); // Clear file if paper is chosen
            try {
                // Fetch full paper text to prep for analysis
                const paperRes = await paperAPI.getOne(pId);
                // We'll use this text for the analysis
                setText(paperRes.data.cleanText || '');
            } catch (err) {
                console.error("Failed to fetch paper text", err);
            }
        } else {
            setText('');
        }
    };

    const handleCheck = async () => {
        if (activeTab === 'file' && !file && !selectedPaperId) {
            setError('Please upload a PDF file OR select an existing paper.');
            return;
        }

        if (activeTab !== 'file' && (!text || text.length < 50)) {
            setError('Please enter at least 50 characters to check.');
            return;
        }

        setError(null);
        setLoading(true);
        setResults(null);

        try {
            let responseData = {};

            if (activeTab === 'web') {
                const res = await plagiarismAPI.checkWeb(text);
                responseData = res.data;
            } else if (activeTab === 'internal') {
                const res = await plagiarismAPI.checkInternal(text, projectId);
                responseData = res.data;
            } else if (activeTab === 'file') {
                // If file is selected, use upload endpoint
                if (file) {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('projectId', projectId);
                    const res = await plagiarismAPI.checkFile(formData);
                    responseData = res.data;
                } else if (selectedPaperId) {
                    // Logic for existing paper: Run parallel checks manually
                    if (!text) {
                        throw new Error("Selected paper has no text content.");
                    }

                    // Run Web + Humanism in parallel
                    const [webRes, humanismRes] = await Promise.all([
                        plagiarismAPI.checkWeb(text),
                        plagiarismAPI.checkHumanism({ text }) // Call new endpoint
                    ]);

                    const selectedPaper = papers.find(p => p._id === selectedPaperId);

                    responseData = {
                        fileInfo: {
                            name: selectedPaper?.title || 'Selected Paper',
                            wordCount: text.split(/\s+/).length,
                            pageCount: 0
                        },
                        web: webRes.data,
                        humanism: humanismRes.data
                    };
                }
            }
            setResults(responseData);
        } catch (err) {
            console.error('Plagiarism check failed:', err);
            setError(err.response?.data?.message || err.message || 'Check failed. Please ensuring API keys are configured.');
        } finally {
            setLoading(false);
        }
    };

    const getHumanismColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 50) return 'text-blue-600';
        if (score >= 20) return 'text-amber-600';
        return 'text-red-600';
    };

    return (
        <div className="container mx-auto p-6 max-w-6xl">
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
                    Plagiarism & AI Detection
                </h1>
                <p className="text-gray-600">
                    Verify content originality and analyze writing style (Human vs AI) for your project papers.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Input */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                            {[
                                { id: 'web', label: 'Web Check', icon: Globe, color: 'blue' },
                                { id: 'internal', label: 'Internal Check', icon: Database, color: 'purple' },
                                { id: 'file', label: 'Start Analysis', icon: FileText, color: 'green' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveTab(tab.id); setResults(null); setError(null); }}
                                    className={`flex-1 min-w-[140px] py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all font-medium text-sm ${activeTab === tab.id
                                        ? `bg-${tab.color}-50 text-${tab.color}-700 border border-${tab.color}-200 shadow-sm`
                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="mb-6 min-h-[300px]">
                            {activeTab === 'file' ? (
                                <div className="space-y-6">
                                    {/* Option 1: Select Existing */}
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Option 1: Select Paper from Project
                                        </label>
                                        <select
                                            value={selectedPaperId}
                                            onChange={handlePaperSelect}
                                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                                        >
                                            <option value="">-- Choose a paper --</option>
                                            {papers.map(p => (
                                                <option key={p._id} value={p._id}>{p.title}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="relative flex items-center justify-center">
                                        <hr className="w-full border-gray-200" />
                                        <span className="absolute bg-white px-3 text-sm text-gray-400 font-medium">OR</span>
                                    </div>

                                    {/* Option 2: Upload New */}
                                    <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400 bg-gray-50'}`}>
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="report-upload"
                                        />
                                        <label htmlFor="report-upload" className="cursor-pointer">
                                            <Upload className={`w-8 h-8 mx-auto mb-2 ${file ? 'text-green-600' : 'text-gray-400'}`} />
                                            <p className="text-sm font-medium text-gray-700">
                                                {file ? file.name : "Upload New Report (PDF)"}
                                            </p>
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Text to Analyze
                                    </label>
                                    <textarea
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        className="w-full h-64 p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm leading-relaxed"
                                        placeholder="Paste text here..."
                                    />
                                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                                        <span>Minimum 50 characters</span>
                                        <span>{text.length} chars</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-4 border border-red-200 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleCheck}
                            disabled={loading || (activeTab === 'file' ? (!file && !selectedPaperId) : text.length < 50)}
                            className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 transition-all ${loading || (activeTab === 'file' ? (!file && !selectedPaperId) : text.length < 50)
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-gradient-to-r from-gray-900 to-gray-700 hover:shadow-lg hover:-translate-y-0.5'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Running Deep Analysis...
                                </>
                            ) : (
                                <>
                                    <Search className="w-5 h-5" />
                                    Run Analysis
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Right Panel: Results */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                Report Card
                            </h3>
                        </div>

                        <div className="p-4 flex-1 overflow-y-auto max-h-[700px]">
                            {!results ? (
                                <div className="text-center py-12 text-gray-400">
                                    <Cpu className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>Results will appear here</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* HUMANISM SCORE */}
                                    {results.humanism && (
                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>
                                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Humanism Score</h4>

                                            <div className="relative inline-flex items-center justify-center mb-2">
                                                <svg className="w-32 h-32 transform -rotate-90">
                                                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-200" />
                                                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent"
                                                        strokeDasharray={351}
                                                        strokeDashoffset={351 - (351 * results.humanism.humanismScore) / 100}
                                                        className={getHumanismColor(results.humanism.humanismScore)}
                                                    />
                                                </svg>
                                                <span className={`absolute text-3xl font-bold ${getHumanismColor(results.humanism.humanismScore)}`}>
                                                    {results.humanism.humanismScore}%
                                                </span>
                                            </div>

                                            <p className="font-medium text-gray-800 mb-1">{results.humanism.assessment}</p>
                                            <p className="text-xs text-gray-500 italic px-2">"{results.humanism.reasoning}"</p>
                                        </div>
                                    )}

                                    {/* PLAGIARISM RESULT */}
                                    {(results.web || (!results.web && !results.humanism)) && (
                                        <div className={`p-5 rounded-xl border ${(results.web?.foundMatches || results.foundMatches)
                                            ? 'bg-amber-50 border-amber-200'
                                            : 'bg-green-50 border-green-200'
                                            }`}>
                                            <div className="flex items-center gap-3 mb-2">
                                                {(results.web?.foundMatches || results.foundMatches) ? (
                                                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                                                ) : (
                                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                                )}
                                                <h4 className={`font-bold ${(results.web?.foundMatches || results.foundMatches) ? 'text-amber-800' : 'text-green-800'}`}>
                                                    {(results.web?.foundMatches || results.foundMatches) ? 'Plagiarism Detected' : 'No Plagiarism Found'}
                                                </h4>
                                            </div>
                                            <p className="text-sm opacity-80 pl-9">
                                                {(results.web?.checkedChunks || results.checkedChunks) ? `Scanned chunks against web sources.` : 'Content appears original.'}
                                            </p>
                                        </div>
                                    )}

                                    {/* DETAILED MATCHES */}
                                    {(results.web?.matches || results.matches) && (
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest border-b pb-2">Source Matches</h4>
                                            {(results.web?.matches || results.matches || []).map((match, i) => (
                                                <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm border border-gray-200 hover:bg-white transition-colors">
                                                    {match.chunk ? (
                                                        // Web Match
                                                        <>
                                                            <div className="mb-2 text-xs italic text-gray-500 border-l-2 border-blue-300 pl-2">
                                                                "{match.chunk}"
                                                            </div>
                                                            {match.matches.map((m, j) => (
                                                                <a key={j} href={m.link} target="_blank" rel="noopener noreferrer" className="block mt-1 text-blue-600 hover:underline truncate">
                                                                    {m.title}
                                                                </a>
                                                            ))}
                                                        </>
                                                    ) : (
                                                        // Internal Match
                                                        <>
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="font-medium text-gray-900">{match.sourcePaper}</span>
                                                                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded">{(match.similarity * 100).toFixed(0)}%</span>
                                                            </div>
                                                            <div className="text-xs italic text-gray-500 border-l-2 border-purple-300 pl-2 line-clamp-2">
                                                                "{match.text}"
                                                            </div>
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
