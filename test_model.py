import joblib
import numpy as np
import warnings

warnings.filterwarnings("ignore", category=UserWarning)

# Load your system
model = joblib.load('models/cvd_model.pkl')
scaler = joblib.load('models/scaler.pkl')

# Define the data for testing
young_features = np.array([[22, 0, 0, 110, 170, 0, 0, 170, 0, 0, 1, 0, 1]])
old_features = np.array([[70, 1, 3, 160, 280, 1, 2, 105, 1, 2.5, 2, 3, 3]])

# 1. Test Young & Healthy
scaled_young = scaler.transform(young_features)
prob_young = model.predict_proba(scaled_young)[0][0] * 100

# 2. Test Old & High Risk
scaled_old = scaler.transform(old_features)
prob_old = model.predict_proba(scaled_old)[0][0] * 100

print("--- FINAL PHASE 7 VALIDATION ---")
print(f"Healthy 22yo F Risk: {prob_young:.2f}%")
print(f"High Risk 70yo M Risk: {prob_old:.2f}%")

if prob_young < prob_old:
    print("\n✅ SUCCESS: Model logic is now correctly aligned!")
else:
    print("\n❌ ERROR: Logic is still inverted.")