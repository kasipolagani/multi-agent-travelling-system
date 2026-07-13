import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <motion.footer
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16 px-6 mt-16"
        >
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Company Info */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                                </svg>
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Travel Companion
              </span>
                        </div>
                        <p className="text-gray-400 mb-4">
                            AI-powered travel planning that negotiates the perfect itinerary for you.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="p-2 bg-gray-700 rounded-lg hover:bg-blue-600 transition-colors">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="p-2 bg-gray-700 rounded-lg hover:bg-blue-600 transition-colors">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="p-2 bg-gray-700 rounded-lg hover:bg-blue-600 transition-colors">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="p-2 bg-gray-700 rounded-lg hover:bg-blue-600 transition-colors">
                                <Youtube size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-4 text-white">Quick Links</h4>
                        <ul className="space-y-3">
                            <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                            <li><button onClick={() => window.dispatchEvent(new CustomEvent('scroll-to-destinations'))} className="text-gray-400 hover:text-white transition-colors">Destinations</button></li>
                            <li><button onClick={() => window.dispatchEvent(new CustomEvent('scroll-to-features'))} className="text-gray-400 hover:text-white transition-colors">Features</button></li>
                            <li><button onClick={() => window.dispatchEvent(new CustomEvent('scroll-to-stats'))} className="text-gray-400 hover:text-white transition-colors">Stats</button></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-lg font-bold mb-4 text-white">Support</h4>
                        <ul className="space-y-3">
                            <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
                            <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
                            <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">FAQs</Link></li>
                            <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Terms & Conditions</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-lg font-bold mb-4 text-white">Stay Updated</h4>
                        <p className="text-gray-400 mb-4">Get the latest travel deals and tips</p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="your@email.com"
                                className="flex-1 p-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button className="px-4 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                                <Mail size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
                    <p>&copy; {currentYear} Travel Companion. All rights reserved. | Powered by AI Agents</p>
                </div>
            </div>
        </motion.footer>
    );
};