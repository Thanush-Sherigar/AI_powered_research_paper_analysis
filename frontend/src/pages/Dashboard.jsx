import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectAPI } from '../services/api';
import { Plus, FolderOpen, FileText, Calendar, TrendingUp, X } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '' });

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const response = await projectAPI.getAll();
            setProjects(response.data.projects);
        } catch (error) {
            console.error('Failed to load projects:', error);
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
            console.error('Failed to create project:', error);
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
