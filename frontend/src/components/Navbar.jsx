import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, BookOpen, FlaskConical } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="glass-card m-4 p-4">
            <div className="container mx-auto flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2">
                    <BookOpen className="w-8 h-8 text-primary-400" />
                    <span className="text-2xl font-bold text-gradient">
                        Paper Reviewer
                    </span>
                </Link>

                <div className="flex items-center space-x-6">
                    <Link
                        to="/citation-checker"
                        className="flex items-center space-x-2 hover:text-primary-400 transition-colors"
                    >
                        <FlaskConical className="w-5 h-5" />
                        <span>Citation Checker</span>
                    </Link>

                    <div className="flex items-center space-x-3">
                        <div className="text-right">
                            <p className="text-sm font-medium">{user?.name}</p>
                            <p className="text-xs text-gray-400">{user?.email}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
