// Speech helpers + small reusable listen-buttons (once / repeat).
// Repeat plays until user taps stop.

window.CT_SPEAK = {
  _loopTimer: null,
  cancel() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (this._loopTimer) { clearTimeout(this._loopTimer); this._loopTimer = null; }
  },
  once(text, lang = 'en-US', rate = 0.95) {
    if (!window.speechSynthesis) return;
    this.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang; u.rate = rate;
    window.speechSynthesis.speak(u);
  },
  loop(text, lang = 'en-US', rate = 0.9, onStop) {
    if (!window.speechSynthesis) return;
    this.cancel();
    const go = () => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang; u.rate = rate;
      u.onend = () => {
        this._loopTimer = setTimeout(go, 500);
      };
      window.speechSynthesis.speak(u);
    };
    go();
    // returns a stop function via cancel()
  },
};

// Small listen-button pair — 1회 + 반복(토글)
function ListenButtons({ text, palette, size = 'sm', accent = 'mine' }) {
  const c = palette;
  const [looping, setLooping] = React.useState(false);

  // Stop loop on unmount
  React.useEffect(() => () => {
    if (looping && window.CT_SPEAK) window.CT_SPEAK.cancel();
  }, [looping]);

  const tone = accent === 'me'
    ? { bg: 'rgba(255,255,255,0.18)', fg: '#fff', activeBg: '#fff', activeFg: c.primary }
    : accent === 'ai'
    ? { bg: c.aiSoft, fg: c.ai, activeBg: c.ai, activeFg: '#fff' }
    : { bg: c.bg, fg: c.ink2, activeBg: c.primary, activeFg: '#fff' };

  const padding = size === 'xs' ? '3px 7px' : '4px 9px';
  const fontSize = size === 'xs' ? 10 : 11;
  const iconSize = size === 'xs' ? 11 : 13;

  function playOnce(e) {
    e.stopPropagation();
    setLooping(false);
    window.CT_SPEAK.once(text);
  }
  function toggleLoop(e) {
    e.stopPropagation();
    if (looping) {
      window.CT_SPEAK.cancel();
      setLooping(false);
    } else {
      setLooping(true);
      window.CT_SPEAK.loop(text);
    }
  }

  const Btn = ({ active, onClick, icon, label }) => (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding, borderRadius: 999, border: 'none', cursor: 'pointer',
      background: active ? tone.activeBg : tone.bg,
      color: active ? tone.activeFg : tone.fg,
      fontSize, fontWeight: 700,
      transition: 'all .12s',
    }}>
      <span style={{ width: iconSize, height: iconSize, display: 'inline-flex', alignItems: 'center' }}>{icon}</span>
      {label && <span>{label}</span>}
    </button>
  );

  const speakIcon = (
    <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5L6 9H2v6h4l5 4V5z"/>
      <path d="M15.5 8.5a4 4 0 0 1 0 7"/>
      <path d="M19 5a8 8 0 0 1 0 14"/>
    </svg>
  );
  const repeatIcon = (
    <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9"/>
      <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
      <polyline points="7 23 3 19 7 15"/>
      <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>
  );

  return (
    <div style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      <Btn onClick={playOnce} icon={speakIcon} label={size === 'xs' ? null : '듣기'} />
      <Btn active={looping} onClick={toggleLoop} icon={repeatIcon} label={size === 'xs' ? null : (looping ? '재생중 · 탭하면 정지' : '반복')} />
    </div>
  );
}

window.ListenButtons = ListenButtons;
