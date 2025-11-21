import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectAPI, paperAPI } from '../services/api';
import { Upload, Plus, FileText, ArrowLeft, Radar, BookMarked } from 'lucide-react';

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

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
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

            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gradient mb-2">
                        {project?.name}
                    </h1>
                    <p className="text-gray-400">{project?.description}</p>
                </div>
                <div className="flex space-x-3">
                    <Link
                        to={`/projects/${id}/novelty`}
                        className="btn-gradient flex items-center space-x-2"
                    >
                        <Radar className="w-5 h-5" />
                        <span>Novelty Radar</span>
                    </Link>
                    <Link
                        to={`/projects/${id}/reading-path`}
                        className="btn-gradient flex items-center space-x-2"
                    >
                        <BookMarked className="w-5 h-5" />
                        <span>Reading Path</span>
                    </Link>
                </div>
            </div>

            <div className="glass-card p-6 mb-6">
                <label className="btn-gradient cursor-pointer inline-flex items-center space-x-2">
                    <Upload className="w-5 h-5" />
                    <span>{uploading ? 'Uploading...' : 'Upload PDF'}</span>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                    />
                </label>
            </div>

            {project?.papers?.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                    <h3 className="text-xl font-semibold mb-2">No papers yet</h3>
                    <p className="text-gray-400">Upload your first PDF to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {project?.papers?.map((paper) => (
                        <Link
                            key={paper._id}
                            to={`/papers/${paper._id}`}
                            className="glass-card p-6 card-hover"
                        >
                            <FileText className="w-8 h-8 text-primary-400 mb-4" />
                            <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                                {paper.title}
                            </h3>
                            {paper.authors && paper.authors.length > 0 && (
                                <p className="text-sm text-gray-400 mb-2">
                                    {paper.authors.slice(0, 3).join(', ')}
                                    {paper.authors.length > 3 && ' et al.'}
                                </p>
                            )}
                            <p className="text-xs text-gray-500">
                                {new Date(paper.createdAt).toLocaleDateString()}
                            </p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
