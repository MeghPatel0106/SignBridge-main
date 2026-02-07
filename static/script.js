document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const startCameraBtn = document.getElementById('btn-start-camera');
    const speakOutputBtn = document.getElementById('btn-speak-output');
    const showGestureBtn = document.getElementById('btn-show-gesture');
    const webcamVideo = document.getElementById('webcam-video');
    const webcamPlaceholder = document.getElementById('webcam-placeholder').querySelector('.placeholder-content');
    const detectedText = document.getElementById('detected-text');
    const textInput = document.getElementById('text-input');

    // State
    let isCameraRunning = false;
    let stream = null;

    // Start Camera Handler
    startCameraBtn.addEventListener('click', () => {
        if (!isCameraRunning) {
            // Start Flask Stream
            webcamVideo.src = "/video_feed";
            webcamVideo.classList.remove('hidden');
            webcamPlaceholder.style.display = 'none';
            startCameraBtn.textContent = 'Stop Camera';
            startCameraBtn.classList.add('active');
            isCameraRunning = true;

            // Start Polling for predictions
            startPolling();
        } else {
            // Stop Camera (just hide logic, backend runs)
            webcamVideo.src = "";
            webcamVideo.classList.add('hidden');
            webcamPlaceholder.style.display = 'block';
            startCameraBtn.textContent = 'Start Camera';
            startCameraBtn.classList.remove('active');
            isCameraRunning = false;
            stopPolling();
        }
    });

    // Speak Output Handler
    speakOutputBtn.addEventListener('click', () => {
        const detectedInput = document.getElementById('detectedWord');
        const storedInput = document.getElementById('storedSentence');

        // Prefer speaking the sentence, otherwise the single word
        const textToSpeak = storedInput.value.trim() || detectedInput.value.trim();

        if (textToSpeak && textToSpeak !== "Waiting for interaction..." && textToSpeak !== "Sentence builds here...") {
            if ('speechSynthesis' in window) {
                const speech = new SpeechSynthesisUtterance(textToSpeak);
                window.speechSynthesis.speak(speech);
            } else {
                alert("Text-to-speech is not supported in this browser.");
            }
        } else {
            alert("No text to speak");
        }
    });

    // Clear and Backspace Handlers
    const clearBtn = document.getElementById('clearBtn');
    const backspaceBtn = document.getElementById('backspaceBtn');

    if (clearBtn) {
        clearBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/clear_sentence', { method: 'POST' });
                const data = await response.json();
                document.getElementById('storedSentence').value = data.sentence;
            } catch (err) {
                console.error("Error clearing sentence:", err);
            }
        });
    }

    if (backspaceBtn) {
        backspaceBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/backspace_sentence', { method: 'POST' });
                const data = await response.json();
                document.getElementById('storedSentence').value = data.sentence;
            } catch (err) {
                console.error("Error backspacing:", err);
            }
        });
    }

    // Prototype Gesture Detection (Tap on Video) - Optional/Removed as we have real detection
    webcamVideo.addEventListener('click', () => {
        // Optional: could manually trigger a fetch
    });

    // Show ISL Gesture Handler
    showGestureBtn.addEventListener('click', async () => {
        const text = textInput.value.trim();
        if (!text) {
            alert("Please enter text to translate.");
            return;
        }

        // Get the placeholder element and clear it
        const placeholder = document.getElementById('isl-player-placeholder');
        const placeholderContent = placeholder.querySelector('.placeholder-content');

        // Hide placeholder content
        if (placeholderContent) {
            placeholderContent.style.display = 'none';
        }

        // Remove any existing media
        const clearMedia = () => {
            let existingImg = placeholder.querySelector('img.isl-gesture-img');
            if (existingImg) existingImg.remove();
            let existingVideo = placeholder.querySelector('video.isl-gesture-video');
            if (existingVideo) existingVideo.remove();
        };
        clearMedia();

        try {
            // Parse the sentence into segments
            const response = await fetch('/parse_sentence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sentence: text })
            });
            const data = await response.json();
            const segments = data.segments;

            if (segments.length === 0) {
                alert("No content to display.");
                if (placeholderContent) placeholderContent.style.display = 'block';
                return;
            }

            // Play segments sequentially
            let segmentIndex = 0;

            async function playNextSegment() {
                if (segmentIndex >= segments.length) {
                    // All segments done
                    return;
                }

                const segment = segments[segmentIndex];
                segmentIndex++;
                clearMedia();

                if (segment.type === 'video') {
                    // Play video
                    const video = document.createElement('video');
                    video.className = 'isl-gesture-video';
                    video.style.width = '100%';
                    video.style.height = '100%';
                    video.style.objectFit = 'contain';
                    video.controls = true;
                    video.autoplay = true;
                    video.src = `/isl/${encodeURIComponent(segment.filename)}`;
                    placeholder.appendChild(video);

                    // Wait for video to end before playing next segment
                    video.onended = () => {
                        playNextSegment();
                    };
                    video.onerror = () => {
                        console.error("Error playing video:", segment.filename);
                        playNextSegment();
                    };
                } else if (segment.type === 'letters') {
                    // Show letters one by one
                    const letters = segment.letters;
                    let letterIndex = 0;

                    const img = document.createElement('img');
                    img.className = 'isl-gesture-img';
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'contain';
                    img.style.display = 'block';
                    img.style.margin = 'auto';
                    placeholder.appendChild(img);

                    function showNextLetter() {
                        if (letterIndex < letters.length) {
                            const letter = letters[letterIndex];
                            img.src = `/images/${letter}.jpg`;
                            img.alt = `ISL Gesture for letter ${letter}`;
                            letterIndex++;
                            setTimeout(showNextLetter, 1000);
                        } else {
                            // Letters done, play next segment
                            playNextSegment();
                        }
                    }

                    showNextLetter();
                }
            }

            playNextSegment();

        } catch (err) {
            console.error("Error parsing sentence:", err);
            alert("Error loading ISL gesture.");
            if (placeholderContent) placeholderContent.style.display = 'block';
        }
    });

    // Prediction Polling
    let pollingInterval = null;

    function startPolling() {
        if (pollingInterval) clearInterval(pollingInterval);
        pollingInterval = setInterval(async () => {
            if (!isCameraRunning) return;
            try {
                const response = await fetch('/get_word');
                const data = await response.json();

                const detectedInput = document.getElementById('detectedWord');
                const storedInput = document.getElementById('storedSentence');

                if (data.word !== undefined) {
                    detectedInput.value = data.word;
                }
                if (data.sentence !== undefined) {
                    storedInput.value = data.sentence;
                }
            } catch (err) {
                console.error("Error fetching prediction:", err);
            }
        }, 500); // Poll every 500ms
    }

    function stopPolling() {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
        }
    }
});
