// Shared mock conversation + brand tokens.
// Palette: ConvoTrans blue — navy #002854, blue #006898, cyan #05A9CF, greys.
window.CT_BRAND = {
  light: {
    bg: '#F2F5F8',           // cool light grey-blue app surface
    surface: '#FFFFFF',      // cards
    ink: '#002854',          // deep navy — primary text
    ink2: '#3A5A78',         // muted navy secondary
    ink3: '#8A9AAB',         // blue-grey meta
    divider: '#DDE4EA',      // light blue-grey
    primary: '#006898',      // mid blue — primary CTA
    primaryInk: '#FFFFFF',
    primarySoft: '#D6EAF3',  // pale blue
    // My bubble: cyan, dark navy text
    mine: '#05A9CF',
    mineInk: '#002854',
    // Their bubble: pure white
    them: '#FFFFFF',
    themInk: '#002854',
    themBorder: '#DDE4EA',
    themAvatar: '#3A5A78',
    themAvatarBg: '#E5EBF1',
    // AI uses DEEP NAVY (distinct from cyan "me" and white "them")
    ai: '#002854',
    aiInk: '#FFFFFF',
    aiSoft: '#E3EAF1',
    aiDeep: '#001B3C',
    accent2: '#05A9CF',      // bright cyan — success/secondary accent
  },
  dark: {
    bg: '#001226',           // near-black navy
    surface: '#04203F',      // deep navy card
    ink: '#EAF1F7',
    ink2: '#A8C0D4',
    ink3: '#5E7A95',
    divider: 'rgba(255,255,255,0.10)',
    primary: '#05A9CF',
    primaryInk: '#002854',
    primarySoft: '#0A2E50',
    mine: '#05A9CF',
    mineInk: '#002854',
    them: '#04203F',
    themInk: '#EAF1F7',
    themBorder: 'rgba(255,255,255,0.12)',
    themAvatar: '#A8C0D4',
    themAvatarBg: '#0A2E50',
    ai: '#0E4C7A',
    aiInk: '#FFFFFF',
    aiSoft: '#0A2E50',
    aiDeep: '#002854',
    accent2: '#05A9CF',
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
