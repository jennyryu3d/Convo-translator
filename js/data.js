// Shared mock conversation + brand tokens — ConvoTrans design system applied.
// Mapped to the "malachite & gold" palette: mint + sage + forest + ink + cream + copper.
window.CT_BRAND = {
  light: {
    bg: '#FCF9E8',           // cream-50 — warm off-white app surface
    surface: '#FFFFFF',      // gray-0 cards
    ink: '#081B1B',          // forest-900 / brand-ink
    ink2: '#203B37',         // forest-600 secondary
    ink3: '#5f6b67',         // gray-500 meta
    divider: '#dde4e1',      // gray-200
    primary: '#96CDB0',      // brand-mint — primary CTA
    primaryInk: '#081B1B',
    primarySoft: '#dcf2e6',  // mint-100
    // My bubble: mint background (light), forest text
    mine: '#96CDB0',
    mineInk: '#081B1B',
    // Their bubble: pure white
    them: '#FFFFFF',
    themInk: '#081B1B',
    themBorder: '#dde4e1',
    themAvatar: '#203B37',
    themAvatarBg: '#dcf2e6',
    // AI uses COPPER (no purple per brand rules)
    ai: '#C18D52',           // brand-copper
    aiInk: '#FFFFFF',
    aiSoft: '#f7f1cc',       // cream-100
    aiDeep: '#735233',       // cream-800
    accent2: '#5A8F76',      // brand-sage — success/secondary
  },
  dark: {
    bg: '#081B1B',           // brand-ink
    surface: '#102220',      // forest-800
    ink: '#f7f1cc',          // cream-100
    ink2: '#EEE8B2',         // cream-300
    ink3: '#6e8e88',         // forest-300
    divider: 'rgba(255,255,255,0.10)',
    primary: '#96CDB0',
    primaryInk: '#081B1B',
    primarySoft: '#182d2a',  // forest-700 ish
    mine: '#96CDB0',
    mineInk: '#081B1B',
    them: '#102220',
    themInk: '#f7f1cc',
    themBorder: 'rgba(255,255,255,0.12)',
    themAvatar: '#96CDB0',
    themAvatarBg: '#182d2a',
    ai: '#d4b06f',           // cream-500 (brighter copper for dark)
    aiInk: '#081B1B',
    aiSoft: '#4a3522',       // cream-900
    aiDeep: '#EEE8B2',
    accent2: '#96CDB0',
  },
};

window.CT_CONVO = [
  {
    id: 1,
    side: 'me',
    orig: '안녕하세요, 만나서 반갑습니다.',
    trans: 'Hi, nice to meet you in person.',
    inputKind: 'foreign',
    time: '오전 10:02',
  },
  {
    id: 2,
    side: 'them',
    orig: 'Likewise! Did you have a chance to review the proposal I sent over yesterday?',
    trans: '저도 반갑습니다! 어제 보내드린 제안서 한번 보실 시간 있으셨어요?',
    time: '오전 10:02',
    suggestions: [
      {
        en: "Yes, I went through it last night. I have a few questions about the timeline.",
        ko: '네, 어젯밤에 다 봤습니다. 일정 관련해서 몇 가지 여쭤보고 싶어요.',
        tone: '긍정',
      },
      {
        en: "I started reviewing it but didn't finish. Could you give me until tomorrow?",
        ko: '검토 시작했는데 다 못 봤어요. 내일까지 시간 주실 수 있을까요?',
        tone: '보류',
      },
      {
        en: "Not yet, sorry. Could you walk me through the main points?",
        ko: '아직 못 봤어요, 죄송합니다. 주요 내용만 간단히 설명해 주실 수 있나요?',
        tone: '요청',
      },
    ],
  },
  {
    id: 3,
    side: 'me',
    orig: 'Yes I read it last night. I has few question about schedule.',
    trans: 'Yes, I read it last night. I have a few questions about the schedule.',
    inputKind: 'polished',
    time: '오전 10:03',
  },
  {
    id: 4,
    side: 'them',
    orig: "Of course. The timeline assumes we kick off next Monday with a two-week design phase. Does that work for your team?",
    trans: '물론이죠. 다음 주 월요일 착수 후 2주간 디자인 단계로 잡혀 있는데, 그쪽 팀에서 가능하실까요?',
    time: '오전 10:04',
    suggestions: [
      { en: "Monday is tight, but doable. Could we extend the design phase to three weeks?", ko: '월요일 시작은 빠듯하지만 가능해요. 디자인 단계를 3주로 늘릴 수 있을까요?', tone: '제안' },
      { en: "That works for us. We'll have the design team ready by Monday.", ko: '저희도 가능합니다. 월요일까지 디자인팀 준비시켜 두겠습니다.', tone: '동의' },
      { en: "Let me check with my team and get back to you by end of day.", ko: '팀과 확인 후 오늘 안으로 답변 드릴게요.', tone: '보류' },
    ],
  },
];
