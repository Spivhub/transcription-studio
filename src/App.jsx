import { useState, useRef, useCallback, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Playfair+Display+SC:wght@400;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #111110;
    --bg-elevated: #1a1a18;
    --bg-card: #161614;
    --border: #807a70;
    --border-subtle: #5e5a54;
    --text-primary: #ffffff;
    --text-secondary: #e0dbd2;
    --text-muted: #c0bab0;
    --accent: #f0ddb8;
    --accent-dim: #c4a872;
    --low-confidence-bg: #2e2b24;
    --low-confidence-border: #7a6e58;
    --low-confidence-text: #f0c070;
    --font-serif: 'Playfair Display', Georgia, serif;
    --font-serif-sc: 'Playfair Display SC', Georgia, serif;
  }

  body {
    background: var(--bg);
    color: var(--text-primary);
    font-family: var(--font-serif);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  .app {
    max-width: 860px;
    margin: 0 auto;
    padding: 0 32px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header ── */
  .header {
    padding: 52px 0 40px;
    border-bottom: 1px solid var(--border-subtle);
    margin-bottom: 52px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .header-left { flex: 1; }

  .header-eyebrow {
    font-family: var(--font-serif-sc);
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--text-muted);
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .header-title {
    font-size: 32px;
    font-weight: 400;
    color: var(--text-primary);
    line-height: 1.15;
    letter-spacing: -0.02em;
    margin-bottom: 10px;
  }

  .header-title em { font-style: italic; color: var(--accent); }

  .header-sub {
    font-size: 14px;
    color: var(--text-secondary);
    font-weight: 400;
    line-height: 1.6;
    font-style: italic;
    max-width: 480px;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-top: 8px;
  }

  /* ── Hamburger / Sessions ── */
  .hamburger-btn {
    background: none;
    border: 1px solid var(--border-subtle);
    border-radius: 4px;
    padding: 8px 10px;
    cursor: pointer;
    color: var(--text-muted);
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .hamburger-btn:hover { border-color: var(--accent-dim); color: var(--accent); }
  .hamburger-btn span {
    display: block;
    width: 18px;
    height: 1px;
    background: currentColor;
    transition: background 0.2s;
  }

  .sessions-drawer {
    position: fixed;
    top: 0;
    right: 0;
    width: 340px;
    height: 100vh;
    background: #141412;
    border-left: 1px solid var(--border-subtle);
    z-index: 200;
    display: flex;
    flex-direction: column;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    box-shadow: -8px 0 32px rgba(0,0,0,0.4);
  }

  .sessions-drawer.open { transform: translateX(0); }

  .drawer-header {
    padding: 28px 24px 20px;
    border-bottom: 1px solid var(--border-subtle);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .drawer-title {
    font-family: var(--font-serif-sc);
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--text-muted);
    text-transform: uppercase;
  }

  .drawer-close {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 18px;
    padding: 2px 6px;
    transition: color 0.2s;
    font-family: var(--font-serif);
  }
  .drawer-close:hover { color: var(--text-primary); }

  .drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .session-card {
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: 5px;
    padding: 14px 16px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .session-card:hover {
    border-color: var(--accent-dim);
    background: #1a1916;
  }

  .session-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 6px;
  }

  .session-filename {
    font-size: 13px;
    color: var(--text-primary);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
  }

  .session-delete {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 12px;
    padding: 2px 4px;
    transition: color 0.2s;
    flex-shrink: 0;
  }
  .session-delete:hover { color: #c07060; }

  .session-meta {
    font-family: var(--font-serif-sc);
    font-size: 9px;
    letter-spacing: 0.15em;
    color: var(--text-muted);
    text-transform: uppercase;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .session-preview {
    font-size: 12px;
    color: var(--text-secondary);
    font-style: italic;
    margin-top: 8px;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .no-sessions {
    font-size: 13px;
    color: var(--text-muted);
    font-style: italic;
    text-align: center;
    padding: 40px 16px;
    line-height: 1.7;
  }

  .drawer-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 199;
  }

  /* ── Auth ── */
  .auth-section {
    margin-bottom: 40px;
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: 6px;
    padding: 28px 32px;
  }

  .auth-title {
    font-family: var(--font-serif-sc);
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--text-muted);
    text-transform: uppercase;
    margin-bottom: 20px;
  }

  .auth-tabs {
    display: flex;
    gap: 0;
    margin-bottom: 24px;
    border-bottom: 1px solid var(--border-subtle);
  }

  .auth-tab {
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    padding: 8px 20px 10px;
    font-family: var(--font-serif-sc);
    font-size: 9px;
    letter-spacing: 0.2em;
    color: var(--text-muted);
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.2s;
    margin-bottom: -1px;
  }

  .auth-tab.active {
    color: var(--accent);
    border-bottom-color: var(--accent-dim);
  }

  .auth-field {
    margin-bottom: 14px;
  }

  .field-label {
    font-family: var(--font-serif-sc);
    font-size: 9px;
    letter-spacing: 0.2em;
    color: var(--text-muted);
    text-transform: uppercase;
    display: block;
    margin-bottom: 8px;
  }

  .auth-input {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--border-subtle);
    border-radius: 4px;
    padding: 10px 14px;
    font-family: var(--font-serif);
    font-size: 14px;
    color: var(--text-primary);
    outline: none;
    transition: border-color 0.2s;
  }

  .auth-input:focus { border-color: var(--accent-dim); }
  .auth-input::placeholder { color: var(--text-muted); }

  .auth-btn {
    width: 100%;
    background: var(--bg-elevated);
    border: 1px solid var(--accent-dim);
    border-radius: 4px;
    padding: 12px 24px;
    font-family: var(--font-serif-sc);
    font-size: 10px;
    letter-spacing: 0.22em;
    color: var(--accent);
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.2s;
    margin-top: 8px;
  }

  .auth-btn:hover:not(:disabled) {
    background: #201f1c;
    border-color: var(--accent);
    color: var(--text-primary);
  }

  .auth-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .auth-error {
    font-size: 12px;
    color: #c07060;
    font-style: italic;
    margin-top: 10px;
  }

  .auth-skip {
    background: none;
    border: none;
    font-size: 12px;
    color: var(--text-muted);
    font-style: italic;
    cursor: pointer;
    margin-top: 14px;
    padding: 0;
    text-decoration: underline;
    text-underline-offset: 3px;
    font-family: var(--font-serif);
    transition: color 0.2s;
  }
  .auth-skip:hover { color: var(--text-secondary); }

  .user-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-serif-sc);
    font-size: 9px;
    letter-spacing: 0.15em;
    color: var(--text-muted);
    text-transform: uppercase;
  }

  .user-pill-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #6a9a6a;
  }

  .signout-btn {
    background: none;
    border: none;
    font-family: var(--font-serif-sc);
    font-size: 9px;
    letter-spacing: 0.15em;
    color: var(--text-muted);
    cursor: pointer;
    text-transform: uppercase;
    transition: color 0.2s;
    padding: 0;
  }
  .signout-btn:hover { color: var(--text-secondary); }

  /* ── Drop zone ── */
  .drop-zone {
    border: 1px dashed var(--border);
    border-radius: 6px;
    padding: 56px 32px;
    text-align: center;
    cursor: pointer;
    transition: all 0.25s ease;
    background: var(--bg-card);
    position: relative;
    margin-bottom: 40px;
  }

  .drop-zone:hover, .drop-zone.dragging {
    border-color: var(--accent-dim);
    background: #181816;
  }

  .drop-icon { font-size: 28px; margin-bottom: 16px; opacity: 0.6; display: block; }

  .drop-title {
    font-size: 17px;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 8px;
    letter-spacing: -0.01em;
  }

  .drop-sub { font-size: 13px; color: var(--text-muted); font-style: italic; line-height: 1.6; }

  .drop-formats {
    margin-top: 18px;
    font-family: var(--font-serif-sc);
    font-size: 9px;
    letter-spacing: 0.2em;
    color: var(--text-muted);
    text-transform: uppercase;
  }

  .file-selected {
    display: flex;
    align-items: center;
    gap: 14px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 18px 22px;
    margin-bottom: 28px;
  }

  .file-icon { font-size: 22px; opacity: 0.6; }
  .file-info { flex: 1; min-width: 0; }

  .file-name {
    font-size: 14px;
    color: var(--text-primary);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 3px;
  }

  .file-size { font-size: 12px; color: var(--text-muted); font-style: italic; }

  .file-clear {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 16px;
    padding: 4px 8px;
    transition: color 0.2s;
    font-family: var(--font-serif);
  }
  .file-clear:hover { color: var(--text-primary); }

  .transcribe-btn {
    width: 100%;
    background: var(--bg-elevated);
    border: 1px solid var(--accent-dim);
    border-radius: 4px;
    padding: 15px 24px;
    font-family: var(--font-serif-sc);
    font-size: 11px;
    letter-spacing: 0.25em;
    color: var(--accent);
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.2s;
    margin-bottom: 52px;
  }

  .transcribe-btn:hover:not(:disabled) {
    background: #201f1c;
    border-color: var(--accent);
    color: var(--text-primary);
  }

  .transcribe-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  /* ── Progress ── */
  .progress-section { margin-bottom: 40px; }

  .progress-label {
    font-family: var(--font-serif-sc);
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--text-muted);
    text-transform: uppercase;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
  }

  .progress-bar-track {
    height: 1px;
    background: var(--border);
    border-radius: 1px;
    overflow: hidden;
    margin-bottom: 12px;
  }

  .progress-bar-fill {
    height: 100%;
    background: var(--accent-dim);
    border-radius: 1px;
    transition: width 0.4s ease;
  }

  .progress-status { font-size: 13px; color: var(--text-secondary); font-style: italic; }

  /* ── Transcript ── */
  .transcript-section { margin-bottom: 80px; }

  .transcript-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-subtle);
    flex-wrap: wrap;
    gap: 12px;
  }

  .transcript-title {
    font-family: var(--font-serif-sc);
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--text-muted);
    text-transform: uppercase;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 11px;
    color: var(--text-muted);
    font-style: italic;
  }

  .legend-swatch {
    width: 22px;
    height: 10px;
    background: var(--low-confidence-bg);
    border: 1px solid var(--low-confidence-border);
    border-radius: 2px;
    display: inline-block;
  }

  /* ── Toolbar ── */
  .toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 24px;
    position: sticky;
    top: 0;
    z-index: 50;
    background: var(--bg);
    padding: 12px 4px;
    border-bottom: 1px solid var(--border-subtle);
  }

  .toolbar-bottom {
    margin-top: 28px;
    margin-bottom: 0;
    padding-top: 20px;
    border-top: 1px solid var(--border-subtle);
    position: static;
    border-bottom: none;
    padding-bottom: 0;
  }

  .tool-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 8px 14px;
    font-family: var(--font-serif-sc);
    font-size: 9px;
    letter-spacing: 0.18em;
    color: var(--text-secondary);
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .tool-btn:hover { border-color: var(--accent-dim); color: var(--accent); }
  .tool-btn.active { border-color: var(--accent-dim); color: var(--accent); background: #1e1c18; }
  .tool-btn.commit-btn { border-color: #5a8a5a; color: #90c090; }
  .tool-btn.commit-btn:hover { border-color: #80b080; color: #b0d8b0; background: #161e16; }
  .tool-icon { font-size: 13px; }

  /* ── Share ── */
  .share-wrapper { position: relative; }

  .share-menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    background: #1e1d1a;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 6px;
    z-index: 100;
    min-width: 190px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  }

  .share-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    background: none;
    border: none;
    border-radius: 3px;
    padding: 9px 12px;
    font-family: var(--font-serif-sc);
    font-size: 9px;
    letter-spacing: 0.18em;
    color: var(--text-secondary);
    cursor: pointer;
    text-transform: uppercase;
    text-align: left;
    transition: all 0.15s;
    white-space: nowrap;
  }

  .share-item:hover { background: #2a2826; color: var(--accent); }
  .share-icon { font-size: 13px; width: 18px; text-align: center; }

  .sms-warning {
    background: #1e1a14;
    border: 1px solid #5a4a20;
    border-radius: 4px;
    padding: 10px 14px;
    font-size: 12px;
    color: #c4a050;
    font-style: italic;
    margin-bottom: 16px;
    line-height: 1.5;
  }

  /* ── Stats ── */
  .stats-row {
    display: flex;
    gap: 32px;
    margin-bottom: 32px;
    padding: 20px 0;
    border-top: 1px solid var(--border-subtle);
    border-bottom: 1px solid var(--border-subtle);
  }

  .stat { display: flex; flex-direction: column; gap: 4px; }

  .stat-value {
    font-size: 22px;
    font-weight: 500;
    color: var(--text-primary);
    letter-spacing: -0.02em;
  }

  .stat-label {
    font-family: var(--font-serif-sc);
    font-size: 9px;
    letter-spacing: 0.2em;
    color: var(--text-muted);
    text-transform: uppercase;
  }

  /* ── Words ── */
  .transcript-body {
    font-size: 19px;
    line-height: 1.85;
    color: var(--text-primary);
    font-weight: 400;
    letter-spacing: 0.005em;
    border: 1px solid transparent;
    border-radius: 6px;
    padding: 4px;
    transition: border-color 0.25s, background 0.25s, padding 0.25s;
    outline: none;
  }

  .transcript-body.edit-active {
    border-color: var(--border);
    background: #131311;
    padding: 20px 24px;
    cursor: text;
  }

  .word { display: inline; }
  .word-normal { color: var(--text-primary); cursor: text; }

  .word-low {
    background: var(--low-confidence-bg);
    color: var(--low-confidence-text);
    border-bottom: 1px solid var(--low-confidence-border);
    border-radius: 2px;
    padding: 0 2px;
    cursor: pointer;
    position: relative;
    transition: background 0.15s;
  }

  .word-low:hover { background: #322e28; }
  .word-low.pending { background: #2a3828; border-bottom-color: #6a9a6a; color: #b0d890; }

  .word-input {
    background: #1e2a1e;
    border: none;
    border-bottom: 1px solid #6a9a6a;
    border-radius: 2px;
    outline: none;
    color: var(--text-primary);
    font-family: var(--font-serif);
    font-size: inherit;
    line-height: inherit;
    letter-spacing: inherit;
    padding: 0 2px;
    min-width: 20px;
  }

  .confidence-tip {
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    background: #222220;
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 4px 8px;
    font-family: var(--font-serif-sc);
    font-size: 9px;
    letter-spacing: 0.15em;
    color: var(--text-muted);
    white-space: nowrap;
    pointer-events: none;
    z-index: 10;
  }

  .pending-bar {
    background: #1a2218;
    border: 1px solid #3a5a3a;
    border-radius: 4px;
    padding: 9px 14px;
    font-size: 12px;
    color: #90c090;
    font-style: italic;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .commit-inline-btn {
    background: none;
    border: 1px solid #5a8a5a;
    border-radius: 3px;
    padding: 4px 12px;
    font-family: var(--font-serif-sc);
    font-size: 9px;
    letter-spacing: 0.15em;
    color: #90c090;
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.15s;
  }
  .commit-inline-btn:hover { background: #1e2e1e; border-color: #80b080; }

  /* ── Error / Footer / New ── */
  .error-box {
    background: #1e1614;
    border: 1px solid #3d2820;
    border-radius: 4px;
    padding: 16px 20px;
    margin-bottom: 32px;
    font-size: 13px;
    color: #c07060;
    font-style: italic;
    line-height: 1.6;
  }

  .footer {
    margin-top: auto;
    padding: 24px 0 32px;
    border-top: 1px solid var(--border-subtle);
    font-family: var(--font-serif-sc);
    font-size: 9px;
    letter-spacing: 0.15em;
    color: var(--text-muted);
    text-transform: uppercase;
    display: flex;
    justify-content: space-between;
  }

  .new-btn {
    background: none;
    border: 1px solid var(--border-subtle);
    border-radius: 4px;
    padding: 10px 20px;
    font-family: var(--font-serif-sc);
    font-size: 9px;
    letter-spacing: 0.2em;
    color: var(--text-muted);
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.2s;
  }
  .new-btn:hover { border-color: var(--accent-dim); color: var(--accent); }

  .save-indicator {
    font-family: var(--font-serif-sc);
    font-size: 9px;
    letter-spacing: 0.15em;
    color: #6a9a6a;
    text-transform: uppercase;
    opacity: 0;
    transition: opacity 0.4s;
  }
  .save-indicator.visible { opacity: 1; }
`;

const CONFIDENCE_THRESHOLD = 0.75;
const SMS_CHAR_LIMIT = 1600;
const API = "/.netlify/functions/transcribe";

function formatBytes(b) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDuration(ms) {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " · " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

// ── Word component - clean input-based editing, no contentEditable ──
function Word({ word, index, onEdit, onPendingChange }) {
  const [editing, setEditing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [val, setVal] = useState(word.text);
  const inputRef = useRef(null);
  const isLow = word.confidence !== null && word.confidence < CONFIDENCE_THRESHOLD && !word.committed;

  useEffect(() => { setVal(word.text); }, [word.text]);

  const startEdit = () => {
    setEditing(true);
    onPendingChange(index, true);
    setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 10);
  };

  const finishEdit = (commit) => {
    setEditing(false);
    onPendingChange(index, false);
    onEdit(index, val.trim() || word.text, commit);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") { e.preventDefault(); finishEdit(true); }
    if (e.key === "Escape") { setVal(word.text); finishEdit(false); }
  };

  if (word.committed) {
    return <span className="word word-normal">{word.text}</span>;
  }

  if (isLow) {
    return (
      <span
        className={`word word-low ${editing ? "pending" : ""}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered && !editing && (
          <span className="confidence-tip">
            {Math.round(word.confidence * 100)}% — click to edit
          </span>
        )}
        {editing ? (
          <>
            <input
              ref={inputRef}
              className="word-input"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onBlur={() => finishEdit(false)}
              onKeyDown={handleKey}
              size={Math.max(val.length, 3)}
            />
            <span
              style={{
                fontSize: "10px",
                marginLeft: "4px",
                cursor: "pointer",
                fontFamily: "var(--font-serif-sc)",
                letterSpacing: "0.1em",
                color: "#90c090",
                textTransform: "uppercase",
              }}
              onMouseDown={(e) => { e.preventDefault(); finishEdit(true); }}
            >commit</span>
          </>
        ) : (
          <span onClick={startEdit}>{word.text}</span>
        )}
      </span>
    );
  }

  return <span className="word word-normal">{word.text}</span>;
}

// ── Main App ──
export default function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authMode, setAuthMode] = useState("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authSkipped, setAuthSkipped] = useState(false);

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [words, setWords] = useState([]);
  const [audioDuration, setAudioDuration] = useState(null);
  const [error, setError] = useState(null);

  const [copiedTop, setCopiedTop] = useState(false);
  const [copiedBottom, setCopiedBottom] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareOpenBottom, setShareOpenBottom] = useState(false);
  const [showSmsWarning, setShowSmsWarning] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [allCommitted, setAllCommitted] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [pendingEdits, setPendingEdits] = useState({});
  const [saveIndicator, setSaveIndicator] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const fileInputRef = useRef(null);
  const transcriptRef = useRef(null);

  // ── Prevent browser from navigating on accidental drops outside drop zone ──
  useEffect(() => {
    const prevent = (e) => { e.preventDefault(); e.stopPropagation(); };
    document.addEventListener("dragover", prevent);
    document.addEventListener("drop", prevent);
    return () => {
      document.removeEventListener("dragover", prevent);
      document.removeEventListener("drop", prevent);
    };
  }, []);

  // ── Auth init ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthChecked(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Auth actions ──
  const signIn = async () => {
    setAuthLoading(true);
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    if (error) setAuthError(error.message);
    setAuthLoading(false);
  };

  const signUp = async () => {
    setAuthLoading(true);
    setAuthError("");
    const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
    if (error) setAuthError(error.message);
    else setAuthError("Check your email to confirm your account, then sign in.");
    setAuthLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSessions([]);
  };

  // ── Sessions ──
  const loadSessions = async () => {
    if (!user) return;
    setSessionsLoading(true);
    const { data } = await supabase
      .from("sessions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setSessions(data || []);
    setSessionsLoading(false);
  };

  const saveSession = async (wordList, duration, fileName) => {
    if (!user) return;
    const text = wordList.map((w) => w.text).join(" ");
    await supabase.from("sessions").insert({
      user_id: user.id,
      file_name: fileName,
      duration_seconds: Math.round(duration || 0),
      word_count: wordList.length,
      transcript: text,
      words: wordList,
    });
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 3000);
  };

  const deleteSession = async (id, e) => {
    e.stopPropagation();
    await supabase.from("sessions").delete().eq("id", id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const restoreSession = (session) => {
    setWords(session.words);
    setAudioDuration(session.duration_seconds);
    setStatus("done");
    setDrawerOpen(false);
    setPendingEdits({});
    setFile({ name: session.file_name, size: 0, restored: true });
  };

  const openDrawer = () => {
    setDrawerOpen(true);
    loadSessions();
  };

  // ── File handling ──
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  // ── API call ──
  const call = async (action, payload) => {
    const res = await fetch(API, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, payload }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `${action} failed`);
    return data;
  };

  // ── Transcribe ──
  const transcribe = async () => {
    if (!file) return;
    setError(null);
    setWords([]);
    setPendingEdits({});
    setStatus("uploading");
    setProgress(10);
    setProgressLabel("Getting upload token...");

    try {
      const tokenRes = await fetch(API, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "getKey", payload: {} }),
      });
      const { key } = await tokenRes.json();

      setProgress(20);
      setProgressLabel("Uploading audio...");

      const uploadRes = await fetch("https://api.assemblyai.com/v2/upload", {
        method: "POST",
        headers: { authorization: key },
        body: file,
      });
      const { upload_url } = await uploadRes.json();

      setProgress(35);
      setProgressLabel("Queuing transcription...");

      const { id } = await call("request", { upload_url });

      setStatus("processing");
      setProgress(45);
      setProgressLabel("Transcribing...");

      let attempts = 0;
      while (true) {
        await new Promise((r) => setTimeout(r, 2500));
        const data = await call("poll", { id });

        if (data.status === "completed") {
          setProgress(100);
          setProgressLabel("Complete");
          const wordList = (data.words || []).map((w) => ({
            text: w.text,
            confidence: w.confidence ?? null,
            start: w.start,
            end: w.end,
            committed: false,
          }));
          setWords(wordList);
          setAudioDuration(data.audio_duration);
          setStatus("done");
          await saveSession(wordList, data.audio_duration, file.name);
          break;
        } else if (data.status === "error") {
          throw new Error(data.error || "Transcription failed");
        }

        attempts++;
        setProgress(Math.min(45 + attempts * 4, 90));
        setProgressLabel("Transcribing" + ".".repeat((attempts % 3) + 1));
      }
    } catch (e) {
      setError(e.message);
      setStatus("error");
      setProgress(0);
    }
  };

  // ── Word editing - pending system ──
  const handlePendingChange = (index, isPending) => {
    setPendingEdits((prev) => {
      const next = { ...prev };
      if (isPending) next[index] = true;
      else delete next[index];
      return next;
    });
  };

  const handleWordEdit = (index, newText, commit) => {
    setWords((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], text: newText, committed: commit ? true : next[index].committed };
      return next;
    });
  };

  const commitAllPending = () => {
    setWords((prev) =>
      prev.map((w) =>
        w.confidence !== null && w.confidence < CONFIDENCE_THRESHOLD
          ? { ...w, committed: true }
          : w
      )
    );
    setPendingEdits({});
    setAllCommitted(true);
  };

  const restoreHighlights = () => {
    setWords((prev) =>
      prev.map((w) =>
        w.confidence !== null && w.confidence < CONFIDENCE_THRESHOLD
          ? { ...w, committed: false }
          : w
      )
    );
    setAllCommitted(false);
  };

  // ── Copy / share ──
  const getFullText = () => {
    if (transcriptRef.current) return transcriptRef.current.innerText.trim();
    return words.map((w) => w.text).join(" ");
  };

  const copyText = (setCopiedFn) => {
    navigator.clipboard.writeText(getFullText());
    setCopiedFn(true);
    setTimeout(() => setCopiedFn(false), 2000);
  };

  const downloadTxt = () => {
    const blob = new Blob([getFullText()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "transcript.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    const text = getFullText();
    const maxChars = 90;
    const wordList = text.split(" ");
    const lines = [];
    let cur = "";
    wordList.forEach((w) => {
      const t = cur ? cur + " " + w : w;
      if (t.length > maxChars && cur) { lines.push(cur); cur = w; }
      else cur = t;
    });
    if (cur) lines.push(cur);

    const fs = 12;
    const lead = 18;
    const mx = 72;
    const my = 72;
    const ph = 792;
    const pw = 612;
    const lpp = Math.floor((ph - my * 2) / lead);
    const pages = [];
    for (let i = 0; i < lines.length; i += lpp) pages.push(lines.slice(i, i + lpp));
    if (!pages.length) pages.push([""]);

    const out = [];
    const offsets = [];
    let pos = 0;
    const ln = (s) => { out.push(s); pos += s.length + 1; };

    ln("%PDF-1.4");

    offsets[1] = pos;
    ln("1 0 obj");
    ln("<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>");
    ln("endobj");

    const base = 3;
    const streamNums = [];
    const pageNums = [];

    pages.forEach((pg, pi) => {
      const sn = base + pi * 2;
      const pn = base + pi * 2 + 1;
      const ty = ph - my;
      let s = "BT" + "
" + "/F1 " + fs + " Tf" + "
" + mx + " " + ty + " Td" + "
" + lead + " TL" + "
";
      pg.forEach((line) => {
        const safe = line.replace(/\/g, "\\").replace(/\(/g, "\(").replace(/\)/g, "\)");
        s += "(" + safe + ") Tj T*" + "
";
      });
      s += "ET";
      offsets[sn] = pos;
      ln(sn + " 0 obj");
      ln("<< /Length " + s.length + " >>");
      ln("stream");
      ln(s);
      ln("endstream");
      ln("endobj");
      streamNums.push(sn);

      offsets[pn] = pos;
      ln(pn + " 0 obj");
      ln("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + pw + " " + ph + "] /Contents " + sn + " 0 R /Resources << /Font << /F1 1 0 R >> >> >>");
      ln("endobj");
      pageNums.push(pn);
    });

    offsets[2] = pos;
    ln("2 0 obj");
    ln("<< /Type /Pages /Kids [" + pageNums.map((n) => n + " 0 R").join(" ") + "] /Count " + pageNums.length + " >>");
    ln("endobj");

    const cat = base + pages.length * 2;
    offsets[cat] = pos;
    ln(cat + " 0 obj");
    ln("<< /Type /Catalog /Pages 2 0 R >>");
    ln("endobj");

    const xref = pos;
    const total = cat + 1;
    ln("xref");
    ln("0 " + total);
    ln("0000000000 65535 f ");
    for (let i = 1; i < total; i++) {
      ln(String(offsets[i] || 0).padStart(10, "0") + " 00000 n ");
    }
    ln("trailer");
    ln("<< /Size " + total + " /Root " + cat + " 0 R >>");
    ln("startxref");
    ln(String(xref));
    ln("%%EOF");

    const blob = new Blob([out.join("
")], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transcript.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadDocx = async () => {
    const { Document, Packer, Paragraph, TextRun } = await import("https://cdn.skypack.dev/docx");
    const doc = new Document({
      sections: [{ children: [new Paragraph({ children: [new TextRun({ text: getFullText(), font: "Times New Roman", size: 26 })] })] }],
    });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "transcript.docx"; a.click();
    URL.revokeObjectURL(url);
  };

  const shareEmail = () => {
    window.open(`mailto:?subject=${encodeURIComponent("Transcript")}&body=${encodeURIComponent(getFullText())}`);
  };

  const shareSms = () => {
    const text = getFullText();
    if (text.length > SMS_CHAR_LIMIT) {
      setShowSmsWarning(true);
      setTimeout(() => setShowSmsWarning(false), 7000);
      return;
    }
    window.open(`sms:?body=${encodeURIComponent(text)}`);
  };

  const reset = () => {
    setFile(null); setWords([]); setStatus("idle");
    setProgress(0); setError(null); setAudioDuration(null);
    setPendingEdits({}); setEditMode(false); setEditedText(""); setAllCommitted(false); setShareOpen(false); setShareOpenBottom(false);
    setShowSmsWarning(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const lowConfWords = words.filter(
    (w) => w.confidence !== null && w.confidence < CONFIDENCE_THRESHOLD && !w.committed
  );
  const pendingCount = Object.keys(pendingEdits).length;

  const avgConf = words.length > 0
    ? Math.round((words.reduce((s, w) => s + (w.confidence ?? 1), 0) / words.length) * 100)
    : null;

  const renderTranscript = () => {
    let out = [];
    for (let i = 0; i < words.length; i++) {
      out.push(
        <Word
          key={i}
          word={words[i]}
          index={i}
          onEdit={handleWordEdit}
          onPendingChange={handlePendingChange}
        />
      );
      if (i < words.length - 1) out.push(" ");
    }
    return out;
  };

  // ── Toolbar component ──
  const Toolbar = ({ isBottom }) => {
    const open = isBottom ? shareOpenBottom : shareOpen;
    const setOpen = isBottom ? setShareOpenBottom : setShareOpen;
    const setCopied = isBottom ? setCopiedBottom : setCopiedTop;
    const copied = isBottom ? copiedBottom : copiedTop;

    return (
      <div className={`toolbar ${isBottom ? "toolbar-bottom" : ""}`}>
        <button className="tool-btn" onClick={() => copyText(setCopied)}>
          <span className="tool-icon">⎘</span>
          {copied ? "Copied!" : "Copy"}
        </button>

        <div className="share-wrapper">
          <button className="tool-btn" onClick={() => setOpen(!open)}>
            <span className="tool-icon">↑</span> Share
          </button>
          {open && (
            <div className="share-menu">
              <button className="share-item" onClick={() => { shareEmail(); setOpen(false); }}>
                <span className="share-icon">✉</span> Email
              </button>
              <button className="share-item" onClick={() => { shareSms(); setOpen(false); }}>
                <span className="share-icon">✆</span> SMS
              </button>
              <button className="share-item" onClick={() => { downloadTxt(); setOpen(false); }}>
                <span className="share-icon">↓</span> Download TXT
              </button>
              <button className="share-item" onClick={() => { downloadPdf(); setOpen(false); }}>
                <span className="share-icon">↓</span> Download PDF
              </button>
              <button className="share-item" onClick={() => { downloadDocx(); setOpen(false); }}>
                <span className="share-icon">↓</span> Download Word
              </button>
            </div>
          )}
        </div>

        {!isBottom && (
          <>
            <button
              className={`tool-btn ${editMode ? "active" : ""}`}
              onClick={() => {
                if (!editMode) setEditedText(words.map((w) => w.text).join(" "));
                setEditMode(!editMode);
              }}
            >
              <span className="tool-icon">✎</span>
              {editMode ? "Done Editing" : "Edit"}
            </button>
            {!allCommitted && lowConfWords.length > 0 && (
              <button className="tool-btn commit-btn" onClick={commitAllPending}>
                <span className="tool-icon">✓</span> Commit All
              </button>
            )}
            {allCommitted && (
              <button className="tool-btn" onClick={restoreHighlights}>
                <span className="tool-icon">◎</span> Restore Highlights
              </button>
            )}
          </>
        )}

        {isBottom && (
          <>
            <button className="new-btn" onClick={reset}>New Recording</button>
            <span className={`save-indicator ${saveIndicator ? "visible" : ""}`}>
              ✓ Saved
            </span>
          </>
        )}
      </div>
    );
  };

  if (!authChecked) return null;

  const showAuth = !user && !authSkipped;

  return (
    <>
      <style>{STYLES}</style>
      <div className="app" onClick={(e) => {
        if (!e.target.closest(".share-wrapper")) {
          setShareOpen(false);
          setShareOpenBottom(false);
        }
      }}>
        {/* Sessions drawer */}
        {drawerOpen && <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />}
        <div className={`sessions-drawer ${drawerOpen ? "open" : ""}`}>
          <div className="drawer-header">
            <div className="drawer-title">Saved Sessions</div>
            <button className="drawer-close" onClick={() => setDrawerOpen(false)}>✕</button>
          </div>
          <div className="drawer-body">
            {sessionsLoading ? (
              <div className="no-sessions">Loading...</div>
            ) : sessions.length === 0 ? (
              <div className="no-sessions">
                No saved sessions yet.<br />Transcribe a recording to save it here automatically.
              </div>
            ) : (
              sessions.map((s) => (
                <div key={s.id} className="session-card" onClick={() => restoreSession(s)}>
                  <div className="session-card-header">
                    <div className="session-filename">{s.file_name || "Untitled"}</div>
                    <button className="session-delete" onClick={(e) => deleteSession(s.id, e)}>✕</button>
                  </div>
                  <div className="session-meta">
                    <span>{formatDate(s.created_at)}</span>
                    {s.duration_seconds > 0 && <span>{formatDuration(s.duration_seconds * 1000)}</span>}
                    <span>{s.word_count} words</span>
                  </div>
                  <div className="session-preview">{s.transcript}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Header */}
        <header className="header">
          <div className="header-left">
            <div className="header-eyebrow">Transcription Studio</div>
            <h1 className="header-title">Every word, <em>examined.</em></h1>
            <p className="header-sub">
              Upload any audio recording. Low-confidence words surface quietly - click to correct them.
            </p>
          </div>
          <div className="header-right">
            {user ? (
              <>
                <div className="user-pill">
                  <span className="user-pill-dot" />
                  {user.email.split("@")[0]}
                </div>
                <button className="signout-btn" onClick={signOut}>Sign out</button>
                <button className="hamburger-btn" onClick={openDrawer} title="Saved sessions">
                  <span /><span /><span />
                </button>
              </>
            ) : authSkipped ? (
              <button className="signout-btn" onClick={() => setAuthSkipped(false)}>Sign in</button>
            ) : null}
          </div>
        </header>

        {/* Auth */}
        {showAuth && (
          <div className="auth-section">
            <div className="auth-title">Sign in to save sessions</div>
            <div className="auth-tabs">
              <button className={`auth-tab ${authMode === "signin" ? "active" : ""}`} onClick={() => setAuthMode("signin")}>Sign In</button>
              <button className={`auth-tab ${authMode === "signup" ? "active" : ""}`} onClick={() => setAuthMode("signup")}>Create Account</button>
            </div>
            <div className="auth-field">
              <label className="field-label">Email</label>
              <input className="auth-input" type="email" placeholder="you@example.com" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} />
            </div>
            <div className="auth-field">
              <label className="field-label">Password</label>
              <input className="auth-input" type="password" placeholder="••••••••" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") authMode === "signin" ? signIn() : signUp(); }} />
            </div>
            {authError && <div className="auth-error">{authError}</div>}
            <button className="auth-btn" disabled={authLoading || !authEmail || !authPassword} onClick={authMode === "signin" ? signIn : signUp}>
              {authLoading ? "Please wait..." : authMode === "signin" ? "Sign In" : "Create Account"}
            </button>
            <div><button className="auth-skip" onClick={() => setAuthSkipped(true)}>Continue without signing in</button></div>
          </div>
        )}

        {/* Drop zone */}
        {!file ? (
          <div
            className={`drop-zone ${dragging ? "dragging" : ""}`}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragging(false); }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file"
              accept="audio/*,video/*,.mp3,.wav,.m4a,.ogg,.flac,.aac,.wma,.mp4,.mov"
              onChange={handleFileChange} style={{ display: "none" }} />
            <span className="drop-icon">♪</span>
            <div className="drop-title">Drop your audio here</div>
            <div className="drop-sub">or click to browse your files</div>
            <div className="drop-formats">mp3 · wav · m4a · flac · ogg · aac · wma · mp4</div>
          </div>
        ) : (
          <div className="file-selected">
            <span className="file-icon">◉</span>
            <div className="file-info">
              <div className="file-name">{file.name}</div>
              {file.size > 0 && <div className="file-size">{formatBytes(file.size)}</div>}
            </div>
            <button className="file-clear" onClick={reset}>✕</button>
          </div>
        )}

        {status !== "done" && (
          <button className="transcribe-btn"
            disabled={!file || file.restored || status === "uploading" || status === "processing"}
            onClick={transcribe}>
            {status === "uploading" || status === "processing" ? "Transcribing..." : "Transcribe Recording"}
          </button>
        )}

        {(status === "uploading" || status === "processing") && (
          <div className="progress-section">
            <div className="progress-label"><span>Progress</span><span>{progress}%</span></div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-status">{progressLabel}</div>
          </div>
        )}

        {error && <div className="error-box"><strong>Something went wrong:</strong> {error}</div>}

        {status === "done" && words.length > 0 && (
          <div className="transcript-section">
            <div className="stats-row">
              <div className="stat">
                <div className="stat-value">{words.length}</div>
                <div className="stat-label">Words</div>
              </div>
              {audioDuration && (
                <div className="stat">
                  <div className="stat-value">{formatDuration(audioDuration * 1000)}</div>
                  <div className="stat-label">Duration</div>
                </div>
              )}
              {avgConf !== null && (
                <div className="stat">
                  <div className="stat-value">{avgConf}%</div>
                  <div className="stat-label">Avg Confidence</div>
                </div>
              )}
              <div className="stat">
                <div className="stat-value">{lowConfWords.length}</div>
                <div className="stat-label">To Review</div>
              </div>
            </div>

            <div className="transcript-header">
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div className="transcript-title">Transcript</div>
                {lowConfWords.length > 0 && (
                  <div className="legend-item">
                    <span className="legend-swatch" />
                    Under 75% confidence
                  </div>
                )}
              </div>
            </div>

            <Toolbar isBottom={false} />

            {showSmsWarning && (
              <div className="sms-warning">
                Your transcript is {getFullText().length.toLocaleString()} characters. SMS works best under {SMS_CHAR_LIMIT.toLocaleString()} - use Email or Download TXT instead.
              </div>
            )}

            {pendingCount > 0 && (
              <div className="pending-bar">
                <span>{pendingCount} word{pendingCount > 1 ? "s" : ""} edited - press Enter in each field or commit all at once</span>
                <button className="commit-inline-btn" onClick={commitAllPending}>Commit All</button>
              </div>
            )}

            <div
              ref={transcriptRef}
              className={`transcript-body ${editMode ? "edit-active" : ""}`}
              contentEditable={editMode}
              suppressContentEditableWarning={true}
              spellCheck={editMode}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.preventDefault();
              }}
            >
              {renderTranscript()}
            </div>

            <Toolbar isBottom={true} />
          </div>
        )}

        <footer className="footer">
          <span>Powered by AssemblyAI</span>
          <span>75% Confidence Threshold</span>
        </footer>
      </div>
    </>
  );
}
