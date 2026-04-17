import { useState, useRef, useCallback } from "react";

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

  .header {
    padding: 52px 0 40px;
    border-bottom: 1px solid var(--border-subtle);
    margin-bottom: 52px;
  }

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
    padding: 12px 0;
    border-bottom: 1px solid var(--border-subtle);
    margin-left: -4px;
    margin-right: -4px;
    padding-left: 4px;
    padding-right: 4px;
  }

  .toolbar-bottom {
    margin-top: 28px;
    margin-bottom: 0;
    padding-top: 20px;
    border-top: 1px solid var(--border-subtle);
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

  .transcript-body {
    font-size: 19px;
    line-height: 1.85;
    color: var(--text-primary);
    font-weight: 400;
    letter-spacing: 0.005em;
  }

  .word { display: inline; cursor: default; }
  .word-normal { color: var(--text-primary); }

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

  .word-committed {
    color: var(--text-primary);
    border-bottom: 1px solid #4a7a4a;
    border-radius: 2px;
    padding: 0 2px;
  }

  .word-editing {
    background: #2a2520;
    border-bottom: 1px solid var(--accent-dim);
    color: var(--text-primary);
  }

  .word-input {
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-primary);
    font-family: var(--font-serif);
    font-size: inherit;
    line-height: inherit;
    letter-spacing: inherit;
    min-width: 20px;
    padding: 0 2px;
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

  .transcript-textarea {
    width: 100%;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 28px 32px;
    font-family: var(--font-serif);
    font-size: 19px;
    line-height: 1.85;
    color: var(--text-primary);
    letter-spacing: 0.005em;
    resize: vertical;
    outline: none;
    min-height: 320px;
    transition: border-color 0.2s;
  }

  .transcript-textarea:focus { border-color: var(--accent-dim); }

  .edit-hint {
    font-size: 12px;
    color: var(--text-muted);
    font-style: italic;
    margin-top: 10px;
    text-align: right;
  }

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
`;

const CONFIDENCE_THRESHOLD = 0.75;
const SMS_CHAR_LIMIT = 1600;
const API = "/.netlify/functions/transcribe";

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDuration(ms) {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

function Word({ word, index, onEdit, onCommit }) {
  const [editing, setEditing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [val, setVal] = useState(word.text);
  const inputRef = useRef(null);
  const isLow = word.confidence !== null && word.confidence < CONFIDENCE_THRESHOLD && !word.committed;

  const startEdit = () => {
    if (!isLow) return;
    setEditing(true);
    setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 10);
  };

  const commitEdit = () => { setEditing(false); onEdit(index, val); };

  const handleKey = (e) => {
    if (e.key === "Enter") { commitEdit(); onCommit(index); }
    if (e.key === "Escape") commitEdit();
  };

  if (word.committed) {
    return <span className="word word-committed">{word.text}</span>;
  }

  if (isLow) {
    return (
      <span
        className={`word word-low ${editing ? "word-editing" : ""}`}
        onClick={startEdit}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered && !editing && (
          <span className="confidence-tip">
            {Math.round(word.confidence * 100)}% - click to edit, Enter to commit
          </span>
        )}
        {editing ? (
          <input
            ref={inputRef}
            className="word-input"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKey}
            size={Math.max(val.length, 3)}
          />
        ) : val}
      </span>
    );
  }

  return <span className="word word-normal">{word.text}</span>;
}

export default function App() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [words, setWords] = useState([]);
  const [editedText, setEditedText] = useState("");
  const [audioDuration, setAudioDuration] = useState(null);
  const [error, setError] = useState(null);
  const [copiedTop, setCopiedTop] = useState(false);
  const [copiedBottom, setCopiedBottom] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareOpenBottom, setShareOpenBottom] = useState(false);
  const [showSmsWarning, setShowSmsWarning] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

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

  const transcribe = async () => {
    if (!file) return;
    setError(null);
    setWords([]);
    setEditedText("");
    setEditMode(false);
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
          setEditedText(wordList.map((w) => w.text).join(" "));
          setAudioDuration(data.audio_duration);
          setStatus("done");
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

  const handleWordEdit = (index, newText) => {
    setWords((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], text: newText };
      return next;
    });
  };

  const handleCommit = (index) => {
    setWords((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], committed: true };
      return next;
    });
  };

  const commitAllEdited = () => {
    setWords((prev) =>
      prev.map((w) =>
        w.confidence !== null && w.confidence < CONFIDENCE_THRESHOLD
          ? { ...w, committed: true }
          : w
      )
    );
  };

  const getFullText = () =>
    editMode ? editedText : words.map((w) => w.text).join(" ");

  const copyText = (setCopiedFn) => {
    navigator.clipboard.writeText(getFullText());
    setCopiedFn(true);
    setTimeout(() => setCopiedFn(false), 2000);
  };

  const downloadTxt = () => {
    const blob = new Blob([getFullText()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transcript.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = async () => {
    const { jsPDF } = await import("https://cdn.skypack.dev/jspdf");
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const text = getFullText();
    const margin = 72;
    const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;
    doc.setFont("Times", "normal");
    doc.setFontSize(13);
    const lines = doc.splitTextToSize(text, maxWidth);
    let y = margin;
    lines.forEach((line) => {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 20;
    });
    doc.save("transcript.pdf");
  };

  const downloadDocx = async () => {
    const { Document, Packer, Paragraph, TextRun } = await import(
      "https://cdn.skypack.dev/docx"
    );
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            children: [new TextRun({ text: getFullText(), font: "Times New Roman", size: 26 })],
          }),
        ],
      }],
    });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transcript.docx";
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareEmail = () => {
    const body = encodeURIComponent(getFullText());
    window.open(`mailto:?subject=${encodeURIComponent("Transcript")}&body=${body}`);
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
    setFile(null);
    setWords([]);
    setEditedText("");
    setStatus("idle");
    setProgress(0);
    setError(null);
    setAudioDuration(null);
    setEditMode(false);
    setShareOpen(false);
    setShareOpenBottom(false);
    setShowSmsWarning(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const lowConfWords = words.filter(
    (w) => w.confidence !== null && w.confidence < CONFIDENCE_THRESHOLD && !w.committed
  );
  const avgConf =
    words.length > 0
      ? Math.round((words.reduce((s, w) => s + (w.confidence ?? 1), 0) / words.length) * 100)
      : null;

  const renderTranscript = () => {
    let out = [];
    for (let i = 0; i < words.length; i++) {
      out.push(
        <Word key={i} word={words[i]} index={i} onEdit={handleWordEdit} onCommit={handleCommit} />
      );
      if (i < words.length - 1) out.push(" ");
    }
    return out;
  };

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
            <span className="tool-icon">↑</span>
            Share
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

            {!editMode && lowConfWords.length > 0 && (
              <button className="tool-btn commit-btn" onClick={commitAllEdited}>
                <span className="tool-icon">✓</span>
                Commit All
              </button>
            )}
          </>
        )}

        {isBottom && (
          <button className="new-btn" onClick={reset}>
            New Recording
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="app" onClick={(e) => {
        if (!e.target.closest(".share-wrapper")) {
          setShareOpen(false);
          setShareOpenBottom(false);
        }
      }}>
        <header className="header">
          <div className="header-eyebrow">Transcription Studio</div>
          <h1 className="header-title">Every word, <em>examined.</em></h1>
          <p className="header-sub">
            Upload any audio recording. Low-confidence words surface quietly - click to correct them.
          </p>
        </header>

        {!file ? (
          <div
            className={`drop-zone ${dragging ? "dragging" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,video/*,.mp3,.wav,.m4a,.ogg,.flac,.aac,.wma,.mp4,.mov"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
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
              <div className="file-size">{formatBytes(file.size)}</div>
            </div>
            <button className="file-clear" onClick={reset}>✕</button>
          </div>
        )}

        {status !== "done" && (
          <button
            className="transcribe-btn"
            disabled={!file || status === "uploading" || status === "processing"}
            onClick={transcribe}
          >
            {status === "uploading" || status === "processing"
              ? "Transcribing..."
              : "Transcribe Recording"}
          </button>
        )}

        {(status === "uploading" || status === "processing") && (
          <div className="progress-section">
            <div className="progress-label">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-status">{progressLabel}</div>
          </div>
        )}

        {error && (
          <div className="error-box">
            <strong>Something went wrong:</strong> {error}
          </div>
        )}

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
                {!editMode && (
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
                Your transcript is {getFullText().length.toLocaleString()} characters. SMS works best under {SMS_CHAR_LIMIT.toLocaleString()} - consider Email or Download TXT instead.
              </div>
            )}

            {editMode ? (
              <>
                <textarea
                  className="transcript-textarea"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  spellCheck={true}
                />
                <div className="edit-hint">Full transcript editing mode - spell check active</div>
              </>
            ) : (
              <div className="transcript-body">{renderTranscript()}</div>
            )}

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
