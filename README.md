<p align="center">
  <img src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Writing%20hand/3D/writing_hand_3d.png" width="120" alt="SignBridge Logo"/>
</p>

<h1 align="center">🤟 SignBridge</h1>

<p align="center">
  <strong>Bridging Silence & Speech</strong><br>
  <em>Real-time Indian Sign Language (ISL) Recognition & Translation System</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/Flask-2.0+-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask"/>
  <img src="https://img.shields.io/badge/MediaPipe-ML-00C853?style=for-the-badge&logo=google&logoColor=white" alt="MediaPipe"/>
  <img src="https://img.shields.io/badge/OpenCV-Computer%20Vision-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white" alt="OpenCV"/>
  <img src="https://img.shields.io/badge/scikit--learn-ML-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white" alt="scikit-learn"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="License"/>
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome"/>
  <img src="https://img.shields.io/badge/Maintained-Yes-blue.svg?style=flat-square" alt="Maintained"/>
</p>

---

## 📖 Table of Contents

- [✨ Overview](#-overview)
- [🎯 Key Features](#-key-features)
- [🖼️ Screenshots](#️-screenshots)
- [🏗️ Project Structure](#️-project-structure)
- [🛠️ Technology Stack](#️-technology-stack)
- [⚙️ Installation](#️-installation)
- [🚀 Quick Start](#-quick-start)
- [📱 Usage Guide](#-usage-guide)
- [🧠 Machine Learning Model](#-machine-learning-model)
- [🎬 ISL Video Dictionary](#-isl-video-dictionary)
- [🔤 Alphabet Reference](#-alphabet-reference)
- [🌐 API Endpoints](#-api-endpoints)
- [🛣️ Roadmap](#️-roadmap)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Overview

**SignBridge** is an innovative real-time **Indian Sign Language (ISL)** recognition and translation system that bridges the communication gap between the deaf and hearing communities. Using cutting-edge machine learning and computer vision technologies, SignBridge provides bidirectional translation:

| 👐 **Sign-to-Text** | ✍️ **Text-to-Sign** |
|:---:|:---:|
| Recognize hand gestures via webcam | Convert text/speech to ISL videos |
| Real-time prediction display | Support for words & phrases |
| Automatic sentence formation | Letter-by-letter fallback |
| Text-to-Speech output | Multi-language voice input |

> 💡 **Mission**: To make communication accessible for everyone by leveraging AI to interpret and generate Indian Sign Language.

---

## 🎯 Key Features

### 🎥 Real-Time Sign Recognition
- **Live Webcam Feed** with MediaPipe hand landmark detection
- **21-point Hand Skeleton** visualization with connecting bones
- **Dwell-Time Detection** - hold gesture for 1+ second to confirm
- **Automatic Space Addition** - 2-second pause triggers word completion
- **Multi-Hand Support** - detects up to 2 hands simultaneously

### 🔊 Text-to-Speech Integration
- **Automatic Speaking** - speaks formed sentences after pause
- **Manual Trigger** - click to speak any recognized text
- **pyttsx3 Engine** - cross-platform TTS support

### 🌍 Multi-Language Translation
- **English** (Default)
- **Hindi** (हिंदी)
- Powered by Google Translate API

### 📚 Comprehensive Learning
- **26 ISL Alphabet Images** (A-Z)
- **41 ISL Word Videos** (common words & phrases)
- **Interactive Tutorial Page** with video modal

### 🎤 Voice Input
- **Speech-to-Text** recognition
- **Hindi-to-English Translation** for ISL display
- **Browser-based** speech recognition API

---

## 🖼️ Screenshots

### Sign Recognition Page
```
┌─────────────────────────────────────────────────────────────┐
│  📷 SIGN-RECOGNITION                                         │
│  ┌─────────────────────┐  ┌──────────────────────────────┐  │
│  │                     │  │ Detected Word: [HELLO    ]   │  │
│  │   🎥 Webcam Feed    │  │                              │  │
│  │   with Hand         │  │ Formed Sentence:             │  │
│  │   Landmark          │  │ ┌──────────────────────────┐ │  │
│  │   Detection         │  │ │ HELLO WORLD              │ │  │
│  │                     │  │ └──────────────────────────┘ │  │
│  └─────────────────────┘  │ [Clear] [Backspace ⌫]        │  │
│                           │                              │  │
│                           │ Translation: [English ▼]     │  │
│                           │ [📷 Start Camera] [🔊 Speak] │  │
│                           └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Text-to-Sign Page
```
┌─────────────────────────────────────────────────────────────┐
│  ✍️ TEXT/SPEECH TO SIGN                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Enter Text: [Hello how are you________________]      │   │
│  │ 🎤 [English ▼] [Start Voice Input]                   │   │
│  │            [🤟 Show ISL Gesture]                     │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │              ▶️ ISL Video Player                     │   │
│  │         (Plays matching word videos or               │   │
│  │          shows letter-by-letter images)              │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Project Structure

```
SignBridge-main-master/
│
├── 📄 app.py                      # Main Flask application (544 lines)
│                                  # - Routes & API endpoints
│                                  # - Real-time video streaming
│                                  # - ML model inference
│                                  # - TTS integration
│
├── 📄 requirements.txt            # Python dependencies
│
├── 🧠 isl_model.pkl              # Trained KNN classifier (~8MB)
├── 📊 scaler.pkl                 # Feature scaler for normalization
├── 📋 dataset.csv                # Training data (~20MB)
├── 🔧 hand_landmarker.task       # MediaPipe hand model (~7.8MB)
│
├── 📄 hand_landmarks.py          # Landmark extraction utilities
├── 📄 predict_live.py            # Standalone prediction script
├── 📄 clean_and_balance_dataset.py # Dataset preprocessing
├── 📄 test_translation.py        # Translation testing
├── 📓 check.ipynb                # Jupyter notebook for analysis
│
├── 📁 templates/                 # Jinja2 HTML templates
│   ├── base.html                 # Base layout with navigation
│   ├── index.html                # Sign Recognition page
│   ├── text_to_isl.html          # Text/Speech to Sign page
│   ├── isl_keyboard.html         # ISL Virtual Keyboard
│   ├── tutorial.html             # Learning tutorial page
│   └── history.html              # Conversation history
│
├── 📁 static/                    # Static assets
│   ├── style.css                 # Main stylesheet (~19KB)
│   └── script.js                 # Frontend JavaScript (~26KB)
│
├── 📁 images/                    # ISL Alphabet Images (26 files)
│   ├── A.jpg                     # Hand sign for letter A
│   ├── B.jpg                     # Hand sign for letter B
│   ├── ...                       # ...
│   └── Z.jpg                     # Hand sign for letter Z
│
└── 📁 isl/                       # ISL Word Videos (41 files)
    ├── hello.mp4                 # Video for "Hello"
    ├── good morning.mp4          # Video for "Good Morning"
    ├── what is your name.mp4     # Video for "What is your name"
    └── ...                       # (more words & phrases)
```

### 📝 File Descriptions

| File | Description |
|------|-------------|
| `app.py` | Core Flask server with all routes, video streaming, ML inference, translation API, and TTS |
| `isl_model.pkl` | Pre-trained K-Nearest Neighbors classifier for ISL gesture recognition |
| `scaler.pkl` | StandardScaler for normalizing hand landmark features |
| `hand_landmarker.task` | MediaPipe's pre-trained hand detection model |
| `dataset.csv` | 20MB+ dataset with hand landmark coordinates and labels |
| `hand_landmarks.py` | Utility functions for extracting 63 features (21 landmarks × 3 axes) |

---

## 🛠️ Technology Stack

### Backend
| Technology | Purpose |
|------------|---------|
| ![Python](https://img.shields.io/badge/Python-3.8+-3776AB?logo=python&logoColor=white) | Core programming language |
| ![Flask](https://img.shields.io/badge/Flask-2.x-000000?logo=flask&logoColor=white) | Web framework |
| ![MediaPipe](https://img.shields.io/badge/MediaPipe-Latest-00C853?logo=google&logoColor=white) | Hand landmark detection |
| ![OpenCV](https://img.shields.io/badge/OpenCV-4.x-5C3EE8?logo=opencv&logoColor=white) | Computer vision & video processing |
| ![scikit-learn](https://img.shields.io/badge/scikit--learn-1.x-F7931E?logo=scikit-learn&logoColor=white) | Machine learning (KNN classifier) |
| ![pyttsx3](https://img.shields.io/badge/pyttsx3-2.x-blue) | Text-to-Speech engine |

### Frontend
| Technology | Purpose |
|------------|---------|
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) | Page structure |
| ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) | Styling & animations |
| ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black) | Client-side logic |
| ![Jinja2](https://img.shields.io/badge/Jinja2-Template-B41717) | HTML templating |

### APIs
| API | Purpose |
|-----|---------|
| Google Translate (gtx) | Multi-language translation |
| Web Speech API | Browser-based speech recognition |

---

## ⚙️ Installation

### Prerequisites

- **Python 3.8+** installed
- **Webcam** connected (for sign recognition)
- **pip** package manager

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/SignBridge.git
cd SignBridge-main-master
```

### Step 2: Create Virtual Environment (Recommended)

```bash
# Create virtual environment
python -m venv venv

# Activate (macOS/Linux)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Dependencies List

```
flask
opencv-python
mediapipe
numpy
pandas
joblib
scikit-learn
pyttsx3
pyobjc          # macOS only
requests
```

### Step 4: Verify Model Files

Ensure these files exist in the project root:
- ✅ `isl_model.pkl` (8MB)
- ✅ `scaler.pkl` (2KB)
- ✅ `hand_landmarker.task` (7.8MB)

---

## 🚀 Quick Start

### Run the Application

```bash
python app.py
```

### Access the Web Interface

Open your browser and navigate to:

```
http://localhost:5000
```

### Available Pages

| URL | Page | Description |
|-----|------|-------------|
| `/` | Sign Recognition | Real-time ISL to text conversion |
| `/text-to-isl` | Text/Speech to Sign | Convert text/speech to ISL videos |
| `/isl-keyboard` | ISL Keyboard | Virtual keyboard with ISL visuals |
| `/tutorial` | Tutorial | Learn ISL alphabets & words |
| `/history` | History | View conversation history |

---

## 📱 Usage Guide

### 🎥 Sign Recognition Mode

1. **Click "Start Camera"** to enable webcam
2. **Position your hand** clearly in front of the camera
3. **Hold a gesture** for 1+ second to register
4. **Watch the prediction** appear in "Detected Word"
5. **Lower your hand** for 2 seconds to add space & trigger TTS
6. Use **"Clear"** or **"Backspace"** to edit sentence
7. Select language and click **"Translate"** for translation
8. Click **"Speak Output"** to hear the sentence

### ✍️ Text/Speech to Sign Mode

1. **Type text** in the input field OR
2. **Select language** (English/Hindi) and click **"Start Voice Input"**
3. **Click "Show ISL Gesture"**
4. **Watch the video player**:
   - If a matching word video exists → plays video
   - If no video → shows letter-by-letter images

### 📚 Tutorial Mode

1. **Scroll through** 26 alphabet cards with images
2. **Click on video cards** in the dictionary
3. **Watch** the ISL gesture video in modal
4. **Press ESC** or click outside to close

---

## 🧠 Machine Learning Model

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    INPUT                                │
│         (Webcam Frame - 640x480 RGB)                    │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│               MEDIAPIPE HANDS                           │
│    - Detects hand(s) in frame                           │
│    - Extracts 21 landmarks per hand                     │
│    - Returns normalized (x, y, z) coordinates           │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              FEATURE EXTRACTION                         │
│    - 21 landmarks × 3 axes = 63 features                │
│    - Flattened to 1D array                              │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              NORMALIZATION (Optional)                   │
│    - StandardScaler from scaler.pkl                     │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│           K-NEAREST NEIGHBORS CLASSIFIER                │
│    - Loaded from isl_model.pkl                          │
│    - Predicts gesture class                             │
│    - Returns confidence probability                     │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    OUTPUT                               │
│         (Predicted Letter/Word + Confidence)            │
└─────────────────────────────────────────────────────────┘
```

### Training Data

- **Dataset**: `dataset.csv` (~20MB)
- **Features**: 63 (21 landmarks × 3 coordinates)
- **Labels**: ISL alphabet letters (A-Z) and common words

### Model Performance

| Metric | Value |
|--------|-------|
| Algorithm | K-Nearest Neighbors (KNN) |
| Training Framework | scikit-learn |
| Inference Backend | MediaPipe Hands |
| Real-time FPS | ~30 FPS |

---

## 🎬 ISL Video Dictionary

The application includes **41 pre-recorded ISL gesture videos**:

### Single Words (17)
| Word | File |
|------|------|
| Bye | `Bye.mp4` |
| Do | `Do.mp4` |
| Done | `Done.mp4` |
| Drink | `Drink.mp4` |
| Eat | `Eat.mp4` |
| Have | `Have.mp4` |
| Hungry | `Hungry.mp4` |
| Know | `Know.mp4` |
| Like | `Like.mp4` |
| Maybe | `Maybe.mp4` |
| Meet | `Meet.mp4` |
| Morning | `Morning.mp4` |
| Not | `Not.mp4` |
| Now | `Now.mp4` |
| Sleep | `Sleep.mp4` |
| Yes | `Yes.mp4` |
| You | `You.mp4` |

### Additional Words
| Word | File |
|------|------|
| Call | `call.mp4` |
| Doctor | `doctor.mp4` |
| Good | `good.mp4` |
| Help | `help.mp4` |
| Hi | `hi.mp4` |
| Hot | `hot.mp4` |
| Loss | `loss.mp4` |
| Me | `me.mp4` |
| Name | `name.mp4` |
| Nice | `nice.mp4` |
| Pain | `pain.mp4` |
| Thief | `thief.mp4` |
| Tired | `tired.mp4` |
| Want | `want.mp4` |
| What | `what.mp4` |

### Phrases
| Phrase | File |
|--------|------|
| Good Morning | `good morning.mp4` |
| What Time | `what time.mp4` |
| What is your name | `what is your name.mp4` |
| Hungry you | `hungry you.mp4` |
| Cat I have | `cat i have.mp4` |
| Cat many like | `cat many like.mp4` |
| Drink any you want | `drink any you want.mp4` |
| Now do you what | `now do you what.mp4` |
| That book is good | `that book is good.mp4` |

---

## 🔤 Alphabet Reference

The `/images` folder contains all 26 ISL alphabet signs:

<table>
<tr>
<td align="center"><strong>A</strong><br><code>A.jpg</code></td>
<td align="center"><strong>B</strong><br><code>B.jpg</code></td>
<td align="center"><strong>C</strong><br><code>C.jpg</code></td>
<td align="center"><strong>D</strong><br><code>D.jpg</code></td>
<td align="center"><strong>E</strong><br><code>E.jpg</code></td>
<td align="center"><strong>F</strong><br><code>F.jpg</code></td>
<td align="center"><strong>G</strong><br><code>G.jpg</code></td>
</tr>
<tr>
<td align="center"><strong>H</strong><br><code>H.jpg</code></td>
<td align="center"><strong>I</strong><br><code>I.jpg</code></td>
<td align="center"><strong>J</strong><br><code>J.jpg</code></td>
<td align="center"><strong>K</strong><br><code>K.jpg</code></td>
<td align="center"><strong>L</strong><br><code>L.jpg</code></td>
<td align="center"><strong>M</strong><br><code>M.jpg</code></td>
<td align="center"><strong>N</strong><br><code>N.jpg</code></td>
</tr>
<tr>
<td align="center"><strong>O</strong><br><code>O.jpg</code></td>
<td align="center"><strong>P</strong><br><code>P.jpg</code></td>
<td align="center"><strong>Q</strong><br><code>Q.jpg</code></td>
<td align="center"><strong>R</strong><br><code>R.jpg</code></td>
<td align="center"><strong>S</strong><br><code>S.jpg</code></td>
<td align="center"><strong>T</strong><br><code>T.jpg</code></td>
<td align="center"><strong>U</strong><br><code>U.jpg</code></td>
</tr>
<tr>
<td align="center"><strong>V</strong><br><code>V.jpg</code></td>
<td align="center"><strong>W</strong><br><code>W.jpg</code></td>
<td align="center"><strong>X</strong><br><code>X.jpg</code></td>
<td align="center"><strong>Y</strong><br><code>Y.jpg</code></td>
<td align="center"><strong>Z</strong><br><code>Z.jpg</code></td>
<td colspan="2"></td>
</tr>
</table>

---

## 🌐 API Endpoints

### Pages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Sign Recognition page |
| GET | `/text-to-isl` | Text/Speech to Sign page |
| GET | `/isl-keyboard` | ISL Keyboard page |
| GET | `/tutorial` | Tutorial page |
| GET | `/history` | Conversation history page |

### API Routes

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/video_feed` | Live webcam MJPEG stream | - | `multipart/x-mixed-replace` |
| GET | `/get_word` | Get current prediction & sentence | - | `{ word, sentence }` |
| POST | `/clear_sentence` | Clear formed sentence | - | `{ status, sentence }` |
| POST | `/backspace_sentence` | Remove last character | - | `{ status, sentence }` |
| GET | `/get_history` | Get conversation history | - | `{ history: [...] }` |
| POST | `/clear_history` | Clear all history | - | `{ status }` |
| POST | `/translate` | Translate English to target lang | `{ text, lang }` | `{ translated_text }` |
| POST | `/translate_to_english` | Translate any lang to English | `{ text, source_lang }` | `{ translated_text }` |
| POST | `/parse_sentence` | Parse text into video/letter segments | `{ sentence }` | `{ segments: [...] }` |
| GET | `/images/<filename>` | Serve alphabet images | - | Image file |
| GET | `/isl/<filename>` | Serve ISL videos | - | Video file |

### Example API Usage

```javascript
// Get current prediction
fetch('/get_word')
  .then(res => res.json())
  .then(data => console.log(data.word, data.sentence));

// Parse sentence for ISL display
fetch('/parse_sentence', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sentence: 'Hello how are you' })
})
  .then(res => res.json())
  .then(data => {
    data.segments.forEach(seg => {
      if (seg.type === 'video') {
        // Play video: /isl/hello.mp4
      } else {
        // Show letters: ['H', 'O', 'W']
      }
    });
  });

// Translate text
fetch('/translate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Hello', lang: 'hi' })
})
  .then(res => res.json())
  .then(data => console.log(data.translated_text)); // नमस्ते
```

---

## 🛣️ Roadmap

### ✅ Completed

- [x] Real-time ISL recognition with MediaPipe
- [x] KNN-based gesture classification
- [x] Text-to-Speech output
- [x] Text/Speech to ISL conversion
- [x] Multi-language translation (English, Hindi)
- [x] ISL video dictionary (41 words)
- [x] ISL alphabet reference (A-Z)
- [x] Conversation history

### 🔄 In Progress

- [ ] Expand video dictionary (100+ words)
- [ ] Improve model accuracy with deep learning (CNN/LSTM)

### 🔮 Future Plans

- [ ] Mobile app (React Native / Flutter)
- [ ] Two-hand gesture recognition
- [ ] Dynamic gesture recognition (movement-based signs)
- [ ] User accounts & personalization
- [ ] Community-contributed gesture database
- [ ] Offline mode with PWA support

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Contribution Ideas

- 🎬 Add more ISL word videos
- 📸 Improve hand gesture images
- 🧠 Train better ML models
- 🌍 Add more language translations
- 📱 Create mobile app
- 📖 Improve documentation
- 🐛 Report & fix bugs

---

## 👥 Team

<table>
<tr>
<td align="center">
<strong>Developer</strong><br>
SignBridge Team
</td>
</tr>
</table>

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 SignBridge

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **MediaPipe** by Google for hand landmark detection
- **scikit-learn** for machine learning tools
- **Flask** for the web framework
- **OpenCV** for computer vision capabilities
- The **Deaf & Hard of Hearing Community** for inspiration

---

<p align="center">
  <strong>Made with ❤️ for Accessibility</strong><br>
  <em>Breaking barriers, one sign at a time 🤟</em>
</p>

<p align="center">
  ⭐ Star this repo if you found it helpful!
</p>
