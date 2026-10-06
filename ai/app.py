from flask import Flask, request, jsonify
from flask_cors import CORS

from model.iot_ai import IoTAI


# ============================================================
# FLASK APPLICATION
# ============================================================

app = Flask(__name__)

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": "*"
        }
    }
)


# ============================================================
# LOAD OUR CUSTOM AI MODEL
# ============================================================

MODEL_PATH = "data/intents.json"

ai_model = IoTAI(MODEL_PATH)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health():

    return jsonify({
        "success": True,
        "model": "IoT Hub AI",
        "type": "Custom NLP Model",
        "status": "running"
    })


# ============================================================
# AI CHAT
# ============================================================

@app.post("/api/chat")
def chat():

    try:

        data = request.get_json(
            silent=True
        )

        if not data:

            return jsonify({
                "success": False,
                "error": "Request body is required."
            }), 400

        message = data.get(
            "message",
            ""
        )

        if not isinstance(
            message,
            str
        ):

            return jsonify({
                "success": False,
                "error": "Message must be a string."
            }), 400

        message = message.strip()

        if not message:

            return jsonify({
                "success": False,
                "error": "Message cannot be empty."
            }), 400

        # ----------------------------------------------
        # PREDICT INTENT
        # ----------------------------------------------

        result = ai_model.predict(
            message
        )

        # ----------------------------------------------
        # RESPONSE
        # ----------------------------------------------

        intent = result.get(
            "intent"
        )

        confidence = result.get(
            "confidence",
            0
        )

        response = generate_response(
            message,
            intent,
            confidence
        )

        return jsonify({
            "success": True,
            "message": message,
            "intent": intent,
            "confidence": confidence,
            "response": response
        })

    except Exception as error:

        print(
            "AI ERROR:",
            error
        )

        return jsonify({
            "success": False,
            "error": str(error)
        }), 500


# ============================================================
# RESPONSE ENGINE
# ============================================================

def generate_response(
    message,
    intent,
    confidence
):

    if not intent:

        return (
            "I could not understand your request. "
            "Please ask me about IoT products, "
            "projects, components, or your cart."
        )

    if intent == "PRODUCT_SEARCH":

        return (
            "I understand that you are looking "
            "for IoT products or components. "
            "I can search the IoT Hub product "
            "catalog for you."
        )

    if intent == "PRODUCT_DETAILS":

        return (
            "I can provide product information "
            "such as features, specifications, "
            "price, compatibility, and stock."
        )

    if intent == "PROJECT_SEARCH":

        return (
            "I understand that you are looking "
            "for an IoT project. I can search "
            "the IoT Hub project catalog."
        )

    if intent == "PROJECT_FLOW":

        return (
            "I can explain an IoT project's flow "
            "from sensors to controller, decision "
            "logic, actuators, and output."
        )

    if intent == "ADD_PRODUCT_CART":

        return (
            "I understand that you want to add "
            "a product to your cart."
        )

    if intent == "ADD_PROJECT_CART":

        return (
            "I understand that you want to add "
            "all required components of a project "
            "to your cart."
        )

    if intent == "VIEW_CART":

        return (
            "I can show the products currently "
            "present in your cart."
        )

    if intent == "PRICE_QUERY":

        return (
            "I can check the current IoT Hub "
            "product price for you."
        )

    if intent == "STOCK_QUERY":

        return (
            "I can check product availability "
            "and stock."
        )

    if intent == "RECOMMEND_PROJECT":

        return (
            "I can recommend an IoT project "
            "based on your requirements."
        )

    if intent == "GENERAL_IOT":

        return (
            "I can answer IoT-related questions "
            "about sensors, microcontrollers, "
            "communication protocols, and projects."
        )

    return (
        "I understood your request as "
        f"{intent.replace('_', ' ').lower()}."
    )


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    print()
    print("=" * 60)
    print("              IoT HUB AI")
    print("=" * 60)
    print("Custom AI model: ACTIVE")
    print("AI API: http://127.0.0.1:5001")
    print("Health: http://127.0.0.1:5001/api/health")
    print("Chat: POST /api/chat")
    print("=" * 60)
    print()

    app.run(
        host="127.0.0.1",
        port=5001,
        debug=True
    )