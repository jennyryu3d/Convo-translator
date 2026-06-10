// App version + settings sheet (bottom-sheet) showing version info.
window.CT_VERSION = {
  number: '1.2.0',
  build: '2026.06.10',
  label: 'Beta',
  notes: '제안 카드 누적·음성출력·선택 교체 · 단어/구 탭 번역 · 대화 자동 임시저장 · 저장 대화 다시보기 · 색상 스킨(블루·골드·로즈) · 플로팅 새대화/저장 버튼',
};

function SettingsSheet({ palette, dark, onClose, target, native, skinId = 'blue', onPickSkin }) {
  const c = palette;
  const v = window.CT_VERSION;
  const tgt = window.CT_LANG.byCode(target);
  const nat = window.CT_LANG.byCode(native);
  const sttOK = window.CT_RECOGNIZE && window.CT_RECOGNIZE.supported();

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 85,
      background: 'rgba(8,27,27,0.6)', backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'flex-end',
      animation: 'setFade .15s ease-out',
    }}>
      <style>{`
        @keyframes setFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes setSlide { from { transform: translateY(100%); } to { transform: none; } }
      `}</style>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', background: c.surface, borderRadius: '24px 24px 0 0',
        padding: '10px 0 22px',
        animation: 'setSlide .22s ease-out',
        boxShadow: '0 -8px 24px rgba(8,27,27,0.18)',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 999, background: c.divider, margin: '0 auto 16px' }} />

        {/* App identity */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px 18px' }}>
          <img src="convotrans-design/assets/app-icon.png" alt="ConvoTrans"
            style={{ width: 72, height: 72, borderRadius: 18, boxShadow: '0 6px 18px rgba(8,27,27,0.2)' }} />
          <div style={{
            marginTop: 12, fontSize: 20, fontWeight: 700, color: c.ink,
            fontFamily: "'Chakra Petch', system-ui, sans-serif",
          }}>ConvoTrans</div>
          <div style={{
            marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, color: c.ink2, fontWeight: 600,
          }}>
            <span>버전 {v.number}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, color: c.primaryInk, background: c.primary,
              padding: '1px 7px', borderRadius: 999,
            }}>{v.label}</span>
          </div>
          <div style={{ marginTop: 3, fontSize: 11, color: c.ink3 }}>빌드 {v.build}</div>
        </div>

        {/* Info rows */}
        <div style={{ padding: '0 16px' }}>
          <Row c={c} label="대화 언어" value={`${tgt.name} (${tgt.code})`} />
          <Row c={c} label="내 모국어" value={`${nat.name} (${nat.code})`} />
          <Row c={c} label="음성 인식" value={sttOK ? '지원됨' : '미지원 브라우저'} ok={sttOK} />
          <Row c={c} label="API 연결" value={window.CT_API.needsKey() ? (window.CT_API.getKey() ? '연결됨 (내 키)' : '키 필요') : '디자인 환경'} ok={!window.CT_API.needsKey() || !!window.CT_API.getKey()} last />
        </div>

        {/* Color skin picker */}
        <div style={{ padding: '14px 18px 0' }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', color: c.ink3, marginBottom: 8, fontFamily: "'Chakra Petch', system-ui, sans-serif" }}>
            색상 테마
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {Object.keys(window.CT_SKINS || {}).map(id => {
              const sk = window.CT_SKINS[id];
              const on = id === skinId;
              return (
                <button key={id} onClick={() => onPickSkin && onPickSkin(id)} style={{
                  flex: 1, cursor: 'pointer', borderRadius: 14, padding: '12px 8px',
                  border: on ? `2px solid ${sk.swatch}` : `1.5px solid ${c.divider}`,
                  background: on ? sk.swatch + '14' : c.bg,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                  fontFamily: 'inherit',
                }}>
                  <span style={{
                    width: 30, height: 30, borderRadius: 999, background: sk.swatch,
                    boxShadow: on ? `0 0 0 3px ${sk.swatch}44` : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {on && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-11"/></svg>}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: on ? c.ink : c.ink2 }}>{sk.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ padding: '12px 18px 0' }}>
          <div style={{
            background: c.bg, borderRadius: 12, padding: '10px 12px',
            fontSize: 11, color: c.ink2, lineHeight: 1.5,
          }}>
            <b style={{ color: c.primary }}>이번 업데이트</b><br/>{v.notes}
          </div>
        </div>

        <div style={{ padding: '14px 20px 0', textAlign: 'center', fontSize: 11, color: c.ink3, lineHeight: 1.5 }}>
          대화를 잇는 실시간 번역기 · 14개 언어 지원<br/>
          © 2026 ConvoTrans
        </div>
      </div>
    </div>
  );
}

function Row({ c, label, value, ok, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 6px',
      borderBottom: last ? 'none' : `1px solid ${c.divider}`,
    }}>
      <span style={{ fontSize: 13, color: c.ink2, fontWeight: 500 }}>{label}</span>
      <span style={{
        fontSize: 13, fontWeight: 700,
        color: ok === false ? '#b84a3a' : c.ink,
      }}>{value}</span>
    </div>
  );
}

window.SettingsSheet = SettingsSheet;
