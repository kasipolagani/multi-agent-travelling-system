import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Compass, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('user')) navigate('/');
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        setTimeout(() => {
            if (email && password.length >= 6) {
                const userData = {
                    name: email.split('@')[0],
                    email: email,
                    id: Date.now(),
                    createdAt: new Date().toISOString()
                };
                localStorage.setItem('user', JSON.stringify(userData));
                setIsLoading(false);
                navigate('/');
            } else {
                setError('Invalid email or password');
                setIsLoading(false);
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 pt-16">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop"
                    alt="Travel Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            </div>

            {/* Compact Split Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
                {/* Left Panel */}
                <div className="w-full md:w-5/12 bg-gradient-to-br from-blue-700 to-indigo-800 p-8 flex flex-col justify-between text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 -right-10 w-40 h-40 bg-blue-400 rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6 shadow-inner border border-white/10">
                            <Compass className="text-white" size={24} />
                        </div>
                        <h1 className="text-3xl font-bold mb-3 leading-tight">Resume Your<br />Journey</h1>
                        <p className="text-blue-100 text-sm leading-relaxed opacity-90">
                            Your AI travel agents are ready to continue planning your dream trip.
                        </p>
                    </div>

                    <div className="relative z-10 mt-6 md:mt-0">
                        <p className="text-xs text-blue-200 uppercase tracking-widest font-semibold flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_#4ade80]"></span>
                            System Online
                        </p>
                    </div>
                </div>

                {/* Right Panel - Compact Form */}
                <div className="w-full md:w-7/12 bg-white p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Welcome Back, Traveller</h2>
                        <p className="text-gray-500 text-sm">Enter your credentials to access dashboard.</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg flex items-center gap-2 border border-red-100">
                            <span className="bg-red-100 px-1.5 rounded text-[10px]">!</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm"
                                    placeholder="traveller@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gray-900 text-white py-3.5 rounded-lg font-bold text-sm shadow-xl hover:bg-black hover:scale-[1.01] transition-all flex items-center justify-center gap-2 mt-2"
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Resume Adventure
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center border-t pt-4 border-gray-100">
                        <p className="text-gray-500 text-xs">
                            New to the crew?{' '}
                            <Link to="/signup" className="text-blue-600 font-bold hover:text-blue-700 hover:underline">
                                Join the expedition
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};