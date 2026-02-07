from flask import Flask, render_template, Response, jsonify, send_from_directory
import cv2
import mediapipe as mp
import numpy as np
import pandas as pd
import joblib
import time
from sklearn.neighbors import KNeighborsClassifier
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from mediapipe.tasks.python import vision
import os
import pyttsx3

basedir = os.path.abspath(os.path.dirname(__file__))
app = Flask(__name__, 
            template_folder=os.path.join(basedir, 'templates'),
            static_folder=os.path.join(basedir, 'static'),
            static_url_path='/static')

# --- Global Variables for Prediction ---
model = None
scaler = None
current_prediction = ""
landmarker = None

# Sentence Building Globals
stored_sentence = ""
last_valid_prediction = None
stability_start_time = 0.0
is_sentence_appended = False

# TTS and Debug Globals
engine = None
try:
    engine = pyttsx3.init()
except Exception as e:
    print(f"Warning: Could not initialize TTS engine: {e}")

feedback_duration = 1.0

# --- Initialization ---
def load_resources():
    global model, landmarker
    print("Loading model...")
    try:
        model = joblib.load(os.path.join(basedir, 'isl_model.pkl'))
        print("Model loaded.")
    except Exception as e:
        print(f"Error loading model: {e}")
        return

    # Initialize MediaPipe Hands
    BaseOptions = mp.tasks.BaseOptions
    HandLandmarker = mp.tasks.vision.HandLandmarker
    HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions
    VisionRunningMode = mp.tasks.vision.RunningMode

    options = HandLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=os.path.join(basedir, 'hand_landmarker.task')),
        running_mode=VisionRunningMode.VIDEO,
        num_hands=2
    )
    
    # Create the landmarker (we'll keep it open)
    landmarker = HandLandmarker.create_from_options(options)
    print("MediaPipe Landmarker initialized.")

load_resources()

