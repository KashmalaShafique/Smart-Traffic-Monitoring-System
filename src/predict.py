import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import pickle
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, "data", "traffic_data.csv")
MODEL_SAVE = os.path.join(BASE_DIR, "models", "traffic_predictor.pkl")

def generate_sample_data():
    """Generate sample data if CSV is empty or missing"""
    import random
    from datetime import datetime, timedelta

    rows = []
    base_time = datetime.strptime("08:00:00", "%H:%M:%S")

    for i in range(200):
        current_time = base_time + timedelta(minutes=i)
        hour = current_time.hour

        # Simulate rush hours
        if 8 <= hour <= 10 or 17 <= hour <= 19:
            count = random.randint(15, 30)
        elif 12 <= hour <= 14:
            count = random.randint(10, 20)
        else:
            count = random.randint(1, 10)

        if count <= 10:
            congestion = "LOW"
        elif count <= 20:
            congestion = "MEDIUM"
        else:
            congestion = "HIGH"

        rows.append({
            "time": current_time.strftime("%H:%M:%S"),
            "vehicle_count": count,
            "congestion_level": congestion
        })

    df = pd.DataFrame(rows)
    df.to_csv(CSV_PATH, index=False)
    print(f"Sample data generated: {len(df)} rows saved to {CSV_PATH}")
    return df

def train_model():
    # Load or generate data
    if not os.path.exists(CSV_PATH):
        print("No CSV found — generating sample data...")
        df = generate_sample_data()
    else:
        df = pd.read_csv(CSV_PATH)
        if len(df) < 10:
            print("Not enough data — generating sample data...")
            df = generate_sample_data()

    # Feature engineering
    df["hour"] = pd.to_datetime(df["time"], format="%H:%M:%S").dt.hour
    df["minute"] = pd.to_datetime(df["time"], format="%H:%M:%S").dt.minute
    df["rolling_avg"] = df["vehicle_count"].rolling(3, min_periods=1).mean()
    df["prev_count"] = df["vehicle_count"].shift(1).fillna(0)

    features = ["hour", "minute", "vehicle_count", "rolling_avg", "prev_count"]
    X = df[features]
    y = df["congestion_level"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42)

    model = GradientBoostingClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    print("\n--- Model Evaluation ---")
    print(classification_report(y_test, model.predict(X_test)))

    with open(MODEL_SAVE, "wb") as f:
        pickle.dump(model, f)

    print(f"Model saved to {MODEL_SAVE}")
    return model

if __name__ == "__main__":
    train_model()