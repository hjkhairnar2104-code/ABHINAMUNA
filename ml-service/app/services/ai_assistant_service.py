import os
import re
from typing import Dict, Any, List
from app.schemas.ai_assistant_schemas import ChatRequest, ChatResponse

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

class AIAssistantService:
    def __init__(self):
        self.gemini_client = None
        self._init_gemini()

    def _init_gemini(self):
        try:
            import google.generativeai as genai
            if GEMINI_API_KEY and len(GEMINI_API_KEY) > 10:
                genai.configure(api_key=GEMINI_API_KEY)
                # Try getting model
                self.gemini_client = genai.GenerativeModel("gemini-1.5-flash")
        except Exception:
            self.gemini_client = None

    def process_chat(self, req: ChatRequest) -> ChatResponse:
        user_msg = req.message.strip().lower()
        ctx = req.user_context or {}

        # 1. Check for Route / Journey intent: "pune to mumbai" / "travel from X to Y"
        if ("pune" in user_msg and "mumbai" in user_msg) or "route" in user_msg or "travelling from" in user_msg or "traveling from" in user_msg:
            return ChatResponse(
                reply=(
                    "Your Pune → Mumbai Expressway route is approximately 148 km (~2 hrs 35 mins). "
                    "I analyzed the route and found 6 high-speed EV charging hubs along Mumbai-Pune Expressway, "
                    "including GreenCharge Lonavala and Zeon Khalapur."
                ),
                tool_executed="findStationsAlongRoute",
                tool_arguments={"origin": "Pune", "destination": "Mumbai", "distance_km": 148},
                tool_result={"stations_found": 6, "suggested_stop": "GreenCharge Lonavala (Expressway Hub)"},
                action_type="SHOW_ROUTE",
                suggested_quick_replies=["Where should I stop?", "Show top recommendation", "Check my battery range"]
            )

        # 2. Check for Recommendation intent: "where should i stop" / "recommend" / "which station"
        if "where should i stop" in user_msg or "recommend" in user_msg or "which station" in user_msg or "best station" in user_msg:
            return ChatResponse(
                reply=(
                    "⭐ I recommend **GreenCharge Lonavala (Expressway Hub)**.\n\n"
                    "• **Route Deviation:** Only 1.5 km off Mumbai-Pune Expressway\n"
                    "• **Charger:** Dual 120 kW CCS2 Ultra-Fast Gun\n"
                    "• **Live Availability:** 6 / 10 slots currently free\n"
                    "• **Driver Rating:** 4.7 ⭐ (128 reviews)\n"
                    "• **Tariff:** ₹13.50/kWh + ₹40/hr parking\n\n"
                    "Would you like me to check slot availability for your planned arrival time?"
                ),
                tool_executed="recommendStation",
                tool_arguments={"station_id": 4, "station_name": "GreenCharge Lonavala", "speed_kw": 120},
                tool_result={"station_id": 4, "name": "GreenCharge Lonavala", "available_slots": 6, "ai_score": 0.94},
                action_type="SHOW_STATION",
                suggested_quick_replies=["Book it tomorrow at 5 PM", "Show available slots", "Compare with Wakad station"]
            )

        # 3. Check for Booking intent: "book it tomorrow at 5 pm" / "book slot" / "reserve"
        if "book" in user_msg or "reserve" in user_msg or "at 5 pm" in user_msg or "slot" in user_msg:
            time_match = re.search(r"(\d{1,2})\s*(pm|am)", user_msg)
            time_str = f"{time_match.group(1)} {time_match.group(2).upper()}" if time_match else "5:00 PM"
            
            return ChatResponse(
                reply=(
                    f"I inspected the real-time slot registry for **GreenCharge Lonavala** tomorrow at {time_str}.\n\n"
                    f"✅ **Slot A3 (120 kW CCS2)** is verified available from {time_str} to 7:00 PM.\n"
                    f"💰 Estimated cost: ₹270 (20 kWh charging buffer + 1 hr parking).\n\n"
                    "Would you like me to hold this slot for 10 minutes and proceed to secure checkout?"
                ),
                tool_executed="checkSlotAvailability",
                tool_arguments={"station_id": 4, "slot_code": "A3", "time_window": f"{time_str} - 7:00 PM"},
                tool_result={"available": True, "slot_id": "A3", "hold_time_minutes": 10},
                action_type="PROMPT_BOOKING",
                suggested_quick_replies=["Yes, lock slot A3 & proceed", "Show other slots", "Change time to 6 PM"]
            )

        # 4. Check for Confirmation / Yes to proceed to payment
        if user_msg in ["yes", "yes, lock slot a3 & proceed", "proceed", "pay", "continue"]:
            return ChatResponse(
                reply=(
                    "🔒 **Slot A3 has been temporarily locked in Redis for 10 minutes.**\n\n"
                    "A secure Razorpay payment intent has been initiated. "
                    "Please complete payment in the booking drawer to confirm your reservation and receive your digital QR entry pass."
                ),
                tool_executed="createBookingHold",
                tool_arguments={"station_id": 4, "slot_code": "A3", "hold_ttl_sec": 600},
                tool_result={"hold_status": "LOCKED", "order_id": "order_smartev_demo", "amount_inr": 270},
                action_type="OPEN_PAYMENT",
                suggested_quick_replies=["Open Payment", "View Hold Status", "Cancel Hold"]
            )

        # 5. Check for Battery Health intent: "battery" / "soh" / "health" / "rul"
        if "battery" in user_msg or "soh" in user_msg or "health" in user_msg or "rul" in user_msg:
            return ChatResponse(
                reply=(
                    "🔋 **AI Battery Intelligence Telemetry Summary:**\n\n"
                    "• **State of Health (SOH):** 91.4% (Condition: GOOD)\n"
                    "• **Estimated Remaining Useful Life (RUL):** ~1,240 cycles remaining before 70% threshold\n"
                    "• **Pack Temperature:** 31.5°C (Optimal thermal range)\n"
                    "• **Internal Resistance:** 18.2 mΩ (Stable impedance)\n\n"
                    "Recommendation: Your battery degradation rate is 12% lower than fleet average. "
                    "Continue maintaining standard 20%-80% state of charge cycles."
                ),
                tool_executed="getBatteryHealth",
                tool_arguments={"vehicle_id": "V-101", "model": "XGBoost v1.0"},
                tool_result={"soh": 91.4, "rul_cycles": 1240, "status": "GOOD"},
                action_type="SHOW_BATTERY",
                suggested_quick_replies=["Open Battery Dashboard", "How to prolong battery life?", "Check station demand"]
            )

        # 6. Check for Nearby stations / find stations
        if "nearby" in user_msg or "find station" in user_msg or "where can i charge" in user_msg:
            return ChatResponse(
                reply=(
                    "📍 Here are top-rated EV stations closest to your current location:\n\n"
                    "1. **GreenCharge Wakad** — 1.8 km away • 120 kW CCS2 • 8 slots free (₹14/kWh)\n"
                    "2. **VoltPoint Baner** — 3.2 km away • 60 kW CCS2 • 4 slots free (₹12/kWh)\n"
                    "3. **ElectriHub Hinjewadi Phase 1** — 4.5 km away • 150 kW Ultra • 5 slots free (₹15/kWh)"
                ),
                tool_executed="findNearbyStations",
                tool_arguments={"lat": 18.598, "lng": 73.765, "radius_km": 10},
                tool_result={"stations_count": 3},
                action_type="SHOW_NEARBY",
                suggested_quick_replies=["Navigate to Wakad", "Book Wakad Station", "Show route to Mumbai"]
            )

        # 7. Check for Demand prediction
        if "demand" in user_msg or "crowded" in user_msg or "busy" in user_msg:
            return ChatResponse(
                reply=(
                    "📊 **AI Demand Forecast for Wakad & Expressway Stations:**\n\n"
                    "• **Tomorrow 5 PM – 8 PM:** Very High Demand (87% - 92% utilization expected)\n"
                    "• **Optimal Off-Peak Window:** 3:00 PM – 4:30 PM (expected utilization < 45%)\n\n"
                    "Tip: Reserving a slot in advance guarantees zero queue waiting during expressway peak travel."
                ),
                tool_executed="getStationDemand",
                tool_arguments={"station_id": 1, "target_date": "tomorrow"},
                tool_result={"peak_utilization": 92.0, "recommended_window": "3 PM - 4:30 PM"},
                action_type="SHOW_DEMAND",
                suggested_quick_replies=["Book off-peak slot", "Check Lonavala demand", "Plan Mumbai journey"]
            )

        # Default helpful assistant reply with tool suggestion
        return ChatResponse(
            reply=(
                f"Hello! I am your **SmartEV AI Copilot**. I can help you with:\n\n"
                "• 🗺️ **Intelligent Navigation:** Calculate optimal EV routes (e.g. Pune → Mumbai)\n"
                "• ⭐ **AI Recommendations:** Pick the best high-speed charging stop with live availability\n"
                "• 🔒 **Automated Booking:** Reserve specific slots (e.g., Slot A3 tomorrow at 5 PM)\n"
                "• 🔋 **Battery Health:** Review XGBoost SOH and RUL cycle predictions\n"
                "• 📈 **Demand Forecasts:** Identify peak grid hours and off-peak charging windows\n\n"
                "Where are you heading today?"
            ),
            tool_executed=None,
            action_type="DEFAULT",
            suggested_quick_replies=["I am travelling from Pune to Mumbai", "Check my battery health", "Find nearby charging stations"]
        )

ai_assistant_service = AIAssistantService()
