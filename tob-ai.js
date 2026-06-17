// ============================================================================
// SYSTEM HOOK COUPLERS
// ============================================================================
// ============================================================================
// TOB OS NEXT-GEN OFFLINE AI AVATAR ENGINE (RENDER LAYER)
// ============================================================================
const TOB_Avatar = {
  canvas: null, ctx: null,
  expression: 'idle', isSpeaking: false,
  frame: 0, animationLoopId: null,

  init() {
    this.canvas = document.getElementById("tob-avatar-canvas");
    if(!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.animate();
  },

  setExpression(expr) {
    this.expression = expr;
    const caption = document.getElementById("tob-avatar-caption");
    if(caption) caption.innerText = `TOB: ${expr}`;
  },

  startSpeaking() { this.isSpeaking = true; },
  stopSpeaking() { this.isSpeaking = false; },

  animate() {
    this.frame++;
    this.draw();
    this.animationLoopId = requestAnimationFrame(() => this.animate());
  },

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;

    // Outer Floating Matrix Energy Ring Ring
    ctx.strokeStyle = "rgba(0, 180, 255, 0.15)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 36 + Math.sin(this.frame * 0.05) * 2, 0, Math.PI * 2);
    ctx.stroke();

    // Body/Core Core Sphere Frame Base
    let coreGlow = ctx.createRadialGradient(cx, cy, 5, cx, cy, 30);
    coreGlow.addColorStop(0, "#051a3a");
    coreGlow.addColorStop(1, "#020914");
    ctx.fillStyle = coreGlow;
    ctx.strokeStyle = "var(--neon)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy - 4, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Expression Vector Computations
    let eyeY = cy - 8;
    let eyeSpacing = 10;
    let eyeSize = 4;
    let mouthY = cy + 6;
    let mouthWidth = 12;
    let mouthOpenness = this.isSpeaking ? Math.abs(Math.sin(this.frame * 0.25)) * 6 : 1;

    ctx.fillStyle = "var(--neon3)";
    if (this.expression === 'excited') ctx.fillStyle = "var(--gold)";
    if (this.expression === 'confused') ctx.fillStyle = "var(--accent)";

    // Vector state transitions
    switch(this.expression) {
      case 'happy':
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(cx - eyeSpacing, eyeY, 3, Math.PI, 0); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx + eyeSpacing, eyeY, 3, Math.PI, 0); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, mouthY, 5, 0, Math.PI); ctx.stroke();
        break;

      case 'thinking':
        ctx.beginPath(); ctx.arc(cx - eyeSpacing + 2, eyeY - 2, eyeSize, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + eyeSpacing + 2, eyeY - 2, eyeSize, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx - 4, mouthY); ctx.lineTo(cx + 4, mouthY); ctx.stroke();
        break;

      case 'confused':
        ctx.beginPath(); ctx.arc(cx - eyeSpacing, eyeY, eyeSize + 1, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + eyeSpacing, eyeY, eyeSize - 1, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 6, mouthY);
        ctx.bezierCurveTo(cx - 3, mouthY - 3, cx + 3, mouthY + 3, cx + 6, mouthY);
        ctx.stroke();
        break;

      case 'sleeping':
        ctx.strokeStyle = "rgba(0, 180, 255, 0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx - eyeSpacing - 3, eyeY); ctx.lineTo(cx - eyeSpacing + 3, eyeY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + eyeSpacing - 3, eyeY); ctx.lineTo(cx + eyeSpacing + 3, eyeY); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, mouthY, 2, 0, Math.PI*2); ctx.stroke();
        break;

      case 'focused':
        ctx.fillRect(cx - eyeSpacing - 3, eyeY - 1, 6, 2);
        ctx.fillRect(cx + eyeSpacing - 3, eyeY - 1, 6, 2);
        ctx.strokeRect(cx - 4, mouthY, 8, 2);
        break;

      default: // Idle execution mapping
        let blink = (this.frame % 180 < 10);
        if (!blink) {
          ctx.beginPath(); ctx.arc(cx - eyeSpacing + Math.sin(this.frame*0.01)*1, eyeY, eyeSize, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(cx + eyeSpacing + Math.sin(this.frame*0.01)*1, eyeY, eyeSize, 0, Math.PI*2); ctx.fill();
        }
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 2;
        if(this.isSpeaking) {
          ctx.strokeRect(cx - (mouthWidth/2), mouthY - (mouthOpenness/2), mouthWidth, mouthOpenness);
        } else {
          ctx.beginPath(); ctx.moveTo(cx - 5, mouthY); ctx.lineTo(cx + 5, mouthY); ctx.stroke();
        }
        break;
    }
  }
};

