from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
import datetime

app = Flask(__name__)

# --- CONFIGURATION (Phase 4.2.4 Security) ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cvd_database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'level6-super-secret-key' 

# Initialize tools
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app)

# --- MODELS (Phase 4.2.3 Data Storage) ---
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

# --- MODEL LOADING ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
try:
    model_path = os.path.join(BASE_DIR, 'models', 'cvd_model.pkl')
    scaler_path = os.path.join(BASE_DIR, 'models', 'scaler.pkl')
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    print("Model and Scaler loaded successfully.")
except Exception as e:
    print(f"Error loading model files: {e}")

# --- API ENDPOINTS (Phase 4.1) ---

@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint for API health check."""
    return jsonify({"status": "healthy", "database": "connected"}), 200

@app.route('/register', methods=['POST'])
def register():
    """User registration with password hashing."""
    data = request.json
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({"message": "User already exists"}), 400
    
    hashed_pw = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')
    new_user = User(username=data.get('username'), password=hashed_pw)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User registered successfully!"}), 201

@app.route('/login', methods=['POST'])
def login():
    """User authentication and JWT generation."""
    data = request.json
    user = User.query.filter_by(username=data.get('username')).first()
    if user and bcrypt.check_password_hash(user.password, data.get('password')):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({"token": access_token, "username": user.username}), 200
    return jsonify({"message": "Invalid credentials"}), 401

@app.route('/predict', methods=['POST'])
@jwt_required()  # Commented out for initial testing (Phase 6 connection)
def predict():
    """CVD Risk Prediction and Data Storage."""
    try:
        # 1. Handle User Identity (Fallback if not logged in)
        current_user_id = get_jwt_identity()
        
        # 2. Get features from React
        data = request.json.get('features')
        if not data or len(data) != 13:
            return jsonify({"error": "13 health metrics required."}), 400

        # 3. AI Prediction Logic
        input_data = np.array([data])
        features_scaled = scaler.transform(input_data)
        
        prediction = model.predict(features_scaled)[0]
        risk_percentage = round(float(model.predict_proba(features_scaled)[0][1] * 100), 2)

        status = "High Risk" if prediction == 1 else "Low Risk"
        advice = "Consult a healthcare provider." if prediction == 1 else "Maintain healthy habits!"

        # 4. Save to Database (ONLY if a user is actually logged in)
        if current_user_id:
            new_entry = HealthHistory(
                user_id=current_user_id, 
                risk_score=risk_percentage, 
                status=status
            )
            db.session.add(new_entry)
            db.session.commit()
        else:
            print("Guest session: Result calculated but not saved to database.")

        return jsonify({
            "status": status,
            "risk_score": risk_percentage,
            "recommendation": advice,
            "bot_speech": f"Analysis complete. Your risk is {status}."
        })
        
    except Exception as e:
        print(f"Prediction Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/history', methods=['GET'])
@jwt_required()
def get_history():
    """Retrieve prediction history for the authenticated user."""
    user_id = get_jwt_identity()
    records = HealthHistory.query.filter_by(user_id=user_id).all()
    history = [{"risk_score": r.risk_score, "status": r.status, "date": r.timestamp.strftime("%Y-%m-%d %H:%M")} for r in records]
    return jsonify(history), 200

@app.route('/api/chatbot', methods=['POST'])
@jwt_required()
def chatbot():
    """Chatbot Intent Recognition and Response (Phase 4.3)."""
    user_msg = request.json.get('message', '').lower()
    user_id = get_jwt_identity()

    if "last" in user_msg or "history" in user_msg:
        last = HealthHistory.query.filter_by(user_id=user_id).order_by(HealthHistory.timestamp.desc()).first()
        response = f"Your last risk score was {last.risk_score}%." if last else "No history found."
    elif "bp" in user_msg:
        response = "Normal BP is usually below 120/80 mmHg."
    else:
        response = "I can explain your risk scores or show your history."
    
    return jsonify({"response": response})

if __name__ == '__main__':
    app.run(debug=True, port=5001)