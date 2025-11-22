import React, { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';

export default function FileUpload({ onFileSelect, isUploading = false, accept = ".pdf", maxSizeMB = 10 }) {
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const validateFile = (file) => {
        if (!file) return false;

        // Check file type
        if (accept && !file.name.toLowerCase().endsWith('.pdf')) {
            setError('Only PDF files are supported');
            return false;
        }

        // Check file size
        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`File size must be less than ${maxSizeMB}MB`);
            return false;
        }

        setError(null);
        return true;
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (validateFile(file)) {
                setSelectedFile(file);
                onFileSelect(file);
            }
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (validateFile(file)) {
                setSelectedFile(file);
                onFileSelect(file);
            }
        }
    };

    const onButtonClick = () => {
        inputRef.current.click();
    };

    const clearFile = (e) => {
        e.stopPropagation();
        setSelectedFile(null);
        setError(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div className="w-full">
            <div
                className={`relative w-full h-64 rounded-xl border-2 border-dashed transition-all duration-300 ease-in-out flex flex-col items-center justify-center p-6 text-center
                    ${dragActive
                        ? 'border-primary-500 bg-primary-500/10 scale-[1.02]'
                        : 'border-slate-800 bg-[#020817] hover:border-slate-700 hover:bg-[#0f172a]'
                    }
                    ${error ? 'border-red-500/50 bg-red-500/5' : ''}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={onButtonClick}
                style={{ cursor: isUploading ? 'not-allowed' : 'pointer' }}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={handleChange}
                    disabled={isUploading}
                />

                {isUploading ? (
                    <div className="flex flex-col items-center animate-pulse">
                        <div className="w-16 h-16 mb-4 rounded-full bg-primary-500/20 flex items-center justify-center">
                            <Upload className="w-8 h-8 text-primary-400 animate-bounce" />
                        </div>
                        <p className="text-lg font-medium text-white">Uploading paper...</p>
                        <p className="text-sm text-gray-400 mt-2">Please wait while we process your file</p>
                    </div>
                ) : selectedFile ? (
                    <div className="relative flex flex-col items-center w-full max-w-xs p-4 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                        <button
                            onClick={clearFile}
                            className="absolute -top-2 -right-2 p-1 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 border border-gray-700 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <FileText className="w-12 h-12 text-primary-400 mb-3" />
                        <p className="text-sm font-medium text-white truncate w-full text-center">
                            {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        <div className="mt-3 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs font-medium">
                            Ready to upload
                        </div>
                    </div>
                ) : (
                    <>
                        <div className={`w-16 h-16 mb-4 rounded-2xl flex items-center justify-center transition-all duration-300
                            ${dragActive ? 'bg-primary-500 text-white rotate-12 scale-110' : 'bg-gray-800 text-gray-400'}
                        `}>
                            <Upload className="w-8 h-8" />
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">
                            Upload Files
                        </h3>
                        <p className="text-gray-400 mb-6 max-w-sm">
                            Drag and drop files here or click to browse
                        </p>

                        <div className="flex flex-col items-center space-y-2 text-xs text-gray-500">
                            <p>Max file size: {maxSizeMB}MB</p>
                            <p>Supported: {accept.replace(/\./g, '').toUpperCase()}</p>
                        </div>
                    </>
                )}

                {error && (
                    <div className="absolute bottom-4 flex items-center text-red-400 text-sm bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
