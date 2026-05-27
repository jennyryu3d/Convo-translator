// Language registry — uses circular ISO chips (NO flag emoji, per ConvoTrans brand rules).
// Each lang has a brand-aligned color for its chip.
window.CT_LANGS = [
  { code: 'EN', name: 'English',    native: 'English',    chipBg: '#96CDB0', chipFg: '#081B1B', sample: 'How can I help?' },
  { code: 'KO', name: '한국어',       native: 'Korean',     chipBg: '#6b563f', chipFg: '#FFFFFF', sample: '안녕하세요' },
  { code: 'JA', name: '日本語',       native: 'Japanese',   chipBg: '#487762', chipFg: '#FFFFFF', sample: 'こんにちは' },
  { code: 'ZH', name: '中文',         native: 'Chinese',    chipBg: '#C18D52', chipFg: '#FFFFFF', sample: '你好' },
  { code: 'ES', name: 'Español',     native: 'Spanish',    chipBg: '#203B37', chipFg: '#FFFFFF', sample: 'Hola' },
  { code: 'FR', name: 'Français',    native: 'French',     chipBg: '#5A8F76', chipFg: '#FFFFFF', sample: 'Bonjour' },
  { code: 'DE', name: 'Deutsch',     native: 'German',     chipBg: '#735233', chipFg: '#FFFFFF', sample: 'Hallo' },
  { code: 'IT', name: 'Italiano',    native: 'Italian',    chipBg: '#7ab895', chipFg: '#FFFFFF', sample: 'Ciao' },
  { code: 'PT', name: 'Português',   native: 'Portuguese', chipBg: '#385e4d', chipFg: '#FFFFFF', sample: 'Olá' },
  { code: 'VI', name: 'Tiếng Việt',  native: 'Vietnamese', chipBg: '#9d7242', chipFg: '#FFFFFF', sample: 'Xin chào' },
  { code: 'TH', name: 'ไทย',          native: 'Thai',       chipBg: '#29473a', chipFg: '#FFFFFF', sample: 'สวัสดี' },
  { code: 'AR', name: 'العربية',      native: 'Arabic',     chipBg: '#102220', chipFg: '#FFFFFF', sample: 'مرحبا' },
  { code: 'HI', name: 'हिन्दी',         native: 'Hindi',      chipBg: '#8d7252', chipFg: '#FFFFFF', sample: 'नमस्ते' },
  { code: 'RU', name: 'Русский',     native: 'Russian',    chipBg: '#1a2f26', chipFg: '#FFFFFF', sample: 'Привет' },
];

window.CT_LANG = {
  byCode(code) {
    return window.CT_LANGS.find(l => l.code === code) || window.CT_LANGS[0];
  },
  prompt(code) { return window.CT_LANG.byCode(code).native; },
  displayName(code) { return window.CT_LANG.byCode(code).name; },
  // For backward compatibility — used to be flag(), now returns null (we don't show flags).
  flag(code) { return null; },
};
