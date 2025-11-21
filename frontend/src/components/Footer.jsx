import { Link } from 'react-router-dom';
import { Github, Heart, BookOpen, Mail, ExternalLink } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
            <div className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* About Section */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                            <h3 className="text-lg font-bold text-gray-900">Paper Reviewer</h3>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            AI-powered research paper analysis and review platform.
                            Enhance your research with intelligent insights and automated analysis.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                                    Features
                                </a>
                            </li>
                            <li>
                                <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                                    About
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">Connect</h3>
                        <div className="space-y-3">
                            <a
                                href="mailto:support@paperreviewer.ai"
                                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors text-sm"
                            >
                                <Mail className="w-4 h-4" />
                                <span>support@paperreviewer.ai</span>
                            </a>
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors text-sm"
                            >
                                <Github className="w-4 h-4" />
                                <span>GitHub</span>
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-6 border-t border-gray-200">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-600 text-sm">
                            © {currentYear} Paper Reviewer. All rights reserved.
                        </p>
                        <p className="text-gray-600 text-sm flex items-center gap-1">
                            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for researchers
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
