// LangChip — circular ISO-code chip. The ConvoTrans brand explicitly forbids
// flag emoji for languages, so this is the universal language indicator.

function LangChip({ code, size = 32, style = {}, overrideBg = null, overrideFg = null }) {
  const lang = (window.CT_LANG && window.CT_LANG.byCode(code)) || { code, chipBg: '#dde4e1', chipFg: '#081B1B' };
  return (
    <div style={{
      width: size, height: size, borderRadius: 999,
      background: overrideBg || lang.chipBg, color: overrideFg || lang.chipFg,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Chakra Petch', system-ui, sans-serif",
      fontWeight: 700,
      fontSize: Math.max(10, Math.round(size * 0.36)),
      letterSpacing: '0.04em', flexShrink: 0,
      ...style,
    }}>{lang.code}</div>
  );
}

window.LangChip = LangChip;
