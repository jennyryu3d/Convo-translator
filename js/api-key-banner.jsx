// API key entry banner. Translation goes through the serverless proxy by
// default, so this stays hidden in normal use. It only opens when the proxy
// is unreachable/rate-limited (a `ct-api-key-needed` event) or when the user
// opens it from settings to add a personal fallback key.

function ApiKeyBanner() {
  const [hasKey, setHasKey] = React.useState(!!window.CT_API.getKey());
  const [open, setOpen] = React.useState(false);
  // reason: 'busy' (upstream busy) | 'rate' (this device too fast/much) |
  //         'quota' (today's free usage spent) | 'down' (proxy error) |
  //         'manual' (opened from settings)
  const [reason, setReason] = React.useState('manual');
  // In an auto-triggered notice we hide the key input until the user opts in.
  const [showKeyInput, setShowKeyInput] = React.useState(false);
  const [val, setVal] = React.useState('');

  React.useEffect(() => {
    function onNeed(e) {
      const r = (e && e.detail && e.detail.reason) || 'manual';
      setReason(r);
      setShowKeyInput(r === 'manual'); // settings → straight to key input
      setOpen(true);
    }
    function onSet()  { setHasKey(!!window.CT_API.getKey()); }
    window.addEventListener('ct-api-key-needed', onNeed);
    window.addEventListener('ct-api-key-set', onSet);
    return () => {
      window.removeEventListener('ct-api-key-needed', onNeed);
      window.removeEventListener('ct-api-key-set', onSet);
    };
  }, []);

  // If we're inside the design environment we never need the key.
  if (!window.CT_API.needsKey()) return null;
  if (!open) return null;

  function save() {
    const t = val.trim();
    if (!t.startsWith('sk-ant-')) {
      alert(window.t('keyFormatAlert'));
      return;
    }
    window.CT_API.setKey(t);
    setVal('');
    setOpen(false);
  }

  // Headline + body depend on why the sheet opened.
  const NOTICE = {
    busy: {
      tag: window.t('rateTag'),
      title: window.t('rateTitle'),
      body: window.t('rateBody'),
    },
    rate: {
      tag: window.t('slowTag'),
      title: window.t('slowTitle'),
      body: window.t('slowBody'),
    },
    quota: {
      tag: window.t('quotaTag'),
      title: window.t('quotaTitle'),
      body: window.t('quotaBody'),
    },
    down: {
      tag: window.t('connTag'),
      title: window.t('connTitle'),
      body: window.t('connBody'),
    },
    manual: {
      tag: window.t('keyTag'),
      title: window.t('keyTitle'),
      body: window.t('keyBody'),
    },
  };
  const notice = NOTICE[reason] || NOTICE.manual;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(8,27,27,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: '#fff', borderRadius: 24, padding: 24,
        boxShadow: '0 24px 48px rgba(8,27,27,0.2)',
      }}>
        <div style={{
          fontFamily: "'Chakra Petch', system-ui, sans-serif",
          fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#487762', marginBottom: 4,
        }}>{notice.tag}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#081B1B', marginBottom: 8, fontFamily: "'Chakra Petch', system-ui, sans-serif" }}>
          {notice.title}
        </div>
        <div style={{ fontSize: 13, color: '#444e4b', lineHeight: 1.55, marginBottom: 14 }}>
          {notice.body}
        </div>

        {/* Auto-notice (busy/down): offer the key path as an option, not a demand. */}
        {!showKeyInput ? (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => { setOpen(false); try { window.CT_API.retry(); } catch (e) {} }} style={{
              padding: '10px 20px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: '#96CDB0', color: '#081B1B', fontSize: 13, fontWeight: 700,
              fontFamily: 'inherit',
            }}>{window.t('retry')}</button>
            <button onClick={() => setShowKeyInput(true)} style={{
              padding: '10px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: 'transparent', color: '#487762', fontSize: 13, fontWeight: 600,
              fontFamily: 'inherit', textDecoration: 'underline',
            }}>{window.t('useMyKey')}</button>
          </div>
        ) : (
        <React.Fragment>
        <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" style={{
          display: 'inline-block', fontSize: 12, color: '#487762', textDecoration: 'underline',
          marginBottom: 14,
        }}>{window.t('getKeyLink')}</a>
        <input
          type="password"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); }}
          placeholder="sk-ant-api03-..."
          style={{
            width: '100%', border: '1.5px solid #dde4e1', borderRadius: 12,
            padding: '10px 12px', fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
            outline: 'none', marginBottom: 14, color: '#081B1B', background: '#f7f9f8',
          }}
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={() => setOpen(false)} style={{
            padding: '10px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: 'transparent', color: '#5f6b67', fontSize: 13, fontWeight: 600,
            fontFamily: 'inherit',
          }}>{window.t('later')}</button>
          <button onClick={save} disabled={!val.trim()} style={{
            padding: '10px 20px', borderRadius: 999, border: 'none',
            background: val.trim() ? '#96CDB0' : '#dde4e1',
            color: val.trim() ? '#081B1B' : '#8d9a96',
            fontSize: 13, fontWeight: 700, cursor: val.trim() ? 'pointer' : 'default',
            fontFamily: 'inherit',
          }}>{window.t('save')}</button>
        </div>
        <div style={{ fontSize: 11, color: '#8d9a96', marginTop: 14, lineHeight: 1.5 }}>
          {window.t('keyStorageNote')}
        </div>
        </React.Fragment>
        )}
      </div>
    </div>
  );
}

window.ApiKeyBanner = ApiKeyBanner;
