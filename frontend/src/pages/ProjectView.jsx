import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectAPI, paperAPI } from '../services/api';
import { Upload, FileText, ArrowLeft, Radar, BookMarked, Sparkles, ShieldAlert } from 'lucide-react';
import FileUpload from '../components/ui/FileUpload';

export default function ProjectView() {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadProject();
    }, [id]);

    const loadProject = async () => {
        try {
            const response = await projectAPI.getOne(id);
            setProject(response.data);
        } catch (error) {
            console.error('Failed to load project:', error);
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
            loadProject();
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload paper');
        } finally {
            setUploading(false);
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
            <Link to="/" className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
            </Link>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gradient mb-2">
                        {project?.name}
                    </h1>
                    <p className="text-gray-400">{project?.description}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Link
                        to={`/projects/${id}/novelty`}
                        className="btn-insights flex items-center space-x-2"
                    >
                        <Radar className="w-5 h-5" />
                        <span>Novelty Radar</span>
                    </Link>
                    <Link
                        to={`/projects/${id}/reading-path`}
                        className="btn-comparison flex items-center space-x-2"
                    >
                        <BookMarked className="w-5 h-5" />
                        <span>Reading Path</span>
                    </Link>
                    <Link
                        to={`/projects/${id}/citation-checker`}
                        className="btn-quality flex items-center space-x-2"
                    >
                        <Sparkles className="w-5 h-5" />
                        <span>Citation Checker</span>
                    </Link>
                    <Link
                        to={`/projects/${id}/plagiarism`}
                        className="btn-danger flex items-center space-x-2"
                        style={{ background: 'linear-gradient(to right, #ef4444, #f87171)' }}
                    >
                        <ShieldAlert className="w-5 h-5" />
                        <span>Plagiarism Check</span>
                    </Link>
                </div>
            </div>

            <div className="glass-card p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Add Papers</h3>
                <FileUpload
                    onFileSelect={handleFileUpload}
                    isUploading={uploading}
                    accept=".pdf"
                />
            </div>

            {project?.papers?.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4">
                        <FileText className="w-10 h-10 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No papers yet</h3>
                    <p className="text-gray-400">Upload your first PDF to get started with AI-powered analysis</p>
                </div>
            ) : (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gradient-purple">Papers ({project.papers.length})</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {project?.papers?.map((paper, index) => (
                            <Link
                                key={paper._id}
                                to={`/papers/${paper._id}`}
                                className="glass-card p-6 card-hover group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all">
                                        <FileText className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <span className="badge-info">#{index + 1}</span>
                                </div>
                                <h3 className="text-lg font-semibold mb-3 line-clamp-2 group-hover:text-primary-300 transition-colors">
                                    {paper.title}
                                </h3>
                                {paper.authors && paper.authors.length > 0 && (
                                    <p className="text-sm text-gray-400 mb-2 line-clamp-1">
                                        {paper.authors.slice(0, 3).join(', ')}
                                        {paper.authors.length > 3 && ' et al.'}
                                    </p>
                                )}
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                                    <p className="text-xs text-gray-500">
                                        {new Date(paper.createdAt).toLocaleDateString()}
                                    </p>
                                    <span className="badge-success">Processed</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
