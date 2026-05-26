// Live interactive prototype — single screen with full state.
// Used as a focus-mode-friendly artboard with Tweaks support.

function LiveTranslator({ tweaks, setTweak }) {
  const dark = tweaks.theme === 'dark';
  const palette = window.CT_BRAND[dark ? 'dark' : 'light'];

  // Override primary color from tweaks
  const c = React.useMemo(() => {
    const p = { ...palette };
    p.primary = tweaks.primary;
    p.primaryInk = tweaks.primaryInk || '#fff';
    return p;
  }, [palette, tweaks.primary, tweaks.primaryInk]);

  const [convo, setConvo] = React.useState(window.CT_CONVO);
  const [mode, setMode] = React.useState('mine');
  const [voiceModeOpen, setVoiceModeOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [langPicker, setLangPicker] = React.useState(null);  // 'target' | 'native' | null
  const target = tweaks.target || 'EN';
  const native = tweaks.native || 'KO';
  const scrollRef = window.useDragScroll();

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [convo]);

  function nowStamp() {
    const d = new Date();
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    return (h < 12 ? '오전 ' : '오후 ') + ((h % 12) || 12) + ':' + m;
  }

  // Send MY message: orig=raw input (Korean OR raw English), trans=ENGLISH sent.
  // inputKind: 'ko' | 'en-clean' | 'en-fixed'
  function sendMine(orig, trans, inputKind = 'ko') {
    setConvo(cv => [...cv, {
      id: Date.now(), side: 'me',
      orig, trans, inputKind, time: nowStamp(),
    }]);
    // Fake a "their" reply with AI-fresh suggestions
    setTimeout(async () => {
      const replies = [
        { en: 'Got it. Could you send over the updated draft by Friday?', ko: '알겠습니다. 금요일까지 수정된 초안을 보내주실 수 있을까요?' },
        { en: 'Thanks for clarifying. What\'s the next step on your end?', ko: '명확히 해주셔서 감사해요. 그쪽에서는 다음 단계가 뭔가요?' },
        { en: 'Sounds reasonable. Who should I loop in on this?', ko: '합리적이네요. 이 건에 누구를 함께 참여시킬까요?' },
      ];
      const pick = replies[Math.floor(Math.random() * replies.length)];
      setConvo(cv => [...cv, {
        id: Date.now() + 1, side: 'them',
        orig: pick.en, trans: pick.ko, time: nowStamp(),
        suggestions: [
          { en: 'Sure, I\'ll have it ready by Thursday afternoon.', ko: '네, 목요일 오후까지 준비할게요.', tone: '동의' },
          { en: 'Friday might be tight. Can we aim for Monday instead?', ko: '금요일은 빠듯해요. 월요일은 어떠세요?', tone: '대안' },
          { en: 'Will do. Anything specific you want me to highlight?', ko: '알겠습니다. 특별히 강조해야 할 부분이 있을까요?', tone: '질문' },
        ],
      }]);
    }, 900);
  }

  // Record THEIR speech: orig=English (their words), trans=Korean (for me to read)
  function sendThem(english, korean) {
    setConvo(cv => [...cv, {
      id: Date.now(), side: 'them',
      orig: english, trans: korean, time: nowStamp(),
      suggestions: [
        { en: 'Got it, thanks for letting me know.', ko: '알겠습니다, 알려주셔서 감사해요.', tone: '동의' },
        { en: 'Could you give me a bit more detail on that?', ko: '그 부분 조금 더 자세히 설명해 주실 수 있나요?', tone: '질문' },
        { en: 'Let me get back to you after I check internally.', ko: '내부 확인 후 다시 말씀드릴게요.', tone: '보류' },
      ],
    }]);
  }

  // Apply dynamic font-size & bubble radius via inline style props
  const fontScale = tweaks.fontSize / 14;
  const bubbleRadius = tweaks.bubbleRadius;
  const shadowStr = tweaks.bubbleShadow === 'none' ? 'none'
    : tweaks.bubbleShadow === 'soft' ? '0 1px 3px rgba(0,0,0,0.06)'
    : '0 4px 12px rgba(0,0,0,0.1)';

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: c.bg, color: c.ink, fontSize: 14 * fontScale,
      fontFamily: "'Plus Jakarta Sans', -apple-system, system-ui, sans-serif",
    }}>
      <TopBar palette={c} dark={dark} showMascot={tweaks.showMascot}
        onToggleDark={() => setTweak('theme', dark ? 'light' : 'dark')}
        onSearch={() => setSearchOpen(true)}
        target={target} native={native}
        onPickTarget={() => setLangPicker('target')}
        onPickNative={() => setLangPicker('native')}
      />

      <div ref={scrollRef} style={{
        flex: 1, minHeight: 0, overflowY: 'auto',
        padding: '12px 14px 6px',
        scrollBehavior: 'smooth',
      }}>
        {convo.map((m, i) => {
          if (m.side === 'me') {
            return <MyBubbleStyled key={m.id} msg={m} palette={c} radius={bubbleRadius} shadow={shadowStr} fontScale={fontScale} />;
          }
          const isLast = i === convo.length - 1;
          return (
            <TheirBubbleStyled key={m.id} msg={m} palette={c} dark={dark} radius={bubbleRadius} shadow={shadowStr} fontScale={fontScale} native={native}>
              {m.suggestions && isLast && (
                <SuggestionDisplay
                  variant={tweaks.suggStyle}
                  palette={c}
                  suggestions={m.suggestions}
                  dark={dark}
                  max={tweaks.maxSugg}
                  onPick={s => sendMine(s.en, s.en, 'en-clean')}
                />
              )}
            </TheirBubbleStyled>
          );
        })}
      </div>

      <LiveInput palette={c} dark={dark} mode={mode} onModeChange={setMode}
        onSendMine={sendMine} onSendThem={sendThem} fontScale={fontScale}
        onOpenVoice={() => setVoiceModeOpen(true)}
        target={target} native={native} />

      {voiceModeOpen && (
        <window.VoiceMode
          palette={c}
          dark={dark}
          onClose={() => setVoiceModeOpen(false)}
          onLog={(entry) => {
            const stamp = nowStamp();
            setConvo(cv => [...cv, { id: Date.now() + Math.random(), ...entry, time: stamp }]);
          }}
        />
      )}

      {searchOpen && (
        <window.SearchOverlay
          palette={c}
          dark={dark}
          onClose={() => setSearchOpen(false)}
          onJump={() => setSearchOpen(false)}
        />
      )}

      {langPicker && (
        <window.LangPickerModal
          palette={c} dark={dark}
          role={langPicker}
          current={langPicker === 'target' ? target : native}
          onPick={(code) => setTweak(langPicker === 'target' ? 'target' : 'native', code)}
          onClose={() => setLangPicker(null)}
        />
      )}
    </div>
  );
}

