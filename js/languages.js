// Language registry — uses circular ISO chips (NO flag emoji, per ConvoTrans brand rules).
// Each lang has a brand-aligned color for its chip + a BCP-47 locale for
// SpeechRecognition (STT) and SpeechSynthesis (TTS).
window.CT_LANGS = [
  { code: 'EN', name: 'English',    native: 'English',    locale: 'en-US', chipBg: '#0066FF', chipFg: '#FFFFFF', sample: 'How can I help?' },
  { code: 'KO', name: '한국어',       native: 'Korean',     locale: 'ko-KR', chipBg: '#00C2D1', chipFg: '#FFFFFF', sample: '안녕하세요' },
  { code: 'JA', name: '日本語',       native: 'Japanese',   locale: 'ja-JP', chipBg: '#5B6CFF', chipFg: '#FFFFFF', sample: 'こんにちは' },
  { code: 'ZH', name: '中文',         native: 'Chinese',    locale: 'zh-CN', chipBg: '#00A3A3', chipFg: '#FFFFFF', sample: '你好' },
  { code: 'ES', name: 'Español',     native: 'Spanish',    locale: 'es-ES', chipBg: '#0088CC', chipFg: '#FFFFFF', sample: 'Hola' },
  { code: 'FR', name: 'Français',    native: 'French',     locale: 'fr-FR', chipBg: '#3D5AFE', chipFg: '#FFFFFF', sample: 'Bonjour' },
  { code: 'DE', name: 'Deutsch',     native: 'German',     locale: 'de-DE', chipBg: '#0072B5', chipFg: '#FFFFFF', sample: 'Hallo' },
  { code: 'IT', name: 'Italiano',    native: 'Italian',    locale: 'it-IT', chipBg: '#00B0A6', chipFg: '#FFFFFF', sample: 'Ciao' },
  { code: 'PT', name: 'Português',   native: 'Portuguese', locale: 'pt-BR', chipBg: '#1565E0', chipFg: '#FFFFFF', sample: 'Olá' },
  { code: 'VI', name: 'Tiếng Việt',  native: 'Vietnamese', locale: 'vi-VN', chipBg: '#0091EA', chipFg: '#FFFFFF', sample: 'Xin chào' },
  { code: 'TH', name: 'ไทย',          native: 'Thai',       locale: 'th-TH', chipBg: '#2979FF', chipFg: '#FFFFFF', sample: 'สวัสดี' },
  { code: 'AR', name: 'العربية',      native: 'Arabic',     locale: 'ar-SA', chipBg: '#0097A7', chipFg: '#FFFFFF', sample: 'مرحبا' },
  { code: 'HI', name: 'हिन्दी',         native: 'Hindi',      locale: 'hi-IN', chipBg: '#4763FF', chipFg: '#FFFFFF', sample: 'नमस्ते' },
  { code: 'RU', name: 'Русский',     native: 'Russian',    locale: 'ru-RU', chipBg: '#0064D2', chipFg: '#FFFFFF', sample: 'Привет' },
];

window.CT_LANG = {
  byCode(code) {
    return window.CT_LANGS.find(l => l.code === code) || window.CT_LANGS[0];
  },
  prompt(code) { return window.CT_LANG.byCode(code).native; },
  displayName(code) { return window.CT_LANG.byCode(code).name; },
  locale(code) { return window.CT_LANG.byCode(code).locale || 'en-US'; },
  // For backward compatibility — used to be flag(), now returns null (we don't show flags).
  flag(code) { return null; },
};
