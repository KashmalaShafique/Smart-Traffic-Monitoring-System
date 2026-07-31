import os
import pickle
import pandas as pd
import sys
from django.http import JsonResponse
from django.conf import settings
from datetime import datetime

sys.path.append(settings.SRC_DIR)

DATA_PATH = os.path.join(settings.DATA_DIR, 'traffic_data.csv')
MODEL_PATH = os.path.join(settings.MODELS_DIR, 'traffic_predictor.pkl')

def get_prediction(request):
    try:
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)

        df = pd.read_csv(DATA_PATH)
        df['hour'] = pd.to_datetime(df['time'], format='%H:%M:%S').dt.hour
        df['minute'] = pd.to_datetime(df['time'], format='%H:%M:%S').dt.minute
        df['rolling_avg'] = df['vehicle_count'].rolling(3, min_periods=1).mean()
        df['prev_count'] = df['vehicle_count'].shift(1).fillna(0)

        last = df.iloc[-1]
        features = [[
            last['hour'],
            last['minute'],
            last['vehicle_count'],
            last['rolling_avg'],
            last['prev_count']
        ]]

        prediction = model.predict(features)[0]
        confidence = round(float(model.predict_proba(features).max()) * 100, 2)

        now = datetime.now()
        forecast = []
        for i in range(1, 4):
            hour = (now.hour + i) % 24
            forecast.append({
                'hour': f'{hour:02d}:00',
                'predicted_congestion': prediction,
                'confidence': confidence
            })

        return JsonResponse({
            'current_prediction': prediction,
            'confidence': confidence,
            'forecast': forecast
        })

    except FileNotFoundError:
        return JsonResponse({
            'current_prediction': 'Model not trained yet',
            'confidence': 0,
            'forecast': []
        })
    except Exception as e:
        return JsonResponse({'error': str(e)})