function MyBubbleStyled({ msg, palette, radius, shadow, fontScale }) {
  const c = palette;
  const hasPrivate = msg.inputKind !== 'clean' && msg.orig !== msg.trans;
  const isFixed = msg.inputKind === 'polished';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: 10 }}>
      <div style={{
        fontSize: 10 * fontScale, fontWeight: 800, color: c.primary, letterSpacing: 0.6,
        marginBottom: 4, marginRight: 8, textTransform: 'uppercase',
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        나 · 전송됨
        {msg.inputKind === 'clean' && (
          <span style={{ fontSize: 9 * fontScale, color: c.accent2, fontWeight: 800, letterSpacing: 0.4 }}>· 그대로</span>
        )}
        {isFixed && (
          <span style={{ fontSize: 9 * fontScale, color: '#9B59E0', fontWeight: 800, letterSpacing: 0.4 }}>· ✏ 정정됨</span>
        )}
      </div>
      <div style={{ maxWidth: '86%' }}>
        <div style={{
          background: c.mine, color: c.mineInk,
          padding: '12px 14px 8px',
          borderRadius: `${radius}px ${radius}px 4px ${radius}px`,
          boxShadow: shadow,
        }}>
          <div style={{ fontSize: 15 * fontScale, lineHeight: 1.45, fontWeight: 600 }}>
            {msg.trans}
          </div>
          <div style={{ marginTop: 6, display: 'flex', justifyContent: 'flex-end' }}>
            <window.ListenButtons text={msg.trans} palette={c} accent="me" />
          </div>
        </div>

        {hasPrivate && (
          <div style={{
            marginTop: 4, padding: '6px 10px',
            background: c.bg, border: `1px dashed ${isFixed ? '#9B59E0' : c.divider}`,
            borderRadius: 10, fontSize: 12 * fontScale, color: c.ink2, lineHeight: 1.4,
            display: 'flex', alignItems: 'flex-start', gap: 6,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0, color: c.ink3 }}>
              <rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
            </svg>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9 * fontScale, color: isFixed ? '#9B59E0' : c.ink3, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 1 }}>
                {isFixed ? '내가 말한 원본 · 정정됨 · 나만 보임' : '내가 입력한 원문 · 나만 보임'}
              </div>
              <div style={isFixed ? { textDecoration: 'line-through wavy #9B59E055', textDecorationSkipInk: 'none' } : null}>
                {msg.orig}
              </div>
            </div>
          </div>
        )}

        <div style={{ fontSize: 10 * fontScale, color: c.ink3, textAlign: 'right', marginTop: 2 }}>{msg.time}</div>
      </div>
    </div>
  );
}

