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

// ── UI strings localized to the user's HELPER (native) language ───────────
// Used for the top language-slot labels and the suggestion-card controls so
// they read in the user's own language. English is the fallback for any key.
window.CT_UI = {
  EN: { myLanguage:'My language', yourLanguage:"Other's language", useReply:'Use this reply', selectedReply:'Selected reply', pastSuggestion:'Past suggestion', myChosenReply:'My chosen reply', aiSuggestion:'AI suggestions', selected:'Selected', listen:'Listen', prev:'Previous', next:'Next' },
  KO: { myLanguage:'내 언어', yourLanguage:'상대방 언어', useReply:'이 답변 사용하기', selectedReply:'선택한 답변', pastSuggestion:'지난 제안', myChosenReply:'내가 선택한 답변', aiSuggestion:'AI 제안', selected:'선택됨', listen:'듣기', prev:'이전', next:'다음' },
  JA: { myLanguage:'自分の言語', yourLanguage:'相手の言語', useReply:'この返信を使う', selectedReply:'選んだ返信', pastSuggestion:'過去の提案', myChosenReply:'選んだ返信', aiSuggestion:'AI提案', selected:'選択済み', listen:'再生', prev:'前へ', next:'次へ' },
  ZH: { myLanguage:'我的语言', yourLanguage:'对方语言', useReply:'使用此回复', selectedReply:'已选回复', pastSuggestion:'过往建议', myChosenReply:'我选择的回复', aiSuggestion:'AI 建议', selected:'已选择', listen:'朗读', prev:'上一个', next:'下一个' },
  ES: { myLanguage:'Mi idioma', yourLanguage:'Idioma del otro', useReply:'Usar esta respuesta', selectedReply:'Respuesta elegida', pastSuggestion:'Sugerencia anterior', myChosenReply:'Mi respuesta elegida', aiSuggestion:'Sugerencias de IA', selected:'Elegido', listen:'Escuchar', prev:'Anterior', next:'Siguiente' },
  FR: { myLanguage:'Ma langue', yourLanguage:"Langue de l'autre", useReply:'Utiliser cette réponse', selectedReply:'Réponse choisie', pastSuggestion:'Suggestion passée', myChosenReply:'Ma réponse choisie', aiSuggestion:'Suggestions IA', selected:'Choisi', listen:'Écouter', prev:'Précédent', next:'Suivant' },
  DE: { myLanguage:'Meine Sprache', yourLanguage:'Sprache des Partners', useReply:'Diese Antwort verwenden', selectedReply:'Gewählte Antwort', pastSuggestion:'Früherer Vorschlag', myChosenReply:'Meine gewählte Antwort', aiSuggestion:'KI-Vorschläge', selected:'Gewählt', listen:'Anhören', prev:'Zurück', next:'Weiter' },
  IT: { myLanguage:'La mia lingua', yourLanguage:"Lingua dell'altro", useReply:'Usa questa risposta', selectedReply:'Risposta scelta', pastSuggestion:'Suggerimento precedente', myChosenReply:'La mia risposta scelta', aiSuggestion:'Suggerimenti IA', selected:'Scelto', listen:'Ascolta', prev:'Precedente', next:'Avanti' },
  PT: { myLanguage:'Meu idioma', yourLanguage:'Idioma do outro', useReply:'Usar esta resposta', selectedReply:'Resposta escolhida', pastSuggestion:'Sugestão anterior', myChosenReply:'Minha resposta escolhida', aiSuggestion:'Sugestões de IA', selected:'Escolhido', listen:'Ouvir', prev:'Anterior', next:'Próximo' },
  RU: { myLanguage:'Мой язык', yourLanguage:'Язык собеседника', useReply:'Использовать ответ', selectedReply:'Выбранный ответ', pastSuggestion:'Прошлое предложение', myChosenReply:'Мой выбранный ответ', aiSuggestion:'Подсказки ИИ', selected:'Выбрано', listen:'Прослушать', prev:'Назад', next:'Вперёд' },
  VI: { myLanguage:'Ngôn ngữ của tôi', yourLanguage:'Ngôn ngữ đối phương', useReply:'Dùng câu trả lời này', selectedReply:'Câu trả lời đã chọn', pastSuggestion:'Gợi ý trước', myChosenReply:'Câu trả lời tôi chọn', aiSuggestion:'Gợi ý AI', selected:'Đã chọn', listen:'Nghe', prev:'Trước', next:'Tiếp' },
  TH: { myLanguage:'ภาษาของฉัน', yourLanguage:'ภาษาของอีกฝ่าย', useReply:'ใช้คำตอบนี้', selectedReply:'คำตอบที่เลือก', pastSuggestion:'คำแนะนำก่อนหน้า', myChosenReply:'คำตอบที่ฉันเลือก', aiSuggestion:'คำแนะนำ AI', selected:'เลือกแล้ว', listen:'ฟัง', prev:'ก่อนหน้า', next:'ถัดไป' },
  AR: { myLanguage:'لغتي', yourLanguage:'لغة الطرف الآخر', useReply:'استخدم هذا الرد', selectedReply:'الرد المختار', pastSuggestion:'اقتراح سابق', myChosenReply:'ردي المختار', aiSuggestion:'اقتراحات الذكاء الاصطناعي', selected:'محدد', listen:'استماع', prev:'السابق', next:'التالي' },
  HI: { myLanguage:'मेरी भाषा', yourLanguage:'सामने वाले की भाषा', useReply:'यह उत्तर उपयोग करें', selectedReply:'चुना गया उत्तर', pastSuggestion:'पिछला सुझाव', myChosenReply:'मेरा चुना उत्तर', aiSuggestion:'AI सुझाव', selected:'चयनित', listen:'सुनें', prev:'पिछला', next:'अगला' },
};

window.CT_T = function (code, key) {
  const tbl = window.CT_UI[code] || window.CT_UI.EN;
  return (tbl && tbl[key]) || window.CT_UI.EN[key] || key;
};
