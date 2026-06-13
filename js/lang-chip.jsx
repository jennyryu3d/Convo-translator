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

// CT_chipShade — derive a per-language chip color that stays within the active
// color skin's family (same hue neighbourhood) but varies across the list, so
// chips look distinct yet cohesive with the chosen skin.
(function () {
  function hex2rgb(h) {
    h = String(h || '').replace('#', '');
    if (h.length === 3) h = h.split('').map(x => x + x).join('');
    const n = parseInt(h || '006898', 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgb2hsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    let h, s, l = (mx + mn) / 2;
    if (mx === mn) { h = s = 0; }
    else {
      const d = mx - mn;
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      switch (mx) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        default: h = (r - g) / d + 4;
      }
      h /= 6;
    }
    return [h * 360, s * 100, l * 100];
  }
  function hsl2hex(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      const hue2 = (p, q, t) => {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2(p, q, h + 1 / 3); g = hue2(p, q, h); b = hue2(p, q, h - 1 / 3);
    }
    const to = x => Math.round(x * 255).toString(16).padStart(2, '0');
    return '#' + to(r) + to(g) + to(b);
  }
  window.CT_chipShade = function (palette, i, total) {
    const base = (palette && palette.primary) || '#006898';
    const [h, s] = rgb2hsl.apply(null, hex2rgb(base));
    const t = total > 1 ? i / (total - 1) : 0.5;
    const H = h + (t - 0.5) * 40;            // ±20° hue drift across the list
    const S = Math.min(82, Math.max(40, s)); // keep it lively but on-brand
    const L = 46 + t * 26;                   // lightness ramp 46%→72%
    return { bg: hsl2hex(H, S, L), fg: L >= 60 ? '#15202B' : '#FFFFFF' };
  };
})();
