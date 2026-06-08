// Voice Mode — full-screen overlay for face-to-face spoken conversation.
//
// Mental model:
// • You're standing next to / across from someone. Phone between you.
// • Two big halves: top = "내 차례" (Korean → English audio TO them),
//                   bottom = "상대 차례" (English → Korean text FOR me).
// • Big tap-to-talk button in the middle. Long-press = continuous listen.
// • Live waveform / pulsing while listening. Live transcription as it streams.
// • TTS speaks the translation out loud so the other person hears English.

function VoiceMode({ palette, dark, onClose, onLog, target = 'EN', native = 'KO' }) {
  const c = palette;
  const I = window.CT_ICONS;

  const targetLang = window.CT_LANG.byCode(target);  // conversation language (the OTHER person)
  const nativeLang = window.CT_LANG.byCode(native);  // my own language

  // active = which side is currently speaking ('me' | 'them' | null)
  const [active, setActive] = React.useState(null);
  const [recordMode, setRecordMode] = React.useState('tap');
  // live transcription
  const [myInterim, setMyInterim] = React.useState('');
  const [myFinal, setMyFinal] = React.useState('');
  const [myTrans, setMyTrans] = React.useState('');
  const [themInterim, setThemInterim] = React.useState('');
  const [themFinal, setThemFinal] = React.useState('');
  const [themTrans, setThemTrans] = React.useState('');
  const [translating, setTranslating] = React.useState(false);
  const [sttSupported] = React.useState(() => window.CT_RECOGNIZE && window.CT_RECOGNIZE.supported());

  const recRef = React.useRef(null);

  // Stop any active recognition on unmount.
  React.useEffect(() => () => { if (recRef.current) recRef.current.abort(); }, []);

  // Translate helper using Claude.
  async function translate(text, fromLang, toLang) {
    try {
      const res = await window.CT_API.complete(
        `Translate this ${fromLang.native} to natural ${toLang.native} (polite, conversational register). Output only the ${toLang.native} translation — no quotes, no explanation.\n\n${fromLang.native}: ${text}`
      );
      return String(res).trim().replace(/^["'`]|["'`]$/g, '');
    } catch (e) {
      return '(translation unavailable)';
    }
  }

  // Finalize a turn: translate + TTS + log.
  async function finalizeTurn(side, spoken) {
    if (!spoken || !spoken.trim()) { setActive(null); return; }
    setTranslating(true);
    // me: speak native → translate to target → TTS target aloud (for the other person)
    // them: speak target → translate to native → show to me
    const fromLang = side === 'me' ? nativeLang : targetLang;
    const toLang   = side === 'me' ? targetLang : nativeLang;
    const out = await translate(spoken, fromLang, toLang);
    if (side === 'me') {
      setMyTrans(out);
      window.CT_SPEAK && window.CT_SPEAK.once(out, toLang.locale);
    } else {
      setThemTrans(out);
    }
    setTranslating(false);
    setActive(null);
    onLog && onLog(side === 'me'
      ? { side: 'me', orig: spoken, trans: out, inputKind: 'foreign' }
      : { side: 'them', orig: spoken, trans: out });
  }

  // Start/stop real speech recognition for a side.
  function toggleListening(side) {
    // If already listening on this side → stop.
    if (active === side && recRef.current) {
      recRef.current.stop();
      return;
    }
    if (active) return; // other side busy

    if (!sttSupported) {
      // Graceful fallback: no STT engine. Inform the user.
      alert('이 브라우저는 음성 인식을 지원하지 않아요. Chrome 또는 Safari에서 사용해 주세요. (텍스트 입력은 채팅 화면에서 가능합니다)');
      return;
    }

    // Reset this side's text.
    if (side === 'me') { setMyInterim(''); setMyFinal(''); setMyTrans(''); }
    else { setThemInterim(''); setThemFinal(''); setThemTrans(''); }

    const locale = side === 'me' ? nativeLang.locale : targetLang.locale;
    const rec = window.CT_RECOGNIZE.create(locale, {
      continuous: recordMode === 'hands-free',
      onInterim: (t) => { side === 'me' ? setMyInterim(t) : setThemInterim(t); },
      onFinal:   (t) => { side === 'me' ? setMyFinal(t) : setThemFinal(t); },
      onError:   (err) => {
        setActive(null);
        if (err === 'not-allowed' || err === 'service-not-allowed') {
          alert('마이크 권한이 필요해요. 브라우저 설정에서 마이크를 허용해 주세요.');
        }
      },
      onEnd: (finalText) => {
        if (side === 'me') setMyInterim('');
        else setThemInterim('');
        finalizeTurn(side, finalText);
        recRef.current = null;
      },
    });
    if (!rec) return;
    recRef.current = rec;
    setActive(side);
    rec.start();
  }

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: c.bg, color: c.ink,
      display: 'flex', flexDirection: 'column',
      animation: 'voiceModeIn .25s ease-out',
    }}>
      <style>{`
        @keyframes voiceModeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes voicePulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.04); opacity: 0.85; } }
        @keyframes voiceBar { 0%,100% { height: 18%; } 50% { height: 100%; } }
      `}</style>

      {/* Header */}
      <div style={{
        flexShrink: 0, padding: '14px 16px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: c.surface, borderBottom: `1px solid ${c.divider}`,
      }}>
        <button onClick={onClose} style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, color: c.ink2,
          padding: '6px 10px 6px 6px', borderRadius: 999,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          채팅으로
        </button>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 12, fontWeight: 700, color: c.primary,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: 999, background: c.primary,
            animation: 'voicePulse 1.2s infinite',
          }} />
          보이스 모드 · 실시간 통역
        </div>
        <button style={{
          width: 32, height: 32, borderRadius: 999, border: 'none', background: 'transparent',
          color: c.ink2, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{I.settings}</button>
      </div>

      {/* MY HALF — top: I speak my own language → other person hears target */}
      <VoicePanel
        c={c} side="me"
        active={active === 'me'}
        title={`내 차례 · ${nativeLang.name}`}
        subtitle={`누르고 ${nativeLang.name}로 말하면 상대에게 ${targetLang.name}로 들려줍니다`}
        srcLang={nativeLang.name}
        tgtLang={targetLang.name}
        interim={myInterim}
        finalText={myFinal}
        translation={myTrans}
        translating={translating && active === 'me'}
        onTap={() => toggleListening('me')}
        privateLabel={`내 ${nativeLang.name} 원문 — 나만 보임`}
        publicLabel={`상대에게 들리는 ${targetLang.name}`}
        listening={active === 'me'}
        ttsLocale={targetLang.locale}
      />

      {/* divider with central control */}
      <div style={{
        position: 'relative', flexShrink: 0,
        background: c.surface, padding: '14px 16px',
        borderTop: `1px solid ${c.divider}`,
        borderBottom: `1px solid ${c.divider}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 8,
      }}>
        {/* mode pill */}
        <div style={{
          display: 'flex', gap: 2, background: c.bg, borderRadius: 999, padding: 3,
          border: `1px solid ${c.divider}`, fontSize: 11, fontWeight: 700,
        }}>
          <button onClick={() => setRecordMode('tap')} style={{
            padding: '4px 10px', border: 'none', cursor: 'pointer',
            background: recordMode === 'tap' ? c.primary : 'transparent',
            color: recordMode === 'tap' ? '#fff' : c.ink2, borderRadius: 999,
          }}>탭해서 말하기</button>
          <button onClick={() => setRecordMode('hands-free')} style={{
            padding: '4px 10px', border: 'none', cursor: 'pointer',
            background: recordMode === 'hands-free' ? c.primary : 'transparent',
            color: recordMode === 'hands-free' ? '#fff' : c.ink2, borderRadius: 999,
          }}>핸즈프리</button>
        </div>
      </div>

      {/* THEIR HALF — bottom: other person speaks target → I read my own language */}
      <VoicePanel
        c={c} side="them"
        active={active === 'them'}
        title={`상대 차례 · ${targetLang.name}`}
        subtitle={`상대가 ${targetLang.name}로 말하면 ${nativeLang.name}로 보여줍니다`}
        srcLang={targetLang.name}
        tgtLang={nativeLang.name}
        interim={themInterim}
        finalText={themFinal}
        translation={themTrans}
        translating={translating && active === 'them'}
        onTap={() => toggleListening('them')}
        privateLabel={`실제 들린 ${targetLang.name}`}
        publicLabel={`내가 보는 ${nativeLang.name} 번역 — 나만 보임`}
        listening={active === 'them'}
        ttsLocale={nativeLang.locale}
      />
    </div>
  );
}

// ── One half-panel ──────────────────────────────────────────────────────
function VoicePanel({ c, side, active, title, subtitle, srcLang, tgtLang, interim, finalText, translation, translating, onTap, privateLabel, publicLabel, listening, ttsLocale }) {
  const isMe = side === 'me';
  const accent = isMe ? c.primary : c.accent2;
  const accentSoft = isMe ? c.primarySoft : (c.themAvatarBg);
  const hasContent = !!(interim || finalText || translation);
  const scrollRef = window.useDragScroll();
  return (
    <div style={{
      flex: 1, minHeight: 0, position: 'relative',
      padding: '14px 16px 12px',
      background: active ? (isMe ? c.primarySoft : c.bg) : 'transparent',
      display: 'flex', flexDirection: 'column', gap: 10,
      transition: 'background .25s',
    }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 11, fontWeight: 800, color: accent,
            letterSpacing: 0.5, textTransform: 'uppercase',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: 999, background: accent,
              animation: active ? 'voicePulse 1.1s infinite' : 'none',
            }} />
            {title}
          </div>
          <div style={{ fontSize: 11, color: c.ink3, marginTop: 2 }}>{subtitle}</div>
        </div>
        {/* lang flow */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 10, fontWeight: 700, color: c.ink3,
        }}>
          {srcLang}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>
          {tgtLang}
        </div>
      </div>

      {/* live area */}
      <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* source (what was spoken) */}
        <div style={{
          padding: '10px 12px', borderRadius: 12,
          background: c.surface, border: `1px solid ${c.divider}`,
          fontSize: 14, lineHeight: 1.45, color: c.ink, fontWeight: 500,
          minHeight: 50, position: 'relative',
        }}>
          <div style={{
            fontSize: 9, fontWeight: 800, color: c.ink3, letterSpacing: 0.5,
            textTransform: 'uppercase', marginBottom: 4,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            {privateLabel.includes('나만') && (
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
              </svg>
            )}
            {privateLabel}
          </div>
          {(finalText || interim) ? (
            <span>
              {finalText}
              {interim && <span style={{ color: c.ink3, fontStyle: 'italic' }}>{interim}</span>}
              {active && <span style={{
                display: 'inline-block', width: 2, height: 16,
                background: accent, marginLeft: 2, verticalAlign: 'middle',
                animation: 'voicePulse .6s infinite',
              }} />}
            </span>
          ) : (
            <span style={{ color: c.ink3, fontStyle: 'italic' }}>
              {active ? '듣는 중…' : '눌러서 말하기'}
            </span>
          )}
        </div>

        {/* translation (what the other side gets) */}
        <div style={{
          padding: '10px 12px', borderRadius: 12,
          background: isMe ? c.primary : c.surface,
          color: isMe ? c.primaryInk : c.ink,
          border: isMe ? 'none' : `1.5px solid ${c.accent2}55`,
          fontSize: 16, lineHeight: 1.4, fontWeight: 600,
          minHeight: 56, position: 'relative',
        }}>
          <div style={{
            fontSize: 9, fontWeight: 800,
            color: isMe ? 'rgba(255,255,255,0.85)' : c.accent2,
            letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            {publicLabel.includes('나만') && (
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
              </svg>
            )}
            {isMe && !publicLabel.includes('나만') && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19 5a8 8 0 0 1 0 14"/>
              </svg>
            )}
            {publicLabel}
          </div>
          {translation ? (
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ flex: 1 }}>{translation}</span>
              {/* replay listen — only useful for the translated side */}
              <button onClick={(e) => {
                e.stopPropagation();
                window.CT_SPEAK && window.CT_SPEAK.once(translation, ttsLocale || 'en-US');
              }} style={{
                width: 32, height: 32, borderRadius: 999, border: 'none', flexShrink: 0,
                background: isMe ? 'rgba(255,255,255,0.22)' : c.bg,
                color: isMe ? '#fff' : c.ink2, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }} title="다시 듣기">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a4 4 0 0 1 0 7"/></svg>
              </button>
            </div>
          ) : translating ? (
            <span style={{ opacity: 0.7, fontStyle: 'italic' }}>번역 중…</span>
          ) : (
            <span style={{ opacity: 0.5, fontStyle: 'italic', fontWeight: 500 }}>
              {isMe ? '상대에게 자동으로 들려줍니다' : '여기에 한글 번역이 나옵니다'}
            </span>
          )}
        </div>
      </div>

      {/* tap-to-talk button */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
        <button onClick={onTap} disabled={!!active && !active} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          height: 56, padding: '0 20px 0 18px', borderRadius: 999, border: 'none',
          background: active ? '#D32F2F' : accent, color: '#fff',
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
          boxShadow: active ? '0 4px 14px #D32F2F66' : `0 4px 14px ${accent}66`,
          transition: 'all .15s',
        }}>
          {/* mic + waveform */}
          {active ? (
            <span style={{
              display: 'inline-flex', alignItems: 'flex-end', gap: 2,
              height: 18, width: 24,
            }}>
              {[0, 1, 2, 3, 4].map(i => (
                <span key={i} style={{
                  width: 3, background: '#fff', borderRadius: 2,
                  animation: `voiceBar .${[7,9,6,8,7][i]}s infinite ${i * 0.08}s`,
                }} />
              ))}
            </span>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>
            </svg>
          )}
          {active ? '듣는 중 · 탭해서 멈추기' : (isMe ? '한국어로 말하기' : '상대 영어 듣기')}
        </button>
      </div>
    </div>
  );
}

window.VoiceMode = VoiceMode;
