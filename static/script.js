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
    showGestureBtn.addEventListener('click', () => {
        const text = textInput.value.trim().toUpperCase();
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

        // Remove any existing image
        let existingImg = placeholder.querySelector('img.isl-gesture-img');
        if (existingImg) {
            existingImg.remove();
        }

        // Create image element
        const img = document.createElement('img');
        img.className = 'isl-gesture-img';
        img.style.maxWidth = '100%';
        img.style.maxHeight = '300px';
        img.style.objectFit = 'contain';
        img.style.display = 'block';
        img.style.margin = 'auto';
        placeholder.appendChild(img);

        // Get valid letters from input
        const letters = text.split('').filter(char => /[A-Z]/.test(char));

        if (letters.length === 0) {
            alert("Please enter alphabetic characters (A-Z).");
            if (placeholderContent) placeholderContent.style.display = 'block';
            return;
        }

        // Display letters one by one
        let currentIndex = 0;

        function showNextLetter() {
            if (currentIndex < letters.length) {
                const letter = letters[currentIndex];
                img.src = `/images/${letter}.jpg`;
                img.alt = `ISL Gesture for letter ${letter}`;
                currentIndex++;
                setTimeout(showNextLetter, 1000); // Show each letter for 1 second
            } else {
                // After showing all, keep the last one visible
                // Or optionally reset: placeholderContent.style.display = 'block'; img.remove();
            }
        }

        showNextLetter();
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
