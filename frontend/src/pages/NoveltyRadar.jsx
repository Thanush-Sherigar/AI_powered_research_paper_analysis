import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { analysisAPI } from '../services/api';
import { ArrowLeft, Radar, Lightbulb, AlertCircle } from 'lucide-react';
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar as RechartsRadar,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from 'recharts';

export default function NoveltyRadar() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadNoveltyData();
    }, [id]);

    const loadNoveltyData = async () => {
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="spinner mb-4"></div>
                <p className="text-gray-400">Analyzing paper novelty and contributions...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <Link to={`/projects/${id}`} className="flex items-center text-gray-400 hover:text-white mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Project
                </Link>
                <div className="glass-card p-12 text-center border-red-500/30">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <h3 className="text-xl font-semibold mb-2 text-red-400">Analysis Failed</h3>
                    <p className="text-gray-400">{error}</p>
                </div>
            </div>
        );
    }

    // Prepare data for chart
    const chartData = data?.papers?.map((paper) => ({
        subject: paper.title.substring(0, 20) + '...',
        fullTitle: paper.title,
        A: paper.noveltyScore,
        fullMark: 10,
    }));

    return (
        <div className="container mx-auto p-6">
            <Link to={`/projects/${id}`} className="flex items-center text-gray-400 hover:text-white mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Project
            </Link>

            <div className="flex items-center mb-8">
                <Radar className="w-8 h-8 text-primary-400 mr-3" />
                <h1 className="text-4xl font-bold text-gradient">Novelty Radar</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Radar Chart */}
                <div className="glass-card p-6 flex flex-col items-center justify-center min-h-[400px]">
                    <h3 className="text-xl font-semibold mb-6">Novelty Score Comparison</h3>
                    <div className="w-full h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                <PolarGrid stroke="#ffffff33" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#9ca3af' }} />
                                <RechartsRadar
                                    name="Novelty Score"
                                    dataKey="A"
                                    stroke="#8b5cf6"
                                    fill="#8b5cf6"
                                    fillOpacity={0.5}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                    itemStyle={{ color: '#a78bfa' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Summary */}
                <div className="glass-card p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                        <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
                        Analysis Summary
                    </h3>
                    <p className="text-gray-300 leading-relaxed mb-6">
                        {data?.summary}
                    </p>

                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-400 uppercase text-xs tracking-wider">Top Contributors</h4>
                        {data?.papers?.sort((a, b) => b.noveltyScore - a.noveltyScore).slice(0, 3).map((paper, idx) => (
                            <div key={idx} className="bg-white/5 p-4 rounded-lg border border-white/10">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-semibold text-primary-300">{paper.title}</span>
                                    <span className="bg-primary-500/20 text-primary-300 text-xs px-2 py-1 rounded font-bold">
                                        {paper.noveltyScore}/10
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <div>
                                        <span className="text-xs text-green-400 font-bold block mb-1">Unique Contributions:</span>
                                        <ul className="list-disc list-inside text-sm text-gray-400 pl-2">
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
                                <h4 className="text-lg font-bold text-white">{paper.title}</h4>
                                <div className="flex items-center bg-slate-800 px-3 py-1 rounded-full border border-white/10">
                                    <span className="text-sm text-gray-400 mr-2">Score:</span>
                                    <span className="text-lg font-bold text-primary-400">{paper.noveltyScore}</span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h5 className="text-sm font-bold text-green-400 mb-2 uppercase tracking-wide">Unique Contributions</h5>
                                <ul className="space-y-1">
                                    {paper.uniqueContributions.map((item, i) => (
                                        <li key={i} className="text-sm text-gray-300 flex items-start">
                                            <span className="mr-2 text-green-500">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h5 className="text-sm font-bold text-orange-400 mb-2 uppercase tracking-wide">Overlaps</h5>
                                <ul className="space-y-1">
                                    {paper.overlaps.map((item, i) => (
                                        <li key={i} className="text-sm text-gray-300 flex items-start">
                                            <span className="mr-2 text-orange-500">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
