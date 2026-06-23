import cv2
import mediapipe as mp
from flask import Flask, jsonify
from flask_cors import CORS
import threading
import sys
import time

app = Flask(__name__)
CORS(app)

current_state = "AWAY"

@app.route('/state')
def get_state():
    return jsonify({"status": current_state})

def run_server():
    try:
        app.run(host='127.0.0.1', port=5555, debug=False, use_reloader=False)
    except Exception as e:
        print(f"\n>>> CRITICAL SERVER ERROR: {e}\n", file=sys.stderr)

api_thread = threading.Thread(target=run_server, daemon=True)
api_thread.start()

# headless vision core logic
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

cap = cv2.VideoCapture(0)
print(">>> SproutBreak Vision Core running silently. Press Ctrl+C in this terminal to quit.")

try:
    while cap.isOpened():
        success, image = cap.read()
        if not success: 
            time.sleep(0.1)
            continue

        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = pose.process(image_rgb)

        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            nose_vis = landmarks[mp_pose.PoseLandmark.NOSE.value].visibility
            l_shoulder_vis = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].visibility
            r_shoulder_vis = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].visibility
            
            if nose_vis > 0.60 and (l_shoulder_vis > 0.50 or r_shoulder_vis > 0.50):
                current_state = "PRESENT"
            else:
                current_state = "AWAY"
        else:
            current_state = "AWAY"
            
        # throttle loop
        time.sleep(0.03) 

except KeyboardInterrupt:
    print("\n>>> Shutting down Vision Core...")

finally:
    # release lock
    cap.release()