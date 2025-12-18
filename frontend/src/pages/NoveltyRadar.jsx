import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { analysisAPI, projectAPI, paperAPI } from '../services/api';
import { ArrowLeft, Radar, Lightbulb, AlertCircle, Globe, GitCompare, Upload } from 'lucide-react';
import FileUpload from '../components/ui/FileUpload';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from 'recharts';

export default function NoveltyRadar() {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [papers, setPapers] = useState([]);

    // Analysis State
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Tab State
    const [activeTab, setActiveTab] = useState('overview'); // overview, web, pair

    // Web Check State
    const [selectedWebPaperId, setSelectedWebPaperId] = useState('');

    // Pairwise State
    const [pairPaper1, setPairPaper1] = useState('');
    const [pairPaper2, setPairPaper2] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadProjectDetails();
        if (activeTab === 'overview') {
            loadProjectOverview();
        } else {
            // Reset analysis data when switching to interactions modes (unless we want to persist)
            setData(null);
            setError(null);
        }
    }, [id, activeTab]);

    const loadProjectDetails = async () => {
        try {
            const res = await projectAPI.getOne(id);
            setProject(res.data);
            if (res.data.papers) {
                setPapers(res.data.papers);
            }
        } catch (err) {
            console.error('Failed to load project details:', err);
        }
    };

    const loadProjectOverview = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await analysisAPI.getNoveltyRadar(id);
            setData(response.data);
        } catch (err) {
            console.error('Failed to load novelty data:', err);
            setError('Failed to analyze novelty. Ensure you have at least 2 papers in the project.');
        } finally {
            setLoading(false);
        }
    };

    const handleWebCheck = async () => {
        if (!selectedWebPaperId) {
            setError("Please select a paper to check.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await analysisAPI.checkNoveltyWeb(id, selectedWebPaperId);
            setData(res.data);
        } catch (err) {
            console.error("Web check failed:", err);
            setError(err.response?.data?.message || "Web check failed.");
        } finally {
            setLoading(false);
        }
    };

    const handlePairCheck = async () => {
        if (!pairPaper1 || !pairPaper2) {
            setError("Please select two papers to compare.");
            return;
        }
        if (pairPaper1 === pairPaper2) {
            setError("Please select two different papers.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await analysisAPI.checkNoveltyPair(id, [pairPaper1, pairPaper2]);
            setData(res.data);
        } catch (err) {
            console.error("Pairwise check failed:", err);
            setError(err.response?.data?.message || "Comparison failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file) => {
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', id);

        try {
            await paperAPI.upload(formData);
            // Reload project to get new papers list
            await loadProjectDetails();
            alert("Paper uploaded successfully!");
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload paper');
        } finally {
            setUploading(false);
        }
    };

    // Prepare data for chart
    const chartData = data?.papers?.map((paper) => ({
        subject: paper.title.substring(0, 20) + '...',
        fullTitle: paper.title,
        A: paper.noveltyScore,
        fullMark: 10,
    }));

    return (
        <div className="container mx-auto p-6">
            <Link to={`/projects/${id}`} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Project
            </Link>

            <div className="flex items-center mb-8">
                <Radar className="w-8 h-8 text-primary-400 mr-3" />
                <h1 className="text-4xl font-bold text-gradient">Novelty Radar</h1>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-4 mb-8">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-primary-600 text-white' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}
                >
                    <Radar className="w-4 h-4 mr-2" />
                    Project Overview
                </button>
                <button
                    onClick={() => setActiveTab('web')}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${activeTab === 'web' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}
                >
                    <Globe className="w-4 h-4 mr-2" />
                    Web Comparison
                </button>
                <button
                    onClick={() => setActiveTab('pair')}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${activeTab === 'pair' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}
                >
                    <GitCompare className="w-4 h-4 mr-2" />
                    Pairwise Compare
                </button>
            </div>

            {/* Input Sections for Web/Pairwise */}
            <div className="mb-8">
                {activeTab === 'web' && (
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-4">Check a Paper Against the Web</h3>
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Paper</label>
                                <select
                                    value={selectedWebPaperId}
                                    onChange={(e) => setSelectedWebPaperId(e.target.value)}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">-- Choose a paper --</option>
                                    {papers.map(p => (
                                        <option key={p._id} value={p._id}>{p.title}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleWebCheck}
                                disabled={loading || !selectedWebPaperId}
                                className="btn-primary py-3 px-6 h-full flex items-center justify-center disabled:opacity-50"
                            >
                                {loading ? <div className="spinner w-5 h-5" /> : 'Run Web Check'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'pair' && (
                    <div className="glass-card p-6 space-y-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Paper A (Base)</label>
                                <select
                                    value={pairPaper1}
                                    onChange={(e) => setPairPaper1(e.target.value)}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="">-- Choose Paper A --</option>
                                    {papers.map(p => (
                                        <option key={p._id} value={p._id}>{p.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Paper B (Comparison)</label>
                                <select
                                    value={pairPaper2}
                                    onChange={(e) => setPairPaper2(e.target.value)}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="">-- Choose Paper B --</option>
                                    {papers.map(p => (
                                        <option key={p._id} value={p._id}>{p.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handlePairCheck}
                                disabled={loading || !pairPaper1 || !pairPaper2}
                                className="btn-primary bg-purple-600 hover:bg-purple-700 py-3 px-8 flex items-center justify-center disabled:opacity-50"
                            >
                                {loading ? <div className="spinner w-5 h-5" /> : 'Compare Papers'}
                            </button>
                        </div>

                        <div className="border-t border-slate-700 pt-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                <Upload className="w-4 h-4 mr-2" />
                                Upload New Papers (if needed)
                            </h4>
                            <FileUpload
                                onFileSelect={handleFileUpload}
                                isUploading={uploading}
                                accept=".pdf"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="glass-card p-8 text-center border-red-500/30 mb-8">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                    <h3 className="text-xl font-semibold mb-2 text-red-400">Analysis Failed</h3>
                    <p className="text-gray-700">{error}</p>
                </div>
            )}

            {/* Results Section */}
            {!error && !loading && (
                !data ? (
                    // Placeholder when no data loaded yet (only for interactive tabs)
                    activeTab !== 'overview' && (
                        <div className="glass-card p-12 text-center text-gray-500">
                            <Radar className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p>Select papers above and run analysis to see results here.</p>
                        </div>
                    )
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Radar Chart */}
                            <div className="glass-card p-6 flex flex-col items-center justify-center min-h-[400px]">
                                <h3 className="text-xl font-semibold mb-6">Novelty Score Comparison</h3>
                                <div className="w-full h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" vertical={false} />
                                            <XAxis
                                                dataKey="subject"
                                                stroke="#9ca3af"
                                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                                angle={-45}
                                                textAnchor="end"
                                                interval={0}
                                                height={60}
                                            />
                                            <YAxis
                                                domain={[0, 10]}
                                                stroke="#9ca3af"
                                                tick={{ fill: '#9ca3af' }}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                                cursor={{ fill: '#ffffff10' }}
                                                formatter={(value) => [`${value}/10`, 'Novelty Score']}
                                            />
                                            <Bar
                                                dataKey="A"
                                                name="Novelty Score"
                                                fill="#8b5cf6"
                                                radius={[4, 4, 0, 0]}
                                                barSize={50}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="glass-card p-6">
                                <h3 className="text-xl font-semibold mb-4 flex items-center">
                                    <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
                                    Analysis Summary
                                </h3>
                                <p className="text-gray-800 leading-relaxed mb-6">
                                    {data?.summary}
                                </p>

                                <div className="space-y-4">
                                    <h4 className="font-bold text-gray-700 uppercase text-xs tracking-wider">Top Contributors</h4>
                                    {data?.papers?.sort((a, b) => b.noveltyScore - a.noveltyScore).slice(0, 3).map((paper, idx) => (
                                        <div key={idx} className="bg-white/5 p-4 rounded-lg border border-white/10">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-semibold text-primary-300">{paper.title}</span>
                                                <span className="bg-primary-500/20 text-primary-300 text-xs px-2 py-1 rounded font-bold">
                                                    {paper.noveltyScore}/10
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="border border-gray-200 rounded-lg p-3 bg-green-50">
                                                    <span className="text-xs text-green-600 font-bold block mb-1">Unique Contributions:</span>
                                                    <ul className="list-disc list-inside text-sm text-gray-700 pl-2">
                                                        {paper.uniqueContributions.slice(0, 2).map((c, i) => (
                                                            <li key={i}>{c}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Detailed Breakdown */}
                        <div className="mt-8">
                            <h3 className="text-2xl font-bold mb-6">Detailed Breakdown</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {data?.papers?.map((paper, idx) => (
                                    <div key={idx} className="glass-card p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="text-lg font-bold text-white flex gap-2">
                                                {paper.title}
                                                {paper.isWebSource && <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded">Web Source</span>}
                                            </h4>
                                            <div className="flex items-center bg-slate-800 px-3 py-1 rounded-full border border-white/10">
                                                <span className="text-sm text-gray-400 mr-2">Score:</span>
                                                <span className="text-lg font-bold text-primary-400">{paper.noveltyScore}</span>
                                            </div>
                                        </div>

                                        <div className="mb-4 border border-gray-200 rounded-lg p-4 bg-green-50">
                                            <h5 className="text-sm font-bold text-green-600 mb-2 uppercase tracking-wide">Unique Contributions</h5>
                                            <ul className="space-y-1">
                                                {paper.uniqueContributions.map((item, i) => (
                                                    <li key={i} className="text-sm text-gray-800 flex items-start">
                                                        <span className="mr-2 text-green-500">•</span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="border border-gray-200 rounded-lg p-4 bg-orange-50">
                                            <h5 className="text-sm font-bold text-orange-600 mb-2 uppercase tracking-wide">Overlaps</h5>
                                            <ul className="space-y-1">
                                                {paper.overlaps.map((item, i) => (
                                                    <li key={i} className="text-sm text-gray-800 flex items-start">
                                                        <span className="mr-2 text-orange-500">•</span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {paper.url && (
                                            <div className="mt-4 pt-4 border-t border-white/10">
                                                <a href={paper.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300 flex items-center">
                                                    <Globe className="w-3 h-3 mr-1" />
                                                    View Source
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )
            )}

            {loading && (
                <div className="flex flex-col items-center justify-center p-12">
                    <div className="spinner mb-4"></div>
                    <p className="text-gray-700">Runnning deeper analysis...</p>
                </div>
            )}
        </div>
    );
}
