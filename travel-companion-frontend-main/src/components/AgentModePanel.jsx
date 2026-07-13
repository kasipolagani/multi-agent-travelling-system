import { useState } from 'react'
import { useAgentStream } from '../hooks/useAgentStream'
import { PhaseDisplay } from './PhaseDisplay'
import { Plane, MapPin, DollarSign, Play } from 'lucide-react'

export const AgentModePanel = () => {
    const [origin, setOrigin] = useState('')
    const [destination, setDestination] = useState('')
    const [budget, setBudget] = useState('')
    const { events, isConnected, isLoading, startPlanning } = useAgentStream()

    const handleStart = () => {
        if (!origin || !destination || !budget) return
        startPlanning(origin, destination, parseFloat(budget), '2025-06-01')
    }

    return (
        <div className="flex flex-col h-full">
            {/* Input Form */}
            {!isLoading && events.length === 0 && (
                <div className="p-6 space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <MapPin size={16} /> From
                        </label>
                        <input
                            value={origin}
                            onChange={e => setOrigin(e.target.value)}
                            placeholder="New York"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-cents gap-2">
                            <MapPin size={16} /> To
                        </label>
                        <input
                            value={destination}
                            onChange={e => setDestination(e.target.value)}
                            placeholder="Paris"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <DollarSign size={16} /> Budget (₹)
                        </label>
                        <input
                            type="number"
                            value={budget}
                            onChange={e => setBudget(e.target.value)}
                            placeholder="1500"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        onClick={handleStart}
                        disabled={!origin || !destination || !budget}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold
                     disabled:bg-gray-300 disabled:cursor-not-allowed
                     hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                    >
                        <Play size={20} /> Start Planning
                    </button>
                </div>
            )}

            {/* Loading State */}
            {isLoading && events.length === 0 && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-pulse text-4xl mb-2">🤖</div>
                        <p className="text-gray-600">Connecting agents...</p>
                    </div>
                </div>
            )}

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-4">
                <PhaseDisplay events={events} />
            </div>

            {/* Footer Status */}
            {isLoading && (
                <div className="p-3 bg-blue-50 border-t text-center text-sm text-blue-600">
                    Agents are working... {events.length}/4 phases complete
                </div>
            )}
        </div>
    )
}