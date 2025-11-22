import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, setAuthData } = useAuth();
    const navigate = useNavigate();

    // Handle GitHub OAuth redirect
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('accessToken');
        const refreshToken = params.get('refreshToken');
        const errorParam = params.get('error');

        if (errorParam) {
            setError(decodeURIComponent(errorParam));
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (accessToken && refreshToken) {
            // We need to fetch the user details since the redirect only gave us tokens
            // But for now, let's just set the tokens. 
            // Ideally, the backend should pass the user object too or we fetch it.
            // Since AuthContext expects user object in localStorage, we might need to fetch /me
            // OR we can update AuthContext to fetch user if token exists but user doesn't.

            // Let's try to set tokens and let AuthContext/App handle the rest?
            // Actually, AuthContext relies on 'user' in localStorage.
            // We should probably fetch the user profile here.

            const handleGithubLogin = async () => {
                try {
                    setLoading(true);
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', refreshToken);

                    // We need a way to get the user. 
                    // Let's assume we can call a "me" endpoint or just reload and let App fetch it?
                    // But AuthContext doesn't have a "fetchMe" yet.
                    // Let's use the setAuthData helper we will add to AuthContext.

                    // For now, let's manually fetch user info using the token
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

    const handleSubmit = async (e) => {
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

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
            {/* Left Side - Dark Background */}
            <div style={{
                width: '50%',
                backgroundColor: '#111827',
                color: 'white',
                padding: '3rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden'
            }} className="hidden lg:flex">
                {/* Background gradients */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '24rem',
                    height: '24rem',
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
                    filter: 'blur(60px)'
                }}></div>
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '24rem',
                    height: '24rem',
                    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
                    filter: 'blur(60px)'
                }}></div>

                <div style={{ position: 'relative', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <BookOpen style={{ width: '2rem', height: '2rem' }} />
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Paper Reviewer</span>
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                        <div style={{ marginTop: '8rem' }}>
                            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', lineHeight: '1.2' }}>
                                AI-Powered Research Paper Analysis
                            </h2>
                            <p style={{ fontSize: '1.125rem', lineHeight: '1.75', color: '#d1d5db' }}>
                                Analyze, compare, and extract insights from research papers with advanced AI technology.
                                Save time and enhance your research workflow.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                backgroundColor: 'white'
            }}>
                <div style={{ width: '100%', maxWidth: '28rem' }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                            Welcome back
                        </h1>
                        <p style={{ color: '#6b7280' }}>
                            Enter your email to sign in to your account
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
                        {error && (
                            <div style={{
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '0.5rem',
                                padding: '1rem',
                                fontSize: '0.875rem',
                                color: '#991b1b',
                                marginBottom: '1.5rem'
                            }}>
                                {error}
                            </div>
                        )}

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#111827',
                                marginBottom: '0.5rem'
                            }}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.625rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                                placeholder="name@example.com"
                                required
                                onFocus={(e) => e.target.style.borderColor = '#111827'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#111827',
                                marginBottom: '0.5rem'
                            }}>
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.625rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                                placeholder="••••••••"
                                required
                                onFocus={(e) => e.target.style.borderColor = '#111827'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: '#111827',
                                color: 'white',
                                fontWeight: '600',
                                borderRadius: '0.5rem',
                                border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.5 : 1,
                                fontSize: '1rem'
                            }}
                        >
                            {loading ? 'Signing in...' : 'Sign In with Email'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                            <div style={{ width: '100%', borderTop: '1px solid #d1d5db' }}></div>
                        </div>
                        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', fontSize: '0.875rem' }}>
                            <span style={{ padding: '0 0.5rem', backgroundColor: 'white', color: '#6b7280' }}>Or continue with</span>
                        </div>
                    </div>

                    {/* GitHub Button */}
                    <button
                        type="button"
                        onClick={() => window.location.href = 'http://localhost:5000/api/auth/github'}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.5rem',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            fontWeight: '500',
                            marginBottom: '1.5rem'
                        }}
                    >
                        <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        Continue with GitHub
                    </button>

                    {/* Footer */}
                    <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ fontWeight: '600', color: '#111827', textDecoration: 'none' }}>
                            Sign up
                        </Link>
                    </p>

                    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af' }}>
                        By clicking continue, you agree to our{' '}
                        <a href="#" style={{ textDecoration: 'underline', color: '#9ca3af' }}>Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" style={{ textDecoration: 'underline', color: '#9ca3af' }}>Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}
