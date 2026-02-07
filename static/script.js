document.addEventListener('DOMContentLoaded', () => {
    // ===== MOBILE SIDEBAR TOGGLE =====
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function openSidebar() {
        sidebar?.classList.add('active');
        sidebarOverlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar?.classList.remove('active');
        sidebarOverlay?.classList.remove('active');
        document.body.style.overflow = '';
    }

    hamburgerBtn?.addEventListener('click', openSidebar);
    sidebarClose?.addEventListener('click', closeSidebar);
    sidebarOverlay?.addEventListener('click', closeSidebar);

    // ===== COMMON UTILITIES =====
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ===== ISL → SPEECH PAGE =====
    const startCameraBtn = document.getElementById('btn-start-camera');
    const speakOutputBtn = document.getElementById('btn-speak-output');
    const webcamVideo = document.getElementById('webcam-video');
    const webcamPlaceholder = document.getElementById('webcam-placeholder');

    let isCameraRunning = false;
    let pollingInterval = null;

    if (startCameraBtn) {
        startCameraBtn.addEventListener('click', () => {
            const placeholderContent = webcamPlaceholder?.querySelector('.placeholder-content');

            if (!isCameraRunning) {
                webcamVideo.src = "/video_feed";
                webcamVideo.classList.remove('hidden');
                if (placeholderContent) placeholderContent.style.display = 'none';
                startCameraBtn.innerHTML = '<span class="btn-icon">⏹️</span> Stop Camera';
                isCameraRunning = true;
                startPolling();
            } else {
                webcamVideo.src = "";
                webcamVideo.classList.add('hidden');
                if (placeholderContent) placeholderContent.style.display = 'block';
                startCameraBtn.innerHTML = '<span class="btn-icon">📷</span> Start Camera';
                isCameraRunning = false;
                stopPolling();
            }
        });
    }

    if (speakOutputBtn) {
        speakOutputBtn.addEventListener('click', () => {
            const detectedInput = document.getElementById('detectedWord');
            const storedInput = document.getElementById('storedSentence');
            const textToSpeak = storedInput?.value.trim() || detectedInput?.value.trim();

            if (textToSpeak && textToSpeak !== "Waiting for gesture..." && textToSpeak !== "Your sentence will appear here...") {
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
    }

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

    function startPolling() {
        if (pollingInterval) clearInterval(pollingInterval);
        pollingInterval = setInterval(async () => {
            if (!isCameraRunning) return;
            try {
                const response = await fetch('/get_word');
                const data = await response.json();

                const detectedInput = document.getElementById('detectedWord');
                const storedInput = document.getElementById('storedSentence');

                if (data.word !== undefined && detectedInput) {
                    detectedInput.value = data.word;
                }
                if (data.sentence !== undefined && storedInput) {
                    storedInput.value = data.sentence;
                }
            } catch (err) {
                console.error("Error fetching prediction:", err);
            }
        }, 500);
    }

    function stopPolling() {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
        }
    }

    // ===== TEXT → ISL PAGE =====
    const showGestureBtn = document.getElementById('btn-show-gesture');
    const textInput = document.getElementById('text-input');

    if (showGestureBtn) {
        showGestureBtn.addEventListener('click', async () => {
            const text = textInput?.value.trim();
            if (!text) {
                alert("Please enter text to translate.");
                return;
            }

            const placeholder = document.getElementById('isl-player-placeholder');
            const placeholderContent = placeholder?.querySelector('.placeholder-content');

            if (placeholderContent) placeholderContent.style.display = 'none';

            const clearMedia = () => {
                let existingImg = placeholder?.querySelector('img.isl-gesture-img');
                if (existingImg) existingImg.remove();
                let existingVideo = placeholder?.querySelector('video.isl-gesture-video');
                if (existingVideo) existingVideo.remove();
            };
            clearMedia();

            try {
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

                let segmentIndex = 0;

                async function playNextSegment() {
                    if (segmentIndex >= segments.length) return;

                    const segment = segments[segmentIndex];
                    segmentIndex++;
                    clearMedia();

                    if (segment.type === 'video') {
                        const video = document.createElement('video');
                        video.className = 'isl-gesture-video';
                        video.style.width = '100%';
                        video.style.height = '100%';
                        video.style.objectFit = 'contain';
                        video.style.borderRadius = '12px';
                        video.controls = true;
                        video.autoplay = true;
                        video.src = `/isl/${encodeURIComponent(segment.filename)}`;
                        placeholder.appendChild(video);

                        video.onended = () => playNextSegment();
                        video.onerror = () => {
                            console.error("Error playing video:", segment.filename);
                            playNextSegment();
                        };
                    } else if (segment.type === 'letters') {
                        const letters = segment.letters;
                        let letterIndex = 0;

                        const img = document.createElement('img');
                        img.className = 'isl-gesture-img';
                        img.style.width = '100%';
                        img.style.height = '100%';
                        img.style.objectFit = 'contain';
                        img.style.display = 'block';
                        img.style.margin = 'auto';
                        img.style.borderRadius = '12px';
                        placeholder.appendChild(img);

                        function showNextLetter() {
                            if (letterIndex < letters.length) {
                                const letter = letters[letterIndex];
                                img.src = `/images/${letter}.jpg`;
                                img.alt = `ISL Gesture for letter ${letter}`;
                                letterIndex++;
                                setTimeout(showNextLetter, 1000);
                            } else {
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
    }

    // ===== HISTORY PAGE =====
    const historyDiv = document.getElementById('conversation-history');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    let historyInterval = null;

    if (historyDiv) {
        function startHistoryPolling() {
            if (historyInterval) clearInterval(historyInterval);
            historyInterval = setInterval(fetchHistory, 1000);
            fetchHistory();
        }

        async function fetchHistory() {
            try {
                const response = await fetch('/get_history');
                const data = await response.json();

                if (data.history && data.history.length > 0) {
                    historyDiv.innerHTML = data.history.map((sentence, index) => `
                        <div class="history-item">
                            <span class="history-number">#${data.history.length - index}</span>
                            <span class="history-text">${escapeHtml(sentence)}</span>
                        </div>
                    `).join('');
                } else {
                    historyDiv.innerHTML = '<p class="empty-state">No conversations yet...</p>';
                }
            } catch (err) {
                console.error("Error fetching history:", err);
            }
        }

        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', async () => {
                try {
                    await fetch('/clear_history', { method: 'POST' });
                    fetchHistory();
                } catch (err) {
                    console.error("Error clearing history:", err);
                }
            });
        }

        startHistoryPolling();
    }
});
