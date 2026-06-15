// App version + settings sheet (bottom-sheet) showing version info.
window.CT_VERSION = {
  number: '1.4.2',
  build: '2026.06.15',
  label: 'Beta',
  notes: {
    KO: '개인정보 처리방침 추가(설정에서 보기) · 로딩 화면 정리 · 설정·언어·테마 유지 · 30분 후 새 대화',
    EN: 'Added a privacy policy (see Settings) · cleaner loading screen · settings/language/theme persist · fresh chat after 30 min',
  },
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
            <span>{window.t('version')} {v.number}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, color: c.primaryInk, background: c.primary,
              padding: '1px 7px', borderRadius: 999,
            }}>{v.label}</span>
          </div>
          <div style={{ marginTop: 3, fontSize: 11, color: c.ink3 }}>{window.t('build')} {v.build}</div>
        </div>

        {/* Info rows */}
        <div style={{ padding: '0 16px' }}>
          <Row c={c} label={window.t('convoLanguage')} value={`${tgt.name} (${tgt.code})`} />
          <Row c={c} label={window.t('myNativeLang')} value={`${nat.name} (${nat.code})`} />
          <Row c={c} label={window.t('speechRecognition')} value={sttOK ? window.t('supported') : window.t('unsupportedBrowser')} ok={sttOK} />
          <Row c={c} label={window.t('apiConnection')} value={!window.CT_API.needsKey() ? window.t('designEnv') : (window.CT_API.getKey() ? window.t('connectedMyKey') : window.t('serverConnected'))} ok />
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 6px',
          }}>
            <span style={{ fontSize: 13, color: c.ink2, fontWeight: 500 }}>{window.t('appAddress')}</span>
            <a href="https://convotrans.jennyryu3d.com" target="_blank" rel="noreferrer" style={{
              fontSize: 13, fontWeight: 700, color: c.primary, textDecoration: 'none',
            }}>convotrans.jennyryu3d.com</a>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 6px',
          }}>
            <span style={{ fontSize: 13, color: c.ink2, fontWeight: 500 }}>{window.t('privacyPolicy')}</span>
            <a href="privacy.html" target="_blank" rel="noreferrer" style={{
              fontSize: 13, fontWeight: 700, color: c.primary, textDecoration: 'none',
            }}>{window.t('view')}</a>
          </div>
        </div>

        {/* Color skin picker */}
        <div style={{ padding: '14px 18px 0' }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', color: c.ink3, marginBottom: 8, fontFamily: "'Chakra Petch', system-ui, sans-serif" }}>
            {window.t('colorTheme')}
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
                  <span style={{ fontSize: 12, fontWeight: 700, color: on ? c.ink : c.ink2 }}>{window.CT_LOCALE === 'EN' ? (sk.nameEn || sk.name) : sk.name}</span>
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
            <b style={{ color: c.primary }}>{window.t('whatsNew')}</b><br/>{(v.notes && (v.notes[window.CT_LOCALE] || v.notes.KO)) || v.notes}
          </div>
        </div>

        <div style={{ padding: '14px 20px 0', textAlign: 'center', fontSize: 11, color: c.ink3, lineHeight: 1.5 }}>
          {window.t('tagline')}<br/>
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
