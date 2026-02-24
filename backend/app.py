from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
import datetime
import requests
from dotenv import load_dotenv

app = Flask(__name__)

# --- CONFIGURATION ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cvd_database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# Lengthened key to remove the InsecureKeyLengthWarning
app.config['JWT_SECRET_KEY'] = 'cvd-secure-jwt-secret-key-2026-v1-stable-production-final-ultra-secure' 

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app)

# --- DATABASE MODELS ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    history = db.relationship('HealthHistory', backref='user', lazy=True)

class HealthHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    risk_score = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)

# --- ML MODEL LOADING ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
try:
    model_path = os.path.join(BASE_DIR, 'models', 'cvd_model.pkl')
    scaler_path = os.path.join(BASE_DIR, 'models', 'scaler.pkl')
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    print("✓ CVD ML System: Loaded Successfully.")
except Exception as e:
    print(f"✗ ML Loading Error: {e}")

# --- AUTH ROUTES ---

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({"message": "User exists"}), 400
    hashed_pw = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')
    new_user = User(username=data.get('username'), password=hashed_pw)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"token": create_access_token(identity=str(new_user.id))}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data.get('username')).first()
    if user and bcrypt.check_password_hash(user.password, data.get('password')):
        return jsonify({"token": create_access_token(identity=str(user.id)), "username": user.username}), 200
    return jsonify({"message": "Invalid credentials"}), 401

# --- PREDICTION LOGIC ---

@app.route('/predict', methods=['POST'])
@jwt_required()  
def predict():
    try:
        user_id = get_jwt_identity()
        data = request.json.get('features')
        features_scaled = scaler.transform(np.array([data]))
        risk_score = round(float(model.predict_proba(features_scaled)[0][1] * 100), 2)
        status = "High Risk" if risk_score > 50 else "Low Risk"
        new_entry = HealthHistory(user_id=int(user_id), risk_score=risk_score, status=status)
        db.session.add(new_entry)
        db.session.commit()
        return jsonify({"status": status, "risk_score": risk_score})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()
    history = HealthHistory.query.filter_by(user_id=int(user_id)).order_by(HealthHistory.timestamp.desc()).all()
    return jsonify([{"risk_score": h.risk_score, "status": h.status, "timestamp": h.timestamp.strftime("%Y-%m-%d %H:%M")} for h in history]), 200

# --- THE CHATBOT (NEW HF ROUTER VERSION) ---

@app.route('/api/chatbot', methods=['POST'])
@jwt_required()
def chatbot():
    user_msg = request.json.get('message', '')
    user_id = get_jwt_identity()

    last = HealthHistory.query.filter_by(user_id=int(user_id)).order_by(HealthHistory.timestamp.desc()).first()
    context = f"User's last CVD risk score: {last.risk_score}% ({last.status})." if last else "No history."
    
    load_dotenv()
    hf_token = os.getenv("HUGGINGFACE_TOKEN")

    # FIX: Add .strip() to remove hidden spaces/newlines
    if hf_token:
        hf_token = hf_token.strip()
    else:
        return jsonify({"response": "API Key is missing from the server environment."})

    API_URL = "https://router.huggingface.co/v1/chat/completions"
    
    # Ensure there is exactly one space after 'Bearer'
    headers = {
        "Authorization": f"Bearer {hf_token}", 
        "Content-Type": "application/json"
    }

    try:
        payload = {
            "model": "meta-llama/Meta-Llama-3-8B-Instruct",
            "messages": [
                {
                    "role": "system", 
                    "content": (
                        "You are a supportive and professional Cardiovascular Assistant. "
                        "FORMATTING RULES:\n"
                        "1. Use '###' for headers.\n"
                        "2. Use '---' for horizontal dividers.\n"
                        "3. Use 🔴 for high risk (>50%) and 🟢 for low risk (<50%).\n"
                        "4. When the user asks for results, provide a 'Heart Health Snapshot'.\n"
                        "5. IMPORTANT: Do not list all missing factors at once. Pick the most important one (like Blood Pressure) "
                        "and ask for it nicely. Keep responses under 150 words."
                    )
                },
                {"role": "user", "content": f"Context: {context}\n\nUser Message: {user_msg}"}
            ],
            "max_tokens": 300
        }
        
        response = requests.post(API_URL, headers=headers, json=payload, timeout=15)
        output = response.json()

        # ADD THIS LINE TO SEE THE REAL ERROR IN YOUR TERMINAL
        print(f"DEBUG HF RESPONSE: {output}")

        if "choices" in output:
            bot_text = output['choices'][0]['message']['content'].strip()
            return jsonify({"response": bot_text})
        
        # This will now tell the user the specific error from HF
        error_msg = output.get("error", "Unknown API error")
        return jsonify({"response": f"I'm having trouble. API says: {error_msg}. Your last score was {context}"})

    except Exception as e:
        print(f"CHATBOT EXCEPTION: {e}")
        return jsonify({"response": "System busy. Please try again!"})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5001)