// Shared mock conversation + brand tokens
window.CT_BRAND = {
  light: {
    bg: '#FFFAF5',
    surface: '#FFFFFF',
    ink: '#1A1410',
    ink2: '#6B5B4F',
    ink3: '#A89A8E',
    divider: '#F1E8DE',
    primary: '#E85D2F',          // warm orange (brand + ME)
    primaryInk: '#FFFFFF',
    primarySoft: '#FFEDE3',
    mine: '#E85D2F',             // my bubble: SOLID orange
    mineInk: '#FFFFFF',
    them: '#FFFFFF',             // their bubble: white
    themInk: '#1A1410',
    themBorder: '#E8DCCB',
    themAvatar: '#6B5B4F',       // neutral grey-brown for "EN" badge
    themAvatarBg: '#F1E8DE',
    // AI gets its OWN color family — violet, never used in chat bubbles
    ai: '#7C5DDC',
    aiInk: '#FFFFFF',
    aiSoft: '#EFEAFC',
    aiDeep: '#3D2C8B',
    accent2: '#2E7D5B',
  },
  dark: {
    bg: '#16110D',
    surface: '#221A14',
    ink: '#F8EFE6',
    ink2: '#B8A99B',
    ink3: '#7A6B5F',
    divider: '#2E241C',
    primary: '#FF7849',
    primaryInk: '#1A1410',
    primarySoft: '#3A2317',
    mine: '#FF7849',             // solid orange in dark too
    mineInk: '#1A1410',
    them: '#2A201A',
    themInk: '#F8EFE6',
    themBorder: '#3D2F26',
    themAvatar: '#B8A99B',
    themAvatarBg: '#3D2F26',
    ai: '#A689F2',
    aiInk: '#1A1410',
    aiSoft: '#2E1F4F',
    aiDeep: '#C8B5FF',
    accent2: '#7AB89A',
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
    // EN-FIXED example: user spoke imperfect English, app corrected it.
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
      {
        en: "Monday is tight, but doable. Could we extend the design phase to three weeks?",
        ko: '월요일 시작은 빠듯하지만 가능해요. 디자인 단계를 3주로 늘릴 수 있을까요?',
        tone: '제안',
      },
      {
        en: "That works for us. We'll have the design team ready by Monday.",
        ko: '저희도 가능합니다. 월요일까지 디자인팀 준비시켜 두겠습니다.',
        tone: '동의',
      },
      {
        en: "Let me check with my team and get back to you by end of day.",
        ko: '팀과 확인 후 오늘 안으로 답변 드릴게요.',
        tone: '보류',
      },
    ],
  },
];

// One-off conversation (live prototype starting state) — first 2 entries only
window.CT_CONVO_SHORT = window.CT_CONVO.slice(0, 2);
