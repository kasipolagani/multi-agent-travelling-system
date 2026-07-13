// src/hooks/useAgentStream.js
import { useState, useCallback } from 'react';

export const useAgentStream = () => {
  const [socket, setSocket] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback((onOpenCallback) => {
    const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/agent';
    console.log(`🔌 [useAgentStream] Connecting to ${WS_URL}`);
    setError(null);
    setIsConnected(false);

    // Create new WebSocket instance
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log("✅ [useAgentStream] WebSocket connected!");
      setSocket(ws);
      setIsConnected(true);
      setError(null);

      // Execute callback immediately with the socket instance
      if (onOpenCallback) {
        console.log("📤 [useAgentStream] Executing callback with socket");
        onOpenCallback(ws);
      }
    };

    ws.onmessage = (event) => {
      console.log("📥 [useAgentStream] Received message:", event.data);
      try {
        const data = JSON.parse(event.data);

        setEvents(prev => {
          // 1. If we receive a 'thinking' status, we want to replace any existing
          // 'thinking' status for this phase (to update the text).
          // But we do NOT want to remove 'complete' statuses (the results).

          // Filter out ONLY the previous 'thinking' events for this specific phase.
          // This preserves 'complete' events (Flights/Hotels) so they stack up.
          const cleanPrev = prev.filter(e => !(e.phase === data.phase && e.status === 'thinking'));

          // 2. Append the new event
          return [...cleanPrev, data];
        });

      } catch (err) {
        console.error("💥 [useAgentStream] JSON parse error:", err);
      }
    };

    ws.onclose = () => {
      console.log("❌ [useAgentStream] WebSocket disconnected");
      setSocket(null);
      setIsConnected(false);
      setIsLoading(false);
    };

    ws.onerror = (err) => {
      console.error("💥 [useAgentStream] WebSocket error:", err);
      setError("Connection failed. Please check backend is running on port 8000.");
      setIsConnected(false);
      setIsLoading(false);
      setSocket(null);
    };

  }, []);

  const startPlanning = (origin, destination, budget, dates) => {
    console.log("🚀 [useAgentStream] startPlanning called with:", { origin, destination, budget });
    setIsLoading(true);
    setError(null);
    setEvents([]);

    // Pass callback that receives the socket instance
    connect((ws) => {
      console.log("📤 [useAgentStream] Sending data via callback:", { origin, destination, budget, dates });
      ws.send(JSON.stringify({ origin, destination, budget, dates }));
      console.log("📤 [useAgentStream] Data sent successfully");
    });
  };

  return { events, isLoading, error, isConnected, startPlanning };
};