function TheirBubbleStyled({ msg, palette, dark, children, radius, shadow, fontScale, native = 'KO' }) {
  const c = palette;
  const nativeLang = window.CT_LANG.byCode(native);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: 12 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        marginBottom: 4, marginLeft: 4,
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: 999,
          background: c.themAvatarBg, color: c.themAvatar,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10 * fontScale, fontWeight: 800, flexShrink: 0,
        }}>EN</div>
        <div style={{
          fontSize: 10 * fontScale, fontWeight: 800, color: c.ink2, letterSpacing: 0.6,
          textTransform: 'uppercase',
        }}>상대방</div>
      </div>
      <div style={{ maxWidth: '92%', width: '100%' }}>
        <div style={{
          background: c.them, border: `1px solid ${c.themBorder}`,
          padding: '12px 14px 10px',
          borderRadius: `4px ${radius}px ${radius}px ${radius}px`,
          boxShadow: shadow,
        }}>
          <div style={{ fontSize: 15 * fontScale, lineHeight: 1.5, color: c.themInk || c.ink, fontWeight: 500 }}>{msg.orig}</div>
          <div style={{ marginTop: 6 }}>
            <window.ListenButtons text={msg.orig} palette={c} accent="them" />
          </div>
          <div style={{
            marginTop: 8, paddingTop: 8,
            borderTop: `1px dashed ${c.divider}`,
            fontSize: 13 * fontScale, lineHeight: 1.45, color: c.ink2,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3,
            }}>
              <span style={{ fontSize: 10 * fontScale, color: c.accent2, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase' }}>{nativeLang.name} 번역</span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                fontSize: 9 * fontScale, fontWeight: 700, color: c.ink3,
                background: c.bg, padding: '1px 6px', borderRadius: 4,
              }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
                </svg>
                나만 보임
              </span>
            </div>
            {msg.trans}
          </div>
        </div>
        <div style={{ fontSize: 10 * fontScale, color: c.ink3, marginTop: 4, marginLeft: 4 }}>{msg.time}</div>
        {children}
      </div>
    </div>
  );
}

// Small icon mode button used in the speaker toggle.
function IconModeBtn({ c, active, accent, onClick, title, children }) {
  const onColor = accent || c.primary;
  return (
    <button onClick={onClick} title={title} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      height: 30, padding: '0 10px', borderRadius: 999,
      border: 'none', cursor: 'pointer',
      background: active ? onColor : 'transparent',
      color: active ? '#fff' : c.ink2,
      transition: 'all .15s',
    }}>{children}</button>
  );
}

