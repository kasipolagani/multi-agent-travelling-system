import React, { useState, useEffect, useRef } from 'react';
import {
    X, Send, Loader2, Bot, Minimize2, Maximize2,
    MapPin, IndianRupee, Sparkles, Power, Rocket,
    Calendar
} from 'lucide-react';
import { useAgentStream } from '../hooks/useAgentStream';
import { PhaseDisplay } from './PhaseDisplay';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function ChatWidget({ isOpen, onClose }) {
    const [isAgentMode, setIsAgentMode] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [validationError, setValidationError] = useState(null);
    const { events, isLoading, startPlanning, isConnected } = useAgentStream();
    const chatEndRef = useRef(null);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (isAgentMode) setIsExpanded(true);
    }, [isAgentMode]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, events, isTyping]);

    // --- NEW: Listen for custom events from HomePage ---
    useEffect(() => {
        const handleTriggerChat = (e) => {
            // Set input and optionally auto-send logic could go here
            setChatInput(e.detail.message);
        };

        const handleTriggerAgent = (e) => {
            setIsAgentMode(true);
            // Small timeout to ensure the DOM has updated with the form
            setTimeout(() => {
                const destInput = document.querySelector('input[name="destination"]');
                if (destInput) {
                    destInput.value = e.detail.destination;
                    // Highlight the field to show user it was filled
                    destInput.focus();
                    destInput.style.backgroundColor = "#eff6ff"; // light blue highlight
                    setTimeout(() => destInput.style.backgroundColor = "", 1000);
                }
            }, 100);
        };

        window.addEventListener('trigger-chat-message', handleTriggerChat);
        window.addEventListener('trigger-agent-mode', handleTriggerAgent);

        return () => {
            window.removeEventListener('trigger-chat-message', handleTriggerChat);
            window.removeEventListener('trigger-agent-mode', handleTriggerAgent);
        };
    }, []);

    const sendMessage = async () => {
        if (!chatInput.trim()) return;

        const userMessage = { role: 'user', content: chatInput, timestamp: new Date() };
        const updatedHistory = [...chatHistory, userMessage];

        setChatHistory(updatedHistory);
        setChatInput('');
        setIsTyping(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: chatInput, history: updatedHistory }),
            });

            if (!response.ok) throw new Error('Network error');
            const data = await response.json();

            const botMessage = { role: 'bot', content: data.reply, timestamp: new Date() };
            setChatHistory(prev => [...prev, botMessage]);
        } catch (error) {
            setChatHistory(prev => [...prev, {
                role: 'bot',
                content: "I'm having trouble connecting right now. Please try again.",
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleAgentSubmit = (e) => {
        e.preventDefault();
        setValidationError(null);

        const formData = new FormData(e.target);
        const origin = formData.get('origin');
        const destination = formData.get('destination');
        const startDate = formData.get('startDate');
        const endDate = formData.get('endDate');
        const budget = parseFloat(formData.get('budget'));
        const mode = formData.get('mode');

        if (!origin || !destination || !startDate || !endDate || !budget) {
            setValidationError("All fields are required.");
            return;
        }
        if (new Date(endDate) <= new Date(startDate)) {
            setValidationError("End date must be after start date.");
            return;
        }

        // Pass 'mode' inside the dates object to keep the hook signature simple
        startPlanning(origin, destination, budget, { start: startDate, end: endDate, mode });
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{
                opacity: 1, y: 0, scale: 1,
                width: isExpanded ? '900px' : '384px',
                height: isExpanded ? '92vh' : '600px'
            }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden transition-all duration-500 ease-in-out border border-gray-100 font-sans max-h-[95vh]"
        >
            {/* Header */}
            <div className={`p-4 flex justify-between items-center transition-colors duration-500 shrink-0 ${isAgentMode ? 'bg-slate-900 text-white' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                }`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isAgentMode ? 'bg-blue-500/20' : 'bg-white/20'}`}>
                        <Bot size={20} className={isAgentMode ? 'text-blue-400' : 'text-white'} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">{isAgentMode ? 'AI AGENT TERMINAL' : 'Travel Assistant'}</h3>
                        <p className="text-xs opacity-80 flex items-center gap-1">
                            {isAgentMode ? (isConnected ? '● System Online' : '○ Connecting...') : '● Online'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="hover:bg-white/10 p-2 rounded-lg transition-colors">
                        {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                    <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-lg transition-colors">
                        <X size={18} />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* LEFT PANEL: Chat */}
                <div className={`flex flex-col h-full ${isExpanded ? 'w-1/3 border-r border-gray-200' : 'w-full'}`}>
                    <div className="shrink-0 p-3 bg-gray-50 border-b border-gray-100 z-10">
                        <button
                            onClick={() => setIsAgentMode(!isAgentMode)}
                            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition-all shadow-sm ${isAgentMode ? 'bg-slate-800 text-blue-400 border border-slate-700' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                                }`}
                        >
                            {isAgentMode ? <Power size={14} /> : <Sparkles size={14} />}
                            {isAgentMode ? 'DEACTIVATE AGENTS' : 'ENABLE AGENT MODE'}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30 pb-20">
                        {chatHistory.map((msg, idx) => (
                            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'bot' && <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 text-white text-xs shadow-sm mt-1"><Bot size={14} /></div>}
                                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none'}`}>
                                    <ReactMarkdown components={{
                                        p: ({ node, ...props }) => <p className="mb-1 last:mb-0" {...props} />,
                                        ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2" {...props} />,
                                        li: ({ node, ...props }) => <li className="mb-0.5" {...props} />,
                                        strong: ({ node, ...props }) => <span className="font-bold" {...props} />
                                    }}>{msg.content}</ReactMarkdown>
                                </div>
                            </motion.div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0"><Bot size={14} className="text-gray-400" /></div>
                                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1 items-center h-10">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75" />
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150" />
                                </div>
                            </motion.div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="shrink-0 p-4 bg-white border-t border-gray-100 relative z-20">
                        <div className="relative flex items-center gap-2">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && sendMessage()}
                                placeholder="Type your message..."
                                disabled={isAgentMode}
                                className="flex-1 pl-5 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={isAgentMode || !chatInput.trim()}
                                className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                            >
                                {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: Agent Interface */}
                {(isExpanded || isAgentMode) && (
                    <div className={`bg-slate-50 flex flex-col ${isExpanded ? 'w-2/3' : 'hidden'}`}>
                        {isAgentMode ? (
                            <div className="h-full flex flex-col">
                                {!isLoading && events.length === 0 && (
                                    <div className="flex-1 flex flex-col justify-center p-8 overflow-y-auto">
                                        <div className="text-center mb-8">
                                            <h2 className="text-2xl font-bold text-slate-800">Mission Parameters</h2>
                                            <p className="text-slate-500 text-sm mt-1">Plan your multi-modal journey</p>
                                        </div>

                                        <form onSubmit={handleAgentSubmit} className="space-y-4 max-w-md mx-auto w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Origin</label>
                                                    <div className="relative"><MapPin className="absolute left-3 top-3 text-slate-400" size={16} /><input name="origin" required placeholder="e.g. Bhimavaram" className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" /></div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Destination</label>
                                                    <div className="relative"><MapPin className="absolute left-3 top-3 text-slate-400" size={16} /><input name="destination" required placeholder="e.g. Vijayawada" className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" /></div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
                                                    <div className="relative"><Calendar className="absolute left-3 top-3 text-slate-400" size={16} /><input name="startDate" type="date" min={today} required className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-700" /></div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">End Date</label>
                                                    <div className="relative"><Calendar className="absolute left-3 top-3 text-slate-400" size={16} /><input name="endDate" type="date" min={today} required className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-700" /></div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Budget (₹)</label>
                                                    <div className="relative"><IndianRupee className="absolute left-3 top-3 text-slate-400" size={16} /><input name="budget" type="number" required placeholder="5000" className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" /></div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preferred Mode</label>
                                                    <div className="relative">
                                                        <select name="mode" className="w-full pl-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-700 appearance-none">
                                                            <option value="any">🚀 Any / Mixed</option>
                                                            <option value="flight">✈️ Flight Only</option>
                                                            <option value="train">🚆 Train Only</option>
                                                            <option value="bus">🚌 Bus / Road</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            {validationError && <div className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg">{validationError}</div>}

                                            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-blue-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                                                <Rocket size={18} /> Launch Multi-Modal Agents
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {(isLoading || events.length > 0) && (
                                    <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Live Operation Log</h4>
                                        </div>
                                        <PhaseDisplay events={events} />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50/50">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm"><Sparkles size={32} className="text-blue-200" /></div>
                                    <p className="font-medium text-gray-500">Agent Mode Inactive</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}