import cv2
import mediapipe as mp
import cv2
import mediapipe as mp
import time
import csv
import os
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

def main():
    # Initialize MediaPipe Hands (new way for v0.10.30+)
    BaseOptions = mp.tasks.BaseOptions
    HandLandmarker = mp.tasks.vision.HandLandmarker
    HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions
    VisionRunningMode = mp.tasks.vision.RunningMode
    
    # Create hand landmarker
    options = HandLandmarkerOptions(
        base_options=BaseOptions(model_asset_path='hand_landmarker.task'),
        running_mode=VisionRunningMode.VIDEO,
        num_hands=2
    )
    
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return
    
    print("✅ Webcam opened! Press 'q' to exit")
    
    with HandLandmarker.create_from_options(options) as landmarker:
        while cap.isOpened():
            success, frame = cap.read()
            if not success:
                continue
            
            frame = cv2.flip(frame, 1)
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Convert to MediaPipe Image
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
            
            # Detect hands
            # Timestamp (ms) is required for VIDEO mode
            timestamp_ms = int(time.time() * 1000)
            detection_result = landmarker.detect_for_video(mp_image, timestamp_ms)
            
            # Draw landmarks
            if detection_result.hand_landmarks:
                for hand_landmarks in detection_result.hand_landmarks:
                    for idx, landmark in enumerate(hand_landmarks):
                        h, w, _ = frame.shape
                        cx, cy = int(landmark.x * w), int(landmark.y * h)
                        # Draw red dot
                        cv2.circle(frame, (cx, cy), 5, (0, 0, 255), -1)
                        # Requested print
                        print(f"{idx}: {landmark.x:.3f}, {landmark.y:.3f}, {landmark.z:.3f}")

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
                    

            
            cv2.imshow('SignBridge Hand Tracker', frame)
            
            # Key handling
            key = cv2.waitKey(5) & 0xFF
            
            if key == ord('.'):
                break
            elif (key >= ord('a') and key <= ord('z')) or (key >= ord('0') and key <= ord('9')):
                if detection_result.hand_landmarks:
                    # Get the first detected hand
                    hand_landmarks = detection_result.hand_landmarks[0]
                    
                    # Flatten landmarks
                    row = []
                    for landmark in hand_landmarks:
                        row.extend([landmark.x, landmark.y, landmark.z])
                    
                    # Determine label
                    label = chr(key).upper()
                    row.append(label)
                    
                    # Save to CSV
                    file_exists = os.path.isfile('balanced_dataset.csv')
                    with open('dataset.csv', mode='a', newline='') as f:
                        writer = csv.writer(f)
                        # Optional: write header if new file, but requirement says just append row
                        # if not file_exists:
                        #    header = []
                        #    for i in range(21):
                        #        header.extend([f'x{i}', f'y{i}', f'z{i}'])
                        #    header.append('label')
                        #    writer.writerow(header)
                        
                        writer.writerow(row)
                    
                    print(f"Saved sample for {label}")
    
    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    main()