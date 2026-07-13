# backend/agent_engine.py
import asyncio
import json
from agents.searcher import SearcherAgent
from agents.planner import PlannerAgent
from agents.budgeter import BudgeterAgent
from agents.payer import PayerAgent


class AgentEngine:
    def __init__(self):
        self.searcher = SearcherAgent()
        self.planner = PlannerAgent()
        self.budgeter = BudgeterAgent()
        self.payer = PayerAgent()

    def _safe_get(self, data, key):
        if not data:
            return []
        if isinstance(data, list): 
            return data
        if isinstance(data, dict): 
            return data.get(key, [])
        return []

    async def run_stream(self, origin, destination, budget, dates, websocket):
        budget = float(budget)
        checkin = dates.get('start') if isinstance(dates, dict) else dates
        checkout = dates.get('end') if isinstance(dates, dict) else dates
        preferred_mode = dates.get('mode', 'any') if isinstance(dates, dict) else 'any'

        async def send_update(phase, agent, status, message, display=None, dialogue=None):
            await websocket.send_json({
                "phase": phase,
                "agent": agent,
                "status": status,
                "message": message,
                "display": display or {},
                "dialogue": dialogue or []
            })

        try:
            # ==========================================
            # PHASE 1: SEARCH
            # ==========================================
            await send_update("searching", "SearcherAgent", "thinking",
                              "Searching transport, hotels, and attractions...")

            # Transport
            transport_data = await asyncio.to_thread(
                self.searcher.search_transport, origin, destination, checkin, budget, preferred_mode
            )
            all_transport = transport_data.get('options', []) if transport_data else []

            # Hotels
            hotel_data = await asyncio.to_thread(
                self.searcher.search_hotels, destination, checkin, checkout, budget
            )
            hotels_list = hotel_data.get('hotels', [])[:10] if hotel_data else []

            # Attractions
            attraction_data = await asyncio.to_thread(
                self.searcher.search_attractions, destination, budget
            )
            attractions_list = attraction_data.get('attractions', [])[:10] if attraction_data else []

            # --- PREPARE DATA FOR FRONTEND DISPLAY ---
            display_cards = []

            # Format Transport
            for t in all_transport:
                display_cards.append({
                    'type': t.get('transport_mode', 'transport'),
                    'airline': t.get('provider'),
                    'name': t.get('provider'),
                    'price': t.get('price', 0),
                    'duration': t.get('duration', 'N/A'),
                    'departure_time': t.get('departure_time', 'Flexible'),
                    'route': t.get('route', ''),
                    'source_url': t.get('source_url', ''),
                    'rating': t.get('comfort_level', '')
                })

            # Format Hotels
            for h in hotels_list:
                display_cards.append({
                    'type': 'hotel',
                    'name': h.get('name', 'Hotel'),
                    'price': h.get('price_per_night', 0),
                    'rating': h.get('rating', 'N/A'),
                    'route': None,
                    'source_url': None,
                    'duration': f"{h.get('location', '')}"
                })

            # Format Attractions
            for a in attractions_list:
                display_cards.append({
                    'type': 'attraction',
                    'name': a.get('name', 'Attraction'),
                    'price': a.get('price', 0),
                    'rating': a.get('rating', ''),
                    'route': None,
                    'source_url': None,
                    'duration': a.get('duration', '')
                })

            await send_update(
                "searching",
                "SearcherAgent",
                "complete",
                f"Found {len(all_transport)} transport options, {len(hotels_list)} hotels, {len(attractions_list)} attractions",
                display={"cards": display_cards}
            )

            await asyncio.sleep(1)

            # ==========================================
            # PHASE 2: COLLABORATIVE PLANNING & NEGOTIATION
            # ==========================================
            self.budgeter.set_budget(budget)

            # Both agents collaborate to create 3 plans
            result = await asyncio.to_thread(
                self.planner.create_three_plans_collaborative,
                all_transport, hotels_list, attractions_list, budget,
                origin, destination, self.budgeter
            )

            collaborative_plans = result.get('plans', [])
            negotiation_dialogue = result.get('dialogue', [])

            if not collaborative_plans or len(collaborative_plans) == 0:
                await send_update("planning", "PlannerAgent", "error", "Failed to create plans")
                return

            await asyncio.sleep(1)

            # ==========================================
            # PHASE 3: SHOW NEGOTIATION CHAT
            # ==========================================
            if negotiation_dialogue:
                # Convert negotiation history to dialogue format for UI
                dialogue_messages = []
                for msg in negotiation_dialogue:
                    dialogue_messages.append({
                        "agent": msg.get("agent", "System"),
                        "message": msg.get("message", ""),
                        "tone": msg.get("tone", "neutral")
                    })

                await send_update("negotiating", "System", "complete",
                                  "Live negotiation between Planner & Budgeter:",
                                  display={"title": "Live Negotiation"},
                                  dialogue=dialogue_messages)

                await asyncio.sleep(1)

            # ==========================================
            # PHASE 4: DISPLAY FINAL PLANS
            # ==========================================
            plan_cards = []
            for p in collaborative_plans:
                transport = p.get('transport', {})
                hotel = p.get('hotel', {})

                plan_cards.append({
                    'id': p.get('id'),
                    'title': p.get('title', 'Travel Package'),
                    'tier': p.get('id', '').replace('_plan', ''),
                    'total_cost': p.get('grand_total', 0),
                    'description': p.get('description', ''),
                    'negotiation_notes': p.get('negotiation_notes', ''),
                    'full_plan': p,  # Store full plan for PDF generation
                    'breakdown': {
                        'transport': {
                            'mode': transport.get('mode', 'N/A'),
                            'provider': transport.get('provider', 'N/A'),
                            'cost': transport.get('round_trip_price', 0)
                        },
                        'hotel': {
                            'name': hotel.get('name', 'N/A'),
                            'nights': hotel.get('nights', 0),
                            'cost': hotel.get('total_hotel_cost', 0)
                        },
                        'attractions': {
                            'count': len(p.get('attractions', [])),
                            'cost': p.get('total_attractions_cost', 0)
                        },
                        'food': {
                            'days': p.get('days', 0),
                            'cost': p.get('food_misc_total', 0)
                        }
                    }
                })

            await send_update("finalizing", "PayerAgent", "complete",
                              "Your 3 personalized travel options are ready!",
                              display={
                                  "title": "Your Travel Options",
                                  "plan_cards": plan_cards,
                                  "show_selection": True
                              },
                              dialogue=[{
                                  "agent": "PayerAgent",
                                  "message": "Select any plan below to download the complete itinerary with all booking links and costs."
                              }])

        except Exception as e:
            print(f"CRITICAL ERROR: {e}")
            import traceback
            traceback.print_exc()
            await websocket.send_json({"phase": "error", "message": str(e)})