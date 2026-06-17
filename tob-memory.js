const TOB_MemoryApp = {
  storageKey: "tob_memory_indexed_vault",

  getHistory() {
    try { return JSON.parse(localStorage.getItem(this.storageKey) || "{}"); } catch(e) { return {}; }
  },

  archiveRecord(sessionId, userPrompt, tobResponse) {
    const history = this.getHistory();
    if (!history[sessionId]) {
      history[sessionId] = {
        title: userPrompt.length > 22 ? userPrompt.substring(0, 19) + "..." : userPrompt,
        timestamp: new Date().toLocaleDateString(),
        turns: []
      };
    }
    history[sessionId].turns.push({ prompt: userPrompt, response: tobResponse });
    try { localStorage.setItem(this.storageKey, JSON.stringify(history)); } catch(e) {}
    this.refreshUI();
  },

  createWindowInstance() {
    // Hook into TOB OS native Window Manager
    if (window.WM && window.WM.create) {
      WM.create("tob-memory-vault", "TOB Memory Vault", "🧠", 560, 400, (body) => {
        this.injectAppInterface(body);
      });
    } else {
      // Fallback floating panel if WM is unavailable
      const existing = document.getElementById("tob-memory-fallback");
      if (existing) { existing.remove(); return; }
      const panel = document.createElement("div");
      panel.id = "tob-memory-fallback";
      panel.style.cssText = "position:fixed;bottom:60px;left:20px;width:500px;height:360px;background:#020a14;border:1px solid var(--panel-border);z-index:9999;border-radius:14px;padding:12px;box-shadow:0 16px 50px rgba(0,0,0,.7);";
      const closeBtn = document.createElement("button");
      closeBtn.textContent = "✕ CLOSE";
      closeBtn.style.cssText = "position:absolute;top:10px;right:12px;background:none;border:1px solid var(--panel-border);color:var(--text-dim);border-radius:5px;padding:3px 9px;cursor:pointer;font-size:9px;font-family:Share Tech Mono,monospace;";
      closeBtn.onclick = () => panel.remove();
      panel.appendChild(closeBtn);
      document.body.appendChild(panel);
      this.injectAppInterface(panel);
    }
  },

  injectAppInterface(containerEl) {
    containerEl.innerHTML =
      "<div style=\"display:flex;height:100%;min-height:280px;color:#fff;font-family:'Rajdhani',sans-serif;background:#020a14;border-radius:8px;overflow:hidden;\">" +
        "<div style=\"width:150px;border-right:1px solid var(--panel-border);padding:10px;overflow-y:auto;background:rgba(0,0,0,0.2);flex-shrink:0;\">" +
          "<div style=\"font-family:'Orbitron',sans-serif;font-size:9px;color:var(--neon);letter-spacing:2px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--panel-border);\">🧠 MEMORY VAULT</div>" +
          "<div id=\"memory-threads-list\"></div>" +
        "</div>" +
        "<div style=\"flex:1;display:flex;flex-direction:column;padding:12px;\">" +
          "<div id=\"memory-chat-title\" style=\"font-family:'Orbitron',sans-serif;font-size:10px;color:var(--neon);border-bottom:1px solid var(--panel-border);padding-bottom:6px;margin-bottom:10px;letter-spacing:2px;\">SELECT A SESSION NODE</div>" +
          "<div id=\"memory-chat-scroll\" style=\"flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:8px;\"></div>" +
          "<div style=\"margin-top:8px;padding-top:8px;border-top:1px solid var(--panel-border);display:flex;gap:6px;\">" +
            "<button onclick=\"TOB_MemoryApp.clearAll()\" style=\"padding:5px 12px;background:rgba(255,45,110,.12);border:1px solid rgba(255,45,110,.3);border-radius:6px;color:rgba(255,80,120,.8);cursor:pointer;font-size:9px;font-family:'Share Tech Mono',monospace;\">PURGE ALL</button>" +
          "</div>" +
        "</div>" +
      "</div>";
    this.refreshUI();
  },

  refreshUI() {
    const sidebar = document.getElementById("memory-threads-list");
    if (!sidebar) return;
    sidebar.innerHTML = "";
    const history = this.getHistory();
    const keys = Object.keys(history);
    if (keys.length === 0) {
      sidebar.innerHTML = "<div style=\"font-size:10px;color:var(--text-muted);padding:4px;\">No sessions yet.</div>";
      return;
    }
    keys.reverse().forEach(sessionId => {
      const session = history[sessionId];
      const div = document.createElement("div");
      div.className = "memory-sidebar-item";
      div.innerHTML =
        "<div style=\"font-size:11px;font-weight:700;color:var(--text);\">" + session.title + "</div>" +
        "<div style=\"font-size:9px;color:var(--text-dim);margin-top:2px;\">" + session.timestamp + " &bull; " + session.turns.length + " turn" + (session.turns.length !== 1 ? "s" : "") + "</div>";
      div.onclick = () => this.loadThreadToViewer(sessionId);
      sidebar.appendChild(div);
    });
  },

  loadThreadToViewer(sessionId) {
    const history = this.getHistory();
    const session = history[sessionId];
    if (!session) return;
    TOB_IslandAI.activeSessionId = sessionId;
    const titleEl = document.getElementById("memory-chat-title");
    if (titleEl) titleEl.textContent = "NODE: " + session.title.toUpperCase();
    const scroll = document.getElementById("memory-chat-scroll");
    if (!scroll) return;
    scroll.innerHTML = "";
    session.turns.forEach(turn => {
      const userDiv = document.createElement("div");
      userDiv.style.cssText = "background:rgba(0,85,255,.14);padding:8px 10px;border-radius:8px;font-size:12px;border-left:2px solid var(--neon2);";
      userDiv.innerHTML = "<b style=\"color:var(--text-dim);font-size:10px;\">YOU</b><br>" + turn.prompt;
      const tobDiv = document.createElement("div");
      tobDiv.style.cssText = "background:rgba(255,255,255,.04);padding:8px 10px;border-radius:8px;font-size:12px;border-left:2px solid var(--neon);";
      tobDiv.innerHTML = "<b style=\"color:var(--neon);font-size:10px;\">TOB</b><br>" + turn.response;
      scroll.appendChild(userDiv);
      scroll.appendChild(tobDiv);
    });
    scroll.scrollTop = scroll.scrollHeight;
  },

  clearAll() {
    if (!confirm("Purge all memory sessions from the vault?")) return;
    try { localStorage.removeItem(this.storageKey); } catch(e) {}
    this.refreshUI();
    const scroll = document.getElementById("memory-chat-scroll");
    if (scroll) scroll.innerHTML = "";
    const titleEl = document.getElementById("memory-chat-title");
    if (titleEl) titleEl.textContent = "VAULT CLEARED";
  },

  // Legacy compat
  save(key, value) { this.archiveRecord("session-legacy", key, String(value)); },
  load() { return this.getHistory(); },
  clear() { this.clearAll(); }
};

function bootstrapTOBNlpExtensions() {
  if (typeof TOB_Avatar !== "undefined" && TOB_Avatar.init) TOB_Avatar.init();
  if (typeof TOB_VersionManager !== "undefined" && TOB_VersionManager.init) TOB_VersionManager.init();
  if (typeof TOB_AI !== "undefined" && TOB_AI.initVoiceWakeWord) TOB_AI.initVoiceWakeWord();
  TOB_IslandAI.init();
  console.log("TOB OS v18.0 — Dynamic Island AI Matrix ignition complete.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => setTimeout(bootstrapTOBNlpExtensions, 1200));
} else {
  setTimeout(bootstrapTOBNlpExtensions, 1200);
}
