from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
from flask_sqlalchemy import SQLAlchemy  # The Database tool
from flask_bcrypt import Bcrypt          # The Password Scrambler
from flask_jwt_extended import JWTManager # The Login Token manager
import datetime                          # To record the time of checks

app = Flask(__name__)
# Tell Flask where to store the database file
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cvd_database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'level6-super-secret-key' # Change this later!

# Initialize the tools
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Table 1: User Information
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False) # Scrambled version
    history = db.relationship('HealthHistory', backref='user', lazy=True)

# Table 2: Saved Health Checks (Phase 4.2 requirement)
class HealthHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    risk_score = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)

CORS(app)

# This finds the folder where cvd_project lives
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

try:
    model_path = os.path.join(BASE_DIR, 'models', 'cvd_model.pkl')
    scaler_path = os.path.join(BASE_DIR, 'models', 'scaler.pkl')
    
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    print("Model and Scaler loaded successfully from project folder.")
except Exception as e:
    print(f"Error loading model files: {e}")

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
            alerts.append("Critical: Your heart rate is significantly above normal resting levels.")
        if blood_pressure > 160:
            alerts.append("Alert: Your blood pressure is in the hypertensive range.")

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
    
# --- USER REGISTRATION ---
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Check if user already exists
    if User.query.filter_by(username=username).first():
        return jsonify({"message": "User already exists"}), 400

    # Scramble (hash) the password!
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    new_user = User(username=username, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully!"}), 201

# --- USER LOGIN ---
from flask_jwt_extended import create_access_token

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data.get('username')).first()

    # Check if user exists and password is correct
    if user and bcrypt.check_password_hash(user.password, data.get('password')):
        # Create a "Visitor Badge" (Token)
        access_token = create_access_token(identity=str(user.id))
        return jsonify({"token": access_token, "username": user.username}), 200
    
    return jsonify({"message": "Invalid credentials"}), 401

if __name__ == '__main__':
    app.run(debug=True, port=5001)