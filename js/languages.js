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
  EN: {
    yourLanguage: "Other's language", myLanguage: 'My language',
    meSent: 'Me · Sent', asIs: 'As-is', corrected: '✏ Corrected', correctedMine: 'Corrected · my input', myInput: 'My input',
    them: 'Other', translation: 'Translation',
    liveMode: 'Live chat', learnMode: 'Practice mode',
    whoSpeaksHint: "Tap who's speaking, then talk", processing: 'Processing…', listeningTapDone: 'Listening · tap to finish',
    iSpeak: "I'll speak", theySpeak: 'They speak', suggest3: '3 suggestions',
    practiceHint: 'Type and AI plays your partner — it replies and suggests what to say next',
    placeholderAnyLang: "Type in any language — it's sent as {lang}…",
    tagAsIs: '✓ {code} as-is', tagFix: '✏ {code} fix', tagTranslate: '→ {code} translate',
    autoProcessing: 'Auto-processing…', autoTranslateHint: 'Translates automatically as you type',
    translateBtn: 'Translate', manualTranslateHint: 'Tap Translate when you’re done typing',
    voiceInput: '{lang} voice input', sendTo: 'Send as {lang}',
    // Settings
    version: 'Version', build: 'Build', convoLanguage: 'Conversation language',
    myNativeLang: 'My language', speechRecognition: 'Speech recognition',
    supported: 'Supported', unsupportedBrowser: 'Unsupported browser',
    apiConnection: 'API connection', designEnv: 'Design environment',
    connectedMyKey: 'Connected (your key)', serverConnected: 'Server connected',
    appAddress: 'App address', colorTheme: 'Color theme', whatsNew: "What's new",
    privacyPolicy: 'Privacy policy', view: 'View',
    tagline: 'Real-time conversation translator · 14 languages',
    // Language picker
    pickConvoLang: 'Choose conversation language', pickNativeLang: 'Choose my language',
    targetSlotDesc: 'Language for talking, transcripts, and corrections',
    nativeSlotDesc: 'Helper translation only you see',
    targetSlotHint: 'Whatever language you type is auto-translated and corrected into this, then sent to the other person.',
    nativeSlotHint: "The other person's words are translated into this and shown only to you.",
    // API key banner
    keyFormatAlert: 'An Anthropic API key starts with "sk-ant-…". Please check and try again.',
    rateTag: 'One moment', rateTitle: 'High demand right now',
    rateBody: 'A lot of requests came in at once. Please try again shortly. To keep going right away, you can use your own API key.',
    connTag: 'Connection issue', connTitle: 'Connection is a little unstable',
    connBody: "We couldn't reach the translation server for a moment. Please try again shortly. To keep going right away, you can use your own API key.",
    keyTag: 'API key', keyTitle: 'Use my Anthropic API key',
    keyBody: 'Translation normally works without a key. Add your own as a backup so things keep flowing during high demand. Your key is stored only on this device.',
    ok: 'OK', useMyKey: 'Use my API key', getKeyLink: 'Get a key at console.anthropic.com →',
    later: 'Later', save: 'Save', keyStorageNote: "🔒 Your key is stored only in this browser's localStorage. On a shared computer, remove it in settings after use.",
    // Search / saved conversations
    savedConvos: 'Saved conversations', searchConvos: 'Search conversations', close: 'Close',
    searchPlaceholder: 'Search your conversation history…', period: 'Date range', clearPeriod: 'Clear dates',
    all: 'All', mine: 'Me', theirs: 'Other', searchAllNote: 'Searches all text',
    recentConvos: 'Recent', thatPeriod: 'that range',
    deleteConfirm: "Delete this conversation? This can't be undone.",
    noSavedYet: 'No saved conversations yet',
    noSavedHintA: 'After a conversation, tap', saveConvoBold: 'Save conversation',
    noSavedHintB: ' to find it again here by searching.',
    searchTips: 'Search tips', searchTipsBody: 'Search freely — titles, summaries, and conversation text are all searched.',
    delete: 'Delete', noMatch: 'No results matching "{q}"',
    noMatchHint: 'Try a different keyword.', hits: '{n} hits',
    // Save sheet
    untitledConvo: 'Untitled conversation', convoWord: 'Conversation', savedConvoTopic: 'Saved conversation',
    savedLabel: 'Saved', startNewQ: 'Start a new conversation?', saveThisQ: 'Save this conversation?',
    startNewDesc: 'Save the current conversation, or start fresh without saving',
    saveThisDesc: 'Edit the title and summary · find it later by search',
    titleLabel: 'Title', titleGenerating: 'Generating title…', titlePlaceholder: 'e.g., Meeting with Thomas',
    summaryLabel: 'Summary', aiWriting: 'AI writing…', summaryGenerating: 'Summarizing the conversation…',
    summaryPlaceholder: 'Enter a summary', msgsSavedNote: '💬 {n} messages saved too · revisit them as study material',
    deleteConvo: 'Delete conversation', dontSave: "Don't save", dontShowToday: "Don't show automatically today",
    // Conversation screen — empty state, confirms, viewer, FABs, word popup
    skinChanged: '{name} theme applied · this color will stick from now on',
    clearAndRestart: 'Clear the current conversation and start over?',
    transFailed: '(translation failed)', transFetchFail: "(couldn't get the translation)",
    transPreparing: '(preparing translation…)', translating: 'Translating…',
    startConvo: 'Start a conversation',
    emptyHintPre: 'Below, choose', emptyHintMid: 'or',
    emptyHintPost: ' — then speak or type, and translations with next-phrase suggestions begin.',
    modeSwitchTo: 'Switch to {name}?',
    modeSwitchBody: 'You have a conversation in progress. Switch while keeping it, or clear it and start fresh.',
    keepAndSwitch: 'Keep & switch', clearAndSwitch: 'Clear & switch', cancel: 'Cancel', startFresh: 'Start fresh',
    readOnly: 'Read-only', noMsgsInConvo: 'This conversation has no saved messages.',
    newConvo: 'New conversation', msgsCount: '{n} messages',
    aiSuggestion: 'AI suggestions', selected: 'Selected', myChosenReply: 'My chosen reply',
    listen: 'Listen', prev: 'Previous', next: 'Next',
    selectedReply: 'Selected', pastSuggestion: 'Past suggestion', useReply: 'Use this reply',
  },
  KO: {
    yourLanguage: '상대방 언어', myLanguage: '내 언어',
    meSent: '나 · 전송됨', asIs: '그대로', corrected: '✏ 정정됨', correctedMine: '정정됨 · 내 입력', myInput: '내 입력',
    them: '상대방', translation: '번역',
    liveMode: '실시간 대화', learnMode: '학습 모드',
    whoSpeaksHint: '누가 말하는지 누른 뒤 말하세요', processing: '처리 중…', listeningTapDone: '듣는 중 · 탭하면 완료',
    iSpeak: '내가 말하기', theySpeak: '상대방 말하기', suggest3: '제안 3개',
    practiceHint: '입력하면 AI가 상대역이 되어 답하고 다음 표현을 제안해요',
    placeholderAnyLang: '어떤 언어로 입력해도 {lang}로 전송돼요…',
    tagAsIs: '✓ {code} 그대로', tagFix: '✏ {code} 정정', tagTranslate: '→ {code} 번역',
    autoProcessing: '자동 처리 중…', autoTranslateHint: '입력하면 자동 번역됩니다',
    translateBtn: '번역', manualTranslateHint: '다 입력한 뒤 번역을 누르세요',
    voiceInput: '{lang} 음성 입력', sendTo: '{lang}로 보내기',
    // Settings
    version: '버전', build: '빌드', convoLanguage: '대화 언어',
    myNativeLang: '내 모국어', speechRecognition: '음성 인식',
    supported: '지원됨', unsupportedBrowser: '미지원 브라우저',
    apiConnection: 'API 연결', designEnv: '디자인 환경',
    connectedMyKey: '연결됨 (내 키)', serverConnected: '서버 연결됨',
    appAddress: '앱 주소', colorTheme: '색상 테마', whatsNew: '이번 업데이트',
    privacyPolicy: '개인정보 처리방침', view: '보기',
    tagline: '대화를 잇는 실시간 번역기 · 14개 언어 지원',
    // Language picker
    pickConvoLang: '대화 언어 선택', pickNativeLang: '내 모국어 선택',
    targetSlotDesc: '상대방과 대화·기록·교정에 쓰일 언어',
    nativeSlotDesc: '나만 보는 보조 번역 언어',
    targetSlotHint: '내가 어떤 언어로 입력해도 이 언어로 자동 번역/교정되어 상대에게 전송됩니다.',
    nativeSlotHint: '상대방 말이 이 언어로 번역돼 나에게만 보입니다.',
    // API key banner
    keyFormatAlert: 'Anthropic API 키는 "sk-ant-…" 로 시작해요. 다시 확인해 주세요.',
    rateTag: '잠시만요', rateTitle: '지금 사용량이 많아요',
    rateBody: '요청이 한꺼번에 몰렸어요. 잠시 후 다시 시도해 주세요. 바로 계속하고 싶다면 본인 API 키를 쓸 수도 있어요.',
    connTag: '연결 문제', connTitle: '잠시 연결이 원활하지 않아요',
    connBody: '번역 서버에 일시적으로 연결하지 못했어요. 잠시 후 다시 시도해 주세요. 바로 계속하고 싶다면 본인 API 키를 쓸 수도 있어요.',
    keyTag: 'API 키 설정', keyTitle: '내 Anthropic API 키 쓰기',
    keyBody: '평소엔 키 없이 번역돼요. 사용량이 몰릴 때를 대비해 본인 키를 넣어두면, 막히지 않고 본인 키로 번역됩니다. 키는 이 기기에만 저장돼요.',
    ok: '확인', useMyKey: '내 API 키 쓰기', getKeyLink: 'console.anthropic.com에서 키 발급받기 →',
    later: '나중에', save: '저장', keyStorageNote: '🔒 키는 브라우저 localStorage에만 저장돼요. 공용 PC면 사용 후 설정에서 제거하세요.',
    // Search / saved conversations
    savedConvos: '저장된 대화', searchConvos: '대화 검색', close: '닫기',
    searchPlaceholder: '대화 기록에서 한글·영어 검색…', period: '기간', clearPeriod: '기간 해제',
    all: '전체', mine: '내 말', theirs: '상대 말', searchAllNote: '한글·영어 모두 검색',
    recentConvos: '최근 대화', thatPeriod: '해당 기간',
    deleteConfirm: '이 대화를 삭제할까요? 되돌릴 수 없어요.',
    noSavedYet: '아직 저장된 대화가 없어요',
    noSavedHintA: '대화를 나눈 뒤', saveConvoBold: '대화 저장',
    noSavedHintB: '을 누르면 여기에서 한글·영어로 검색해 다시 찾을 수 있어요',
    searchTips: '검색 팁', searchTipsBody: '한글 또는 영어로 자유롭게 검색하세요. 제목·요약·대화 내용 모두 검색돼요.',
    delete: '삭제', noMatch: '"{q}"와(과) 일치하는 결과가 없어요',
    noMatchHint: '다른 키워드를 시도해 보거나 한글·영어 중 한 쪽으로 다시 검색해 보세요', hits: '{n}건',
    // Save sheet
    untitledConvo: '제목 없는 대화', convoWord: '대화', savedConvoTopic: '저장된 대화',
    savedLabel: '저장됨', startNewQ: '새 대화를 시작할까요?', saveThisQ: '이 대화를 저장할까요?',
    startNewDesc: '현재 대화를 저장하거나, 저장 없이 새로 시작할 수 있어요',
    saveThisDesc: '제목과 요약을 편집할 수 있어요 · 나중에 검색으로 찾기',
    titleLabel: '제목', titleGenerating: '제목 생성 중…', titlePlaceholder: '예: 토마스와의 미팅',
    summaryLabel: '요약', aiWriting: 'AI 작성 중…', summaryGenerating: '대화 내용을 요약하고 있어요…',
    summaryPlaceholder: '대화 요약을 입력하세요', msgsSavedNote: '💬 {n}개 메시지가 함께 저장돼요 · 영어 학습 자료로 다시 볼 수 있어요',
    deleteConvo: '대화 삭제', dontSave: '저장 안 함', dontShowToday: '오늘 하루 자동으로 띄우지 않기',
    // Conversation screen — empty state, confirms, viewer, FABs, word popup
    skinChanged: '{name} 테마로 변경됐어요 · 앞으로 이 색상이 유지돼요',
    clearAndRestart: '현재 대화를 지우고 새로 시작할까요?',
    transFailed: '(번역 실패)', transFetchFail: '(번역을 가져오지 못했어요)',
    transPreparing: '(번역 준비 중…)', translating: '번역 중…',
    startConvo: '대화를 시작해 보세요',
    emptyHintPre: '아래에서', emptyHintMid: '또는',
    emptyHintPost: '를 골라 말하거나 입력하면 번역과 다음 표현 제안이 시작돼요',
    modeSwitchTo: '{name}(으)로 전환할까요?',
    modeSwitchBody: '진행 중인 대화가 있어요. 대화를 유지한 채 전환하거나, 지우고 새로 시작할 수 있어요.',
    keepAndSwitch: '대화 유지하고 전환', clearAndSwitch: '대화 지우고 전환', cancel: '취소', startFresh: '새로 시작',
    readOnly: '읽기 전용', noMsgsInConvo: '이 대화에는 저장된 메시지가 없어요.',
    newConvo: '새 대화', msgsCount: '{n}개 메시지',
    aiSuggestion: 'AI 제안', selected: '선택됨', myChosenReply: '내가 선택한 답변',
    listen: '듣기', prev: '이전 답변', next: '다음 답변',
    selectedReply: '선택한 답변', pastSuggestion: '지난 제안', useReply: '이 답변 사용하기',
  },
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

// Current UI locale: 'KO' or 'EN'. The app sets this from the user's selected
// language (Korean → KO, any other language → EN).
window.CT_LOCALE = 'KO';

// Translate a UI key for the current locale, with optional {placeholder} vars.
window.t = function (key, vars) {
  const loc = window.CT_LOCALE === 'EN' ? 'EN' : 'KO';
  const tbl = window.CT_UI[loc] || window.CT_UI.KO;
  let s = (tbl && tbl[key] != null) ? tbl[key]
        : (window.CT_UI.EN[key] != null ? window.CT_UI.EN[key] : key);
  if (vars) s = String(s).replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
  return s;
};

// Back-compat: explicit lookup by language code.
window.CT_T = function (code, key) {
  const tbl = window.CT_UI[code] || window.CT_UI.EN;
  return (tbl && tbl[key]) || window.CT_UI.EN[key] || key;
};
