import { useState, useEffect } from 'react';
import { MessageCircle, MapPin, Sparkles, ArrowRight, Globe, Shield, BookOpen, Plane } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ChatWidget from '../components/ChatWidget';
import { Footer } from '../components/Footer';

export default function HomePage() {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const { scrollY } = useScroll();

    // Parallax effect for hero text
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        fetch(`${API_URL}/trending`)
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch');
                return response.json();
            })
            .then(data => {
                setDestinations(data.destinations || []);
            })
            .catch(err => console.error('Error:', err))
            .finally(() => setLoading(false));
    }, []);

    const filteredDestinations = destinations.filter(dest =>
        filter === 'all' || dest.type === filter
    );

    // --- NEW HANDLERS ---
    const handleResearch = (cityName) => {
        setIsChatOpen(true);
        // Dispatch custom event to ChatWidget to send a specific message
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('trigger-chat-message', {
                detail: { message: `Give detailed travel places of ${cityName}` }
            }));
        }, 500); // Small delay to ensure widget opens first
    };

    const handlePlan = (cityName) => {
        setIsChatOpen(true);
        // Dispatch custom event to pre-fill Agent Mode
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('trigger-agent-mode', {
                detail: { destination: cityName }
            }));
        }, 500);
    };

    return (
        <div className="min-h-screen bg-white font-sans">

            {/* --- IMMERSIVE HERO SECTION --- */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"
                        alt="Travel Hero"
                        className="w-full h-full object-cover scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/50" />
                </div>

                {/* Main Content */}
                <motion.div
                    style={{ y: y1 }}
                    className="relative z-10 text-center px-6 max-w-5xl mx-auto -mt-12"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tighter mb-6 drop-shadow-2xl leading-tight">
                            The World is <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">
                                Waiting For You.
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md">
                            Stop searching. Start experiencing. Our autonomous agents negotiate prices and build complex itineraries while you sleep.
                        </p>

                        <button
                            onClick={() => setIsChatOpen(true)}
                            className="group relative px-10 py-5 bg-white text-blue-900 rounded-full font-bold text-lg shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.7)] transition-all flex items-center justify-center gap-3 mx-auto overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Sparkles size={20} className="text-indigo-600 relative z-10" />
                            <span className="relative z-10">Start Planning Now</span>
                            <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50"
                >
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
                        <div className="w-1 h-2 bg-white rounded-full" />
                    </div>
                </motion.div>
            </section>

            {/* --- DESTINATIONS SECTION --- */}
            <section id="destinations" className="py-24 px-6 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Trending Now</h2>
                            <p className="text-gray-500">Curated destinations with the best AI-negotiated rates</p>
                        </div>

                        {/* Filter Tabs */}
                        <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex gap-1 mt-4 md:mt-0">
                            {['all', 'domestic', 'international'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                                            ? 'bg-gray-900 text-white shadow-md'
                                            : 'text-gray-500 hover:bg-gray-100'
                                        }`}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bento Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            [1, 2, 3].map(i => <div key={i} className="h-80 bg-gray-200 rounded-3xl animate-pulse" />)
                        ) : (
                            filteredDestinations.map((dest, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group relative h-[400px] rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500"
                                >
                                    {/* Image */}
                                    <img
                                        src={dest.image}
                                        alt={dest.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => { e.target.src = `https://source.unsplash.com/800x600/?${dest.query || 'travel'}`; }}
                                    />

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300" />

                                    {/* Content - Shifts up on hover */}
                                    <div className="absolute bottom-0 left-0 w-full p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-3xl font-bold text-white">{dest.name}</h3>
                                            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-sm font-bold border border-white/30">
                                                ₹{(dest.avg_cost || 0).toLocaleString()}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-gray-300 mb-4">
                                            <MapPin size={16} />
                                            <span>{dest.location || 'India'}</span>
                                        </div>

                                        {/* Revealed on Hover - NEW BUTTONS */}
                                        <div className="h-0 group-hover:h-auto overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 flex gap-2">

                                            {/* Research Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleResearch(dest.name);
                                                }}
                                                className="flex-1 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2"
                                            >
                                                <BookOpen size={16} />
                                                Research
                                            </button>

                                            {/* Plan Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePlan(dest.name);
                                                }}
                                                className="flex-1 py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Plane size={16} />
                                                Plan Trip
                                            </button>

                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* --- FEATURES SECTION --- */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { icon: <Globe className="text-blue-600" size={32} />, title: "Global Connectivity", desc: "Access to over 500+ airlines and 2M+ hotels worldwide through our partner network." },
                            { icon: <Shield className="text-purple-600" size={32} />, title: "AI Negotiation", desc: "Our proprietary bots negotiate with vendors in real-time to secure prices 15% below market rate." },
                            { icon: <Sparkles className="text-amber-600" size={32} />, title: "Instant Planning", desc: "From chaos to a complete, booked itinerary in less than 60 seconds." }
                        ].map((feature, i) => (
                            <div key={i} className="bg-gray-50 rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300 border border-gray-100">
                                <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />

            {/* Floating Action Button */}
            {!isChatOpen && (
                <button
                    onClick={() => setIsChatOpen(true)}
                    className="fixed bottom-8 right-8 bg-black text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-40 group"
                >
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-40 group-hover:opacity-75 transition-opacity" />
                    <MessageCircle size={28} className="relative z-10" />
                </button>
            )}

            <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </div>
    );
}