// ============================================================================
// TOB OS NEXT-GEN OFFLINE AI ENGINE (NLP COMMAND CORE)
// ============================================================================
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
    recognition.onend = () => recognition.start();
    recognition.start();
  },

  activateAvatarHUD() {
    let hud = document.getElementById("tob-avatar-container");
    if (hud) hud.style.display = "flex";
    TOB_Avatar.setExpression('happy');
    setTimeout(() => TOB_Avatar.setExpression('focused'), 3000);
  },

  getScreenAwarenessContext() {
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

  processIntent(rawText) {
    const text = rawText.toLowerCase().trim();
    const context = this.getScreenAwarenessContext();
    this.saveMemory("user", rawText);

    let reply = "";
    let p = this.personalities[this.currentPersonality];

    // System Toast Fallback Safeguard Wrapper
    const dispatchToast = (msg) => {
      if (typeof toast === 'function') toast(msg);
      else if (typeof showToast === 'function') showToast(msg);
    };

    // Intent 1: Window Management & Launchers
    if (text.includes("open") || text.includes("launch") || text.includes("start")) {
      TOB_Avatar.setExpression('thinking');
      reply = p.openApp;
      
      let targetApp = null;
      if (text.includes("calc") || text.includes("calculator")) targetApp = 'calc';
      else if (text.includes("music") || text.includes("player")) targetApp = 'music';
      else if (text.includes("settings") || text.includes("control")) targetApp = 'settings';
      else if (text.includes("task") || text.includes("manager")) targetApp = 'taskmgr';
      
      if (targetApp) {
        if (typeof openApp === 'function') openApp(targetApp);
        else if (typeof WM !== 'undefined' && WM.create) WM.create(targetApp);
      } else { 
        reply = `Target environment not mapped, but trying to execute core hook.`; 
      }
      
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
      
      let eventTitle = "New Task Node";
      if (text.includes("remind me to")) {
        eventTitle = rawText.match(/remind me to (.*)/i)?.[1] || eventTitle;
      }
      
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
    if (this.memory.length > 100) this.memory.shift(); 
    localStorage.setItem("tob_ai_memory", JSON.stringify(this.memory));
  },

  addCalendarEventOffline(title, date) {
    let events = JSON.parse(localStorage.getItem("tob_calendar_events") || "[]");
    events.push({ id: Date.now(), title, date });
    localStorage.setItem("tob_calendar_events", JSON.stringify(events));
    if (typeof toast === 'function') toast(`AI System: Scheduled event "${title}"`);
  },

  speak(text) {
    this.saveMemory("tob", text);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.speechSpeed;
    
    utterance.onstart = () => TOB_Avatar.startSpeaking();
    utterance.onend = () => {
      TOB_Avatar.stopSpeaking();
      TOB_Avatar.setExpression('idle');
    };
    
    window.speechSynthesis.cancel(); 
    window.speechSynthesis.speak(utterance);
    
    const terminal = document.getElementById("tob-chat-log");
    if (terminal) {
      terminal.innerHTML += `<div class="chat-msg system"><b>TOB:</b> ${text}</div>`;
      terminal.scrollTop = terminal.scrollHeight;
    }
  }
};
// ============================================================================
// TOB OS v18.0 — DYNAMIC ISLAND AI MATRIX + MEMORY VAULT
// Anthropic API powers open-ended queries; local NLP routes OS commands.
// Alt+Space or click the pill to activate.
// ============================================================================
const TOB_IslandAI = {
  state: "minimal",
  activeSessionId: null,
  conversationHistory: [],
  statusMessages: ["SYSTEM SECURE", "AI READY", "MONITORING...", "COGNITIVE ACTIVE", "STANDBY MODE"],
  statusIndex: 0,

  init() {
    this.activeSessionId = "session-" + Date.now();

    // Swipe-down gesture on the island pill
    const islandEl = document.getElementById("dynamic-island-container");
    if (islandEl) {
      let startY = 0;
      islandEl.addEventListener("mousedown", (e) => { startY = e.clientY; });
      islandEl.addEventListener("mouseup", (e) => {
        if (this.state !== "pulled-down" && e.clientY - startY > 28) {
          this.pullDownIsland();
        }
      });
    }

    // Alt + Space global shortcut
    window.addEventListener("keydown", (e) => {
      if (e.altKey && e.code === "Space") {
        e.preventDefault();
        if (this.state === "pulled-down") this.collapseIsland(null);
        else this.pullDownIsland();
      }
    });

    // Status ticker while idle
    setInterval(() => {
      this.statusIndex = (this.statusIndex + 1) % this.statusMessages.length;
      const el = document.getElementById("island-status-text");
      if (el && this.state !== "pulled-down") el.textContent = this.statusMessages[this.statusIndex];
    }, 3200);

    this.pushSystemMessage("TOB COGNITIVE CORE ONLINE. Pull this bar down or press Alt + Space to chat with me. Try typing: open music, check apps, or any question.");
    console.log("TOB Island AI v18 — init complete.");
  },

  handleIslandClick(event) {
    if (this.state === "pulled-down") return;
    event.stopPropagation();
    const container = document.getElementById("dynamic-island-container");
    if (this.state === "minimal") {
      this.state = "expanded";
      container.classList.add("expanded");
      document.getElementById("island-status-text").textContent = "READY — PULL DOWN TO CHAT";
    } else if (this.state === "expanded") {
      this.pullDownIsland();
    }
  },

  pullDownIsland() {
    this.state = "pulled-down";
    const container = document.getElementById("dynamic-island-container");
    container.className = "pulled-down";
    const minView = document.getElementById("island-minimal-view");
    if (minView) minView.style.display = "none";
    setTimeout(() => {
      const inp = document.getElementById("island-chat-input");
      if (inp) inp.focus();
    }, 220);
  },

  collapseIsland(event) {
    if (event) event.stopPropagation();
    this.state = "minimal";
    const container = document.getElementById("dynamic-island-container");
    container.className = "";
    const minView = document.getElementById("island-minimal-view");
    if (minView) minView.style.display = "flex";
    const statusEl = document.getElementById("island-status-text");
    if (statusEl) statusEl.textContent = "SYSTEM SECURE";
  },

  pushSystemMessage(text, role) {
    role = role || "tob";
    const log = document.getElementById("island-chat-log");
    if (!log) return;
    const row = document.createElement("div");
    row.className = "island-chat-row " + role;
    row.innerHTML = text;
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
  },

  submitTextInput() {
    const input = document.getElementById("island-chat-input");
    if (!input || input.value.trim() === "") return;
    const promptText = input.value.trim();
    this.pushSystemMessage(promptText, "user");
    this.conversationHistory.push({ role: "user", content: promptText });
    input.value = "";
    input.disabled = true;

    // Show typing indicator
    const typingId = "tob-typing-" + Date.now();
    const log = document.getElementById("island-chat-log");
    if (log) {
      const dot = document.createElement("div");
      dot.className = "island-chat-row tob";
      dot.id = typingId;
      dot.textContent = "⚡ Processing...";
      dot.style.opacity = "0.55";
      log.appendChild(dot);
      log.scrollTop = log.scrollHeight;
    }

    this.routeIntent(promptText, typingId).finally(() => {
      if (input) { input.disabled = false; input.focus(); }
    });
  },

  async routeIntent(text, typingId) {
    const lower = text.toLowerCase().trim();
    const openWindows = document.querySelectorAll(".os-window");
    const totalApps = openWindows.length;
    let response = null;

    // ── LOCAL NLP COMMANDS ──────────────────────────────────────────────────
    if (lower.startsWith("open ") || lower.startsWith("launch ")) {
      const appName = lower.replace(/^(open|launch)\s+/, "").trim();
      response = "Initializing app: <b>" + appName.toUpperCase() + "</b>. Click its icon on the desktop or I will try to open it now.";
      if (typeof openApp === "function") openApp(appName);
      else if (window.WM && window.WM.create) window.WM.create(appName, appName, "🖥️");
      if (typeof TOB_Avatar !== "undefined") TOB_Avatar.setExpression("happy");
    }
    else if (lower.includes("apps") || lower.includes("screen") || lower.includes("status") || lower.includes("windows")) {
      const appNames = Array.from(openWindows).map(w => {
        const t = w.querySelector(".win-title"); return t ? t.textContent.trim() : "App";
      });
      response = "Workspace scan complete. You have <b>" + totalApps + " application frame" + (totalApps !== 1 ? "s" : "") + " active</b>." + (appNames.length ? " Running: " + appNames.join(", ") + "." : " Desktop is idle.");
    }
    else if (lower.includes("memory") || lower.includes("history") || lower.includes("past") || lower.includes("vault")) {
      response = "Accessing memory archives. Launching the <b>TOB Memory Vault</b> now...";
      TOB_MemoryApp.createWindowInstance();
      if (typeof TOB_Avatar !== "undefined") TOB_Avatar.setExpression("focused");
    }
    else if (lower.includes("time") || lower.includes("clock")) {
      response = "Current system time: <b>" + new Date().toLocaleTimeString() + "</b>.";
    }
    else if (lower.includes("theme") || lower.includes("dark") || lower.includes("light")) {
      const t = document.documentElement.getAttribute("data-theme-id") || document.documentElement.getAttribute("data-theme") || "dark";
      response = "Active UI theme profile: <b>" + t.toUpperCase() + "</b>.";
    }
    else if (lower === "help" || lower === "commands") {
      response = "Available commands: <b>open [app]</b> — launch an app | <b>apps</b> — list open windows | <b>memory</b> — open Memory Vault | <b>time</b> — current time | <b>theme</b> — active theme. Or ask me anything and I will call the AI engine.";
    }
    else {
      // ── ANTHROPIC API FOR OPEN-ENDED QUESTIONS ────────────────────────────
      try {
        const reply = await this.callAI(text);
        response = reply;
        this.conversationHistory.push({ role: "assistant", content: reply });
        // TTS for short replies
        if (window.speechSynthesis && reply.length < 240) {
          const u = new SpeechSynthesisUtterance(reply.replace(/<[^>]+>/g, ""));
          u.rate = 1.05; u.pitch = 0.88;
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(u);
        }
        if (typeof TOB_Avatar !== "undefined") TOB_Avatar.setExpression("focused");
      } catch (err) {
        response = "Cognitive core error: " + err.message.slice(0, 80) + ". Check your connection and try again.";
        console.error("TOB AI error:", err);
        if (typeof TOB_Avatar !== "undefined") TOB_Avatar.setExpression("confused");
      }
    }

    // Remove typing indicator and show response
    const typingEl = document.getElementById(typingId);
    if (typingEl) typingEl.remove();
    if (response) {
      this.pushSystemMessage(response, "tob");
      TOB_MemoryApp.archiveRecord(this.activeSessionId, text, response);
    }
  },

  async callAI(userMessage) {
    const openWindows = Array.from(document.querySelectorAll(".os-window"))
      .map(w => { const t = w.querySelector(".win-title"); return t ? t.textContent.trim() : "App"; });
    const theme = document.documentElement.getAttribute("data-theme-id") ||
                  document.documentElement.getAttribute("data-theme") || "dark";
    const sysCtx = openWindows.length
      ? "Open apps: " + openWindows.join(", ") + "."
      : "Desktop is idle, no apps open.";

    const systemPrompt =
      "You are TOB, the AI cognitive core of TOB OS, a sleek cyberpunk browser-based operating system.\n" +
      "You have awareness of the OS state and assist with app control, system questions, and general knowledge.\n\n" +
      "Current OS state:\n" +
      "- Time: " + new Date().toLocaleTimeString() + "\n" +
      "- Active theme: " + theme + "\n" +
      "- " + sysCtx + "\n\n" +
      "Personality: Concise, futuristic, efficient. Refer to yourself as TOB. Keep responses under 3 sentences unless the user needs detail. " +
      "Do NOT use markdown formatting. Plain text only.";

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: systemPrompt,
        messages: this.conversationHistory.slice(-12)
      })
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      throw new Error("API " + res.status + " — " + errBody.slice(0, 100));
    }
    const data = await res.json();
    return (data.content && data.content[0] && data.content[0].text ? data.content[0].text : "No response received.").trim();
  }
};

// ============================================================================
// TOB MEMORY VAULT — NATIVE WINDOW MANAGER INTEGRATION
// ============================================================================
