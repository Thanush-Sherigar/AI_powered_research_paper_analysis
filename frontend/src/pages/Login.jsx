import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, X } from 'lucide-react';

export default function Login() {
    const [showSignIn, setShowSignIn] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);

    // Sign In Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Sign Up Form State
    const [signUpName, setSignUpName] = useState('');
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register: registerUser, setAuthData } = useAuth();
    const navigate = useNavigate();

    // Handle GitHub OAuth redirect
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('accessToken');
        const refreshToken = params.get('refreshToken');
        const errorParam = params.get('error');

        if (errorParam) {
            setError(decodeURIComponent(errorParam));
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (accessToken && refreshToken) {
            const handleGithubLogin = async () => {
                try {
                    setLoading(true);
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', refreshToken);

                    const response = await fetch('http://localhost:5000/api/auth/me', {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    });

                    if (response.ok) {
                        const userData = await response.json();
                        setAuthData(userData, accessToken, refreshToken);
                        navigate('/');
                    } else {
                        throw new Error('Failed to fetch user profile');
                    }
                } catch (err) {
                    setError('Failed to complete GitHub login');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };

            handleGithubLogin();
        }
    }, [navigate, setAuthData]);

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');

        if (signUpPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (signUpPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        const result = await registerUser(signUpName, signUpEmail, signUpPassword);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="relative mx-auto my-10 flex max-w-7xl flex-col items-center justify-center">
            {/* Navbar */}
            <nav className="flex w-full items-center justify-between border-t border-b border-neutral-200 px-4 py-4">
                <div className="flex items-center gap-2">
                    <div className="size-7 rounded-full bg-gradient-to-br from-violet-500 to-pink-500" />
                    <h1 className="text-base font-bold md:text-2xl text-gray-900">Paper Reviewer</h1>
                </div>
                <button
                    onClick={() => {
                        setShowSignIn(true);
                        setShowSignUp(false);
                    }}
                    className="w-24 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 md:w-32"
                >
                    Login
                </button>
            </nav>

            {/* Decorative Borders */}
            <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80">
                <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
            </div>
            <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80">
                <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80">
                <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
            </div>

            <div className="px-4 py-10 md:py-20">
                {/* Animated Hero Title */}
                <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-slate-700 md:text-4xl lg:text-7xl">
                    {"Analyze Research Papers in Minutes, Not Hours"
                        .split(" ")
                        .map((word, index) => (
                            <motion.span
                                key={index}
                                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                                transition={{
                                    duration: 0.3,
                                    delay: index * 0.1,
                                    ease: "easeInOut",
                                }}
                                className="mr-2 inline-block"
                            >
                                {word}
                            </motion.span>
                        ))}
                </h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.8 }}
                    className="relative z-10 mx-auto max-w-2xl py-6 text-center text-xl md:text-2xl font-medium bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent tracking-wide leading-relaxed"
                    style={{ textShadow: '0 2px 10px rgba(59, 130, 246, 0.1)' }}
                >
                    AI-powered research paper analysis, review, and insights. Get comprehensive summaries,
                    critical reviews, and comparative analysis in seconds.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 1 }}
                    className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
                >
                    <button
                        onClick={() => {
                            setShowSignIn(true);
                            setShowSignUp(false);
                            setError('');
                        }}
                        className="w-60 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800"
                    >
                        Get Started
                    </button>
                    <button
                        onClick={() => {
                            setShowSignUp(true);
                            setShowSignIn(false);
                            setError('');
                        }}
                        className="w-60 transform rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-100"
                    >
                        Sign Up
                    </button>
                </motion.div>

                {/* Popup Sign In Modal */}
                <AnimatePresence>
                    {showSignIn && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowSignIn(false)}
                                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                            />

                            {/* Modal */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                                onClick={() => setShowSignIn(false)}
                            >
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="relative w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 shadow-2xl"
                                >
                                    <button
                                        onClick={() => setShowSignIn(false)}
                                        className="absolute right-4 top-4 rounded-full p-2 hover:bg-gray-100"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>

                                    <h2 className="mb-6 text-center text-2xl font-bold">Welcome Back</h2>

                                    {error && (
                                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                                            {error}
                                        </div>
                                    )}

                                    <form onSubmit={handleSignIn} className="space-y-4">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">Email</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="name@example.com"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium">Password</label>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full transform rounded-lg bg-black px-6 py-3 font-medium text-white transition-all hover:bg-gray-800 disabled:opacity-50"
                                        >
                                            {loading ? 'Signing in...' : 'Sign In'}
                                        </button>

                                        <div className="relative my-4">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-gray-300"></div>
                                            </div>
                                            <div className="relative flex justify-center text-sm">
                                                <span className="bg-white px-2 text-gray-500">Or continue with</span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => window.location.href = 'http://localhost:5000/api/auth/github'}
                                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium transition-all hover:bg-gray-50"
                                        >
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                            </svg>
                                            Continue with GitHub
                                        </button>

                                        <p className="mt-4 text-center text-sm text-gray-600">
                                            Don't have an account?{' '}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowSignIn(false);
                                                    setShowSignUp(true);
                                                }}
                                                className="font-semibold text-black hover:underline"
                                            >
                                                Sign up
                                            </button>
                                        </p>
                                    </form>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Popup Sign Up Modal */}
                <AnimatePresence>
                    {showSignUp && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowSignUp(false)}
                                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                            />

                            {/* Modal */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                                onClick={() => setShowSignUp(false)}
                            >
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="relative w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 shadow-2xl"
                                >
                                    <button
                                        onClick={() => setShowSignUp(false)}
                                        className="absolute right-4 top-4 rounded-full p-2 hover:bg-gray-100"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>

                                    <h2 className="mb-6 text-center text-2xl font-bold">Create Account</h2>

                                    {error && (
                                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                                            {error}
                                        </div>
                                    )}

                                    <form onSubmit={handleSignUp} className="space-y-4">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">Name</label>
                                            <input
                                                type="text"
                                                value={signUpName}
                                                onChange={(e) => setSignUpName(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="John Doe"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium">Email</label>
                                            <input
                                                type="email"
                                                value={signUpEmail}
                                                onChange={(e) => setSignUpEmail(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="name@example.com"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium">Password</label>
                                            <input
                                                type="password"
                                                value={signUpPassword}
                                                onChange={(e) => setSignUpPassword(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium">Confirm Password</label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full transform rounded-lg bg-black px-6 py-3 font-medium text-white transition-all hover:bg-gray-800 disabled:opacity-50"
                                        >
                                            {loading ? 'Creating account...' : 'Sign Up'}
                                        </button>

                                        <div className="relative my-4">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-gray-300"></div>
                                            </div>
                                            <div className="relative flex justify-center text-sm">
                                                <span className="bg-white px-2 text-gray-500">Or continue with</span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => window.location.href = 'http://localhost:5000/api/auth/github'}
                                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium transition-all hover:bg-gray-50"
                                        >
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                            </svg>
                                            Continue with GitHub
                                        </button>

                                        <p className="mt-4 text-center text-xs text-gray-500">
                                            By signing up, you agree to our{' '}
                                            <a href="#" className="underline">Terms of Service</a>
                                            {' '}and{' '}
                                            <a href="#" className="underline">Privacy Policy</a>
                                        </p>

                                        <p className="text-center text-sm text-gray-600">
                                            Already have an account?{' '}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowSignUp(false);
                                                    setShowSignIn(true);
                                                }}
                                                className="font-semibold text-black hover:underline"
                                            >
                                                Sign in
                                            </button>
                                        </p>
                                    </form>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
