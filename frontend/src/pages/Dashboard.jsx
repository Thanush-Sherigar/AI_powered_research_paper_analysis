import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI } from '../services/api';
import { Plus, FolderOpen, FileText, Calendar } from 'lucide-react';

export default function Dashboard() {
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gradient mb-2">
                        My Projects
                    </h1>
                    <p className="text-gray-400">
                        Organize and analyze your research papers
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-gradient flex items-center space-x-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Project</span>
                </button>
            </div>

            {projects.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                    <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
                    <p className="text-gray-400 mb-6">
                        Create your first project to start analyzing papers
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-gradient"
                    >
                        Create Project
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Link
                            key={project._id}
                            to={`/projects/${project._id}`}
                            className="glass-card p-6 card-hover"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <FolderOpen className="w-8 h-8 text-primary-400" />
                                <span className="text-sm text-gray-400">
                                    {project.metadata?.paperCount || 0} papers
                                </span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                {project.description || 'No description'}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(project.createdAt).toLocaleDateString()}
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Create Project Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="glass-card p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
                        <form onSubmit={handleCreateProject} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
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
                                <label className="block text-sm font-medium mb-2">
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
                            <div className="flex space-x-3">
                                <button type="submit" className="btn-gradient flex-1">
                                    Create
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 py-2 px-4 rounded-lg transition-colors"
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
