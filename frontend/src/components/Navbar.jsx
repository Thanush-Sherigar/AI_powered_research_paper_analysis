import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, BookOpen, User } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <span className="text-xl font-bold text-gray-900 block">
                                Paper Reviewer
                            </span>
                            <span className="text-xs text-gray-500">
                                AI-Powered Analysis
                            </span>
                        </div>
                    </Link>



                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        <div className="hidden sm:flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2.5 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-200"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5 text-gray-600 hover:text-red-600 transition-colors" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
