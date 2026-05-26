// Top-level canvas — assembles all variations into a DesignCanvas.
// Plus a focused live prototype with Tweaks.

const PHONE_W = 380;
const PHONE_H = 800;
const FOCUS_W = 412;
const FOCUS_H = 880;

function Artboard({ palette, dark, children, h = PHONE_H, w = PHONE_W }) {
  const c = palette;
  return (
    <div style={{
      width: w, height: h, borderRadius: 30, overflow: 'hidden',
      background: c.bg, color: c.ink,
      boxShadow: dark
        ? '0 12px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06), inset 0 0 0 4px #0a0805'
        : '0 12px 32px rgba(8, 27, 27, 0.16), 0 0 0 1px rgba(0,0,0,0.06), inset 0 0 0 4px #081B1B',
      fontFamily: "'Plus Jakarta Sans', -apple-system, system-ui, sans-serif",
      display: 'flex', flexDirection: 'column',
      position: 'relative',
    }}>
      <div style={{
        height: 26, flexShrink: 0, padding: '4px 22px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 11, fontWeight: 700, color: c.ink,
        background: c.surface,
      }}>
        <span>10:05</span>
        <span style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 10 }}>
          <span>5G</span>
          <span style={{ display: 'inline-block', width: 18, height: 9, border: `1.2px solid ${c.ink2}`, borderRadius: 2, padding: 1 }}>
            <span style={{ display: 'block', width: '80%', height: '100%', background: c.ink2, borderRadius: 1 }} />
          </span>
        </span>
      </div>
      {children}
      <div style={{
        position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
        width: 100, height: 4, borderRadius: 999, background: c.ink3, opacity: 0.45,
      }} />
    </div>
  );
}

// Standalone Voice Mode demo — for canvas review
function VoiceArtboard({ palette, dark }) {
  return (
    <Artboard palette={palette} dark={dark}>
      <window.VoiceMode palette={palette} dark={dark} onClose={() => {}} onLog={() => {}} />
    </Artboard>
  );
}

// Standalone Search overlay demo — for canvas review
function SearchArtboard({ palette, dark }) {
  return (
    <Artboard palette={palette} dark={dark}>
      <window.SearchOverlay palette={palette} dark={dark} embedded onClose={() => {}} />
    </Artboard>
  );
}

function SearchEmptyArtboard({ palette, dark }) {
  // embedded with empty query — shows recents
  const Wrapper = () => {
    React.useEffect(() => {}, []);
    return <window.SearchOverlay palette={palette} dark={dark} embedded={true} onClose={() => {}} initialQ="" />;
  };
  return (
    <Artboard palette={palette} dark={dark}>
      <window.SearchOverlay palette={palette} dark={dark} embedded={true} onClose={() => {}} initialEmpty />
    </Artboard>
  );
}

