import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, UserCircle, Menu, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Check if current page is Login or Signup
    const isAuthPage = ['/login', '/signup'].includes(location.pathname);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            setIsLoggedIn(true);
            setUserName(userData.name || 'Traveler');
        }

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setShowProfileMenu(false);
        navigate('/');
    };

    const handleProfileClick = () => {
        setShowProfileMenu(false);
        navigate('/profile');
    };

    return (
        <header
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${
                isAuthPage
                    ? 'bg-transparent py-6 border-transparent' // Auth Pages: Fully Transparent
                    : scrolled
                        ? 'bg-white/90 backdrop-blur-md border-b border-gray-200 py-3 shadow-sm' // Home Scrolled: Solid & Compact
                        : 'bg-white/70 backdrop-blur-md border-b border-white/20 py-4' // Home Top: The "Nice BG" (Frosted Glass)
            }`}
        >
            <nav className={`max-w-7xl mx-auto px-6 flex items-center ${isAuthPage ? 'justify-center' : 'justify-between'}`}>

                {/* Logo Link */}
                <Link to="/" className={`flex items-center gap-3 group transition-all duration-300 ${
                    isAuthPage
                        ? 'bg-black/20 backdrop-blur-xl border border-white/10 rounded-full px-8 py-3 hover:bg-black/30 shadow-2xl'
                        : ''
                }`}>
                    {/* Icon - Only show if NOT on Auth Page */}
                    {!isAuthPage && (
                        <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-blue-500/30 transition-all">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                    )}

                    {/* Title Text */}
                    <span className={`font-bold tracking-wide transition-all ${
                        isAuthPage
                            ? 'text-white text-2xl drop-shadow-md'
                            : 'text-xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'
                    }`}>
                        Travel Companion
                    </span>
                </Link>

                {/* Desktop Auth - HIDDEN ON AUTH PAGES */}
                {!isAuthPage && (
                    <div className="hidden md:flex items-center gap-3">
                        {isLoggedIn ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-200 transition-all"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-inner">
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium text-gray-800 text-sm pr-2">{userName}</span>
                                    <svg className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                <AnimatePresence>
                                    {showProfileMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                                        >
                                            <div className="p-2">
                                                <button
                                                    onClick={handleProfileClick}
                                                    className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition-colors text-left group"
                                                >
                                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                                                        <UserCircle size={18} />
                                                    </div>
                                                    <span className="font-medium text-gray-700 text-sm">My Profile</span>
                                                </button>
                                                <div className="h-px bg-gray-100 my-1" />
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full px-3 py-2 flex items-center gap-3 hover:bg-red-50 rounded-lg transition-colors text-left text-red-600 group"
                                                >
                                                    <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                                                        <LogOut size={18} />
                                                    </div>
                                                    <span className="font-medium text-sm">Logout</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-6 py-2.5 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-6 py-2.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-800 hover:scale-105 transition-all shadow-lg"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                )}

                {/* Mobile Menu Button */}
                {!isAuthPage && (
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                )}

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && !isAuthPage && (
                        <motion.div
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100 }}
                            className="md:hidden fixed top-20 right-0 w-full max-w-sm bg-white/95 backdrop-blur-xl border-l border-b border-gray-200 rounded-bl-2xl shadow-2xl p-6"
                        >
                            <div className="flex flex-col gap-4">
                                {isLoggedIn ? (
                                    <>
                                        <button onClick={handleProfileClick} className="py-3 flex items-center gap-3 text-gray-700 border-b border-gray-100">
                                            <UserCircle size={20} /> My Profile
                                        </button>
                                        <button onClick={handleLogout} className="py-3 flex items-center gap-3 text-red-600">
                                            <LogOut size={20} /> Logout
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-3 mt-4">
                                        <Link to="/login" className="w-full px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-center hover:bg-gray-50">
                                            Login
                                        </Link>
                                        <Link to="/signup" className="w-full px-6 py-3 rounded-xl bg-black text-white font-semibold text-center hover:bg-gray-800 shadow-lg">
                                            Sign Up
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </header>
    );
};