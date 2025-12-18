import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectAPI, plagiarismAPI } from '../services/api';
import { Plus, FolderOpen, FileText, Calendar, TrendingUp, X, ShieldAlert, Search, AlertTriangle, CheckCircle, ChevronRight, ChevronDown } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [newProject, setNewProject] = useState({ name: '', description: '' });

    const [isQuickCheckOpen, setIsQuickCheckOpen] = useState(false);
    const [quickText, setQuickText] = useState('');
    const [quickLoading, setQuickLoading] = useState(false);
    const [quickResult, setQuickResult] = useState(null);
    const [quickError, setQuickError] = useState(null);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const response = await projectAPI.getAll();
            setProjects(response.data.projects);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            await projectAPI.create(newProject);
            setNewProject({ name: '', description: '' });
            setShowCreateModal(false);
            loadProjects();
        } catch (error) {
        }
    };

    const handleQuickCheck = async () => {
        if (!quickText || quickText.length < 50) {
            setQuickError('Text is too short. Please enter at least 50 characters.');
            return;
        }

        setQuickLoading(true);
        setQuickError(null);
        setQuickResult(null);

        try {
            const res = await plagiarismAPI.checkWeb(quickText);
            setQuickResult(res.data);
        } catch (err) {
            setQuickError(err.response?.data?.message || 'Plagiarism check failed. Please try again.');
        } finally {
            setQuickLoading(false);
        }
    };

    const totalPapers = projects.reduce((sum, p) => sum + (p.metadata?.paperCount || 0), 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            My Projects
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Organize and analyze your research papers with AI-powered insights
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-gradient flex items-center space-x-2 justify-center"
                    >
                        <Plus className="w-5 h-5" />
                        <span>New Project</span>
                    </button>
                </div>
            </div>

            {/* Quick Plagiarism Check Section */}
            <div className="mb-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldAlert className="w-32 h-32" />
                </div>

                <div className="relative z-10">
                    <button
                        onClick={() => setIsQuickCheckOpen(!isQuickCheckOpen)}
                        className="w-full flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-500/20 p-2 rounded-lg backdrop-blur-sm border border-orange-500/30">
                                <ShieldAlert className="w-6 h-6 text-orange-400" />
                            </div>
                            <h2 className="text-xl font-bold">Quick Plagiarism Check</h2>
                        </div>
                        <div className={`p-2 rounded-full bg-slate-800 transition-all duration-300 ${isQuickCheckOpen ? 'rotate-180 bg-slate-700' : 'rotate-0'}`}>
                            <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-white" />
                        </div>
                    </button>

                    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-start transition-all duration-500 ease-in-out overflow-hidden ${isQuickCheckOpen ? 'max-h-[800px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
                        <div>
                            <p className="text-slate-300 mb-6 text-sm">
                                Paste content below to instantly check for plagiarism against web sources.
                                For deeper analysis (including AI detection), use a Project.
                            </p>

                            <div className="relative">
                                <textarea
                                    value={quickText}
                                    onChange={(e) => setQuickText(e.target.value)}
                                    className="w-full h-32 bg-slate-700/50 border border-slate-600 rounded-xl p-4 text-sm text-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none placeholder-slate-500 font-mono transition-all"
                                    placeholder="Paste text here to check (min 50 chars)..."
                                />
                                <div className="absolute bottom-3 right-3 text-xs text-slate-500 bg-slate-800/80 px-2 py-1 rounded">
                                    {quickText.length} chars
                                </div>
                            </div>

                            {quickError && (
                                <div className="mt-3 text-red-400 text-sm flex items-center gap-2 bg-red-900/20 p-2 rounded-lg border border-red-900/40">
                                    <AlertTriangle className="w-4 h-4" />
                                    {quickError}
                                </div>
                            )}

                            <button
                                onClick={handleQuickCheck}
                                disabled={quickLoading || quickText.length < 50}
                                className={`mt-4 btn-generation w-full sm:w-auto flex items-center justify-center gap-2 ${quickLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {quickLoading ? (
                                    <>
                                        <div className="spinner w-4 h-4 border-white border-t-transparent"></div>
                                        Checking Web Sources...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-4 h-4" />
                                        Check for Plagiarism
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 min-h-[200px] flex flex-col">
                            {!quickResult ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm p-8 text-center border-2 border-dashed border-slate-700 rounded-lg">
                                    <ShieldAlert className="w-10 h-10 mb-3 opacity-30" />
                                    <p>Results will appear here</p>
                                </div>
                            ) : (
                                <div className="flex-1 animate-fadeIn">
                                    <div className={`flex items-center gap-3 mb-4 p-3 rounded-lg border ${quickResult.foundMatches ? 'bg-amber-900/20 border-amber-500/30 text-amber-200' : 'bg-green-900/20 border-green-500/30 text-green-200'}`}>
                                        {quickResult.foundMatches ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                                        <div className="font-bold">
                                            {quickResult.foundMatches ? 'Plagiarism Detected' : 'Content Appears Original'}
                                        </div>
                                    </div>

                                    <div className="space-y-3 overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
                                        {quickResult.matches && quickResult.matches.map((match, i) => (
                                            <div key={i} className="bg-slate-700/50 rounded p-3 text-xs border border-slate-600">
                                                <div className="mb-2 italic text-slate-400 border-l-2 border-blue-500/50 pl-2">
                                                    "{match.chunk}"
                                                </div>
                                                <div className="space-y-1">
                                                    {match.matches.map((m, j) => (
                                                        <a key={j} href={m.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 hover:underline truncate">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                                                            {m.title}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        {(!quickResult.matches || quickResult.matches.length === 0) && !quickResult.foundMatches && (
                                            <div className="text-slate-400 text-sm text-center py-4">
                                                No matches found across web sources.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1 font-medium">Total Projects</p>
                            <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
                        </div>
                        <div className="bg-purple-100 p-4 rounded-xl">
                            <FolderOpen className="w-8 h-8 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1 font-medium">Total Papers</p>
                            <p className="text-3xl font-bold text-gray-900">{totalPapers}</p>
                        </div>
                        <div className="bg-blue-100 p-4 rounded-xl">
                            <FileText className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1 font-medium">AI Analyses</p>
                            <p className="text-3xl font-bold text-gray-900">{totalPapers * 3}</p>
                        </div>
                        <div className="bg-green-100 p-4 rounded-xl">
                            <TrendingUp className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Projects Grid */}
            {projects.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-6">
                        <FolderOpen className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-gray-900">No projects yet</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Create your first project to start analyzing research papers with AI-powered tools
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-generation inline-flex items-center space-x-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create Your First Project</span>
                    </button>
                </div>
            ) : (
                <div>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">Your Projects</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <Link
                                key={project._id}
                                to={`/projects/${project._id}`}
                                className="glass-card p-6 card-hover"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="bg-blue-100 p-3 rounded-xl">
                                        <FolderOpen className="w-7 h-7 text-blue-600" />
                                    </div>
                                    <span className="badge-info">
                                        {project.metadata?.paperCount || 0} papers
                                    </span>
                                </div>

                                <h3 className="text-xl font-semibold mb-2 text-gray-900 line-clamp-1">
                                    {project.name}
                                </h3>

                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {project.description || 'No description provided'}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div className="flex items-center text-xs text-gray-500">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {new Date(project.createdAt).toLocaleDateString()}
                                    </div>
                                    <span className="badge-success text-xs">Active</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Create Project Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="glass-card p-8 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateProject} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">
                                    Project Name
                                </label>
                                <input
                                    type="text"
                                    value={newProject.name}
                                    onChange={(e) =>
                                        setNewProject({ ...newProject, name: e.target.value })
                                    }
                                    className="input-field w-full"
                                    placeholder="My Research Project"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">
                                    Description (optional)
                                </label>
                                <textarea
                                    value={newProject.description}
                                    onChange={(e) =>
                                        setNewProject({ ...newProject, description: e.target.value })
                                    }
                                    className="input-field w-full h-24 resize-none"
                                    placeholder="Brief description of your project..."
                                />
                            </div>

                            <div className="flex space-x-3 pt-2">
                                <button type="submit" className="btn-generation flex-1">
                                    Create Project
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg transition-colors font-semibold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
