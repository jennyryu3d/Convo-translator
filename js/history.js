// History data — past conversations grouped by date, for Search demo.
// In production these would come from local storage / server.

window.CT_HISTORY = [
  {
    id: 'sess-2026-05-15',
    date: '2026-05-15',
    label: '오늘',
    partner: 'Sarah Mitchell',
    partnerOrg: 'Helios Design',
    topic: '디자인 제안서 검토 미팅',
    messages: [
      { side: 'me',   orig: '안녕하세요, 만나서 반갑습니다.', trans: 'Hi, nice to meet you in person.', time: '오전 10:02' },
      { side: 'them', orig: 'Likewise! Did you have a chance to review the proposal I sent over yesterday?', trans: '저도 반갑습니다! 어제 보내드린 제안서 한번 보실 시간 있으셨어요?', time: '오전 10:02' },
      { side: 'me',   orig: '네, 어젯밤에 다 봤습니다. 일정 관련해서 몇 가지 여쭤보고 싶어요.', trans: 'Yes, I went through it last night. I have a few questions about the timeline.', time: '오전 10:03' },
      { side: 'them', orig: 'Of course. The timeline assumes we kick off next Monday with a two-week design phase. Does that work for your team?', trans: '물론이죠. 다음 주 월요일 착수 후 2주간 디자인 단계로 잡혀 있는데, 그쪽 팀에서 가능하실까요?', time: '오전 10:04' },
    ],
  },
  {
    id: 'sess-2026-05-13',
    date: '2026-05-13',
    label: '이틀 전',
    partner: 'Sarah Mitchell',
    partnerOrg: 'Helios Design',
    topic: 'API 통합 일정 협의',
    messages: [
      { side: 'me',   orig: 'API 명세서를 받았는데, 인증 부분이 좀 불명확해요.', trans: 'I received the API spec, but the authentication part is a bit unclear.', time: '오후 2:14' },
      { side: 'them', orig: 'Got it. We use OAuth 2.0 with refresh tokens. I can share a sample request if that helps.', trans: '알겠습니다. OAuth 2.0과 refresh token을 사용해요. 도움이 된다면 샘플 요청 보내드릴게요.', time: '오후 2:15' },
      { side: 'me',   orig: '좋아요. 샘플 부탁드립니다. 그리고 rate limit도 알려주세요.', trans: 'Great. Please send the sample. And let me know the rate limit too.', time: '오후 2:16' },
      { side: 'them', orig: 'Rate limit is 1000 requests per minute. I\'ll email everything by end of day.', trans: '분당 1000건 제한이에요. 오늘 안에 메일로 다 보내드릴게요.', time: '오후 2:17' },
    ],
  },
  {
    id: 'sess-2026-05-09',
    date: '2026-05-09',
    label: '지난 주',
    partner: 'Marcus Lee',
    partnerOrg: 'Northwind Capital',
    topic: '투자 라운드 일정 / 자료 요청',
    messages: [
      { side: 'them', orig: 'Hi! Following up on our last call — when do you think you\'ll have the financial model ready?', trans: '안녕하세요! 지난 통화 후속이에요 — 재무 모델은 언제쯤 준비되실 것 같아요?', time: '오전 9:30' },
      { side: 'me',   orig: '다음 주 수요일까지는 초안 보내드릴 수 있어요. 검토 부탁드립니다.', trans: 'I can send you a draft by next Wednesday. Please review it.', time: '오전 9:32' },
      { side: 'them', orig: 'Perfect. Also, can you include unit economics broken down by segment?', trans: '좋아요. 그리고 세그먼트별로 unit economics도 포함해 주실 수 있나요?', time: '오전 9:33' },
      { side: 'me',   orig: '네, 엔터프라이즈와 셀프서브 두 세그먼트로 나눠서 정리할게요.', trans: 'Sure, I\'ll break it down by Enterprise and Self-serve segments.', time: '오전 9:34' },
    ],
  },
  {
    id: 'sess-2026-05-02',
    date: '2026-05-02',
    label: '2주 전',
    partner: '여행 가이드 (Lisbon)',
    partnerOrg: '리스본 여행',
    topic: '벨렘 지구 가는 길 묻기',
    messages: [
      { side: 'me',   orig: '벨렘 지구까지 트램으로 얼마나 걸려요?', trans: 'How long does it take to get to the Belém district by tram?', time: '오후 3:11' },
      { side: 'them', orig: 'About 25 minutes on tram 15E from Praça da Figueira. Goes right past the Jerónimos Monastery.', trans: '피게이라 광장에서 15E 트램으로 약 25분이에요. 제로니무스 수도원 바로 옆을 지나요.', time: '오후 3:12' },
      { side: 'me',   orig: '감사합니다. 추천하시는 식당이 근처에 있나요?', trans: 'Thanks. Is there a restaurant you\'d recommend nearby?', time: '오후 3:13' },
    ],
  },
  {
    id: 'sess-2026-04-22',
    date: '2026-04-22',
    label: '한 달 전',
    partner: 'Helios Design 팀',
    partnerOrg: 'Helios Design',
    topic: '킥오프 미팅 / 디자인 시스템 합의',
    messages: [
      { side: 'me',   orig: '디자인 시스템은 저희 쪽 토큰을 그대로 쓰면 될까요?', trans: 'Can we just use our design tokens as-is?', time: '오전 11:05' },
      { side: 'them', orig: 'Yes, send us your tokens.json and we\'ll adapt our components.', trans: '네, tokens.json 파일 보내주시면 저희가 컴포넌트를 맞춰 갈게요.', time: '오전 11:06' },
    ],
  },
];

// Flatten for searching: include session metadata so we can group results.
// Searches BOTH the demo history and the user's own saved conversations.
window.CT_searchAll = function(q) {
  const norm = (s) => String(s || '').toLowerCase();
  const needle = norm(q).trim();
  if (!needle) return [];
  const results = [];
  const saved = (window.CT_SAVED && window.CT_SAVED.all()) || [];
  const all = [...saved, ...window.CT_HISTORY];
  for (const sess of all) {
    for (let i = 0; i < (sess.messages || []).length; i++) {
      const m = sess.messages[i];
      const blob = norm(m.orig) + ' ' + norm(m.trans);
      if (blob.includes(needle)) {
        results.push({ session: sess, msg: m, idx: i });
      }
    }
  }
  return results;
};
