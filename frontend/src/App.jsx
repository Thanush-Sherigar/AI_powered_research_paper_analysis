import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectView from './pages/ProjectView';
import PaperDetail from './pages/PaperDetail';
import ComparisonView from './pages/ComparisonView';
import NoveltyRadar from './pages/NoveltyRadar';
import ReadingPath from './pages/ReadingPath';
import CitationChecker from './pages/CitationChecker';
import PlagiarismCheck from './pages/PlagiarismCheck';
import { GridBackground } from './components/ui/GridBackground';

/**
 * Protected Route Component
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

/**
 * Main App Component
 */
function App() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-black overflow-hidden relative">
            {isAuthenticated && <Sidebar />}

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
                <GridBackground className="w-full h-full flex flex-col">
                    <main className="flex-1 overflow-y-auto w-full">
                        <div className="min-h-full flex flex-col w-full">
                            <div className="flex-1 p-8">
                                <Routes>
                                    {/* Public routes */}
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/register" element={<Register />} />

                                    {/* Protected routes */}
                                    <Route
                                        path="/"
                                        element={
                                            <ProtectedRoute>
                                                <Dashboard />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/projects/:id"
                                        element={
                                            <ProtectedRoute>
                                                <ProjectView />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/papers/:id"
                                        element={
                                            <ProtectedRoute>
                                                <PaperDetail />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/compare"
                                        element={
                                            <ProtectedRoute>
                                                <ComparisonView />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/projects/:id/novelty"
                                        element={
                                            <ProtectedRoute>
                                                <NoveltyRadar />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/projects/:id/reading-path"
                                        element={
                                            <ProtectedRoute>
                                                <ReadingPath />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/projects/:id/citation-checker"
                                        element={
                                            <ProtectedRoute>
                                                <CitationChecker />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/projects/:id/plagiarism"
                                        element={
                                            <ProtectedRoute>
                                                <PlagiarismCheck />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Fallback */}
                                    <Route path="*" element={<Navigate to="/" />} />
                                </Routes>
                            </div>
                            {isAuthenticated && <div className="px-8 pb-8"><Footer /></div>}
                        </div>
                    </main>
                </GridBackground>
            </div>
        </div>
    );
}

export default App;
