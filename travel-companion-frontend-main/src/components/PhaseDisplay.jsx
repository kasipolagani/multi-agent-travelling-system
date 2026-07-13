import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
    CheckCircle, AlertTriangle, Loader2, Plane, MapPin,
    IndianRupee, Download, MessageSquare, Shield, Sparkles,
    Bed, Camera, TrainFront, BusFront, Zap, Wallet, Star,
    Swords, Brain, Target, Award, ThumbsDown, ExternalLink,
    ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Send
} from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">Something went wrong rendering this section.</p>
                </div>
            );
        }
        return this.props.children;
    }
}

const mdComponents = {
    p: ({ node, ...props }) => (
        <p className="text-gray-700 text-sm leading-relaxed mb-2 last:mb-0" {...props} />
    ),
    strong: ({ node, ...props }) => (
        <strong className="font-bold text-gray-900" {...props} />
    ),
};

const MarkdownWrapper = ({ children, className = '' }) => {
    return (
        <div className={className}>
            <ReactMarkdown components={mdComponents}>{children}</ReactMarkdown>
        </div>
    );
};

export const PhaseDisplay = ({ events }) => {
    const [collapsedSections, setCollapsedSections] = useState({
        flights: false,
        trains: false,
        buses: false,
        hotels: false,
        attractions: false
    });

    const toggleSection = (section) => {
        setCollapsedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const cleanText = (text) => text?.toString().replace(/\$/g, '₹') || '';

    const formatPrice = (price) => {
        if (typeof price === 'number') return price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
        const clean = price?.toString().replace(/[₹$£€¥]/g, '').trim();
        return `₹${clean}`;
    };

    const groupCardsByType = (cards) => {
        const groups = {
            flights: [],
            trains: [],
            buses: [],
            hotels: [],
            attractions: []
        };

        cards?.forEach(card => {
            const type = card.type?.toLowerCase() || '';
            if (type.includes('flight')) groups.flights.push(card);
            else if (type.includes('train')) groups.trains.push(card);
            else if (type.includes('bus')) groups.buses.push(card);
            else if (type === 'hotel') groups.hotels.push(card);
            else if (type === 'attraction') groups.attractions.push(card);
        });

        return groups;
    };

    const getDomain = (url) => {
        try {
            const domain = new URL(url).hostname.replace('www.', '');
            return domain;
        } catch {
            return url;
        }
    };

    const getAgentStyle = (agentName) => {
        if (agentName?.includes('Budgeter')) {
            return {
                bg: 'bg-amber-50',
                accent: 'text-amber-700',
                icon: Shield,
                iconColor: 'text-amber-600',
                badge: 'bg-amber-100 text-amber-700'
            };
        }
        if (agentName?.includes('Planner')) {
            return {
                bg: 'bg-blue-50',
                accent: 'text-blue-700',
                icon: Brain,
                iconColor: 'text-blue-600',
                badge: 'bg-blue-100 text-blue-700'
            };
        }
        return {
            bg: 'bg-gray-50',
            accent: 'text-gray-700',
            icon: MessageSquare,
            iconColor: 'text-gray-600',
            badge: 'bg-gray-100 text-gray-700'
        };
    };

    const TransportCard = ({ card, borderColor, icon: Icon }) => (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`bg-white border-2 ${borderColor} p-3 rounded-lg hover:shadow-md transition-all`}
        >
            <div className="flex justify-between items-start gap-3 mb-2">
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{card.airline || card.name}</p>
                    <div className="text-xs text-gray-500 flex flex-wrap gap-2 mt-1">
                        {card.departure_time && <span>🕐 {card.departure_time}</span>}
                        {card.duration && <span>⏱️ {card.duration}</span>}
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <p className="font-bold text-lg text-gray-900">{formatPrice(card.price)}</p>
                </div>
            </div>
            {card.source_url && (
                <a href={card.source_url} target="_blank" rel="noopener noreferrer"
                   className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mt-2">
                    <CheckCircle2 size={10} /> Verify on {getDomain(card.source_url)}
                </a>
            )}
        </motion.div>
    );

    const CollapsibleGroup = ({ title, icon: Icon, cards, gradient, borderColor, sectionKey }) => {
        if (!cards || cards.length === 0) return null;

        const isCollapsed = collapsedSections[sectionKey];

        return (
            <motion.div className="mb-4">
                <button
                    onClick={() => toggleSection(sectionKey)}
                    className={`w-full flex items-center justify-between gap-2 p-3 rounded-lg border-2 ${borderColor} bg-white hover:shadow-md transition-all`}
                >
                    <div className="flex items-center gap-2 flex-1">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient}`}>
                            <Icon size={16} className="text-white" />
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-gray-800 text-sm">{title}</h4>
                            <p className="text-xs text-gray-400">{cards.length} option{cards.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <div className="shrink-0">
                        {isCollapsed ? <ChevronDown size={18} className="text-gray-600" /> : <ChevronUp size={18} className="text-gray-600" />}
                    </div>
                </button>

                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 space-y-2 pl-2 border-l-4 border-gray-200 py-2"
                        >
                            {cards.map((card, idx) => (
                                <TransportCard key={idx} card={card} borderColor={borderColor} icon={Icon} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    };

    const parseStrategicPlans = (text) => {
        if (!text) return [];
        const rawPlans = text.split('🏹').filter(p => p.trim().length > 0);
        return rawPlans.map(planStr => {
            const lines = planStr.split('\n').map(l => l.trim()).filter(l => l);
            return {
                title: lines[0],
                desc: lines[1] || '',
                cost: lines.find(l => l.startsWith('Cost:'))?.replace('Cost:', '').trim() || 'N/A'
            };
        });
    };

    const getPdfUrl = (text) => {
        const match = text?.match(/http.*\.pdf/);
        return match ? match[0] : null;
    };

    return (
        <ErrorBoundary>
            <div className="space-y-6 font-sans text-sm pb-4">
                <AnimatePresence>
                    {events.map((event, i) => {
                        const pdfUrl = event.display?.itinerary ? getPdfUrl(event.display.itinerary) : null;
                        const groupedCards = event.display?.cards ? groupCardsByType(event.display.cards) : null;
                        const isSearching = event.phase === 'searching';
                        const isNegotiating = event.phase === 'negotiating';
                        const isPlanning = event.phase === 'planning';

                        return (
                            <motion.div
                                key={`${event.phase}-${event.display?.title || i}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                                className={`relative overflow-hidden rounded-2xl border ${
                                    event.status === 'error' ? 'bg-red-50 border-red-200' :
                                        isNegotiating ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border-orange-200' :
                                            'bg-white border-blue-100'
                                } p-0`}
                            >
                                {/* HEADER */}
                                <div className={`px-5 py-4 flex items-center gap-3 border-b ${
                                    event.status === 'thinking' ? 'bg-blue-50 border-blue-100' :
                                        isNegotiating ? 'bg-gradient-to-r from-amber-100 to-orange-100 border-amber-200' :
                                            'bg-gray-50 border-gray-100'
                                }`}>
                                    <div className={`p-2 rounded-lg ${
                                        isNegotiating ? 'bg-orange-500/20 animate-pulse' : 'bg-white/60'
                                    }`}>
                                        {isNegotiating ? <Swords className="text-orange-600" size={20} /> :
                                            event.status === 'thinking' ? <Loader2 className="animate-spin text-blue-500" size={20} /> :
                                                event.status === 'complete' ? <CheckCircle className="text-emerald-500" size={20} /> :
                                                    <Target className="text-gray-400" size={20} />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-800 text-base">{cleanText(event.display?.title || event.message)}</h3>
                                    </div>
                                    {event.status === 'complete' && <CheckCircle className="text-emerald-500" size={20} />}
                                </div>

                                <div className="p-5 space-y-4">
                                    {/* SEARCHER RESULTS - COLLAPSIBLE GROUPS */}
                                    {isSearching && groupedCards && (
                                        <div className="max-h-[600px] overflow-y-auto pr-2">
                                            <CollapsibleGroup
                                                title="✈️ Flight Options"
                                                icon={Plane}
                                                cards={groupedCards.flights}
                                                gradient="from-blue-500 to-indigo-600"
                                                borderColor="border-blue-200"
                                                sectionKey="flights"
                                            />
                                            <CollapsibleGroup
                                                title="🚂 Train Options"
                                                icon={TrainFront}
                                                cards={groupedCards.trains}
                                                gradient="from-teal-500 to-cyan-600"
                                                borderColor="border-teal-200"
                                                sectionKey="trains"
                                            />
                                            <CollapsibleGroup
                                                title="🚌 Bus Options"
                                                icon={BusFront}
                                                cards={groupedCards.buses}
                                                gradient="from-orange-500 to-red-600"
                                                borderColor="border-orange-200"
                                                sectionKey="buses"
                                            />

                                            {groupedCards.hotels.length > 0 && (
                                                <motion.div className="mb-4">
                                                    <button
                                                        onClick={() => toggleSection('hotels')}
                                                        className="w-full flex items-center justify-between gap-2 p-3 rounded-lg border-2 border-emerald-200 bg-white hover:shadow-md transition-all"
                                                    >
                                                        <div className="flex items-center gap-2 flex-1">
                                                            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600">
                                                                <Bed size={16} className="text-white" />
                                                            </div>
                                                            <div className="text-left">
                                                                <h4 className="font-bold text-gray-800 text-sm">🏨 Hotels</h4>
                                                                <p className="text-xs text-gray-400">{groupedCards.hotels.length} option{groupedCards.hotels.length !== 1 ? 's' : ''}</p>
                                                            </div>
                                                        </div>
                                                        <div className="shrink-0">
                                                            {collapsedSections.hotels ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                                                        </div>
                                                    </button>
                                                    <AnimatePresence>
                                                        {!collapsedSections.hotels && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                className="mt-2 space-y-2 pl-2 border-l-4 border-gray-200 py-2"
                                                            >
                                                                {groupedCards.hotels.slice(0, 10).map((card, idx) => (
                                                                    <div key={idx} className="bg-white border border-emerald-200 p-3 rounded-lg hover:shadow-md transition-all flex justify-between items-start gap-2">
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="font-semibold text-sm text-gray-800">{card.name}</p>
                                                                            <p className="text-xs text-gray-500">⭐ {card.rating}</p>
                                                                        </div>
                                                                        <p className="font-bold text-gray-900 shrink-0">{formatPrice(card.price)}<span className="text-xs text-gray-400">/night</span></p>
                                                                    </div>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            )}

                                            {groupedCards.attractions.length > 0 && (
                                                <motion.div className="mb-4">
                                                    <button
                                                        onClick={() => toggleSection('attractions')}
                                                        className="w-full flex items-center justify-between gap-2 p-3 rounded-lg border-2 border-purple-200 bg-white hover:shadow-md transition-all"
                                                    >
                                                        <div className="flex items-center gap-2 flex-1">
                                                            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                                                                <Camera size={16} className="text-white" />
                                                            </div>
                                                            <div className="text-left">
                                                                <h4 className="font-bold text-gray-800 text-sm">🎯 Attractions</h4>
                                                                <p className="text-xs text-gray-400">{groupedCards.attractions.length} place{groupedCards.attractions.length !== 1 ? 's' : ''}</p>
                                                            </div>
                                                        </div>
                                                        <div className="shrink-0">
                                                            {collapsedSections.attractions ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                                                        </div>
                                                    </button>
                                                    <AnimatePresence>
                                                        {!collapsedSections.attractions && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                className="mt-2 grid grid-cols-2 gap-2 pl-2 border-l-4 border-gray-200 py-2"
                                                            >
                                                                {groupedCards.attractions.slice(0, 8).map((card, idx) => (
                                                                    <div key={idx} className="bg-white border border-purple-200 p-3 rounded-lg hover:shadow-md transition-all">
                                                                        <p className="font-semibold text-xs text-gray-800 mb-1">{card.name}</p>
                                                                        <p className="font-bold text-sm text-gray-900">{formatPrice(card.price)}</p>
                                                                    </div>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            )}
                                        </div>
                                    )}

                                    {/* NEGOTIATION - WHATSAPP STYLE CHAT */}
                                    {isNegotiating && event.dialogue && event.dialogue.length > 0 && (
                                        <div className="rounded-xl overflow-hidden flex flex-col max-h-[600px]">
                                            {/* Chat Messages - Full Width */}
                                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
                                                {event.dialogue.map((msg, idx) => {
                                                    const isPlanner = msg.agent?.includes('Planner');
                                                    const agentStyle = getAgentStyle(msg.agent);
                                                    const AgentIcon = agentStyle.icon;

                                                    return (
                                                        <motion.div
                                                            key={idx}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: idx * 0.1 }}
                                                            className={`flex gap-2 ${isPlanner ? 'justify-end' : 'justify-start'}`}
                                                        >
                                                            {!isPlanner && (
                                                                <div className={`w-8 h-8 rounded-full ${agentStyle.badge} flex items-center justify-center shrink-0 shadow-sm`}>
                                                                    <AgentIcon size={14} className={agentStyle.iconColor} />
                                                                </div>
                                                            )}

                                                            <div className={`max-w-lg px-4 py-3 rounded-2xl shadow-sm ${
                                                                isPlanner
                                                                    ? 'bg-blue-200 text-blue-900 rounded-br-none'
                                                                    : 'bg-amber-100 text-amber-900 border border-amber-300 rounded-bl-none'
                                                            }`}>
                                                                <p className="text-xs font-bold mb-1 opacity-90">
                                                                    {msg.agent}
                                                                </p>
                                                                <MarkdownWrapper>
                                                                    {cleanText(msg.message)}
                                                                </MarkdownWrapper>
                                                            </div>

                                                            {isPlanner && (
                                                                <div className={`w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center shrink-0 shadow-sm`}>
                                                                    <Brain size={14} className="text-blue-600" />
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* PLANNING - AGENT DIALOGUE */}
                                    {isPlanning && event.dialogue && event.dialogue.length > 0 && (
                                        <div className="space-y-2">
                                            {event.dialogue.map((msg, idx) => {
                                                const agentStyle = getAgentStyle(msg.agent);
                                                const AgentIcon = agentStyle.icon;

                                                return (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.2 }}
                                                        className={`${agentStyle.bg} border rounded-xl p-4 shadow-sm`}
                                                    >
                                                        <div className="flex items-start gap-3 mb-2">
                                                            <div className={`w-8 h-8 rounded-full ${agentStyle.badge} flex items-center justify-center shrink-0`}>
                                                                <AgentIcon size={16} className={agentStyle.iconColor} />
                                                            </div>
                                                            <p className={`text-xs font-bold ${agentStyle.accent}`}>{msg.agent}</p>
                                                        </div>
                                                        <MarkdownWrapper className="pl-11 -mt-7">
                                                            {cleanText(msg.message)}
                                                        </MarkdownWrapper>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* FINAL PLAN CARDS */}
                                    {event.display?.plan_cards && event.display.plan_cards.length > 0 && (
                                        <div className="grid gap-4">
                                            <h3 className="font-bold text-lg text-gray-800 mt-4">Choose Your Perfect Plan</h3>
                                            {event.display.plan_cards.map((plan, idx) => {
                                                const tierColors = {
                                                    comfort: { gradient: 'from-yellow-400 to-orange-500', icon: Zap, label: '✨ Premium' },
                                                    balanced: { gradient: 'from-blue-400 to-indigo-500', icon: Star, label: '⭐ Balanced' },
                                                    budget: { gradient: 'from-green-400 to-emerald-500', icon: Wallet, label: '💚 Budget' }
                                                };
                                                const config = tierColors[plan.tier] || tierColors.balanced;
                                                const Icon = config.icon;

                                                return (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.15 }}
                                                        className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-xl hover:border-blue-400 transition-all cursor-pointer"
                                                    >
                                                        <div className="flex gap-3 mb-4">
                                                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg shrink-0`}>
                                                                <Icon size={24} className="text-white" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-gray-900 text-lg">{plan.title}</h4>
                                                                <p className="text-xs text-gray-500 mt-1">{plan.description}</p>
                                                            </div>
                                                            <div className="text-right shrink-0">
                                                                <p className="text-xs text-gray-400">TOTAL</p>
                                                                <p className="font-bold text-2xl text-gray-900">₹{plan.total_cost.toLocaleString()}</p>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2 bg-gray-50 rounded-lg p-4 mb-4">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">✈️ Transport</span>
                                                                <span className="font-bold text-gray-900">₹{plan.breakdown.transport.cost.toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">🏨 Hotel ({plan.breakdown.hotel.nights}N)</span>
                                                                <span className="font-bold text-gray-900">₹{plan.breakdown.hotel.cost.toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">🎯 Attractions</span>
                                                                <span className="font-bold text-gray-900">₹{plan.breakdown.attractions.cost.toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm border-t pt-2">
                                                                <span className="text-gray-600">🍽️ Food & Misc</span>
                                                                <span className="font-bold text-gray-900">₹{plan.breakdown.food.cost.toLocaleString()}</span>
                                                            </div>
                                                        </div>

                                                        {plan.negotiation_notes && (
                                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 mb-4">
                                                                <p className="font-semibold mb-1">Why this plan:</p>
                                                                <p>{plan.negotiation_notes}</p>
                                                            </div>
                                                        )}

                                                        {plan.full_plan && (
                                                            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                                <p className="text-xs font-semibold text-gray-700 mb-2">Selected Options:</p>
                                                                <div className="space-y-1 text-xs text-gray-600">
                                                                    <p><span className="font-semibold">Transport:</span> {plan.full_plan.transport?.provider} ({plan.full_plan.transport?.mode})</p>
                                                                    <p><span className="font-semibold">Hotel:</span> {plan.full_plan.hotel?.name}</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <button
                                                            onClick={async () => {
                                                                if (plan.full_plan) {
                                                                    try {
                                                                        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                                                                        const response = await fetch(`${API_URL}/generate-pdf`, {
                                                                            method: 'POST',
                                                                            headers: { 'Content-Type': 'application/json' },
                                                                            body: JSON.stringify({ plan: plan.full_plan })
                                                                        });
                                                                        if (response.ok) {
                                                                            const data = await response.json();
                                                                            window.open(data.pdf_url, '_blank');
                                                                        } else {
                                                                            alert('Failed to generate PDF. Please try again.');
                                                                        }
                                                                    } catch (error) {
                                                                        console.error('PDF generation error:', error);
                                                                        alert('Error generating PDF. Please check console.');
                                                                    }
                                                                } else {
                                                                    alert('Plan data not available. Please try again.');
                                                                }
                                                            }}
                                                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-bold hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                                        >
                                                            <Download size={18} />
                                                            Get PDF & Book
                                                        </button>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* ERROR */}
                                    {event.status === 'error' && (
                                        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium border border-red-200 flex items-center gap-2">
                                            <AlertTriangle size={18} />
                                            {event.message}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ErrorBoundary>
    );
};

export default PhaseDisplay;