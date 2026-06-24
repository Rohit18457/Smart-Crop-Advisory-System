"""
/whatsapp  —  Twilio WhatsApp Webhook Endpoint
==================================================
POST  /whatsapp
  • Accepts: Twilio form-data
  • Returns: TwiML XML
"""

import logging
import requests
import io
import numpy as np
from PIL import Image
from flask import Blueprint, request
from twilio.twiml.messaging_response import MessagingResponse
from groq import Groq

from config import GROQ_API_KEY
from routes.chat_routes import SYSTEM_PROMPT
from models.disease_model import predict, _keras_available

logger = logging.getLogger(__name__)

whatsapp_bp = Blueprint("whatsapp", __name__)

_groq_client = None

def get_groq_client():
    global _groq_client
    if _groq_client is None:
        _groq_client = Groq(api_key=GROQ_API_KEY)
    return _groq_client

def process_image_url(url):
    """Download image from Twilio and run prediction."""
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        image = Image.open(io.BytesIO(response.content)).convert("RGB")
        image = image.resize((224, 224), Image.LANCZOS)
        img_array = (np.array(image, dtype=np.float32) / 127.5) - 1.0
        img_array = np.expand_dims(img_array, axis=0)
        
        result = predict(img_array)
        return result
    except Exception as e:
        logger.exception("Failed to process WhatsApp image")
        return None

@whatsapp_bp.route("/whatsapp", methods=["POST"])
def whatsapp_webhook():
    """Handle incoming messages from Twilio WhatsApp Sandbox."""
    incoming_msg = request.values.get("Body", "").strip()
    media_url = request.values.get("MediaUrl0")
    media_content_type = request.values.get("MediaContentType0", "")
    
    resp = MessagingResponse()
    msg = resp.message()
    
    # Check if an image was sent for disease detection
    if media_url and media_content_type.startswith("image/"):
        if not _keras_available:
            msg.body("Disease detection model is currently unavailable on the server.")
            return str(resp)
            
        prediction = process_image_url(media_url)
        if prediction:
            if prediction["is_healthy"]:
                text_response = "🌱 Great news! Your plant looks healthy. Keep up the good work!"
            else:
                text_response = (
                    f"🦠 *Disease Detected*: {prediction['disease']}\n"
                    f"⚠️ *Confidence*: {prediction['confidence']}%\n\n"
                    f"💡 *Recommended Solution*:\n{prediction['solution']}"
                )
            msg.body(text_response)
        else:
            msg.body("Sorry, I couldn't analyze the image. Please try again with a clearer photo.")
            
        return str(resp)
        
    # Otherwise, treat it as a chat query
    if incoming_msg:
        try:
            client = get_groq_client()
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": incoming_msg}
                ],
                temperature=0.7,
                max_completion_tokens=500,
            )
            reply = completion.choices[0].message.content.strip()
            msg.body(reply)
        except Exception as e:
            logger.exception("WhatsApp Groq API error")
            msg.body("Sorry, I'm having trouble connecting to my AI brain right now. Please try again later.")
    else:
        msg.body("Welcome to AgriSmart WhatsApp! Send me a photo of a diseased plant, or ask me any farming question.")
        
    return str(resp)
