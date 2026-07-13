# backend/main.py
from fastapi import FastAPI, Query, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import google.generativeai as genai
import os
import json
import requests

# Import your existing modules
from agent_engine import AgentEngine
from utils.config import Config

# Load environment variables
from dotenv import load_dotenv

load_dotenv()

os.makedirs("static", exist_ok=True)

app = FastAPI(title="Travel Companion API")
app.mount("/static", StaticFiles(directory="static"), name="static")

# CORS for Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = AgentEngine()


class ChatMessage(BaseModel):
    message: str
    history: list = []


@app.post("/chat")
async def chat_endpoint(chat: ChatMessage):
    """Handle normal chat conversations with memory"""
    print(f"📨 Chat received: {chat.message[:50]}...")
    try:
        genai.configure(api_key=Config.GEMINI_API_KEY)
        model = genai.GenerativeModel(Config.GEMINI_MODEL)

        conversation_context = ""

        for msg in chat.history:
            if msg.get('content') == chat.message and msg.get('role') == 'user':
                continue

            role_label = "User" if msg.get('role') == 'user' else "TravelBot"
            conversation_context += f"{role_label}: {msg.get('content')}\n"

        system_instruction = """
            You are TravelBot, a friendly AI travel assistant. 
            - Use the context provided to have a continuous conversation.
            - If the user refers to "it" or "that", look at the previous messages.
            - Keep answers concise (2-3 sentences) unless asked for a list.
        """

        prompt = f"""
            {system_instruction}
            
            PREVIOUS CONVERSATION:
            {conversation_context}
            
            CURRENT REQUEST:
            User: {chat.message}
            TravelBot:
        """

        response = model.generate_content(prompt)

        print(f"✅ Chat response: {response.text[:50]}...")
        return {
            "reply": response.text,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"❌ Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

# ============ TRENDING DESTINATIONS ============
UNSPLASH_KEY = os.getenv('UNSPLASH_KEY')

@app.get("/trending")
async def get_trending():
    """
    Returns complete destination data with all required fields.
    Loads data from backend/data/destinations.json file.
    """
    print("📸 Fetching trending destinations...")

    # Load destinations from JSON file
    destinations_file = os.path.join(os.path.dirname(__file__), "data", "destinations.json")
    with open(destinations_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        destinations = data.get('destinations', [])

    # Fetch images for each destination
    for dest in destinations:
        try:
            if UNSPLASH_KEY and UNSPLASH_KEY != "YOUR_UNSPLASH_KEY":
                r = requests.get(
                    f"https://api.unsplash.com/search/photos?query={dest['query']}&per_page=1",
                    headers={"Authorization": f"Client-ID {UNSPLASH_KEY}"}
                )
                if r.status_code == 200 and r.json().get("results"):
                    dest["image"] = r.json()["results"][0]["urls"]["regular"]
                    print(f"✅ Image loaded for {dest['name']} via Unsplash")
                else:
                    # Fall back to simpler query if specific one fails
                    fallback_query = dest['name'].lower().replace(' ', '-')
                    dest["image"] = f"https://source.unsplash.com/800x600/?{fallback_query}"
                    print(f"⚠️ Used fallback for {dest['name']}")
            else:
                # No API key - use free service
                dest["image"] = f"https://source.unsplash.com/800x600/?{dest['query']}"
                print(f"⚠️ No Unsplash key - using free API for {dest['name']}")
        except Exception as e:
            dest["image"] = f"https://source.unsplash.com/800x600/?travel"
            print(f"❌ Error for {dest['name']}: {e}. Using generic fallback.")

    return {"destinations": destinations}


@app.get("/destination-image")
async def get_destination_image(place: str = Query(..., description="Place name to fetch image for")):
    """
    Fetch a destination image from Unsplash based on place name.
    Use this endpoint to get images individually instead of bulk fetching.
    """
    print(f"📸 Fetching image for place: {place}")
    try:
        if not UNSPLASH_KEY:
            # Fallback without API key
            return {
                "image_url": f"https://source.unsplash.com/800x600/?{place}",
                "source": "fallback"
            }

        response = requests.get(
            f"https://api.unsplash.com/search/photos?query={place}&per_page=1",
            headers={"Authorization": f"Client-ID {UNSPLASH_KEY}"}
        )

        if response.status_code == 200:
            data = response.json()
            if data["results"]:
                return {
                    "image_url": data["results"][0]["urls"]["regular"],
                    "source": "unsplash"
                }

        # Fallback if no results found
        return {
            "image_url": f"https://source.unsplash.com/800x600/?{place}",
            "source": "fallback"
        }

    except Exception as e:
        print(f"❌ Error fetching image for {place}: {e}")
        return {
            "image_url": f"https://source.unsplash.com/800x600/?{place}",
            "source": "error_fallback"
        }

# ============ WEBSOCKET AGENT ENDPOINT ============
@app.websocket("/ws/agent")
async def websocket_endpoint(websocket: WebSocket):
    """Stream agent phases to frontend"""
    print("🌐 WebSocket connection attempt...")  # Debug log

    await websocket.accept()
    print("✅ WebSocket connected!")  # Debug log

    try:
        while True:
            print("📡 Waiting for data from frontend...")  # Debug log
            data = await websocket.receive_json()
            print(f"📥 Received: {data}")  # Debug log

            # Run agent workflow
            await engine.run_stream(
                data["origin"],
                data["destination"],
                data["budget"],
                data["dates"],
                websocket
            )

            # After completion, keep connection alive but break loop
            break

    except WebSocketDisconnect:
        print("❌ Client disconnected")
    except Exception as e:
        print(f"💥 WebSocket error: {e}")
        await websocket.send_json({
            "phase": "error",
            "status": "error",
            "message": f"Server error: {str(e)}"
        })
    finally:
        print("🔌 WebSocket connection closed")


class PlanRequest(BaseModel):
    plan: dict


@app.post("/generate-pdf")
async def generate_pdf(request: PlanRequest):
    """Generate PDF itinerary for a selected plan"""
    try:
        print(f"[PDF] Generating PDF for plan...")

        plan_data = request.plan

        # Use PayerAgent to generate PDF
        pdf_url = engine.payer.generate_pdf_itinerary(plan_data, user_name="Traveler")

        if pdf_url:
            return {"success": True, "pdf_url": pdf_url}
        else:
            return {"success": False, "error": "Failed to generate PDF"}, 500

    except Exception as e:
        print(f"[PDF] Error: {e}")
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}, 500


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")
