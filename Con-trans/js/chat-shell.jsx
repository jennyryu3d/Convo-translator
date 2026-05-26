// Shared chat shell — top bar, message bubble, input bar, common SVG icons.

const I = {
  swap: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4v16M7 4l-3 3M7 4l3 3M17 20V4m0 16l3-3m-3 3l-3-3"/></svg>,
  mic: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>,
  send: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l14-7-5 16-4-7-5-2z"/></svg>,
  speak: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5zM15 9a3 3 0 0 1 0 6M18 6a7 7 0 0 1 0 12"/></svg>,
  copy: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  star: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2"/></svg>,
  starFilled: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2"/></svg>,
  sparkle: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5z"/><path d="M19 14l.7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7z"/></svg>,
  ear: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 4-3 5-3 8a3 3 0 0 1-6 0 3 3 0 0 1 3-3"/></svg>,
  history: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2"/></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h0a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v0a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></svg>,
  moon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>,
  sun: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>,
  arrow: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
};

window.CT_ICONS = I;

// ── Top app bar ────────────────────────────────────────────────────────
function TopBar({ palette, dark, onToggleDark, showMascot = true, onSearch, target = 'EN', native = 'KO', onPickTarget, onPickNative }) {
  const c = palette;
  const tgt = window.CT_LANG.byCode(target);
  const nat = window.CT_LANG.byCode(native);
  return (
    <div style={{
      padding: '10px 16px 12px',
      background: c.surface,
      borderBottom: `1px solid ${c.divider}`,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {showMascot && <Mascot mood="happy" size={32} dark={dark} />}
          <div>
            <div style={{
              fontSize: 17, fontWeight: 700, color: c.ink, letterSpacing: '-0.01em', lineHeight: 1.1,
              fontFamily: "'Chakra Petch', system-ui, sans-serif",
            }}>
              ConvoTrans
            </div>
            <div style={{ fontSize: 10, color: c.ink3, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>
              Live translation
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          <IconBtn palette={c} onClick={onSearch} ariaLabel="search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
            </svg>
          </IconBtn>
          <IconBtn palette={c} onClick={onToggleDark} ariaLabel="theme">{dark ? window.CT_ICONS.sun : window.CT_ICONS.moon}</IconBtn>
          <IconBtn palette={c}>{window.CT_ICONS.history}</IconBtn>
          <IconBtn palette={c}>{window.CT_ICONS.settings}</IconBtn>
        </div>
      </div>

      {/* Two language slots — target (what gets sent) + native (private helper) */}
      <div style={{ display: 'flex', gap: 8 }}>
        <LangSlot
          c={c}
          role="target"
          lang={tgt}
          label="대화 언어"
          sub="상대에게 전송 · 교정"
          onClick={() => onPickTarget?.()}
        />
        <LangSlot
          c={c}
          role="native"
          lang={nat}
          label="내 모국어"
          sub="나만 보는 보조"
          onClick={() => onPickNative?.()}
        />
      </div>
    </div>
  );
}

function LangSlot({ c, role, lang, label, sub, onClick }) {
  const isTarget = role === 'target';
  const tint = isTarget ? c.primary : c.accent2;
  return (
    <button onClick={onClick} style={{
      flex: 1, display: 'flex', alignItems: 'center', gap: 9,
      background: c.bg, borderRadius: 14, padding: '8px 10px 8px 8px',
      border: `1.5px solid ${isTarget ? tint : c.divider}`,
      cursor: 'pointer', textAlign: 'left',
      transition: 'all 140ms cubic-bezier(0.22, 0.61, 0.36, 1)',
      fontFamily: 'inherit',
    }}>
      <window.LangChip code={lang.code} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 10, fontWeight: 600, color: tint, letterSpacing: '0.12em',
          textTransform: 'uppercase', lineHeight: 1.1, marginBottom: 2,
          fontFamily: "'Chakra Petch', system-ui, sans-serif",
        }}>{label}</div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 3,
          fontSize: 14, fontWeight: 700, color: c.ink, lineHeight: 1.2,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {lang.name}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={c.ink3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginLeft: 2 }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
        <div style={{ fontSize: 10, color: c.ink3, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {sub}
        </div>
      </div>
    </button>
  );
}

function LangPill({ palette, active, flag, label, sub }) {
  const c = palette;
  return (
    <div style={{
      flex: 1, padding: '6px 12px', borderRadius: 999,
      background: 'transparent',
      display: 'flex', alignItems: 'center', gap: 8,
      minWidth: 0,
    }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{flag}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: c.ink, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {label}
        </div>
        <div style={{ fontSize: 9, color: c.ink3, lineHeight: 1.1, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {sub}
        </div>
      </div>
    </div>
  );
}

function IconBtn({ palette, children, onClick, active, ariaLabel }) {
  const c = palette;
  return (
    <button
      aria-label={ariaLabel}
      onClick={onClick}
      style={{
        width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
        background: active ? c.primarySoft : 'transparent',
        color: active ? c.primary : c.ink2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .12s',
      }}>
      {children}
    </button>
  );
}

// ── Message bubbles ────────────────────────────────────────────────────
// Hierarchy decision:
// • What goes out the wire = ENGLISH (visible to the other person)
// • My private layer = my original input (Korean OR my raw English if I made grammar mistakes)
// • If I typed clean English already, there's no private note at all.
function MyBubble({ msg, palette }) {
  const c = palette;
  const hasPrivate = msg.inputKind !== 'clean' && msg.orig !== msg.trans;
  const isFixed = msg.inputKind === 'polished';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: 10 }}>
      <div style={{
        fontSize: 10, fontWeight: 800, color: c.primary, letterSpacing: 0.6,
        marginBottom: 4, marginRight: 8, textTransform: 'uppercase',
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        나 · 전송됨
        {msg.inputKind === 'clean' && (
          <span style={{ fontSize: 9, color: c.accent2, fontWeight: 800, letterSpacing: 0.4 }}>· 그대로</span>
        )}
        {isFixed && (
          <span style={{ fontSize: 9, color: '#9B59E0', fontWeight: 800, letterSpacing: 0.4 }}>· ✏ 정정됨</span>
        )}
      </div>
      <div style={{ maxWidth: '86%' }}>
        <div style={{
          background: c.mine, color: c.mineInk,
          padding: '12px 14px 8px', borderRadius: '18px 18px 4px 18px',
        }}>
          <div style={{ fontSize: 15, lineHeight: 1.45, fontWeight: 600 }}>
            {msg.trans}
          </div>
          <div style={{ marginTop: 6, display: 'flex', justifyContent: 'flex-end' }}>
            <window.ListenButtons text={msg.trans} palette={c} accent="me" />
          </div>
        </div>

        {hasPrivate && (
          <div style={{
            marginTop: 4, padding: '6px 10px',
            background: c.bg, border: `1px dashed ${isFixed ? '#9B59E0' : c.divider}`,
            borderRadius: 10, fontSize: 12, color: c.ink2, lineHeight: 1.4,
            display: 'flex', alignItems: 'flex-start', gap: 6,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0, color: c.ink3 }}>
              <rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
            </svg>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9, color: isFixed ? '#9B59E0' : c.ink3, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 1 }}>
                {isFixed ? '내가 말한 원본 · 정정됨 · 나만 보임' : '내가 입력한 원문 · 나만 보임'}
              </div>
              <div style={isFixed ? { textDecoration: 'line-through wavy #9B59E055', textDecorationSkipInk: 'none' } : null}>
                {msg.orig}
              </div>
            </div>
          </div>
        )}

        <div style={{ fontSize: 10, color: c.ink3, textAlign: 'right', marginTop: 2 }}>{msg.time}</div>
      </div>
    </div>
  );
}

function TheirBubble({ msg, palette, dark, children, native = 'KO' }) {
  const c = palette;
  const nativeLang = window.CT_LANG ? window.CT_LANG.byCode(native) : { name: '한국어' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: 12 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        marginBottom: 4, marginLeft: 4,
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: 999,
          background: c.themAvatarBg, color: c.themAvatar,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 800, flexShrink: 0,
        }}>EN</div>
        <div style={{
          fontSize: 10, fontWeight: 800, color: c.ink2, letterSpacing: 0.6,
          textTransform: 'uppercase',
        }}>상대방</div>
      </div>
      <div style={{ maxWidth: '92%', width: '100%' }}>
        <div style={{
          background: c.them, border: `1px solid ${c.themBorder}`,
          padding: '12px 14px 10px', borderRadius: '4px 18px 18px 18px',
        }}>
          <div style={{ fontSize: 15, lineHeight: 1.5, color: c.themInk || c.ink, fontWeight: 500 }}>
            {msg.orig}
          </div>
          <div style={{ marginTop: 6 }}>
            <window.ListenButtons text={msg.orig} palette={c} accent="them" />
          </div>
          <div style={{
            marginTop: 8, paddingTop: 8,
            borderTop: `1px dashed ${c.divider}`,
            fontSize: 13, lineHeight: 1.45, color: c.ink2,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3,
            }}>
              <span style={{ fontSize: 10, color: c.accent2, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase' }}>{nativeLang.name} 번역</span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                fontSize: 9, fontWeight: 700, color: c.ink3,
                background: c.bg, padding: '1px 6px', borderRadius: 4,
              }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
                </svg>
                나만 보임
              </span>
            </div>
            {msg.trans}
          </div>
        </div>
        <div style={{ fontSize: 10, color: c.ink3, marginTop: 4, marginLeft: 4 }}>{msg.time}</div>
        {children}
      </div>
    </div>
  );
}

function SmallBtn({ palette, children, accent }) {
  const c = palette;
  return (
    <button style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 8px', borderRadius: 6,
      background: accent ? c.primarySoft : c.bg, color: accent ? c.primary : c.ink2,
      border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer',
    }}>{children}</button>
  );
}

// ── Input bar (bottom) ──────────────────────────────────────────────────
function InputBar({ palette, dark, mode = 'mine', onModeChange }) {
  const c = palette;
  const isMine = mode === 'mine';
  return (
    <div style={{
      background: c.surface, borderTop: `1px solid ${c.divider}`,
      padding: '10px 12px 12px',
    }}>
      {/* icon-only speaker toggle */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 8, alignItems: 'center',
        background: c.bg, borderRadius: 999, padding: 3,
        border: `1px solid ${c.divider}`,
        width: 'fit-content',
      }}>
        <button onClick={() => onModeChange?.('mine')} title="내가 말할게요 · 한국어 → 영어" style={{
          height: 30, padding: '0 10px', borderRadius: 999, border: 'none', cursor: 'pointer',
          background: isMine ? c.primary : 'transparent',
          color: isMine ? '#fff' : c.ink2,
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="3.5"/><path d="M5 21v-1a7 7 0 0 1 14 0v1"/>
          </svg>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.5 }}>KO</span>
        </button>
        <button onClick={() => onModeChange?.('them')} title="상대 말 듣기 · 영어 → 한국어" style={{
          height: 30, padding: '0 10px', borderRadius: 999, border: 'none', cursor: 'pointer',
          background: !isMine ? c.accent2 : 'transparent',
          color: !isMine ? '#fff' : c.ink2,
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 4-3 5-3 8a3 3 0 0 1-6 0 3 3 0 0 1 3-3"/>
          </svg>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.5 }}>EN</span>
        </button>
        <div style={{
          marginLeft: 6, fontSize: 11, fontWeight: 600, color: c.ink2,
          paddingRight: 8, whiteSpace: 'nowrap',
        }}>
          {isMine ? '내가 말함' : '상대 말 듣기'}
        </div>
      </div>
      {/* input row */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 8,
        background: c.bg, border: `1.5px solid ${isMine ? c.primary + '33' : c.accent2 + '33'}`,
        borderRadius: 24, padding: '8px 8px 8px 16px',
      }}>
        <input
          placeholder={isMine ? '메시지를 입력하거나 마이크를 누르세요…' : '상대가 한 말을 입력하거나 듣기 시작…'}
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontSize: 14, color: c.ink, fontFamily: 'inherit',
            padding: '6px 0',
          }}
        />
        <button style={{
          width: 36, height: 36, borderRadius: 999, border: 'none',
          background: isMine ? c.primarySoft : c.bg,
          color: isMine ? c.primary : c.accent2,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>{window.CT_ICONS.mic}</button>
        <button style={{
          width: 36, height: 36, borderRadius: 999, border: 'none',
          background: c.primary, color: c.primaryInk,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>{window.CT_ICONS.send}</button>
      </div>
    </div>
  );
}

function SpeakerTab({ palette, active, label, sub, icon, onClick }) {
  const c = palette;
  return (
    <button onClick={onClick} style={{
      flex: 1, border: 'none', cursor: 'pointer',
      background: active ? c.surface : 'transparent',
      borderRadius: 999, padding: '6px 10px',
      boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
      textAlign: 'left', minWidth: 0,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: active ? c.ink : c.ink2, display: 'flex', alignItems: 'center', gap: 4 }}>
        {icon}{label}
      </div>
      <div style={{ fontSize: 9, color: c.ink3, marginTop: 1 }}>{sub}</div>
    </button>
  );
}

// ── Section label (for variations to use) ───────────────────────────────
function SectionLabel({ palette, color, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
      textTransform: 'uppercase', color: color || palette.ink2,
      marginBottom: 6,
    }}>
      <div style={{ width: 5, height: 5, borderRadius: 999, background: 'currentColor' }} />
      {children}
    </div>
  );
}

