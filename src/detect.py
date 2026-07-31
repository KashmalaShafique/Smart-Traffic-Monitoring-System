from ultralytics import YOLO
import cv2
import csv
import os
from datetime import datetime

# ✅ Use relative path — works on any computer
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIDEO_PATH = os.path.join(BASE_DIR, "data", "traffic_video.mp4")
CSV_PATH = os.path.join(BASE_DIR, "data", "traffic_data.csv")
MODEL_PATH = os.path.join(BASE_DIR, "models", "yolo11n.pt")

# ✅ YOLO11 not YOLOv8
model = YOLO(MODEL_PATH)

# Vehicle classes in YOLO (only count these)
VEHICLE_CLASSES = [1, 2, 3, 5, 7]  # bicycle, car, motorcycle, bus, truck

cap = cv2.VideoCapture(VIDEO_PATH)

# Counting line at middle of frame
frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
line_y = frame_height // 2

count = 0
counted_ids = set()

# Setup CSV
with open(CSV_PATH, "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["time", "vehicle_count", "congestion_level"])

csv_file = open(CSV_PATH, "a", newline="")
writer = csv.writer(csv_file)

frame_count = 0

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    frame_count += 1
    results = model.track(frame, persist=True, classes=VEHICLE_CLASSES, conf=0.3, iou=0.5)

    if results[0].boxes.id is not None:
        boxes = results[0].boxes

        for box in boxes:
            x1, y1, x2, y2 = box.xyxy[0]
            obj_id = int(box.id[0])
            cls = int(box.cls[0])

            cx = int((x1 + x2) / 2)
            cy = int((y1 + y2) / 2)

            # Draw box
            cv2.rectangle(frame,
                (int(x1), int(y1)),
                (int(x2), int(y2)),
                (0, 255, 0), 2)

            # Label
            label = model.names[cls]
            cv2.putText(frame, label, (int(x1), int(y1) - 5),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)

            cv2.circle(frame, (cx, cy), 3, (0, 0, 255), -1)

            # Count when crossing line — WIDER zone now (30px instead of 10px)
            if line_y - 20 < cy < line_y + 20:
                if obj_id not in counted_ids:
                    count += 1
                    counted_ids.add(obj_id)

                    # ✅ Real congestion level (not random)
                    if count <= 10:
                        congestion = "LOW"
                    elif count <= 20:
                        congestion = "MEDIUM"
                    else:
                        congestion = "HIGH"

                    current_time = datetime.now().strftime("%H:%M:%S")
                    writer.writerow([current_time, count, congestion])
                    csv_file.flush()
                    os.fsync(csv_file.fileno())
                    print(f"[LOGGED] Time: {current_time} | Count: {count} | Level: {congestion}")

    # ALSO log every 30 frames regardless of crossing, so dashboard always has fresh data
    if frame_count % 30 == 0:
        if count <= 10:
            congestion = "LOW"
        elif count <= 20:
            congestion = "MEDIUM"
        else:
            congestion = "HIGH"
        current_time = datetime.now().strftime("%H:%M:%S")
        writer.writerow([current_time, count, congestion])
        csv_file.flush()
        os.fsync(csv_file.fileno())

    # Draw line
    cv2.line(frame, (0, line_y),
        (frame.shape[1], line_y), (255, 0, 0), 2)

    cv2.putText(frame, f"Count: {count}", (50, 50),
        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

    cv2.imshow("Traffic Detection", frame)

    if cv2.waitKey(1) & 0xFF == 27:
        break

csv_file.close()
cap.release()
cv2.destroyAllWindows()
print(f"Done. Total vehicles counted: {count}")