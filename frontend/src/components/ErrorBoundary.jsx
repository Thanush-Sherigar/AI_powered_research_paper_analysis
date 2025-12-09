import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
                    <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl w-full">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong.</h1>
                        <div className="bg-red-50 p-4 rounded border border-red-200 mb-6">
                            <h2 className="font-bold text-red-800 mb-2">Error:</h2>
                            <pre className="text-sm text-red-700 whitespace-pre-wrap font-mono">
                                {this.state.error && this.state.error.toString()}
                            </pre>
                        </div>
                        <div className="bg-gray-50 p-4 rounded border border-gray-200 overflow-auto max-h-96">
                            <h2 className="font-bold text-gray-800 mb-2">Component Stack:</h2>
                            <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                            Reload Page
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="mt-6 ml-4 px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
