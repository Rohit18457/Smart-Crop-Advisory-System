"""
/chat  —  AI Chatbot & Voice Assistant Endpoint
==================================================
POST  /chat  (JSON body)
  Input:  { message, history (optional) }
  Output: { reply }

Uses Groq API with LLaMA 3 model for fast inference,
with a specialized agriculture system prompt.
"""

import logging
from flask import Blueprint, request, jsonify
from groq import Groq
from config import GROQ_API_KEY
from utils.auth import supabase_auth_required

logger = logging.getLogger(__name__)

chat_bp = Blueprint("chat", __name__)

# ── Validation limits ──────────────────────────────────────────────────────────
_MAX_MESSAGE_LENGTH = 2000
_MAX_HISTORY_LENGTH = 20

# ── Groq client ────────────────────────────────────────────────────────────────
_client = None


def _get_client():
    global _client
    if _client is None:
        _client = Groq(api_key=GROQ_API_KEY)
    return _client


# ── System prompt ──────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are AgriSmart AI, an expert agricultural assistant for Indian farmers.
You provide accurate, practical advice on:
- Crop recommendations based on soil, climate, and season
- Plant disease identification, causes, and treatments
- Weather impact on farming activities
- Market prices and selling strategies
- Best farming practices, irrigation, fertilizers
- Pest control and organic farming methods

Guidelines:
- Keep answers concise (2-4 paragraphs max) and actionable
- Use simple language that farmers can understand
- Include specific numbers, timelines, or dosages when relevant
- Mention local Indian crop varieties and practices when applicable
- If unsure, recommend consulting a local agricultural extension officer
- Be friendly and encouraging

You are part of the AgriSmart AI Platform that also offers disease detection via image upload,
crop recommendation via soil parameters, live weather data, and market prices."""


@chat_bp.route("/chat", methods=["POST"])
@supabase_auth_required
def chat():
    """Handle chatbot conversation using Groq LLaMA model."""

    data = request.get_json(silent=True)
    if not data or not data.get("message", "").strip():
        return jsonify({
            "success": False,
            "error": "A 'message' field is required in the JSON body."
        }), 400

    user_message = data["message"].strip()
    history = data.get("history", [])

    # ── Input validation ───────────────────────────────────────────────────
    if len(user_message) > _MAX_MESSAGE_LENGTH:
        return jsonify({
            "success": False,
            "error": f"Message too long ({len(user_message)} chars). Maximum is {_MAX_MESSAGE_LENGTH} characters."
        }), 400

    if not isinstance(history, list):
        return jsonify({
            "success": False,
            "error": "'history' must be an array of message objects."
        }), 400

    if len(history) > _MAX_HISTORY_LENGTH:
        history = history[-_MAX_HISTORY_LENGTH:]

    # ── Build conversation messages ────────────────────────────────────────
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    # Include recent history (last 10 messages to stay within context limits)
    for msg in history[-10:]:
        role = "assistant" if msg.get("type") == "assistant" else "user"
        content = msg.get("content", "")
        if isinstance(content, str) and content.strip():
            messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": user_message})

    # ── Call Groq API ──────────────────────────────────────────────────────
    try:
        client = _get_client()
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_completion_tokens=1024,
            top_p=0.9,
        )

        reply = completion.choices[0].message.content.strip()

        return jsonify({
            "success": True,
            "reply": reply,
            "model": "llama-3.3-70b-versatile",
            "usage": {
                "prompt_tokens": completion.usage.prompt_tokens,
                "completion_tokens": completion.usage.completion_tokens,
            }
        }), 200

    except Exception as e:
        logger.exception("Groq API chat error")
        return jsonify({
            "success": False,
            "error": "AI service is temporarily unavailable. Please try again later."
        }), 503
