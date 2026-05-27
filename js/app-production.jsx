// Production entry — renders the live translator FULLSCREEN.
// No design canvas, no variations, no phone-bezel artboard. Just the app.

const PROD_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
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

function ProductionApp() {
  const [tweaks, setTweak] = window.useTweaks(PROD_TWEAK_DEFAULTS);
  const dark = tweaks.theme === 'dark';

  // Lock body background to the active theme so mobile address bar / overscroll
  // doesn't show a different color.
  React.useEffect(() => {
    document.body.style.background = dark ? '#081B1B' : '#FCF9E8';
    document.documentElement.style.background = dark ? '#081B1B' : '#FCF9E8';
  }, [dark]);

  return (
    <>
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', flexDirection: 'column',
        background: dark ? '#081B1B' : '#FCF9E8',
        fontFamily: "'Plus Jakarta Sans', -apple-system, system-ui, sans-serif",
      }}>
        <LiveTranslator tweaks={tweaks} setTweak={setTweak} />
      </div>

      <window.TweaksPanel title="설정 · Tweaks">
        <window.TweakSection label="제안 표현">
          <window.TweakSelect
            label="제안 표시 스타일"
            value={tweaks.suggStyle}
            options={[
              { value: 'chips', label: 'V1 · 키보드 스트립' },
              { value: 'numbered', label: 'V2 · 번호 스택' },
              { value: 'carousel', label: 'V3 · 카드 덱 (기본)' },
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
            min={12} max={20} step={1} unit="px"
            onChange={v => setTweak('fontSize', v)}
          />
          <window.TweakSlider
            label="말풍선 둥글기"
            value={tweaks.bubbleRadius}
            min={6} max={28} step={2} unit="px"
            onChange={v => setTweak('bubbleRadius', v)}
          />
          <window.TweakToggle
            label="캐릭터/일러스트"
            value={tweaks.showMascot}
            onChange={v => setTweak('showMascot', v)}
          />
        </window.TweakSection>

        <window.TweakSection label="API 키">
          <window.TweakButton
            label={window.CT_API.getKey() ? 'API 키 변경/제거' : 'API 키 입력'}
            onClick={() => {
              if (window.CT_API.getKey() && confirm('현재 저장된 API 키를 제거할까요?')) {
                window.CT_API.clearKey();
              } else {
                window.dispatchEvent(new CustomEvent('ct-api-key-needed'));
              }
            }}
          />
        </window.TweakSection>
      </window.TweaksPanel>

      <window.ApiKeyBanner />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<ProductionApp />);
