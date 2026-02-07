document.addEventListener('DOMContentLoaded', () => {
    // ===== COMMON UTILITIES =====
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ===== MOBILE SIDEBAR TOGGLE =====
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebarClose = document.getElementById('sidebarClose');

    function openSidebar() {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', openSidebar);
    }

    if (sidebarClose) {
        sidebarClose.addEventListener('click', closeSidebar);
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    // Close sidebar on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSidebar();
    });

    // ===== VOICE INPUT (Speech Recognition) =====
    const voiceInputBtn = document.getElementById('btn-voice-input');
    const voiceLanguageSelect = document.getElementById('voiceLanguage');
    const voiceTextInput = document.getElementById('text-input');
    const voiceBtnText = document.getElementById('voice-btn-text');

    let recognition = null;
    let isRecording = false;

    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
            isRecording = true;
            if (voiceInputBtn) {
                voiceInputBtn.classList.add('recording');
                if (voiceBtnText) voiceBtnText.textContent = 'Listening...';
            }
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (voiceTextInput) {
                // Show interim results while speaking, final when done
                voiceTextInput.value = finalTranscript || interimTranscript;
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            stopRecording();
            if (event.error === 'no-speech') {
                alert('No speech detected. Please try again.');
            } else if (event.error === 'not-allowed') {
                alert('Microphone access denied. Please allow microphone access in your browser settings.');
            }
        };

        recognition.onend = () => {
            stopRecording();
        };
    }

    function startRecording() {
        if (!recognition) {
            alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
            return;
        }

        const selectedLang = voiceLanguageSelect?.value || 'en-IN';
        recognition.lang = selectedLang;

        try {
            recognition.start();
        } catch (e) {
            console.error('Error starting recognition:', e);
        }
    }

    function stopRecording() {
        isRecording = false;
        if (voiceInputBtn) {
            voiceInputBtn.classList.remove('recording');
            if (voiceBtnText) voiceBtnText.textContent = 'Start Voice Input';
        }
        if (recognition) {
            try {
                recognition.stop();
            } catch (e) {
                // Ignore errors when stopping
            }
        }
    }

    if (voiceInputBtn) {
        voiceInputBtn.addEventListener('click', () => {
            if (isRecording) {
                stopRecording();
            } else {
                startRecording();
            }
        });
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

    // ===== TRANSLATION HANDLER =====
    const translateBtn = document.getElementById('btn-translate');
    if (translateBtn) {
        translateBtn.addEventListener('click', async () => {
            const storedInput = document.getElementById('storedSentence');
            const targetLang = document.getElementById('languageSelect').value;
            const outputArea = document.getElementById('translatedOutput');

            const textToTranslate = storedInput?.value.trim();

            if (!textToTranslate) {
                alert("Please create a sentence first!");
                return;
            }

            outputArea.value = "Translating...";

            try {
                const response = await fetch('/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: textToTranslate,
                        lang: targetLang
                    })
                });

                const data = await response.json();

                if (data.translated_text) {
                    outputArea.value = data.translated_text;

                    // Improved Text-to-Speech logic
                    if ('speechSynthesis' in window) {
                        // Cancel any ongoing speech
                        window.speechSynthesis.cancel();

                        const utterance = new SpeechSynthesisUtterance(data.translated_text);

                        // Set basic language
                        // Adding region codes helps browser find the right voice
                        let langCode = 'en-US';
                        if (targetLang === "hi") langCode = "hi-IN"; else if (targetLang === "gu") langCode = "gu-IN";


                        utterance.lang = langCode;

                        // Try to find a specific voice for this language
                        // Browsers load voices asynchronously, so we might need to wait or just checks
                        const voices = window.speechSynthesis.getVoices();

                        // Priority search for optimal voice:
                        // 1. Exact match for language code
                        // 2. Contains language code
                        // 3. Fallback to Google versions (often higher quality)
                        const specificVoice = voices.find(v => v.lang === langCode) ||
                            voices.find(v => v.lang.includes(targetLang)) ||
                            voices.find(v => v.name.includes('Google') && v.lang.includes(targetLang));

                        if (specificVoice) {
                            console.log(`Using voice: ${specificVoice.name} (${specificVoice.lang})`);
                            utterance.voice = specificVoice;
                        } else {
                            console.warn(`No specific voice found for ${langCode}, using default.`);
                        }

                        // Slight delay to ensure previous speech cancelled
                        setTimeout(() => {
                            window.speechSynthesis.speak(utterance);
                        }, 50);
                    }
                } else if (data.error) {
                    outputArea.value = "Error: " + data.error;
                }
            } catch (err) {
                console.error("Translation error:", err);
                outputArea.value = "Failed to translate.";
            }
        });
    }

    // ===== TEXT → ISL PAGE =====
    const showGestureBtn = document.getElementById('btn-show-gesture');
    const textInput = document.getElementById('text-input');

    // Helper function to detect if text contains non-English characters
    function containsNonEnglish(text) {
        // Check for Hindi (Devanagari), or other non-ASCII characters
        // English letters, numbers, and common punctuation are ASCII 32-126
        return /[^\x00-\x7F]/.test(text);
    }

    // Helper function to translate text to English
    async function translateToEnglish(text, sourceLang = 'auto') {
        try {
            const response = await fetch('/translate_to_english', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text, source_lang: sourceLang })
            });
            const data = await response.json();
            if (data.translated_text) {
                return data.translated_text;
            }
            return text; // Return original if translation fails
        } catch (err) {
            console.error('Translation error:', err);
            return text; // Return original if translation fails
        }
    }

    if (showGestureBtn) {
        showGestureBtn.addEventListener('click', async () => {
            let text = textInput?.value.trim();
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
                // Check if text contains non-English characters (e.g., Hindi)
                // If so, translate to English first before showing ISL gestures
                if (containsNonEnglish(text)) {
                    console.log('Detected non-English text, translating to English...');

                    // Show loading indicator
                    const loadingMsg = document.createElement('p');
                    loadingMsg.textContent = 'Translating to English...';
                    loadingMsg.className = 'translation-loading';
                    loadingMsg.style.textAlign = 'center';
                    loadingMsg.style.padding = '20px';
                    loadingMsg.style.color = '#666';
                    placeholder.appendChild(loadingMsg);

                    // Get the selected voice language to determine source language
                    const voiceLang = voiceLanguageSelect?.value || 'en-IN';
                    let sourceLang = 'auto';
                    if (voiceLang.startsWith('hi')) sourceLang = 'hi';

                    const translatedText = await translateToEnglish(text, sourceLang);
                    console.log(`Translated: "${text}" → "${translatedText}"`);

                    // Remove loading indicator
                    loadingMsg.remove();

                    // Use translated text for ISL gestures
                    text = translatedText;
                }

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
                        video.playsInline = true; // Important for mobile
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

    // ===== ISL KEYBOARD PAGE =====
    const islKeyboardGrid = document.getElementById('islKeyboardGrid');
    const islStoredSentence = document.getElementById('islStoredSentence');
    const islSpaceBtn = document.getElementById('islSpaceBtn');
    const islBackspaceBtn = document.getElementById('islBackspaceBtn');
    const islClearBtn = document.getElementById('islClearBtn');
    const islTranslateBtn = document.getElementById('islTranslateBtn');
    const islSpeakBtn = document.getElementById('islSpeakBtn');

    // Handle letter button clicks
    if (islKeyboardGrid) {
        islKeyboardGrid.addEventListener('click', (e) => {
            const btn = e.target.closest('.isl-key-btn');
            if (btn && islStoredSentence) {
                const letter = btn.dataset.letter;
                islStoredSentence.value += letter;

                // Add visual feedback
                btn.classList.add('key-pressed');
                setTimeout(() => btn.classList.remove('key-pressed'), 150);
            }
        });
    }

    // SPACE button
    if (islSpaceBtn) {
        islSpaceBtn.addEventListener('click', () => {
            if (islStoredSentence) {
                islStoredSentence.value += ' ';
            }
        });
    }

    // BACKSPACE button
    if (islBackspaceBtn) {
        islBackspaceBtn.addEventListener('click', () => {
            if (islStoredSentence) {
                islStoredSentence.value = islStoredSentence.value.slice(0, -1);
            }
        });
    }

    // CLEAR button
    if (islClearBtn) {
        islClearBtn.addEventListener('click', () => {
            if (islStoredSentence) {
                islStoredSentence.value = '';
            }
        });
    }

    // Translation handler for ISL Keyboard page
    if (islTranslateBtn) {
        islTranslateBtn.addEventListener('click', async () => {
            const targetLang = document.getElementById('islLanguageSelect')?.value || 'en';
            const outputArea = document.getElementById('islTranslatedOutput');
            const textToTranslate = islStoredSentence?.value.trim();

            if (!textToTranslate) {
                alert("Please create a sentence first!");
                return;
            }

            outputArea.value = "Translating...";

            try {
                const response = await fetch('/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: textToTranslate,
                        lang: targetLang
                    })
                });

                const data = await response.json();

                if (data.translated_text) {
                    outputArea.value = data.translated_text;

                    // Auto-speak translated text
                    if ('speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                        const utterance = new SpeechSynthesisUtterance(data.translated_text);

                        let langCode = 'en-US';
                        if (targetLang === "hi") langCode = "hi-IN";

                        utterance.lang = langCode;

                        const voices = window.speechSynthesis.getVoices();
                        const specificVoice = voices.find(v => v.lang === langCode) ||
                            voices.find(v => v.lang.includes(targetLang)) ||
                            voices.find(v => v.name.includes('Google') && v.lang.includes(targetLang));

                        if (specificVoice) {
                            utterance.voice = specificVoice;
                        }

                        setTimeout(() => {
                            window.speechSynthesis.speak(utterance);
                        }, 50);
                    }
                } else if (data.error) {
                    outputArea.value = "Error: " + data.error;
                }
            } catch (err) {
                console.error("Translation error:", err);
                outputArea.value = "Failed to translate.";
            }
        });
    }

    // Speak button for ISL Keyboard page
    if (islSpeakBtn) {
        islSpeakBtn.addEventListener('click', () => {
            const translatedOutput = document.getElementById('islTranslatedOutput');
            const textToSpeak = translatedOutput?.value.trim() || islStoredSentence?.value.trim();

            if (textToSpeak) {
                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
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
});