// ── Phone shell — wraps a screen in a phone-like rectangle ──────────────
function PhoneShell({ palette, dark, children, width = 390, height = 800 }) {
  const c = palette;
  return (
    <div style={{
      width, height, borderRadius: 36, overflow: 'hidden',
      background: c.bg, color: c.ink,
      boxShadow: dark
        ? '0 30px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06), inset 0 0 0 6px #000'
        : '0 30px 60px rgba(8, 27, 27, 0.18), 0 0 0 1px rgba(0,0,0,0.06), inset 0 0 0 6px #081B1B',
      fontFamily: "'Plus Jakarta Sans', -apple-system, system-ui, sans-serif",
      position: 'relative',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* faux status bar */}
      <div style={{
        height: 28, flexShrink: 0, padding: '6px 28px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 11, fontWeight: 700, color: c.ink,
        background: c.surface,
      }}>
        <span>10:05</span>
        <span style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 10 }}>
          <span>5G</span>
          <span style={{ display: 'inline-block', width: 20, height: 10, border: `1.2px solid ${c.ink2}`, borderRadius: 2, position: 'relative', padding: 1 }}>
            <span style={{ display: 'block', width: '80%', height: '100%', background: c.ink2, borderRadius: 1 }} />
          </span>
        </span>
      </div>
      {children}
      {/* home indicator */}
      <div style={{
        position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
        width: 110, height: 4, borderRadius: 999, background: c.ink3, opacity: 0.5,
      }} />
    </div>
  );
}

Object.assign(window, { TopBar, MyBubble, TheirBubble, SmallBtn, InputBar, SpeakerTab, SectionLabel, PhoneShell, IconBtn, LangSlot });
