// API key entry banner. Translation goes through the serverless proxy by
// default, so this stays hidden in normal use. It only opens when the proxy
// is unreachable/rate-limited (a `ct-api-key-needed` event) or when the user
// opens it from settings to add a personal fallback key.

function ApiKeyBanner() {
  const [hasKey, setHasKey] = React.useState(!!window.CT_API.getKey());
  const [open, setOpen] = React.useState(false);
  const [val, setVal] = React.useState('');

  React.useEffect(() => {
    function onNeed() { setOpen(true); }
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
      alert('Anthropic API 키는 "sk-ant-..." 로 시작해요. 다시 확인해 주세요.');
      return;
    }
    window.CT_API.setKey(t);
    setVal('');
    setOpen(false);
  }

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
        }}>API 키 설정</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#081B1B', marginBottom: 8, fontFamily: "'Chakra Petch', system-ui, sans-serif" }}>
          Anthropic API 키가 필요해요
        </div>
        <div style={{ fontSize: 13, color: '#444e4b', lineHeight: 1.55, marginBottom: 14 }}>
          이 페이지는 번역에 Claude API를 씁니다.
          본인의 키를 입력하면 <b>이 기기에만 저장</b>되고 다른 곳으로 전송되지 않아요.
        </div>
        <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" style={{
          display: 'inline-block', fontSize: 12, color: '#487762', textDecoration: 'underline',
          marginBottom: 14,
        }}>console.anthropic.com에서 키 발급받기 →</a>
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
          }}>나중에</button>
          <button onClick={save} disabled={!val.trim()} style={{
            padding: '10px 20px', borderRadius: 999, border: 'none',
            background: val.trim() ? '#96CDB0' : '#dde4e1',
            color: val.trim() ? '#081B1B' : '#8d9a96',
            fontSize: 13, fontWeight: 700, cursor: val.trim() ? 'pointer' : 'default',
            fontFamily: 'inherit',
          }}>저장</button>
        </div>
        <div style={{ fontSize: 11, color: '#8d9a96', marginTop: 14, lineHeight: 1.5 }}>
          🔒 키는 브라우저 localStorage에만 저장돼요. 공용 PC면 사용 후 설정에서 제거하세요.
        </div>
      </div>
    </div>
  );
}

window.ApiKeyBanner = ApiKeyBanner;
