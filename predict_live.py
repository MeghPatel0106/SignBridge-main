import cv2
import mediapipe as mp
import numpy as np
import pandas as pd
import joblib
import time
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import pyttsx3

def train_model():
    print("Loading dataset...")
    try:
        df = pd.read_csv('dataset.csv', header=None)
    except FileNotFoundError:
        print("Error: dataset.csv not found!")
        exit()

    # Features are the first 63 columns, Label is the last column
    X = df.iloc[:, :-1].values
    y = df.iloc[:, -1].values

    print(f"Training KNN model with {len(X)} samples...")
    # Train KNN
    knn = KNeighborsClassifier(n_neighbors=5)
    knn.fit(X, y)

    # Save model
    joblib.dump(knn, 'isl_model.pkl')
    print("Model trained and saved as 'isl_model.pkl'.")
    return knn

def main():
    # step 1: Train the model
    model = train_model()

    # Initialize Text-to-Speech
    try:
        engine = pyttsx3.init()
    except Exception as e:
        print(f"Warning: Could not initialize TTS engine: {e}")
        engine = None

    # App Logic Variables
    current_text = ""
    last_prediction = ""
    last_detected_time = time.time()
    space_added = False
    
    # Feedback Timer
    feedback_start_time = 0
    feedback_duration = 1.0 # 1 second

    # Initialize MediaPipe Hands
    BaseOptions = mp.tasks.BaseOptions
    HandLandmarker = mp.tasks.vision.HandLandmarker
    HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions
    VisionRunningMode = mp.tasks.vision.RunningMode

    options = HandLandmarkerOptions(
        base_options=BaseOptions(model_asset_path='hand_landmarker.task'),
        running_mode=VisionRunningMode.VIDEO,
        num_hands=2
    )

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return
    
    print("✅ Live Prediction Started! Press 'q' to exit.")

    with HandLandmarker.create_from_options(options) as landmarker:
        while cap.isOpened():
            success, frame = cap.read()
            if not success:
                continue

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
                # Hand Detected
                last_detected_time = time.time()
                space_added = False

                for hand_landmarks in detection_result.hand_landmarks:
                    # Extract features
                    features = []
                    for landmark in hand_landmarks:
                        features.extend([landmark.x, landmark.y, landmark.z])
                    
                    # Predict probabilities
                    # returns [[prob_class1, prob_class2, ...]]
                    proba = model.predict_proba([features])[0]
                    confidence = np.max(proba)
                    predicted_idx = np.argmax(proba)
                    prediction = model.classes_[predicted_idx]
                    
                    # Keep the one with highest confidence
                    if confidence > max_confidence:
                        max_confidence = confidence
                        best_prediction = prediction
                    
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
            
            else:
                # No hand detected
                if (time.time() - last_detected_time > 2.0) and not space_added:
                    current_text += " "
                    space_added = True
                    last_prediction = "" # Reset prediction so next letter is accepted immediately
                    
                    # Trigger feedback
                    feedback_start_time = time.time()
                    
                    # Speak the text
                    if engine:
                        print(f"Speaking: {current_text}")
                        engine.say(current_text)
                        engine.runAndWait()
                        
                        # Clear text after speaking (optional, but makes sense for continuous flow, 
                        # or user might want to keep building sentences. 
                        # Requirement 3 says "Append a space", "Reset last_prediction".
                        # Requirement 5 says "speak the current_text aloud".
                        # It doesn't explicitly say clear it. I'll keep it accumulating per instructions:
                        # "Convert the continuously predicted letters into full words and speak them aloud."
                        # Usually "speak them aloud" implies reading what's there. 
                        # If I don't clear, it will read the whole paragraph every word.
                        # However, based on "Goal: Convert the continuously predicted letters into full words",
                        # and "When a space is added (word completed), speak the current_text aloud."
                        # If I say "Hello", then add space -> speaks "Hello".
                        # Then I sign "World", text becomes "Hello World".
                        # Add space -> speaks "Hello World".
                        # This seems redundant.
                        # But strictly following: "Append a space", "speak current_text".
                        # I will NOT clear it unless asked. 
                        # Wait, "Keep webcam running and exit on 'q'".
                        # I'll stick to instructions strictly: Append space, Speak current_text.

            # Update text if prediction changed
            # "When a hand is detected and a letter is predicted ... If prediction != last_prediction: Append ..."
            # This logic needs to happen AFTER we determine the best prediction for the *frame*.
            # The current code iterates all hands and finds `best_prediction`.
            # We should use `best_prediction` from the loop above.
            
            if best_prediction and best_prediction != last_prediction:
                current_text += best_prediction
                last_prediction = best_prediction

            # Display best prediction only
            if best_prediction:
                 # Optional: Display confidence
                 display_text = f"Prediction: {best_prediction}"
                 # display_text = f"Prediction: {best_prediction} ({max_confidence:.2f})"
                 cv2.putText(frame, display_text, (50, 50), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
            
            # 4) Display on screen: cv2.putText(frame, f"Text: {current_text}", ...)
            cv2.putText(frame, f"Text: {current_text}", (50, 100), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)
            
            # Debug Status Overlay
            time_diff = time.time() - last_detected_time
            if detection_result.hand_landmarks:
                status_text = "Status: Hand Detected"
                status_color = (0, 255, 0) # Green
            else:
                status_text = f"Status: No Hand ({time_diff:.1f}s)"
                status_color = (0, 0, 255) # Red
                
            cv2.putText(frame, status_text, (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, status_color, 2, cv2.LINE_AA)
            
            # Display Feedback Overlay
            if time.time() - feedback_start_time < feedback_duration:
                # Center text for feedback
                text = "SPACE ADDED"
                font = cv2.FONT_HERSHEY_SIMPLEX
                font_scale = 2
                thickness = 3
                text_size = cv2.getTextSize(text, font, font_scale, thickness)[0]
                text_x = (frame.shape[1] - text_size[0]) // 2
                text_y = (frame.shape[0] + text_size[1]) // 2
                
                cv2.putText(frame, text, (text_x, text_y), 
                           font, font_scale, (0, 255, 255), thickness, cv2.LINE_AA)

            cv2.imshow('SignBridge Live Prediction', frame)

            if cv2.waitKey(5) & 0xFF == ord('q'):
                break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
