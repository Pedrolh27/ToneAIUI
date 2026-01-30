import React, { useEffect, useRef, useState } from "react";
import "./Home.css";

function uid(prefix = "m") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export default function Home() {
  const [messages, setMessages] = useState([
    { id: uid("ai"), role: "ai", content: "Hi — I’m ToneAI. How can I help?", ts: Date.now() },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, sending]);

  async function callToneAI(prompt) {
    // TODO: replace with your backend call
    

    /// end TODO
    await new Promise((r) => setTimeout(r, 400));
    return `ToneAI (demo): You said “${prompt}”. Connect me to your API for real responses.`;
  }

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    setMessages((m) => [...m, { id: uid("u"), role: "user", content: text, ts: Date.now() }]);
    setInput("");
    setSending(true);

    try {
      const reply = await callToneAI(text);
      setMessages((m) => [...m, { id: uid("ai"), role: "ai", content: reply, ts: Date.now() }]);
    } finally {
      setSending(false);
    }
  }

  function toggleMic() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition not supported in this browser (try Chrome).");
      return;
    }

    if (listening) {
      // simplest “stop”: just flip UI state; recognition ends on its own after result/end
      setListening(false);
      return;
    }

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onresult = (e) => {
      const t = e.results?.[0]?.[0]?.transcript || "";
      setInput((prev) => (prev ? `${prev} ${t}` : t).replace(/\s+/g, " ").trim());
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);

    setListening(true);
    rec.start();
  }

  return (
    <div className="tone-page">
      <div className="tone-shell">
        <header className="tone-header">
          <div className="tone-brand">
            <div className="tone-logo">✦</div>
            <div className="tone-brand-text">
              <div className="tone-title">ToneAI</div>
              <div className="tone-subtitle">Chat UI</div>
            </div>
          </div>

          <div className="tone-status">{listening ? "Listening…" : "Ready"}</div>
        </header>

        <main className="tone-chat">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`tone-bubble ${m.role === "user" ? "tone-bubble-user" : "tone-bubble-ai"}`}
            >
              <div className="tone-meta">{m.role === "user" ? "You" : "ToneAI"}</div>
              <div className="tone-text">{m.content}</div>
            </div>
          ))}

          {sending && (
            <div className="tone-bubble tone-bubble-ai">
              <div className="tone-meta">ToneAI</div>
              <div className="tone-text tone-typing">Typing…</div>
            </div>
          )}

          <div ref={bottomRef} />
        </main>

        <footer className="tone-input-row">
          <button className="tone-icon-btn" onClick={toggleMic} title="Microphone">
            {listening ? "■" : "🎤"}
          </button>

          <input
            className="tone-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            placeholder="Message ToneAI…"
          />

          <button className="tone-send-btn" onClick={send} disabled={!input.trim() || sending}>
            Send
          </button>
        </footer>
      </div>
    </div>
  );
}
