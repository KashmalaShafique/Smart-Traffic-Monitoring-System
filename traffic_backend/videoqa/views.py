import os
import cv2
import base64
import tempfile
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt


# Add your own Gemini API key before running the project
GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE"

GEMINI_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/"
    f"models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
)
@csrf_exempt
def upload_and_ask(request):
    if request.method == 'POST':
        try:
            video_file = request.FILES.get('video')
            question = request.POST.get('question', '')
            print("RECEIVED QUESTION:", question)

            if not video_file:
                return JsonResponse({'error': 'No video uploaded'})

            if not question:
                return JsonResponse({'error': 'No question provided'})

            # Save video temporarily
            with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp:
                for chunk in video_file.chunks():
                    tmp.write(chunk)
                tmp_path = tmp.name

            # Extract frames
            cap = cv2.VideoCapture(tmp_path)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            fps = max(cap.get(cv2.CAP_PROP_FPS), 1)
            duration = total_frames / fps
            frame_count = min(4, max(1, int(duration)))
            interval = max(1, total_frames // frame_count)

            frames_b64 = []
            for i in range(frame_count):
                cap.set(cv2.CAP_PROP_POS_FRAMES, i * interval)
                ret, frame = cap.read()
                if ret:
                    # Resize frame to reduce size
                    frame = cv2.resize(frame, (640, 360))
                    _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 60])
                    frames_b64.append(base64.b64encode(buffer).decode('utf-8'))

            cap.release()
            os.unlink(tmp_path)

            if not frames_b64:
                return JsonResponse({'error': 'Could not extract frames from video'})

            # Build Gemini request with only text + one image at a time
            # Use only first frame to avoid size issues
            parts = [
                {
                    'inline_data': {
                        'mime_type': 'image/jpeg',
                        'data': frames_b64[0]
                    }
                },
                {
                    'text': f'You are a traffic analysis AI. Analyze this traffic video frame and answer: {question}'
                }
            ]

            response = requests.post(
                GEMINI_URL,
                headers={'Content-Type': 'application/json'},
                json={'contents': [{'parts': parts}]},
                timeout=60
            )

            if response.status_code != 200:
                return JsonResponse({'error': f'Gemini API error: {response.status_code} - {response.text[:200]}'})

            data = response.json()
            answer = data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', 'Could not analyze video.')

            return JsonResponse({'answer': answer})

        except Exception as e:
            import traceback
            return JsonResponse({'error': str(e), 'detail': traceback.format_exc()})

    return JsonResponse({'error': 'POST required'})