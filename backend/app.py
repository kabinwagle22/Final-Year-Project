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
import json

app = Flask(__name__)

# --- CONFIGURATION ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cvd_database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# Secure key for production
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
    email = db.Column(db.String(120), unique=True, nullable=False)
    history = db.relationship('HealthHistory', backref='user', lazy=True)

class HealthHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    risk_score = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), nullable=False)
    features_json = db.Column(db.Text, nullable=True)
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
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')

    # --- NEW: BLOCK ALL EMPTY FIELDS ---
    if not username or not email or not password:
        return jsonify({"message": "All fields (Username, Email, Password) are required"}), 400
    
    # Existing Password Strength check
    if len(password) < 6:
        return jsonify({"message": "Password must be at least 6 characters"}), 400

    # Validation: Check if Username OR Email already exists
    if User.query.filter_by(username=username).first():
        return jsonify({"message": "Username already taken"}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already registered"}), 400

    # If all checks pass, proceed to hash and save
    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, email=email, password=hashed_pw)
    
    db.session.add(new_user)
    db.session.commit()
    
    # Return a token immediately after registration so they are logged in
    token = create_access_token(identity=str(new_user.id))
    return jsonify({"token": token, "username": username}), 201

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
        
        # 1. Transform the input data using the loaded scaler
        features_scaled = scaler.transform(np.array([data]))
        
        # 2. FIX: Use index [0] instead of [1] because your model's 
        # internal class for "Disease" is mapped to 0.
        probabilities = model.predict_proba(features_scaled)[0]
        risk_score = round(float(probabilities[0] * 100), 2)
        
        # 3. Determine status based on corrected risk score
        status = "High Risk" if risk_score > 50 else "Low Risk"
        
        # 4. Save to Database
        new_entry = HealthHistory(
            user_id=int(user_id), 
            risk_score=risk_score, 
            status=status,
            features_json=json.dumps(data) 
        )
        db.session.add(new_entry)
        db.session.commit()
        
        return jsonify({"status": status, "risk_score": risk_score})
    except Exception as e:
        print(f"Prediction Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()
    # Fetch all records for the user
    history = HealthHistory.query.filter_by(user_id=int(user_id)).order_by(HealthHistory.id.desc()).all()
    
    # IMPORTANT: Add 'features_json' to the dictionary below
    return jsonify([{
        "risk_score": h.risk_score,
        "status": h.status,
        "timestamp": h.timestamp.strftime("%Y-%m-%d %H:%M") if h.timestamp else "N/A",
        "features_json": h.features_json  
    } for h in history])
# --- THE CHATBOT ---

@app.route('/api/chatbot', methods=['POST'])
@jwt_required()
def chatbot():
    user_msg = request.json.get('message', '')
    user_id = get_jwt_identity()

    # Get latest history and extract the 13 factors
    last = HealthHistory.query.filter_by(user_id=int(user_id)).order_by(HealthHistory.timestamp.desc()).first()
    
    if last and last.features_json:
        try:
            f = json.loads(last.features_json)
            # Assuming standard indices (e.g., 3=systolic, 4=diastolic, 8=glucose)
            context = (
                f"User's Risk: {last.risk_score}% ({last.status}). "
                f"Data: BP={f[3]}/{f[4]}, Chol={f[7]}, Glucose={f[8]}, Smoke={f[9]}, Alcohol={f[10]}."
            )
        except:
            context = f"User Risk: {last.risk_score}%. Factors unavailable."
    else:
        context = "No history available."

    load_dotenv()
    hf_token = os.getenv("HUGGINGFACE_TOKEN")

    if not hf_token:
        return jsonify({"response": "API Key is missing."})

    API_URL = "https://router.huggingface.co/v1/chat/completions"
    headers = {"Authorization": f"Bearer {hf_token.strip()}", "Content-Type": "application/json"}

    try:
        payload = {
            "model": "meta-llama/Meta-Llama-3-8B-Instruct",
            "messages": [
                {
                    "role": "system", 
                    "content": (
                        "You are a Clinical Cardiovascular Assistant. "
                        "1. Use '###' for headers and '---' for dividers.\n"
                        "2. Identify the most concerning factor in the context (BP, Glucose, or Chol).\n"
                        "3. Explain why that factor impacts the score.\n"
                        "4. Use 🔴 for High Risk (>50%) and 🟢 for Low Risk.\n"
                        "5. Keep response under 150 words."
                    )
                },
                {"role": "user", "content": f"Context: {context}\n\nUser Question: {user_msg}"}
            ],
            "max_tokens": 300
        }
        
        response = requests.post(API_URL, headers=headers, json=payload, timeout=15)
        output = response.json()

        if "choices" in output:
            bot_text = output['choices'][0]['message']['content'].strip()
            return jsonify({"response": bot_text})
        
        return jsonify({"response": f"System error. Last score was {last.risk_score if last else 'N/A'}%."})

    except Exception as e:
        return jsonify({"response": "I'm having trouble analyzing the data. Please try again later."})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5001)