def generate_frames():
    global current_prediction, stored_sentence, scaler
    
    # Local Session State (Resets on page refresh/new connection)
    last_valid_prediction = None
    stability_start_time = 0.0
    is_sentence_appended = False
    last_detected_time = time.time()
    space_added = False
    has_new_char = False
    feedback_start_time = 0
    feedback_duration = 1.0

    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    while True:
        success, frame = cap.read()
        if not success:
            break

        # Flip and convert
        frame = cv2.flip(frame, 1)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)

        # Detect
        timestamp_ms = int(time.time() * 1000)
        detection_result = landmarker.detect_for_video(mp_image, timestamp_ms)

        # Process result
        best_prediction = None
        max_confidence = -1.0

        if detection_result.hand_landmarks:
            # Hand detected
            # Reset hand drop counter (concept removed, basically handled by stable reset)
            
            for hand_landmarks in detection_result.hand_landmarks:
                # Extract features
                features = []
                for landmark in hand_landmarks:
                    features.extend([landmark.x, landmark.y, landmark.z])
                
                # Predict probabilities
                if model:
                    try:
                        # Normalize if scaler exists
                        if scaler:
                            features_scaled = scaler.transform([features])
                            proba = model.predict_proba(features_scaled)[0]
                        else:
                            proba = model.predict_proba([features])[0]
                            
                        confidence = np.max(proba)
                        predicted_idx = np.argmax(proba)
                        prediction = model.classes_[predicted_idx]
                        
                        # Keep the one with highest confidence
                        if confidence > max_confidence:
                            max_confidence = confidence
                            best_prediction = prediction
                    except Exception as e:
                        print(f"Prediction Error: {e}")
                
                # Draw landmarks (Red dots)
                for landmark in hand_landmarks:
                    h, w, _ = frame.shape
                    cx, cy = int(landmark.x * w), int(landmark.y * h)
                    cv2.circle(frame, (cx, cy), 5, (0, 0, 255), -1)

                # Manually define hand connections (bones)
                HAND_CONNECTIONS = [
                    (0, 1), (1, 2), (2, 3), (3, 4),   # Thumb
                    (0, 5), (5, 6), (6, 7), (7, 8),   # Index
                    (0, 9), (9, 10), (10, 11), (11, 12), # Middle
                    (0, 13), (13, 14), (14, 15), (15, 16), # Ring
                    (0, 17), (17, 18), (18, 19), (19, 20)  # Pinky
                ]

                # Draw connections using OpenCV
                for connection in HAND_CONNECTIONS:
                    start_idx = connection[0]
                    end_idx = connection[1]
                    
                    start_point = hand_landmarks[start_idx]
                    end_point = hand_landmarks[end_idx]
                    
                    # Convert normalized coordinates to pixel coordinates
                    h, w, _ = frame.shape
                    start_x, start_y = int(start_point.x * w), int(start_point.y * h)
                    end_x, end_y = int(end_point.x * w), int(end_point.y * h)
                    
                    # Draw green line with thickness 2
                    cv2.line(frame, (start_x, start_y), (end_x, end_y), (0, 255, 0), 2)
            
            # --- Hand Detected Update ---
            last_detected_time = time.time()
            space_added = False
            
            # Update prediction state
            if best_prediction:
                current_prediction = best_prediction
                
                # Dwell Time Logic
                if best_prediction == last_valid_prediction:
                    # Same prediction as before, check duration
                    duration = time.time() - stability_start_time
                    if duration > 1 and not is_sentence_appended:
                        stored_sentence += best_prediction
                        print(f"Sentence updated: {stored_sentence}")
                        is_sentence_appended = True
                        has_new_char = True # Enable space addition
                else:
                    # New prediction, reset timer
                    last_valid_prediction = best_prediction
                    stability_start_time = time.time()
                    is_sentence_appended = False
                
                # Display
                display_text = f"Prediction: {best_prediction}"
                cv2.putText(frame, display_text, (50, 50), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
                
                # Optional: Show progress bar or indicator? 
                # For now just simple text update.
        
        else:
            # No hand detected
            last_valid_prediction = None
            is_sentence_appended = False
            current_prediction = "" # Clear display if no hand
            
            # Timeout Logic for Space/TTS
            if (time.time() - last_detected_time > 2.0) and not space_added and has_new_char:
                stored_sentence += " "
                space_added = True
                has_new_char = False # Reset flag so we don't add multiple spaces
                
                # Trigger feedback
                feedback_start_time = time.time()
                
                # PROTIP: pyttsx3 blocks. In a flask app generator, this might freeze the feed.
                # However, since we are in the generator loop, it will just pause frames for a moment.
                if engine:
                    print(f"Speaking: {stored_sentence}")
                    try:
                        engine.say(stored_sentence)
                        engine.runAndWait()
                    except Exception as e:
                        print(f"TTS Error: {e}")

        # --- Overlays ---
        # Debug Status
        time_diff = time.time() - last_detected_time
        if detection_result.hand_landmarks:
            status_text = "Status: Hand Detected"
            status_color = (0, 255, 0) # Green
        else:
            status_text = f"Status: No Hand ({time_diff:.1f}s)"
            status_color = (0, 0, 255) # Red
            
        cv2.putText(frame, status_text, (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, status_color, 2, cv2.LINE_AA)

        # Feedback Overlay "SPACE ADDED"
        if time.time() - feedback_start_time < feedback_duration:
            text = "SPACE ADDED"
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = 2
            thickness = 3
            text_size = cv2.getTextSize(text, font, font_scale, thickness)[0]
            text_x = (frame.shape[1] - text_size[0]) // 2
            text_y = (frame.shape[0] + text_size[1]) // 2
            
            cv2.putText(frame, text, (text_x, text_y), 
                       font, font_scale, (0, 255, 255), thickness, cv2.LINE_AA)

        # Encode frame
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    cap.release()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/get_word')
def get_word():
    # Return both current word and stored sentence
    return jsonify({
        'word': current_prediction,
        'sentence': stored_sentence
    })

@app.route('/clear_sentence', methods=['POST'])
def clear_sentence():
    global stored_sentence
    stored_sentence = ""
    # Note: local variables in generate_frames cannot be reset from here easily.
    # But clearing the sentence is the main goal.
    return jsonify({'status': 'cleared', 'sentence': stored_sentence})

@app.route('/backspace_sentence', methods=['POST'])
def backspace_sentence():
    global stored_sentence
    stored_sentence = stored_sentence[:-1]
    # If we backspace, we might want to allow immediate re-entry of the same char if needed,
    # but strictly 'is_sentence_appended' tracks the *current* gesture hold.
    # It shouldn't block re-typing if the user really wants.
    return jsonify({'status': 'backspaced', 'sentence': stored_sentence})

@app.route('/images/<path:filename>')
def serve_image(filename):
    """Serve ISL gesture images from the images folder."""
    return send_from_directory(os.path.join(basedir, 'images'), filename)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
