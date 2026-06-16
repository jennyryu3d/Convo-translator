// Speech helpers + small reusable listen-buttons (once / repeat).
// Repeat plays until user taps stop.
//
// Voice quality: the browser's SpeechSynthesis exposes the OS/Chrome voices,
// which on modern platforms include Google's natural (neural) voices. We
// auto-pick the most natural one per language, and let the user override the
// choice in Settings (stored per language in localStorage).

window.CT_SPEAK = {
  _loopTimer: null,
  _voices: [],
  _defaultLang: 'en-US',
  _prefKey: 'ct_voice_prefs_v1',   // { en: '<voiceURI>', ko: '...' } keyed by 2-letter language

  init() {
    if (!window.speechSynthesis) return;
    const load = () => { try { this._voices = window.speechSynthesis.getVoices() || []; } catch (e) {} };
    load();
    // Voices frequently populate asynchronously after first call.
    try { window.speechSynthesis.addEventListener('voiceschanged', load); }
    catch (e) { window.speechSynthesis.onvoiceschanged = load; }
  },

  // The app sets this to the conversation language so every "listen" button
  // (suggestions, word popup, etc.) speaks in the right language by default.
  setDefaultLang(locale) { if (locale) this._defaultLang = locale; },

  // All installed voices for a language (matched by 2-letter prefix).
  voicesFor(locale) {
    const pre = String(locale || this._defaultLang).slice(0, 2).toLowerCase();
    return (this._voices || []).filter(v => String(v.lang || '').slice(0, 2).toLowerCase() === pre);
  },

  _prefs() { try { return JSON.parse(localStorage.getItem(this._prefKey) || '{}'); } catch (e) { return {}; } },
  getPref(locale) { return this._prefs()[String(locale || this._defaultLang).slice(0, 2).toLowerCase()] || ''; },
  setPref(locale, voiceURI) {
    const key = String(locale || this._defaultLang).slice(0, 2).toLowerCase();
    const p = this._prefs();
    if (voiceURI) p[key] = voiceURI; else delete p[key];
    try { localStorage.setItem(this._prefKey, JSON.stringify(p)); } catch (e) {}
  },

  // The user's pick for this language if set, else the most natural available
  // voice (Google / Natural / Neural / Enhanced, exact locale, cloud-backed).
  _pickVoice(locale) {
    const list = this.voicesFor(locale);
    if (!list.length) return null;
    const pref = this.getPref(locale);
    if (pref) { const m = list.find(v => v.voiceURI === pref || v.name === pref); if (m) return m; }
    const want = String(locale || this._defaultLang).toLowerCase();
    const score = (v) => {
      let s = 0; const n = String(v.name || '').toLowerCase();
      if (n.includes('google')) s += 5;
      if (/natural|neural|enhanced|premium|wavenet|siri/.test(n)) s += 4;
      if (String(v.lang || '').toLowerCase() === want) s += 2;
      if (v.localService === false) s += 1;   // cloud voices tend to sound better
      if (v.default) s += 0.5;
      return s;
    };
    return list.slice().sort((a, b) => score(b) - score(a))[0];
  },

  _utter(text, lang, rate) {
    const u = new SpeechSynthesisUtterance(text);
    const voice = this._pickVoice(lang);
    if (voice) { u.voice = voice; u.lang = voice.lang; }
    else { u.lang = lang || this._defaultLang; }
    u.rate = rate;
    return u;
  },

  cancel() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (this._loopTimer) { clearTimeout(this._loopTimer); this._loopTimer = null; }
  },
  once(text, lang, rate = 0.95) {
    if (!window.speechSynthesis) return;
    this.cancel();
    window.speechSynthesis.speak(this._utter(text, lang || this._defaultLang, rate));
  },
  loop(text, lang, rate = 0.9, onStop) {
    if (!window.speechSynthesis) return;
    this.cancel();
    const go = () => {
      const u = this._utter(text, lang || this._defaultLang, rate);
      u.onend = () => { this._loopTimer = setTimeout(go, 500); };
      window.speechSynthesis.speak(u);
    };
    go();
    // returns a stop function via cancel()
  },
};
window.CT_SPEAK.init();


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
