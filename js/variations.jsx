// 6 visually DISTINCT suggestion display variations.
// Each uses a unique layout metaphor so the differences are obvious at a glance.
// All share: violet AI identity, English-prominent, Korean as muted gloss.

const TONE_COLOR = {
  '긍정': { light: { bg: '#E6F4EA', ink: '#1E7A3E', accent: '#34A853' }, dark: { bg: '#1F3A28', ink: '#7AD18E', accent: '#4ABA68' } },
  '동의': { light: { bg: '#E6F4EA', ink: '#1E7A3E', accent: '#34A853' }, dark: { bg: '#1F3A28', ink: '#7AD18E', accent: '#4ABA68' } },
  '보류': { light: { bg: '#FFF4E0', ink: '#9C5A00', accent: '#E89A2B' }, dark: { bg: '#3D2C12', ink: '#FFC97A', accent: '#FFB94A' } },
  '요청': { light: { bg: '#E8F0FE', ink: '#1A5BAA', accent: '#4285F4' }, dark: { bg: '#15273E', ink: '#8DB4F8', accent: '#5A91F0' } },
  '질문': { light: { bg: '#E8F0FE', ink: '#1A5BAA', accent: '#4285F4' }, dark: { bg: '#15273E', ink: '#8DB4F8', accent: '#5A91F0' } },
  '제안': { light: { bg: '#FCE7F3', ink: '#9D174D', accent: '#EC4899' }, dark: { bg: '#3D1B2D', ink: '#F8A8C8', accent: '#E16BA4' } },
  '대안': { light: { bg: '#FCE7F3', ink: '#9D174D', accent: '#EC4899' }, dark: { bg: '#3D1B2D', ink: '#F8A8C8', accent: '#E16BA4' } },
};
function toneTint(tone, dark) {
  const t = TONE_COLOR[tone] || TONE_COLOR['긍정'];
  return dark ? t.dark : t.light;
}

