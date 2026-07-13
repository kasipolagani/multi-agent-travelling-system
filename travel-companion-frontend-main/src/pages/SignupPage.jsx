import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Map, Sparkles, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

export const SignupPage = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('user')) navigate('/');
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        setTimeout(() => {
            const userData = {
                name: formData.fullName,
                email: formData.email,
                id: Date.now(),
                createdAt: new Date().toISOString()
            };
            localStorage.setItem('user', JSON.stringify(userData));
            setIsLoading(false);
            navigate('/');
            window.location.reload();
        }, 1500);
    };

    return (
        // Added pt-28 to push the entire centered content down, clearing the header title
        <div className="min-h-screen relative flex items-center justify-center px-4 pt-28 pb-4">
            {/* Background Image - Majestic Mountains */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop"
                    alt="Mountain Landscape"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-indigo-900/40 backdrop-blur-sm" />
            </div>

            {/* Compact Split Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
                {/* Left Panel */}
                <div className="w-full md:w-5/12 bg-gradient-to-br from-blue-600 to-purple-700 p-8 flex flex-col justify-between text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl mix-blend-overlay"></div>
                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-300 rounded-full blur-3xl mix-blend-overlay"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6 border border-white/20 shadow-lg">
                            <Map className="text-white" size={24} />
                        </div>
                        <h1 className="text-3xl font-bold mb-3 leading-tight">Begin Your<br/>Expedition</h1>
                        <p className="text-blue-100 text-sm leading-relaxed opacity-90">
                            Unlock AI-powered planning and discover the world's hidden gems for less.
                        </p>
                    </div>

                    <div className="relative z-10 mt-6 md:mt-0">
                        <div className="flex items-center gap-2 text-xs font-medium bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                            <Sparkles size={14} className="text-yellow-300" />
                            AI Agents Standing By
                        </div>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="w-full md:w-7/12 bg-white p-8">
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Create Explorer Profile</h2>
                        <p className="text-gray-500 text-sm">Join thousands of travelers planning smarter.</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-2.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg text-center border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                <input
                                    name="fullName"
                                    required
                                    className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none text-sm transition-all"
                                    placeholder="Explorer"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none text-sm transition-all"
                                    placeholder="explorer@example.com"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Side-by-side inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none text-sm transition-all"
                                        placeholder="••••••"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Confirm</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                    <input
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none text-sm transition-all"
                                        placeholder="••••••"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-2 bg-gray-900 text-white py-3 rounded-lg font-bold text-sm shadow-xl hover:bg-black hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                'Preparing...'
                            ) : (
                                <>
                                    <Rocket size={16} /> Launch Your Journey
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-5 text-center border-t pt-4 border-gray-100">
                        <p className="text-gray-500 text-xs">
                            Already a member?{' '}
                            <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 hover:underline">
                                Resume trip
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};