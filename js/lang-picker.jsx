// Language picker — small bottom-sheet style modal.
// Two language slots: target (what gets sent) + native (user's helper lang).

function LangPickerModal({ palette, dark, role, current, onPick, onClose }) {
  const c = palette;
  const langs = window.CT_LANGS;
  const isTarget = role === 'target';
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 80,
      background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'flex-end',
      animation: 'lpFade .15s ease-out',
    }}>
      <style>{`
        @keyframes lpFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes lpSlide { from { transform: translateY(100%); } to { transform: none; } }
      `}</style>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', background: c.surface, borderRadius: '20px 20px 0 0',
        padding: '8px 0 14px',
        animation: 'lpSlide .22s ease-out',
        boxShadow: '0 -8px 24px rgba(0,0,0,0.18)',
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 999,
          background: c.divider, margin: '0 auto 8px',
        }} />
        <div style={{ padding: '0 16px 12px' }}>
          <div style={{
            fontSize: 10, fontWeight: 800, color: isTarget ? c.primary : c.ink2,
            letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 2,
          }}>
            {isTarget ? '대화 언어 선택' : '내 모국어 선택'}
          </div>
          <div style={{ fontSize: 13, color: c.ink, fontWeight: 700 }}>
            {isTarget
              ? '상대방과 대화·기록·교정에 쓰일 언어'
              : '나만 보는 보조 번역 언어'}
          </div>
          <div style={{ fontSize: 11, color: c.ink3, marginTop: 4, lineHeight: 1.5 }}>
            {isTarget
              ? '내가 어떤 언어로 입력해도 이 언어로 자동 번역/교정되어 상대에게 전송됩니다.'
              : '상대방 말이 이 언어로 번역돼 나에게만 보입니다.'}
          </div>
        </div>
        <div style={{
          maxHeight: 360, overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
        }}>
          {langs.map(l => {
            const on = l.code === current;
            return (
              <button key={l.code} onClick={() => { onPick(l.code); onClose(); }} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', border: 'none',
                background: on ? (isTarget ? c.primarySoft : c.bg) : 'transparent',
                color: c.ink, cursor: 'pointer', textAlign: 'left',
                fontFamily: 'inherit',
              }}>
                <window.LangChip code={l.code} size={36} overrideBg={c.primarySoft} overrideFg={c.primary} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: c.ink, lineHeight: 1.25 }}>
                    {l.name}
                    <span style={{ fontSize: 11, color: c.ink3, fontWeight: 500, marginLeft: 6 }}>
                      · {l.native}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: c.ink3, marginTop: 2 }}>{l.sample}</div>
                </div>
                {on && (
                  <span style={{
                    width: 22, height: 22, borderRadius: 999, flexShrink: 0,
                    background: isTarget ? c.primary : c.accent2, color: isTarget ? c.primaryInk : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-11"/></svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

window.LangPickerModal = LangPickerModal;