const sparkleIcon = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5z"/>
    <path d="M19 14l.7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7z"/>
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════
// V1 — KEYBOARD STRIP
// Inline single-row chips, like Gboard. Very compact, English only.
// ═══════════════════════════════════════════════════════════════════════
function SuggKeyboardStrip({ palette, suggestions, dark, max = 3, onPick }) {
  const c = palette;
  const list = suggestions.slice(0, max);
  return (
    <div style={{
      marginTop: 8, padding: '6px 10px',
      background: c.aiSoft, borderRadius: 999,
      border: `1px solid ${c.ai}33`,
      display: 'flex', alignItems: 'center', gap: 6,
      overflowX: 'auto', scrollbarWidth: 'none',
    }}>
      <span style={{
        flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 3,
        color: c.ai, fontSize: 10, fontWeight: 800, letterSpacing: 0.4,
        padding: '2px 6px',
      }}>
        {sparkleIcon} AI
      </span>
      <div style={{
        width: 1, height: 14, background: c.ai, opacity: 0.3, flexShrink: 0,
      }} />
      {list.map((s, i) => (
        <button key={i} onClick={() => onPick?.(s)} style={{
          flexShrink: 0, border: 'none', cursor: 'pointer',
          background: c.surface, color: c.ink,
          fontSize: 12, fontWeight: 500,
          padding: '5px 12px', borderRadius: 999,
          boxShadow: `0 1px 2px rgba(0,0,0,0.06), inset 0 0 0 1px ${c.divider}`,
          whiteSpace: 'nowrap',
          maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis',
        }} title={s.ko}>
          {s.en.length > 30 ? s.en.slice(0, 28) + '…' : s.en}
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// V2 — NUMBERED STACK (the "loud" one)
// Big violet tray + chunky numbered cards. Highest visual priority.
// ═══════════════════════════════════════════════════════════════════════
function SuggNumberedStack({ palette, suggestions, dark, max = 3, onPick }) {
  const c = palette;
  const list = suggestions.slice(0, max);
  return (
    <div style={{
      marginTop: 12, padding: '14px 14px 14px',
      background: c.aiSoft,
      borderRadius: 18, border: `2px solid ${c.ai}`,
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: -11, left: 16,
        background: c.ai, color: '#fff',
        padding: '4px 12px', borderRadius: 999,
        fontSize: 10, fontWeight: 800, letterSpacing: 0.6,
        display: 'flex', alignItems: 'center', gap: 4,
        boxShadow: `0 4px 10px ${c.ai}55`,
      }}>
        {sparkleIcon} AI 제안 · 번호로 빠른 선택
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
        {list.map((s, i) => (
          <button key={i} onClick={() => onPick?.(s)} style={{
            textAlign: 'left', cursor: 'pointer', border: 'none',
            background: c.surface, borderRadius: 14, padding: '12px 14px 12px 12px',
            display: 'flex', alignItems: 'stretch', gap: 12,
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          }}>
            <div style={{
              width: 36, flexShrink: 0,
              background: `linear-gradient(135deg, ${c.ai}, ${c.aiDeep || c.ai})`,
              color: '#fff', borderRadius: 10,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{i + 1}</div>
              <div style={{ fontSize: 8, fontWeight: 700, opacity: 0.9, marginTop: 1 }}>탭</div>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 14, color: c.ink, fontWeight: 600, lineHeight: 1.4 }}>{s.en}</div>
              <div style={{ fontSize: 11, color: c.ink3, lineHeight: 1.35, marginTop: 3 }}>{s.ko}</div>
              <div style={{
                display: 'inline-block', marginTop: 6,
                fontSize: 9, fontWeight: 700, color: c.ai,
                background: c.aiSoft, padding: '2px 7px', borderRadius: 4,
                letterSpacing: 0.4, textTransform: 'uppercase',
              }}>{s.tone}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// V3 — CARD DECK (one at a time)
// One large card visible. Prev/next arrows + page dots. Like Tinder.
// ═══════════════════════════════════════════════════════════════════════
function SuggCardDeck({ palette, suggestions, dark, max = 3, onPick, pickedIdx = null, locked = false }) {
  const c = palette;
  const TT = window.TappableText || (({ text }) => <span>{text}</span>);
  const list = suggestions.slice(0, max);
  // Start the carousel on the picked card if there is one.
  const [idx, setIdx] = React.useState(typeof pickedIdx === 'number' ? pickedIdx : 0);
  const s = list[idx];
  const isPicked = pickedIdx === idx;
  const anyPicked = typeof pickedIdx === 'number';
  // Selected card uses cyan (mine) color; unselected use AI deep-navy.
  const cardBg = isPicked ? c.mine : c.ai;
  const cardInk = isPicked ? (c.mineInk || '#002854') : (c.aiInk || '#fff');
  return (
    <div style={{ marginTop: 10, padding: 14, background: 'transparent' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 8,
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 10, fontWeight: 800, color: c.ai, letterSpacing: 0.6,
          textTransform: 'uppercase',
        }}>
          {sparkleIcon} AI 제안 · {idx + 1}/{list.length}
          {anyPicked && <span style={{ color: c.accent2, marginLeft: 4 }}>· 선택됨</span>}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {list.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} style={{
              width: i === idx ? 18 : 8, height: 8, borderRadius: 999,
              border: 'none', cursor: 'pointer',
              background: i === pickedIdx ? c.accent2 : (i === idx ? c.ai : c.divider),
              transition: 'all .2s',
            }} />
          ))}
        </div>
      </div>
      <div style={{ position: 'relative', perspective: 800 }}>
        {idx < list.length - 1 && (
          <div style={{
            position: 'absolute', inset: 0, top: 8, left: 6, right: 6,
            background: cardBg, borderRadius: 16,
            opacity: 0.4, zIndex: 0, transform: 'scale(0.96)',
          }} />
        )}
        <div style={{
          position: 'relative', zIndex: 1,
          background: cardBg, borderRadius: 16,
          padding: '16px 16px 14px',
          boxShadow: `0 8px 24px ${cardBg}55`,
          outline: isPicked ? `2px solid ${c.accent2}` : 'none',
          outlineOffset: 2,
        }}>
          {isPicked && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 9, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase',
              color: cardInk, opacity: 0.85, marginBottom: 6,
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-11"/></svg>
              내가 선택한 답변
            </div>
          )}
          <div style={{
            fontSize: 17, color: cardInk, fontWeight: 700, lineHeight: 1.4,
            letterSpacing: '-0.2px', marginBottom: 8,
          }}><TT text={s.en} lang="target" id={`sugg-en-${idx}`} /></div>
          <div style={{
            fontSize: 13, color: cardInk, opacity: 0.95, lineHeight: 1.45,
            paddingTop: 8, borderTop: `1px dashed ${cardInk}55`,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8,
          }}>
            <span style={{ flex: 1 }}><TT text={s.ko} lang="native" id={`sugg-ko-${idx}`} /></span>
            {/* Speaker button — plays the target-language (en) sentence */}
            <button onClick={(e) => { e.stopPropagation(); window.CT_SPEAK && window.CT_SPEAK.once(s.en); }} style={{
              flexShrink: 0, width: 30, height: 30, borderRadius: 999, border: 'none', cursor: 'pointer',
              background: isPicked ? 'rgba(0,40,84,0.12)' : 'rgba(255,255,255,0.18)',
              color: cardInk, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }} title="듣기" aria-label="듣기">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a4 4 0 0 1 0 7"/><path d="M19 5a8 8 0 0 1 0 14"/></svg>
            </button>
          </div>
        </div>
      </div>
      {/* control row */}
      <div style={{
        display: 'flex', alignItems: 'stretch', marginTop: 12,
        borderRadius: 999, overflow: 'hidden',
        background: `linear-gradient(90deg, ${c.aiDeep || c.ai} 0%, ${c.ai} 28%, ${c.ai} 72%, ${c.aiDeep || c.ai} 100%)`,
        boxShadow: `0 6px 18px ${c.ai}66, inset 0 1px 0 rgba(255,255,255,0.25)`,
        opacity: (locked && !isPicked) ? 0.92 : 1,
      }}>
        <button onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0} style={{
          width: 50, border: 'none', cursor: idx === 0 ? 'default' : 'pointer',
          background: 'transparent', color: '#fff', opacity: idx === 0 ? 0.3 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          filter: idx === 0 ? 'none' : 'drop-shadow(0 0 5px rgba(255,255,255,0.9))',
        }} aria-label="이전 답변">
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        <button onClick={() => { if (!(locked && !isPicked)) onPick?.(s, idx); }}
          disabled={locked && !isPicked}
          style={{
            flex: 1, height: 48, border: 'none',
            cursor: (locked && !isPicked) ? 'default' : 'pointer',
            background: 'transparent', color: '#fff',
            fontSize: 14, fontWeight: 800, letterSpacing: '0.01em',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          }}>
          {isPicked ? '선택한 답변' : locked ? '지난 제안' : '이 답변 사용하기'}
          {!locked && !isPicked && (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>
          )}
          {isPicked && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-11"/></svg>
          )}
        </button>

        <button onClick={() => setIdx(Math.min(list.length - 1, idx + 1))} disabled={idx === list.length - 1} style={{
          width: 50, border: 'none', cursor: idx === list.length - 1 ? 'default' : 'pointer',
          background: 'transparent', color: '#fff', opacity: idx === list.length - 1 ? 0.3 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          filter: idx === list.length - 1 ? 'none' : 'drop-shadow(0 0 5px rgba(255,255,255,0.9))',
        }} aria-label="다음 답변">
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// V4 — SPEECH BALLOONS (Character)
// Mascot on the left "saying" each option as a speech bubble with a TAIL.
// ═══════════════════════════════════════════════════════════════════════
function SuggSpeechBalloons({ palette, suggestions, dark, max = 3, onPick }) {
  const c = palette;
  const list = suggestions.slice(0, max);
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 10, fontWeight: 800, color: c.ai, letterSpacing: 0.6,
        textTransform: 'uppercase', marginLeft: 4, marginBottom: 6,
      }}>
        {sparkleIcon} AI 제안
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
        <div style={{ flexShrink: 0, paddingTop: 12 }}>
          <Mascot mood="pointing" size={56} dark={dark} />
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {list.map((s, i) => {
            const tt = toneTint(s.tone, dark);
            return (
              <button key={i} onClick={() => onPick?.(s)} style={{
                position: 'relative', textAlign: 'left', cursor: 'pointer', border: 'none',
                background: c.aiSoft,
                borderRadius: i === 0 ? '4px 16px 16px 16px' : '16px',
                padding: '10px 14px',
                boxShadow: `inset 0 0 0 1.5px ${c.ai}55`,
              }}>
                {/* tail pointing to mascot — only on first one */}
                {i === 0 && (
                  <svg width="10" height="14" viewBox="0 0 10 14" style={{
                    position: 'absolute', left: -8, top: 6,
                  }}>
                    <path d="M10 0 L0 7 L10 14 Z" fill={c.aiSoft} stroke={c.ai} strokeWidth="1.5" strokeOpacity="0.35" />
                  </svg>
                )}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4,
                }}>
                  <span style={{
                    fontSize: 9, fontWeight: 800, color: tt.ink, background: tt.bg,
                    padding: '2px 7px', borderRadius: 4, letterSpacing: 0.4,
                  }}>{s.tone}</span>
                  <span style={{ fontSize: 10, color: c.ai, fontWeight: 700 }}>"이렇게 답해 봐요!"</span>
                </div>
                <div style={{ fontSize: 14, color: c.ink, fontWeight: 600, lineHeight: 1.4 }}>{s.en}</div>
                <div style={{ fontSize: 11, color: c.ink3, lineHeight: 1.4, marginTop: 3 }}>{s.ko}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// V5 — 3-CELL TILE GRID
// 3 equal squares side by side. Most "tap-it-now" feel. Minimal text per tile.
// ═══════════════════════════════════════════════════════════════════════
function SuggTileGrid({ palette, suggestions, dark, max = 3, onPick }) {
  const c = palette;
  const list = suggestions.slice(0, Math.min(max, 3)); // grid works best with 3
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 6,
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 10, fontWeight: 800, color: c.ai, letterSpacing: 0.6,
          textTransform: 'uppercase',
        }}>
          {sparkleIcon} 3가지 방향 · 하나만 탭하세요
        </span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${list.length}, 1fr)`,
        gap: 6,
      }}>
        {list.map((s, i) => {
          const tt = toneTint(s.tone, dark);
          return (
            <button key={i} onClick={() => onPick?.(s)} style={{
              textAlign: 'left', cursor: 'pointer', border: 'none',
              background: c.surface,
              borderRadius: 14, padding: '10px 10px 12px',
              borderTop: `4px solid ${tt.accent}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px ' + c.divider,
              minHeight: 130,
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{
                display: 'inline-block', alignSelf: 'flex-start',
                fontSize: 9, fontWeight: 800, color: tt.ink, background: tt.bg,
                padding: '2px 6px', borderRadius: 4, letterSpacing: 0.4,
                marginBottom: 6,
              }}>{s.tone}</div>
              <div style={{
                fontSize: 12, color: c.ink, fontWeight: 600, lineHeight: 1.35,
                flex: 1,
              }}>{s.en}</div>
              <div style={{
                fontSize: 10, color: c.ink3, lineHeight: 1.35, marginTop: 6,
                paddingTop: 6, borderTop: `1px dashed ${c.divider}`,
              }}>{s.ko}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// V6 — BRANCH PATHS (Conversation Tree)
// Visual fork: one root → 3 diverging branches. Emphasizes that
// each choice leads the conversation in a different direction.
// ═══════════════════════════════════════════════════════════════════════
function SuggBranchPaths({ palette, suggestions, dark, max = 3, onPick }) {
  const c = palette;
  const list = suggestions.slice(0, max);
  return (
    <div style={{
      marginTop: 10, padding: 12,
      background: c.aiSoft, borderRadius: 16,
      border: `1px dashed ${c.ai}66`,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
        fontSize: 10, fontWeight: 800, color: c.ai, letterSpacing: 0.6,
        textTransform: 'uppercase',
      }}>
        {sparkleIcon} 대화가 갈라지는 3가지 길
      </div>
      {/* The fork visual */}
      <div style={{ position: 'relative' }}>
        {/* root node */}
        <div style={{
          width: 12, height: 12, borderRadius: 999, background: c.ai,
          margin: '0 auto 6px', boxShadow: `0 0 0 4px ${c.ai}33`,
        }} />
        {/* branches */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {list.map((s, i) => {
            const tt = toneTint(s.tone, dark);
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'stretch', gap: 0,
              }}>
                {/* branch line */}
                <div style={{
                  width: 36, flexShrink: 0, position: 'relative',
                }}>
                  <svg width="36" height="100%" viewBox="0 0 36 60" preserveAspectRatio="none"
                    style={{ position: 'absolute', top: 0, left: 0 }}>
                    <path
                      d={`M 18 -10 Q 18 20 32 ${i === 0 ? 22 : 30}`}
                      stroke={tt.accent} strokeWidth="2" fill="none"
                      strokeLinecap="round"
                      strokeDasharray="4 3"
                    />
                    <circle cx="32" cy={i === 0 ? 22 : 30} r="4" fill={tt.accent} />
                  </svg>
                </div>
                <button onClick={() => onPick?.(s)} style={{
                  flex: 1, textAlign: 'left', cursor: 'pointer', border: 'none',
                  background: c.surface, borderRadius: 12, padding: '10px 12px',
                  borderLeft: `3px solid ${tt.accent}`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 9, fontWeight: 800, color: tt.ink, background: tt.bg,
                    padding: '2px 7px', borderRadius: 4, marginBottom: 4,
                    letterSpacing: 0.4, textTransform: 'uppercase',
                  }}>
                    {s.tone} 방향
                  </div>
                  <div style={{ fontSize: 13, color: c.ink, fontWeight: 600, lineHeight: 1.4 }}>{s.en}</div>
                  <div style={{ fontSize: 11, color: c.ink3, lineHeight: 1.35, marginTop: 2 }}>{s.ko}</div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Router
function SuggestionDisplay({ variant, palette, suggestions, dark, max = 3, onPick, pickedIdx = null, locked = false }) {
  if (!suggestions || !suggestions.length) return null;
  const map = {
    chips: SuggKeyboardStrip,
    numbered: SuggNumberedStack,
    carousel: SuggCardDeck,
    mascot: SuggSpeechBalloons,
    sticky: SuggTileGrid,
    tabbed: SuggBranchPaths,
  };
  const Cmp = map[variant] || SuggCardDeck;
  return <Cmp palette={palette} suggestions={suggestions} dark={dark} max={max} onPick={onPick} pickedIdx={pickedIdx} locked={locked} />;
}

Object.assign(window, {
  SuggKeyboardStrip, SuggNumberedStack, SuggCardDeck, SuggSpeechBalloons, SuggTileGrid, SuggBranchPaths,
  SuggestionDisplay, toneTint,
});