// One artboard wrapper showing the chat screen with a given variant
function VariationArtboard({ variant, max = 3, convo, palette, dark, showMascot = true }) {
  return (
    <Artboard palette={palette} dark={dark}>
      <ChatScreen
        variant={variant}
        palette={palette}
        dark={dark}
        convo={convo || window.CT_CONVO}
        maxSugg={max}
        showMascot={showMascot}
      />
    </Artboard>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// The live prototype artboard — uses LiveTranslator + Tweaks
// ──────────────────────────────────────────────────────────────────────────

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "suggStyle": "carousel",
  "maxSugg": 3,
  "theme": "light",
  "primary": "#96CDB0",
  "primaryInk": "#081B1B",
  "fontSize": 14,
  "bubbleRadius": 22,
  "bubbleShadow": "soft",
  "showMascot": true,
  "target": "EN",
  "native": "KO"
}/*EDITMODE-END*/;

function LiveArtboard() {
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
  return (
    <>
      <Artboard palette={window.CT_BRAND[tweaks.theme === 'dark' ? 'dark' : 'light']} dark={tweaks.theme === 'dark'} w={FOCUS_W} h={FOCUS_H}>
        <LiveTranslator tweaks={tweaks} setTweak={setTweak} />
      </Artboard>
      <window.TweaksPanel title="Tweaks">
        <window.TweakSection label="제안 표현 (핵심)">
          <window.TweakSelect
            label="제안 표시 스타일"
            value={tweaks.suggStyle}
            options={[
              { value: 'chips', label: 'V1 · 키보드 스트립' },
              { value: 'numbered', label: 'V2 · 번호 스택' },
              { value: 'carousel', label: 'V3 · 카드 덱' },
              { value: 'mascot', label: 'V4 · 말풍선 캐릭터' },
              { value: 'sticky', label: 'V5 · 3분할 타일' },
              { value: 'tabbed', label: 'V6 · 분기 트리' },
            ]}
            onChange={v => setTweak('suggStyle', v)}
          />
          <window.TweakSlider
            label="제안 개수"
            value={tweaks.maxSugg}
            min={2} max={5} step={1}
            onChange={v => setTweak('maxSugg', v)}
          />
        </window.TweakSection>

        <window.TweakSection label="외형">
          <window.TweakRadio
            label="테마"
            value={tweaks.theme}
            options={[
              { value: 'light', label: '라이트' },
              { value: 'dark', label: '다크' },
            ]}
            onChange={v => setTweak('theme', v)}
          />
          <window.TweakColor
            label="메인 컬러"
            value={tweaks.primary}
            options={['#96CDB0', '#5A8F76', '#203B37', '#C18D52', '#735233', '#EEE8B2']}
            onChange={v => setTweak('primary', v)}
          />
          <window.TweakSlider
            label="글자 크기"
            value={tweaks.fontSize}
            min={12} max={18} step={1} unit="px"
            onChange={v => setTweak('fontSize', v)}
          />
          <window.TweakSlider
            label="말풍선 둥글기"
            value={tweaks.bubbleRadius}
            min={6} max={26} step={2} unit="px"
            onChange={v => setTweak('bubbleRadius', v)}
          />
          <window.TweakRadio
            label="말풍선 그림자"
            value={tweaks.bubbleShadow}
            options={[
              { value: 'none', label: '없음' },
              { value: 'soft', label: '부드럽게' },
              { value: 'strong', label: '진하게' },
            ]}
            onChange={v => setTweak('bubbleShadow', v)}
          />
          <window.TweakToggle
            label="캐릭터/일러스트"
            value={tweaks.showMascot}
            onChange={v => setTweak('showMascot', v)}
          />
        </window.TweakSection>
      </window.TweaksPanel>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Page-level App
// ──────────────────────────────────────────────────────────────────────────

function App() {
  const light = window.CT_BRAND.light;
  const dark = window.CT_BRAND.dark;
  const fullConvo = window.CT_CONVO;
  const I = window.CT_ICONS;

  return (
    <window.DesignCanvas>

      {/* ── Section: Intro ────────────────────────────────────────── */}
      <window.DCSection id="intro" title="Con·trans — 대화를 잇는 번역기"
        subtitle="번역 + 다음 답변 제안. 핵심은 '이어갈 영어 표현 3개'가 한눈에 들어오게 만드는 것.">
        <window.DCArtboard id="brief" label="디자인 노트" width={520} height={PHONE_H}>
          <DesignNote />
        </window.DCArtboard>
        <window.DCArtboard id="live" label="🟢 인터랙티브 프로토타입 (Tweaks 사용 가능)" width={FOCUS_W} height={FOCUS_H}>
          <LiveArtboard />
        </window.DCArtboard>
      </window.DCSection>

      {/* ── Section: Search (NEW) ─────────────────────────────────── */}
      <window.DCSection id="search" title="🔍 검색 — 과거 대화에서 키워드 찾기"
        subtitle="상단 돋보기 아이콘 → 검색 화면 진입. 한글·영어 어느 쪽으로 입력해도 양쪽 모두 검색합니다. 결과는 세션(상대방·날짜·주제)별로 그룹화, 매칭 키워드는 하이라이트.">
        <window.DCArtboard id="search-empty" label="검색 화면 · 최근 대화 + 검색 팁" width={PHONE_W} height={PHONE_H}>
          <SearchEmptyArtboard palette={light} dark={false} />
        </window.DCArtboard>
        <window.DCArtboard id="search-results" label="결과 화면 · '디자인' 키워드 검색" width={PHONE_W} height={PHONE_H}>
          <SearchArtboard palette={light} dark={false} />
        </window.DCArtboard>
        <window.DCArtboard id="search-dark" label="결과 화면 · Dark" width={PHONE_W} height={PHONE_H}>
          <SearchArtboard palette={dark} dark={true} />
        </window.DCArtboard>
      </window.DCSection>

      {/* ── Section: Voice Mode ──────────────────────────────────── */}
      <window.DCSection id="voice-mode" title="🎙️ 보이스 대화 모드 — 실시간 통역"
        subtitle="대면/통화 상황을 위한 별도 모드. 입력 바의 '보이스 대화 모드' 버튼으로 진입. 화면을 위·아래로 나눠 내 차례/상대 차례를 분리, 한국어를 말하면 자동으로 영어 음성을 상대에게 들려줍니다.">
        <window.DCArtboard id="voice-light" label="보이스 모드 · 라이트  ·  '내 차례'를 탭해 데모 실행" width={PHONE_W} height={PHONE_H}>
          <VoiceArtboard palette={light} dark={false} />
        </window.DCArtboard>
        <window.DCArtboard id="voice-dark" label="보이스 모드 · 다크" width={PHONE_W} height={PHONE_H}>
          <VoiceArtboard palette={dark} dark={true} />
        </window.DCArtboard>
      </window.DCSection>

      {/* ── Section: Suggestion variants — Light ─────────────────── */}
      <window.DCSection id="variants-light" title="제안 표시 스타일 6종 · 라이트"
        subtitle="모두 동일한 대화 위에 같은 자리(상대방 말풍선 바로 아래)에 제안 영역을 붙임. 차이는 어떻게 강조하느냐.">

        <window.DCArtboard id="v1-chips" label="V1. 키보드 스트립  ·  1줄 인라인 칩 (Gboard처럼)" width={PHONE_W} height={PHONE_H}>
          <VariationArtboard variant="chips" max={3} palette={light} dark={false} convo={fullConvo} />
        </window.DCArtboard>

        <window.DCArtboard id="v2-numbered" label="V2. 번호 스택  ·  제일 크고 크다란 추천 카드" width={PHONE_W} height={PHONE_H}>
          <VariationArtboard variant="numbered" max={3} palette={light} dark={false} convo={fullConvo} />
        </window.DCArtboard>

        <window.DCArtboard id="v3-carousel" label="V3. 카드 덱  ·  한 장씩 보면서 이전/다음" width={PHONE_W} height={PHONE_H}>
          <VariationArtboard variant="carousel" max={3} palette={light} dark={false} convo={fullConvo} />
        </window.DCArtboard>

        <window.DCArtboard id="v4-mascot" label="V4. 말풍선 캐릭터  ·  마스콧이 각 답변을 '말'해주는 느낌" width={PHONE_W} height={PHONE_H}>
          <VariationArtboard variant="mascot" max={3} palette={light} dark={false} convo={fullConvo} />
        </window.DCArtboard>

        <window.DCArtboard id="v5-sticky" label="V5. 3분할 타일  ·  정사각형 3개 나란히 (최소 공간)" width={PHONE_W} height={PHONE_H}>
          <VariationArtboard variant="sticky" max={3} palette={light} dark={false} convo={fullConvo} />
        </window.DCArtboard>

        <window.DCArtboard id="v6-tabbed" label="V6. 분기 트리  ·  대화가 갈라지는 3가지 길 (시각화)" width={PHONE_W} height={PHONE_H}>
          <VariationArtboard variant="tabbed" max={3} palette={light} dark={false} convo={fullConvo} />
        </window.DCArtboard>
      </window.DCSection>

      {/* ── Section: Dark variants ───────────────────────────────── */}
      <window.DCSection id="variants-dark" title="다크 모드 미리보기"
        subtitle="동일한 변형, 다크 테마. 라이트와 강조 위계가 일관되게 유지되는지 확인.">

        <window.DCArtboard id="v2d" label="V2. 번호 스택 · Dark" width={PHONE_W} height={PHONE_H}>
          <VariationArtboard variant="numbered" max={3} palette={dark} dark={true} convo={fullConvo} />
        </window.DCArtboard>

        <window.DCArtboard id="v3d" label="V3. 카드 덱 · Dark" width={PHONE_W} height={PHONE_H}>
          <VariationArtboard variant="carousel" max={3} palette={dark} dark={true} convo={fullConvo} />
        </window.DCArtboard>

        <window.DCArtboard id="v4d" label="V4. 말풍선 캐릭터 · Dark" width={PHONE_W} height={PHONE_H}>
          <VariationArtboard variant="mascot" max={3} palette={dark} dark={true} convo={fullConvo} />
        </window.DCArtboard>

        <window.DCArtboard id="v6d" label="V6. 분기 트리 · Dark" width={PHONE_W} height={PHONE_H}>
          <VariationArtboard variant="tabbed" max={3} palette={dark} dark={true} convo={fullConvo} />
        </window.DCArtboard>
      </window.DCSection>

    </window.DesignCanvas>
  );
}

function DesignNote() {
  return (
    <div style={{
      width: '100%', height: '100%', padding: 28, boxSizing: 'border-box',
      background: '#FCF9E8', color: '#081B1B', overflow: 'auto',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      borderRadius: 24, border: '1px solid #dde4e1',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <Mascot mood="happy" size={48} />
        <div>
          <div style={{
            fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em',
            fontFamily: "'Chakra Petch', system-ui, sans-serif",
          }}>ConvoTrans</div>
          <div style={{ fontSize: 11, color: '#5f6b67', letterSpacing: '0.04em' }}>
            Live conversation translation
          </div>
        </div>
      </div>

      <Section title="문제">
        번역은 기본. <b>대화를 이어갈 영어 표현 3가지</b>가 핵심 차별점.
        하지만 v14는 표현이 본문 텍스트와 비슷해서, 길어진 화면에서 한눈에 잡히지 않음.
      </Section>

      <Section title="원칙">
        1. <b>제안은 항상 가장 강한 시각 위계</b><br />
        2. <b>3가지 의도</b>를 색·라벨로 구분<br />
        3. <b>1탭으로 입력창에 채워짐</b> — 보낼지 다듬을지는 사용자 결정<br />
        4. <b>Malachite & gold</b> 브랜드 — 차분하고 자신감 있게
      </Section>

      <Section title="구조">
        ① 상단: 원형 ISO 칩 언어 선택 + 검색/테마/설정<br />
        ② 본문: 시간순 말풍선 (내 말 오른쪽 · 상대 왼쪽)<br />
        ③ <b>내 말풍선</b>: <b style={{ color: '#487762' }}>영어 크게</b> · 원문은 점선 박스 (나만 봄)<br />
        ④ <b>상대 말풍선</b>: 영어 + 듣기/반복 · 모국어 번역 작게<br />
        ⑤ <b style={{ color: '#C18D52' }}>AI 추천 영역 (copper)</b> — 6가지 방식<br />
        ⑥ 하단 입력: 어떤 언어든 → 대화 언어로 자동 번역·정정 후 전송
      </Section>

      <Section title="브랜드">
        🟢 mint <b>#96CDB0</b> · 🟢 sage <b>#5A8F76</b> · ⚫ forest <b>#203B37</b><br/>
        🟡 cream <b>#EEE8B2</b> · 🟠 copper <b>#C18D52</b><br/>
        Display: <b>Chakra Petch</b> · Body: <b>Plus Jakarta Sans</b>
      </Section>

      <div style={{
        marginTop: 24, padding: 12, background: '#dcf2e6', borderRadius: 14,
        fontSize: 12, color: '#1a2f26', lineHeight: 1.55,
        border: '1px solid #bce4ce',
      }}>
        💡 6가지 변형은 <b>각기 다른 메타포</b>를 씁니다 —
        칩 스트립 / 번호 스택 / 카드 덱 / 말풍선 / 타일 그리드 / 분기 트리.
        가운데 🟢 프로토타입의 Tweaks로 실시간 변경 가능합니다.
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: '#487762', marginBottom: 6,
        fontFamily: "'Chakra Petch', system-ui, sans-serif",
      }}>{title}</div>
      <div style={{ fontSize: 13, color: '#203B37', lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <App />
    <window.ApiKeyBanner />
  </>
);
