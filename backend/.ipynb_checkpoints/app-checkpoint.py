from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# This finds the folder where cvd_project lives
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

try:
    model_path = os.path.join(BASE_DIR, 'models', 'cvd_model.pkl')
    scaler_path = os.path.join(BASE_DIR, 'models', 'scaler.pkl')
    
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    print("✅ Model and Scaler loaded successfully from project folder.")
except Exception as e:
    print(f"❌ Error loading model files: {e}")

# Medical threshold for a "Stronger" warning (Risk R3 Mitigation)
PROBABILITY_THRESHOLD = 0.7 

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # 1. Get JSON data
        data = request.json.get('features')
        if not data or len(data) != 13:
            return jsonify({"error": "Missing data. 13 health metrics required."}), 400

        # 2. Input Validation
        if not (10 <= data[0] <= 100): 
            return jsonify({"error": "Invalid age. Please enter a value between 10 and 100."}), 400

        # 3. Processing
        features_array = np.array([data])
        features_scaled = scaler.transform(features_array)
        
        # 4. AI Prediction
        prediction = model.predict(features_scaled)[0]
        probability = model.predict_proba(features_scaled)[0]
        risk_percentage = round(float(probability[1] * 100), 2)

        # 5. Define Status and Advice (THE MISSING PART)
        if prediction == 1:
            status = "High Risk"
            advice = "We recommend consulting a healthcare provider for a clinical evaluation."
        else:
            status = "Low Risk"
            advice = "Continue maintaining a healthy lifestyle!"

        # 6. Automated "Rate Checker" Logic
        heart_rate = data[7]  # thalach
        blood_pressure = data[3]  # trestbps
        alerts = []
        if heart_rate > 170:
            alerts.append("⚠️ Critical: Your heart rate is significantly above normal resting levels.")
        if blood_pressure > 160:
            alerts.append("⚠️ Alert: Your blood pressure is in the hypertensive range.")

        # 7. Enhanced Chatbot Response
        if risk_percentage > 70:
            bot_message = "My analysis shows several concerning patterns in your health data."
        elif risk_percentage > 40:
            bot_message = "You have a moderate risk profile. It might be time to review your lifestyle."
        else:
            bot_message = "Your cardiac health metrics are within a healthy range."
        
        # 8. Return everything to the Frontend
        return jsonify({
            "status": status,
            "risk_score": risk_percentage,
            "bot_speech": bot_message,
            "alerts": alerts,
            "recommendation": advice
        })

    except Exception as e:
        return jsonify({"error": f"Server Error: {str(e)}"}), 500
    
if __name__ == '__main__':
    app.run(debug=True, port=5001)