function LiveInput({ palette, dark, mode, onModeChange, onSendMine, onSendThem, fontScale = 1, onOpenVoice, target = 'EN', native = 'KO' }) {
  const c = palette;
  const isMine = mode === 'mine';
  const I = window.CT_ICONS;
  const targetLang = window.CT_LANG.byCode(target);
  const nativeLang = window.CT_LANG.byCode(native);

  const [rawInput, setRawInput] = React.useState('');
  const [preview, setPreview] = React.useState('');
  const [inputKind, setInputKind] = React.useState('foreign'); // 'foreign' | 'clean' | 'polished'
  const [translating, setTranslating] = React.useState(false);
  const taRef = React.useRef(null);

  // Auto-resize textarea
  React.useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = 'auto';
      taRef.current.style.height = Math.min(taRef.current.scrollHeight, 100) + 'px';
    }
  }, [rawInput]);

  // Debounced live translation / grammar fix.
  // The app is ALWAYS sending in the TARGET language.
  // Input detection: if input matches target language pattern, treat as native-target editing
  // (grammar polish); otherwise translate to target. Claude is fully multilingual so we don't
  // pre-declare the input language — we just ask Claude to detect.
  React.useEffect(() => {
    const text = rawInput.trim();
    if (!text) { setPreview(''); setTranslating(false); setInputKind('foreign'); return; }
    setTranslating(true);
    const t = setTimeout(async () => {
      try {
        const targetName = targetLang.native;     // 'English', 'Korean', etc.
        const nativeName = nativeLang.native;
        if (!isMine) {
          // their reply: foreign → native (private translation)
          const res = await window.CT_API.complete(
            `Translate this ${targetName} text to natural ${nativeName} (polite, business register). Output only the ${nativeName} translation — no quotes, no explanation.\n\n${targetName}: ${text}`
          );
          setPreview(String(res).trim().replace(/^["'`]|["'`]$/g, ''));
          setInputKind('foreign');
        } else {
          // my message: detect — input in target lang vs other lang
          const res = await window.CT_API.complete(
            `You are a translation + editing assistant.
Target conversation language: ${targetName}.
User input may be in ${targetName} (in which case lightly polish grammar/clarity if needed) OR in any other language (in which case translate to natural professional ${targetName}).

Output a JSON object on a single line: {"kind":"polish"|"translate"|"clean","out":"<final ${targetName}>"}
- "clean": input was already correct, natural ${targetName} — return identical or near-identical
- "polish": input was ${targetName} but had errors — return corrected ${targetName}
- "translate": input was a different language — return ${targetName} translation

Strictly JSON, no markdown, no commentary.

INPUT: ${text}`
          );
          const raw = String(res).trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '');
          let parsed = null;
          try { parsed = JSON.parse(raw); } catch (e) {}
          if (parsed && parsed.out) {
            setPreview(parsed.out);
            // map to inputKind: foreign | polished | clean
            const k = parsed.kind === 'translate' ? 'foreign'
                    : parsed.kind === 'polish'    ? 'polished'
                    :                                'clean';
            setInputKind(k);
          } else {
            // fallback — treat as translation
            setPreview(raw.replace(/^["'`]|["'`]$/g, ''));
            setInputKind('foreign');
          }
        }
      } catch (e) {
        setPreview(isMine ? '(번역/검토 준비 중…)' : '(translation pending…)');
        setInputKind('foreign');
      } finally {
        setTranslating(false);
      }
    }, 600);
    return () => clearTimeout(t);
  }, [rawInput, isMine, target, native]);

  function handleSend() {
    if (!rawInput.trim() || !preview) return;
    if (isMine) onSendMine(rawInput, preview, inputKind);
    else onSendThem(rawInput, preview);
    setRawInput('');
    setPreview('');
    setInputKind('foreign');
  }

  return (
    <div style={{ background: c.surface, borderTop: `1px solid ${c.divider}`, padding: '10px 12px 12px' }}>
      {/* who's talking toggle — icon only */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 8, alignItems: 'center',
        background: c.bg, borderRadius: 999, padding: 3,
        border: `1px solid ${c.divider}`,
        width: 'fit-content',
      }}>
        <IconModeBtn c={c} active={isMine} onClick={() => onModeChange('mine')} title="내가 말할게요 · 한국어 → 영어">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="3.5"/>
            <path d="M5 21v-1a7 7 0 0 1 14 0v1"/>
          </svg>
          <span style={{ fontSize: 10, fontWeight: 800, marginLeft: 2, letterSpacing: 0.5 }}>KO</span>
        </IconModeBtn>
        <IconModeBtn c={c} active={!isMine} accent={c.accent2} onClick={() => onModeChange('them')} title="상대 말 듣기 · 영어 → 한국어">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 4-3 5-3 8a3 3 0 0 1-6 0 3 3 0 0 1 3-3"/>
          </svg>
          <span style={{ fontSize: 10, fontWeight: 800, marginLeft: 2, letterSpacing: 0.5 }}>EN</span>
        </IconModeBtn>
        <div style={{
          marginLeft: 6, fontSize: 11, fontWeight: 600, color: c.ink2,
          paddingRight: 8, whiteSpace: 'nowrap',
        }}>
          {isMine ? '내가 말함' : '상대 말 듣기'}
        </div>
      </div>

      {/* Two-line input: raw (top, in source lang) + translated preview (bottom, what's sent) */}
      <div style={{
        background: c.bg,
        border: `1.5px solid ${isMine ? c.primary + '55' : c.accent2 + '55'}`,
        borderRadius: 18, padding: '8px 8px 8px 14px',
      }}>
        {/* Raw input — what I type */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, padding: '2px 0' }}>
          <span style={{
            fontSize: 9, fontWeight: 800, color: c.ink3, letterSpacing: 0.4,
            textTransform: 'uppercase', marginTop: 6, flexShrink: 0,
            display: 'inline-flex', alignItems: 'center', gap: 3,
          }}>
            {isMine ? (
              <>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
                </svg>
                내가 입력 (한글·영어 자유)
              </>
            ) : '상대 영어'}
          </span>
          <textarea
            ref={taRef}
            value={rawInput}
            onChange={e => setRawInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            rows={1}
            placeholder={isMine
              ? `어떤 언어로 입력해도 ${targetLang.name}로 전송돼요…`
              : `상대가 ${targetLang.name}로 말한 것을 적어주세요…`}
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 14 * fontScale, color: c.ink, fontFamily: 'inherit',
              padding: '4px 0', resize: 'none', minHeight: 22, lineHeight: 1.4,
            }}
          />
        </div>

        {/* Auto-translated / grammar-fixed preview — what actually gets sent */}
        {(rawInput.trim() || preview) && (
          <div style={{
            marginTop: 6, paddingTop: 6,
            borderTop: `1px dashed ${c.divider}`,
            display: 'flex', alignItems: 'flex-start', gap: 6,
          }}>
            <span style={{
              fontSize: 9, fontWeight: 800,
              color: isMine
                ? (inputKind === 'clean' ? c.accent2 : inputKind === 'polished' ? '#9B59E0' : c.primary)
                : c.accent2,
              letterSpacing: 0.4,
              textTransform: 'uppercase', marginTop: 4, flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', gap: 3,
            }}>
              {isMine ? (
                inputKind === 'clean' ? <>✓ {targetLang.code} 그대로 전송</>
                : inputKind === 'polished' ? <>✏ {targetLang.code} 정정 후 전송</>
                : <>{window.CT_ICONS.send} {targetLang.code}로 자동 번역</>
              ) : <>{nativeLang.name} 번역 (나만 봄)</>}
            </span>
            <div style={{
              flex: 1, fontSize: 14 * fontScale,
              color: preview ? c.ink : c.ink3,
              fontWeight: 500, lineHeight: 1.4, padding: '2px 0',
              fontStyle: preview ? 'normal' : 'italic',
            }}>
              {preview || (translating ? '자동 처리 중…' : '입력하면 자동 번역·정정됩니다')}
              {translating && preview && (
                <span style={{ marginLeft: 4, fontSize: 10, color: c.ink3 }}>· 갱신 중</span>
              )}
            </div>
          </div>
        )}

        {/* Action row */}
        <div style={{
          marginTop: 6, paddingTop: 6,
          borderTop: rawInput.trim() ? `1px solid ${c.divider}` : 'none',
          display: rawInput.trim() ? 'flex' : 'none',
          alignItems: 'center', justifyContent: 'space-between', gap: 6,
        }}>
          <div style={{ fontSize: 10, color: c.ink3 }}>
            {isMine ? (
              inputKind === 'polished'
                ? <>원본은 <b style={{ color: '#9B59E0' }}>나만 보임</b>으로 함께 기록돼요.</>
                : inputKind === 'clean'
                ? <>{targetLang.name}가 자연스러워서 <b style={{ color: c.accent2 }}>그대로 전송</b>됩니다.</>
                : <>상대방은 <b style={{ color: c.primary }}>{targetLang.name}만</b> 받아요. 원문은 나만 봐요.</>
            ) : (
              <>상대 말을 기록 · 답변 제안 받기</>
            )}
          </div>
          <button
            onClick={handleSend}
            disabled={!preview}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '7px 14px', borderRadius: 999, border: 'none',
              background: preview ? c.primary : c.divider,
              color: preview ? c.primaryInk : c.ink3,
              fontSize: 12, fontWeight: 700, cursor: preview ? 'pointer' : 'default',
              transition: 'all .12s',
            }}>
            {isMine ? `${targetLang.code}로 전송` : '상대 말 기록'} {I.send}
          </button>
        </div>
      </div>

      {/* Mic button + Voice Mode entry */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 8 }}>
        <button style={{
          width: 44, height: 44, borderRadius: 999, border: 'none',
          background: isMine ? c.primarySoft : c.bg,
          color: isMine ? c.primary : c.accent2, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
        }} title={isMine ? '음성 입력 (1회)' : `상대 ${targetLang.name} 음성 입력 (1회)`}>
          {I.mic}
        </button>
        <button onClick={onOpenVoice} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          height: 44, padding: '0 16px', borderRadius: 999, border: 'none',
          background: `linear-gradient(135deg, ${c.primary}, ${c.ai})`,
          color: '#fff', cursor: 'pointer',
          fontSize: 12, fontWeight: 700, letterSpacing: 0.2,
          boxShadow: `0 4px 12px ${c.primary}44`,
        }} title="보이스 모드 — 실시간 통역">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12h2l2-6 4 12 3-9 2 5h5"/>
          </svg>
          보이스 대화 모드
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { LiveTranslator });
