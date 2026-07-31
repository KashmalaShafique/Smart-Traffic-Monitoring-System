import cv2
import os
import pandas as pd
import sys
from django.http import StreamingHttpResponse, JsonResponse
from django.conf import settings

sys.path.append(settings.SRC_DIR)

DATA_PATH = os.path.join(settings.DATA_DIR, 'traffic_data.csv')
VIDEO_PATH = os.path.join(settings.DATA_DIR, 'traffic_video.mp4')

def generate_frames():
    cap = cv2.VideoCapture(VIDEO_PATH)
    while True:
        success, frame = cap.read()
        if not success:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue
        _, buffer = cv2.imencode('.jpg', frame)
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n'
               + buffer.tobytes() + b'\r\n')

def video_feed(request):
    return StreamingHttpResponse(
        generate_frames(),
        content_type='multipart/x-mixed-replace; boundary=frame'
    )

def get_traffic(request):
    try:
        df = pd.read_csv(DATA_PATH)
        df = df.drop_duplicates(subset=['time'], keep='last')

        latest = int(df['vehicle_count'].iloc[-1])
        avg = float(df['vehicle_count'].mean())
        maximum = int(df['vehicle_count'].max())

        recent = df.tail(5)['vehicle_count'].tolist()
        accident = False
        if len(recent) >= 2:
            if recent[-1] - recent[-2] >= 5:
                accident = True

        if latest <= 10:
            congestion = 'LOW'
        elif latest <= 20:
            congestion = 'MEDIUM'
        else:
            congestion = 'HIGH'

        return JsonResponse({
            'latest': latest,
            'avg': round(avg, 2),
            'max': maximum,
            'congestion': congestion,
            'accident': accident,
            'history': df.tail(50).to_dict(orient='records')
        })

    except FileNotFoundError:
        return JsonResponse({
            'latest': 0,
            'avg': 0,
            'max': 0,
            'congestion': 'LOW',
            'accident': False,
            'history': []
        })
    except Exception as e:
        return JsonResponse({'error': str(e)})
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import TrafficIncident, VehicleDetection


# CREATE
@login_required
def incident_create(request):
    if request.method == 'POST':
        location = request.POST.get('location')
        description = request.POST.get('description')
        severity = request.POST.get('severity')

        TrafficIncident.objects.create(
            location=location,
            description=description,
            severity=severity,
            reported_by=request.user
        )
        return redirect('incident_list')

    return render(request, 'traffic/incident_form.html', {'action': 'Create'})


# READ (List all)
@login_required
def incident_list(request):
    incidents = TrafficIncident.objects.all().order_by('-created_at')
    return render(request, 'traffic/incident_list.html', {'incidents': incidents})


# READ (Single detail)
@login_required
def incident_detail(request, pk):
    incident = get_object_or_404(TrafficIncident, pk=pk)
    detections = incident.detections.all()
    return render(request, 'traffic/incident_detail.html', {
        'incident': incident,
        'detections': detections
    })


# UPDATE
@login_required
def incident_update(request, pk):
    incident = get_object_or_404(TrafficIncident, pk=pk)

    if request.method == 'POST':
        incident.location = request.POST.get('location')
        incident.description = request.POST.get('description')
        incident.severity = request.POST.get('severity')
        incident.is_resolved = request.POST.get('is_resolved') == 'on'
        incident.save()
        return redirect('incident_list')

    return render(request, 'traffic/incident_form.html', {
        'incident': incident,
        'action': 'Update'
    })


# DELETE
@login_required
def incident_delete(request, pk):
    incident = get_object_or_404(TrafficIncident, pk=pk)

    if request.method == 'POST':
        incident.delete()
        return redirect('incident_list')

    return render(request, 'traffic/incident_confirm_delete.html', {'incident': incident})