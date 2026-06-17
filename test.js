// ══════════════════════════════════════════════════════════════
// TOB OS NEXT-GEN OFFLINE AI ENGINE (NLP COMMAND CORE)
// ══════════════════════════════════════════════════════════════
const TOB_AI = {
  currentPersonality: 'butler', // 'butler', 'friendly', 'professional', 'gamer'
  isListening: false,
  memory: [],
  speechSpeed: 1,

  personalities: {
    butler: {
      greet: "Good day, sir. I am TOB, your operational assistant. How may I serve your computing needs today?",
      unknown: "Forgive me, sir. I am unable to locate that internal command in my offline archives. Could you rephrase?",
      openApp: "Right away, sir. Launching the specified application environment.",
      calendar: "I have reviewed your itinerary, sir. Synchronizing your calendar items immediately.",
      gameHelp: "Allow me to assist with your operational strategies, sir. Adjusting parameters.",
    },
    friendly: {
      greet: "Hey there! Great to see you! What are we working on inside TOB OS today? 😄",
      unknown: "Hmm, I didn't quite catch that. Try asking to open an app, check your schedule, or play a game!",
      openApp: "Got it! Opening that up for you right now!",
      calendar: "Awesome, let's lock that into your calendar slots!",
      gameHelp: "Let's win this! Here's a tip: Focus on maximizing your resource collection rate!",
    },
    gamer: {
      greet: "GG! TOB is locked and loaded. What level are we conquering today, Player 1? 🕹️",
      unknown: "Error 404: Command input invalid. Re-spec your query or try a different combo!",
      openApp: "Launching app! Loading screens are optimized.",
      calendar: "Quest accepted! Adding this event to your daily campaign schedule.",
      gameHelp: "Pro-tip unlocked: Time your jumps perfectly to execute animation cancels!",
    }
  },

  // Initialize Speech Recognition for Wake Word "Hello TOB"
  initVoiceWakeWord() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser environment.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const lastResultIndex = event.results.length - 1;
      const transcript = event.results[lastResultIndex][0].transcript.trim().toLowerCase();
      
      console.log("Audio Stream Capture:", transcript);
      if (transcript.includes("hello tob")) {
        this.activateAvatarHUD();
        const query = transcript.replace("hello tob", "").trim();
        if (query.length > 0) {
          this.processIntent(query);
        } else {
          this.speak(this.personalities[this.currentPersonality].greet);
        }
      }
    };

    recognition.onerror = (err) => console.error("Voice Engine Feedback:", err);
    recognition.onend = () => recognition.start(); // Keep listening loop alive offline
    recognition.start();
  },

  activateAvatarHUD() {
    let hud = document.getElementById("tob-avatar-container");
    if (hud) hud.style.display = "flex";
    TOB_Avatar.setExpression('happy');
    setTimeout(() => TOB_Avatar.setExpression('focused'), 3000);
  },

  // On-Screen Awareness Processor (Vector State Mock)
  getScreenAwarenessContext() {
    // Dynamically query your current window manager objects (from your window system variables)
    const openWindows = Array.from(document.querySelectorAll('.os-window')).map(win => {
      const titleEl = win.querySelector('.win-title');
      return titleEl ? titleEl.textContent.trim() : 'Unknown App';
    });
    
    return {
      activeWindows: openWindows,
      activeTheme: document.documentElement.getAttribute('data-theme') || 'dark',
      timestamp: new Date().toLocaleTimeString()
    };
  },

  // Offline NLP Processing Core via Strict Intent Mapping
  processIntent(rawText) {
    const text = rawText.toLowerCase().trim();
    const context = this.getScreenAwarenessContext();
    this.saveMemory("user", rawText);

    let reply = "";
    let p = this.personalities[this.currentPersonality];

    // Intent 1: Window Management & Launchers
    if (text.includes("open") || text.includes("launch") || text.includes("start")) {
      TOB_Avatar.setExpression('thinking');
      reply = p.openApp;
      
      if (text.includes("calc") || text.includes("calculator")) { openApp('calc'); }
      else if (text.includes("music") || text.includes("player")) { openApp('music'); }
      else if (text.includes("browser") || text.includes("web")) { openApp('browser'); }
      else if (text.includes("settings") || text.includes("control")) { openApp('settings'); }
      else if (text.includes("task") || text.includes("manager")) { openApp('taskmgr'); }
      else { reply = `Target environment not mapped, but trying to execute core hook.`; }
      
      setTimeout(() => this.speak(reply), 600);
      return;
    }

    // Intent 2: Screen Awareness Context Mapping
    if (text.includes("what is on my screen") || text.includes("what am i doing") || text.includes("read screen")) {
      TOB_Avatar.setExpression('focused');
      if (context.activeWindows.length === 0) {
        reply = `Your workspace is currently clear, running idle processes on your system workspace.`;
      } else {
        reply = `You currently have the following application layers open: ${context.activeWindows.join(", ")}. It is currently ${context.timestamp}.`;
      }
      this.speak(reply);
      return;
    }

    // Intent 3: Calendar & Scheduling Hooks
    if (text.includes("calendar") || text.includes("schedule") || text.includes("add event")) {
      TOB_Avatar.setExpression('thinking');
      reply = p.calendar;
      
      // Parse dates/times safely offline
      let eventTitle = "New Task Node";
      if (text.includes("remind me to")) {
        eventTitle = rawText.match(/remind me to (.*)/i)?.[1] || eventTitle;
      }
      
      // Hook into your calendar app storage directly
      this.addCalendarEventOffline(eventTitle, new Date().toISOString().split('T')[0]);
      this.speak(`${reply} Added task node: "${eventTitle}" to your local tracking array.`);
      return;
    }

    // Intent 4: Game Assistance Engine
    if (text.includes("game") || text.includes("help me win") || text.includes("cheat") || text.includes("score")) {
      TOB_Avatar.setExpression('excited');
      reply = p.gameHelp;
      this.speak(reply);
      return;
    }

    // Intent 5: Standard Conversational Fallback
    TOB_Avatar.setExpression('confused');
    this.speak(p.unknown);
  },

  saveMemory(role, message) {
    this.memory.push({ role, message, date: Date.now() });
    if (this.memory.length > 100) this.memory.shift(); // Hard limits to protect 4GB RAM bounds
    localStorage.setItem("tob_ai_memory", JSON.stringify(this.memory));
  },

  addCalendarEventOffline(title, date) {
    let events = JSON.parse(localStorage.getItem("tob_calendar_events") || "[]");
    events.push({ id: Date.now(), title, date });
    localStorage.setItem("tob_calendar_events", JSON.stringify(events));
    showToast(`AI System: Scheduled event "${title}"`);
  },

  speak(text) {
    this.saveMemory("tob", text);
    // Use lightweight local Web Speech Synthesis API (Works 100% offline)
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.speechSpeed;
    
    utterance.onstart = () => TOB_Avatar.startSpeaking();
    utterance.onend = () => {
      TOB_Avatar.stopSpeaking();
      TOB_Avatar.setExpression('idle');
    };
    
    window.speechSynthesis.cancel(); // Terminate sticking voice pipelines
    window.speechSynthesis.speak(utterance);
    
    // Echo chat into the Companion app overlay if open
    const terminal = document.getElementById("tob-chat-log");
    if (terminal) {
      terminal.innerHTML += `<div class="chat-msg system"><b>TOB:</b> ${text}</div>`;
      terminal.scrollTop = terminal.scrollHeight;
    }
  }
};