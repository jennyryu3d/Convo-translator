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

  const [convo, setConvo] = React.useState([]);
  const [appMode, setAppMode] = React.useState('practice'); // 'practice' | 'live'
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [langPicker, setLangPicker] = React.useState(null);  // 'target' | 'native' | null
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [saveOpen, setSaveOpen] = React.useState(false);
  const [saveAuto, setSaveAuto] = React.useState(false); // did the save sheet auto-open?
  const [pendingNew, setPendingNew] = React.useState(false); // save sheet opened via "새 대화"
  const [viewSession, setViewSession] = React.useState(null); // saved session opened read-only
  const promptedRef = React.useRef(false);   // only auto-prompt once per conversation
  const idleRef = React.useRef(null);

  // Auto-popup suppressed for the rest of today?
  function autoPromptSnoozed() {
    try { return localStorage.getItem('ct_save_prompt_off') === new Date().toDateString(); } catch (e) { return false; }
  }
  const target = tweaks.target || 'EN';
  const native = tweaks.native || 'KO';
  const scrollRef = window.useDragScroll();

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [convo]);

  // Auto "end of conversation" detection:
  // when there are enough exchanged messages and the user has been idle for a
  // while (no new message), gently prompt to save — once per conversation.
  React.useEffect(() => {
    if (idleRef.current) clearTimeout(idleRef.current);
    const realMessages = convo.length;
    const enough = realMessages >= 4;        // a real exchange happened
    if (!enough || promptedRef.current || saveOpen || autoPromptSnoozed()) return;
    idleRef.current = setTimeout(() => {
      if (!promptedRef.current && !saveOpen && !autoPromptSnoozed()) {
        promptedRef.current = true;
        setSaveAuto(true);
        setSaveOpen(true);
      }
    }, 45000); // 45s of no new messages → likely conversation ended
    return () => { if (idleRef.current) clearTimeout(idleRef.current); };
  }, [convo, saveOpen]);

  function startNewConversation() {
    setConvo([]);
    promptedRef.current = false;
  }

  // Bottom bar: "대화 저장" — open the save sheet manually (only when there's
  // something to save).
  function handleSaveConvo() {
    if (!convo.length) return;
    setSaveAuto(false);
    setPendingNew(false);
    setSaveOpen(true);
  }

  // Bottom bar: "새 대화" — if there's an unsaved conversation, ask to save
  // first by opening the save sheet (flagged as pendingNew). If empty, just
  // reset.
  function handleNewConversation() {
    if (!convo.length) { startNewConversation(); return; }
    setSaveAuto(false);
    setPendingNew(true);
    setSaveOpen(true);
  }

  function nowStamp() {
    const d = new Date();
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    return (h < 12 ? '오전 ' : '오후 ') + ((h % 12) || 12) + ':' + m;
  }

  // Pick (or re-pick) a suggestion attached to a "them" message.
  // • Records the chosen index on that message so the card shows as selected
  //   (cyan) while the 3 cards stay visible/accumulated.
  // • LEARN mode: the choice becomes my turn and the AI partner replies,
  //   continuing the conversation. Re-picking is only allowed while this group
  //   is still the last thing in the conversation (handled by `locked` in the
  //   UI, but we re-check here defensively).
  // • LIVE mode: no AI reply — we just mark the selection and hold for the
  //   other person's next real voice input.
  function pickSuggestion(themId, s, idx) {
    const isLive = appMode === 'live';

    if (isLive) {
      // LIVE: just mark the selection (re-pickable until the next real voice
      // input arrives, which appends a new message and locks this group via UI).
      setConvo(cv => {
        const pos = cv.findIndex(m => m.id === themId);
        if (pos < 0 || pos < cv.length - 1) return cv; // only the last group
        const next = cv.slice();
        next[pos] = { ...next[pos], pickedIdx: idx, pickedAt: Date.now() };
        return next;
      });
      return;
    }

    // LEARN: mark the pick, DROP anything generated after this group (so a
    // re-pick replaces the previous branch), then have the AI partner reply.
    let baseConvo = null;
    setConvo(cv => {
      const pos = cv.findIndex(m => m.id === themId);
      if (pos < 0) return cv;
      const trimmed = cv.slice(0, pos + 1);
      trimmed[pos] = { ...trimmed[pos], pickedIdx: idx, pickedAt: Date.now() };
      baseConvo = trimmed;
      return trimmed;
    });

    (async () => {
      const targetName = window.CT_LANG.byCode(target).native;
      const nativeName = window.CT_LANG.byCode(native).native;
      const base = baseConvo || convo;
      const recent = [...base].slice(-6).map(m =>
        (m.side === 'me' ? 'A' : 'B') + ': ' + (m.trans || m.orig)
      ).join('\n') + `\nA: ${s.en}`;
      try {
        const res = await window.CT_API.complete(
          `You are simulating a natural conversation partner "B" replying to "A" in ${targetName}. ` +
          `Reply realistically and specifically to A's last message, continuing the conversation naturally (1-2 sentences). ` +
          `Then propose 3 short follow-up replies A could send next, each responding to YOUR reply.\n` +
          `Return strict JSON on one line. "ko" MUST be a full natural ${nativeName} translation of the "en" sentence (NOT a category or keyword):\n` +
          `{"reply":"<${targetName}>","reply_native":"<full ${nativeName} translation of reply>","suggestions":[{"en":"<${targetName} follow-up>","ko":"<full ${nativeName} translation>"},{"en":"...","ko":"..."},{"en":"...","ko":"..."}]}\n\n` +
          `Conversation so far:\n${recent}`
        );
        const raw = String(res).trim().replace(/^```json\s*/i,'').replace(/```\s*$/,'');
        const p = JSON.parse(raw);
        setConvo(cv => [...cv, {
          id: Date.now() + 1, side: 'them',
          orig: p.reply, trans: p.reply_native, time: nowStamp(),
          suggestions: (p.suggestions || []).slice(0, 3),
        }]);
      } catch (e) {
        setConvo(cv => [...cv, {
          id: Date.now() + 1, side: 'them', orig: 'Got it. Could you tell me more?', trans: '알겠어요. 좀 더 말씀해 주실래요?', time: nowStamp(),
          suggestions: [
            { en: 'Sure, let me explain.', ko: '네, 설명할게요.' },
            { en: 'Can we talk about it later?', ko: '나중에 얘기해도 될까요?' },
            { en: 'What do you think?', ko: '어떻게 생각하세요?' },
          ],
        }]);
      }
    })();
  }

  // Send MY message. In practice mode the AI replies; in live mode (opts.noReply)
  // a real person will reply, so we just record my turn.
  function sendMine(orig, trans, inputKind = 'foreign', opts = {}) {
    const myMsg = { id: Date.now(), side: 'me', orig, trans, inputKind, time: nowStamp() };
    setConvo(cv => [...cv, myMsg]);
    if (opts.noReply) return;

    (async () => {
      const targetName = window.CT_LANG.byCode(target).native;
      const nativeName = window.CT_LANG.byCode(native).native;
      const recent = [...convo, myMsg].slice(-6).map(m =>
        (m.side === 'me' ? 'A' : 'B') + ': ' + (m.trans || m.orig)
      ).join('\n');
      try {
        const res = await window.CT_API.complete(
          `You are simulating a natural conversation partner "B" replying to "A" in ${targetName}. ` +
          `Reply realistically and specifically to A's last message, continuing the conversation naturally (1-2 sentences). ` +
          `Then propose 3 short follow-up replies A could send next, each responding to YOUR reply.\n` +
          `Return strict JSON on one line. "ko" MUST be a full natural ${nativeName} translation of the "en" sentence (NOT a category or keyword):\n` +
          `{"reply":"<${targetName}>","reply_native":"<full ${nativeName} translation of reply>","suggestions":[{"en":"<${targetName} follow-up>","ko":"<full ${nativeName} translation>"},{"en":"...","ko":"..."},{"en":"...","ko":"..."}]}\n\n` +
          `Conversation so far:\n${recent}`
        );
        const raw = String(res).trim().replace(/^```json\s*/i,'').replace(/```\s*$/,'');
        const p = JSON.parse(raw);
        setConvo(cv => [...cv, {
          id: Date.now() + 1, side: 'them',
          orig: p.reply, trans: p.reply_native, time: nowStamp(),
          suggestions: (p.suggestions || []).slice(0, 3),
        }]);
      } catch (e) {
        const pick = { en: 'Got it. Could you tell me more?', ko: '알겠어요. 좀 더 말씀해 주실래요?' };
        setConvo(cv => [...cv, {
          id: Date.now() + 1, side: 'them', orig: pick.en, trans: pick.ko, time: nowStamp(),
          suggestions: [
            { en: 'Sure, let me explain.', ko: '네, 설명할게요.', tone: '설명' },
            { en: 'Can we talk about it later?', ko: '나중에 얘기해도 될까요?', tone: '보류' },
            { en: 'What do you think?', ko: '어떻게 생각하세요?', tone: '질문' },
          ],
        }]);
      }
    })();
  }

  // Record what the OTHER person said (live mode). orig=target text they spoke,
  // trans=native translation for me. Then generate 3 contextual follow-up
  // suggestions I could say next — shown immediately under their bubble.
  function sendThem(targetText, nativeText) {
    const themId = Date.now();
    const themMsg = { id: themId, side: 'them', orig: targetText, trans: nativeText, time: nowStamp(), suggestions: null };
    setConvo(cv => [...cv, themMsg]);

    (async () => {
      const targetName = window.CT_LANG.byCode(target).native;
      const nativeName = window.CT_LANG.byCode(native).native;
      const recent = [...convo, themMsg].slice(-6).map(m =>
        (m.side === 'me' ? 'Me' : 'Them') + ': ' + (m.orig)
      ).join('\n');
      try {
        const res = await window.CT_API.complete(
          `In a live conversation, the other person just said something in ${targetName}. ` +
          `Propose 3 short, natural replies I could say next in ${targetName}, each directly responding to what they said.\n` +
          `Return strict JSON on one line. "ko" MUST be a full natural ${nativeName} translation of the "en" sentence (NOT a category or keyword):\n` +
          `{"suggestions":[{"en":"<${targetName}>","ko":"<full ${nativeName} translation>"},{"en":"...","ko":"..."},{"en":"...","ko":"..."}]}\n\n` +
          `Conversation so far:\n${recent}\n\nTheir last words: ${targetText}`
        );
        const raw = String(res).trim().replace(/^```json\s*/i,'').replace(/```\s*$/,'');
        const p = JSON.parse(raw);
        const sugg = (p.suggestions || []).slice(0, 3);
        setConvo(cv => cv.map(m => m.id === themId ? { ...m, suggestions: sugg } : m));
      } catch (e) {
        setConvo(cv => cv.map(m => m.id === themId ? { ...m, suggestions: [
          { en: 'Got it, thanks.', ko: '알겠어요, 감사해요.', tone: '동의' },
          { en: 'Could you say that again?', ko: '다시 말씀해 주실래요?', tone: '요청' },
          { en: 'Let me think about it.', ko: '생각해 볼게요.', tone: '보류' },
        ] } : m));
      }
    })();
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
        onHistory={() => setSearchOpen(true)}
        onSettings={() => setSettingsOpen(true)}
        onSaveConvo={() => { if (convo.length) { setSaveAuto(false); setSaveOpen(true); } }}
        target={target} native={native}
        onPickTarget={() => setLangPicker('target')}
        onPickNative={() => setLangPicker('native')}
      />

      <div ref={scrollRef} style={{
        flex: 1, minHeight: 0, overflowY: 'auto', position: 'relative',
        padding: '12px 14px 6px',
        scrollBehavior: 'smooth',
      }}>
        {convo.length === 0 && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 40px',
            pointerEvents: 'none', textAlign: 'center',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: c.primarySoft, color: c.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/></svg>
            </div>
            <div style={{
              fontSize: 19, fontWeight: 800, color: c.ink,
              fontFamily: "'Chakra Petch', system-ui, sans-serif",
            }}>대화를 시작해 보세요</div>
            <div style={{ fontSize: 13, color: c.ink2, lineHeight: 1.6 }}>
              아래에서 <b style={{ color: c.ai }}>실시간 대화</b> 또는 <b style={{ color: c.primary }}>학습 모드</b>를 골라<br/>
              말하거나 입력하면 번역과 다음 표현 제안이 시작돼요
            </div>
          </div>
        )}
        {convo.map((m, i) => {
          if (m.side === 'me') {
            return <MyBubbleStyled key={m.id} msg={m} palette={c} radius={bubbleRadius} shadow={shadowStr} fontScale={fontScale} />;
          }
          // Lock rule:
          // • LIVE: only the very last suggestion group is editable.
          // • LEARN: the last group, OR the second-to-last when the only thing
          //   after it is the AI reply this pick generated (so you can re-pick
          //   the most recent turn — re-picking trims that reply and regenerates).
          let locked;
          if (appMode === 'live') {
            locked = i < convo.length - 1;
          } else {
            // editable if no message after it has its OWN pickedIdx set, i.e.
            // this is the most recent decision point.
            const laterPicked = convo.slice(i + 1).some(mm => typeof mm.pickedIdx === 'number');
            locked = laterPicked;
          }
          return (
            <TheirBubbleStyled key={m.id} msg={m} palette={c} dark={dark} radius={bubbleRadius} shadow={shadowStr} fontScale={fontScale} native={native}>
              {m.suggestions && (
                <SuggestionDisplay
                  variant={tweaks.suggStyle}
                  palette={c}
                  suggestions={m.suggestions}
                  dark={dark}
                  max={tweaks.maxSugg}
                  pickedIdx={typeof m.pickedIdx === 'number' ? m.pickedIdx : null}
                  locked={locked}
                  onPick={(s, idx) => pickSuggestion(m.id, s, idx)}
                />
              )}
            </TheirBubbleStyled>
          );
        })}

        {convo.length > 0 && (
          <FloatingConvoActions palette={c}
            onSave={handleSaveConvo} onNew={handleNewConversation} />
        )}
      </div>

      <LiveInput palette={c} dark={dark} fontScale={fontScale}
        appMode={appMode} onModeChange={setAppMode}
        onSendMine={sendMine} onSendThem={sendThem}
        target={target} native={native} />

      {searchOpen && (
        <window.SearchOverlay
          palette={c}
          dark={dark}
          onClose={() => setSearchOpen(false)}
          onJump={() => setSearchOpen(false)}
          onOpenSession={(sess) => { setViewSession(sess); setSearchOpen(false); }}
        />
      )}

      {viewSession && (
        <SavedConvoViewer
          palette={c} dark={dark}
          session={viewSession}
          radius={bubbleRadius} shadow={shadowStr} fontScale={fontScale}
          native={native}
          onClose={() => setViewSession(null)}
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

      {settingsOpen && (
        <window.SettingsSheet
          palette={c} dark={dark}
          target={target} native={native}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {saveOpen && (
        <window.SaveConvoSheet
          palette={c} dark={dark}
          convo={convo} target={target} native={native}
          autoOpened={saveAuto}
          pendingNew={pendingNew}
          onSaved={() => { setSaveOpen(false); setSaveAuto(false); setPendingNew(false); startNewConversation(); }}
          onDelete={() => { setSaveOpen(false); setSaveAuto(false); setPendingNew(false); startNewConversation(); }}
          onDismiss={() => {
            // "나중에": if this was a "새 대화" request, start fresh anyway
            // (the user chose not to save); otherwise just close.
            const wasPendingNew = pendingNew;
            setSaveOpen(false); setSaveAuto(false); setPendingNew(false);
            if (wasPendingNew) startNewConversation();
          }}
          onSnooze={() => {
            try { localStorage.setItem('ct_save_prompt_off', new Date().toDateString()); } catch (e) {}
            setSaveOpen(false); setSaveAuto(false); setPendingNew(false);
          }}
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
              <div style={{ fontSize: 9 * fontScale, color: isFixed ? '#9B59E0' : c.ink3, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 1, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                {isFixed ? '정정됨 · 나만 보임' : '나만 보임'}
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

// Bottom action bar shown above the input whenever a conversation is in
// progress. Two clear actions: save this conversation, or start a new one.
// Read-only viewer for a saved conversation. Reuses the same bubble styles as
// the live chat so it looks identical — just no input and no suggestions.
function SavedConvoViewer({ palette, dark, session, radius, shadow, fontScale, native, onClose }) {
  const c = palette;
  const scrollRef = window.useDragScroll();
  const msgs = (session && session.messages) || [];
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 92,
      background: c.bg, color: c.ink,
      display: 'flex', flexDirection: 'column',
      animation: 'svvIn .2s ease-out',
    }}>
      <style>{`@keyframes svvIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }`}</style>

      {/* Header */}
      <div style={{
        flexShrink: 0, padding: '12px 12px 10px',
        background: c.surface, borderBottom: `1px solid ${c.divider}`,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <button onClick={onClose} style={{
          width: 36, height: 36, borderRadius: 999, border: 'none',
          background: 'transparent', color: c.ink2, cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} title="닫기">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: c.ink, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'Chakra Petch', system-ui, sans-serif" }}>
            {session.title || session.partner || '저장된 대화'}
          </div>
          <div style={{ fontSize: 11, color: c.ink3, marginTop: 1 }}>
            {(session.label || '저장됨')} · {session.date || ''} · {msgs.length}개 메시지
          </div>
        </div>
        <span style={{
          fontSize: 9, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase',
          color: c.ink3, background: c.bg, border: `1px solid ${c.divider}`,
          padding: '3px 8px', borderRadius: 999, flexShrink: 0,
        }}>읽기 전용</span>
      </div>

      {/* Summary (if any) */}
      {session.summary && (
        <div style={{
          flexShrink: 0, padding: '10px 14px', background: c.surface,
          borderBottom: `1px solid ${c.divider}`,
          fontSize: 12, color: c.ink2, lineHeight: 1.5,
        }}>
          {session.summary}
        </div>
      )}

      {/* Messages — same bubble styles as the live conversation */}
      <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '12px 14px 24px' }}>
        {msgs.length === 0 && (
          <div style={{ marginTop: 40, textAlign: 'center', fontSize: 13, color: c.ink3 }}>
            이 대화에는 저장된 메시지가 없어요.
          </div>
        )}
        {msgs.map((m, i) => (
          m.side === 'me'
            ? <MyBubbleStyled key={i} msg={m} palette={c} radius={radius} shadow={shadow} fontScale={fontScale} />
            : <TheirBubbleStyled key={i} msg={m} palette={c} dark={dark} radius={radius} shadow={shadow} fontScale={fontScale} native={native} />
        ))}
      </div>
    </div>
  );
}

// Floating action buttons that hover at the bottom-right of the conversation
// area — they don't take layout space, so the chat body keeps full height.
// + = new conversation, bookmark = save conversation.
function FloatingConvoActions({ palette, onSave, onNew }) {
  const c = palette;
  const fab = (primary) => ({
    width: 48, height: 48, borderRadius: 999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: primary ? 'none' : `1.5px solid ${c.divider}`,
    background: primary ? c.primary : c.surface,
    color: primary ? c.primaryInk : c.ink2,
    cursor: 'pointer',
    boxShadow: primary
      ? `0 4px 14px ${c.primary}66`
      : '0 3px 10px rgba(0,18,38,0.16)',
    transition: 'transform .12s',
  });
  return (
    <div style={{
      position: 'sticky', bottom: 0, float: 'right',
      // sticky+float keeps the buttons pinned to the bottom-right of the
      // scroll viewport without consuming layout height.
      display: 'flex', flexDirection: 'column', gap: 10,
      alignItems: 'flex-end', pointerEvents: 'none',
      marginRight: 2, marginTop: -56,
    }}>
      {/* 새 대화 */}
      <button onClick={onNew} title="새 대화" style={{ ...fab(false), pointerEvents: 'auto' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
      {/* 대화 저장 */}
      <button onClick={onSave} title="대화 저장" style={{ ...fab(true), pointerEvents: 'auto' }}>
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
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

// Bottom input bar. Two modes selected inline (no page switch):
// • 학습 모드 (practice): I input → AI replies as the partner + suggests.
// • 실시간 대화 (live): real person across from me. Two buttons — "내가 말하기"
//   (my voice → target, no AI reply) and "상대방 말하기" (their voice → native +
//   3 suggestions). All bubbles stay in the main conversation.
function LiveInput({ palette, dark, fontScale = 1, appMode = 'practice', onModeChange, onSendMine, onSendThem, target = 'EN', native = 'KO' }) {
  const c = palette;
  const I = window.CT_ICONS;
  const targetLang = window.CT_LANG.byCode(target);
  const nativeLang = window.CT_LANG.byCode(native);
  const isLive = appMode === 'live';

  const [rawInput, setRawInput] = React.useState('');
  const [preview, setPreview] = React.useState('');
  const [inputKind, setInputKind] = React.useState('foreign');
  const [translating, setTranslating] = React.useState(false);
  const [recSide, setRecSide] = React.useState(null); // null | 'me' | 'them'
  const [busy, setBusy] = React.useState(false);
  const taRef = React.useRef(null);
  const recRef = React.useRef(null);

  React.useEffect(() => () => { if (recRef.current) recRef.current.abort(); }, []);

  // Translate helper.
  async function translate(text, fromName, toName) {
    const res = await window.CT_API.complete(
      `Translate this ${fromName} to natural ${toName}. Output only the ${toName} translation — no quotes, no explanation.\n\n${fromName}: ${text}`
    );
    return String(res).trim().replace(/^["'`]|["'`]$/g, '');
  }

  // LIVE: a side speaks. me → my native, them → target language.
  async function liveListen(side) {
    if (recSide === side && recRef.current) { recRef.current.stop(); return; }
    if (recSide) return;
    const locale = side === 'me' ? nativeLang.locale : targetLang.locale;
    let captured = '';
    const rec = await window.CT_RECOGNIZE.startWithPermission(locale, {
      continuous: false,
      onInterim: () => {},
      onFinal: (t) => { captured = t; },
      onError: () => { setRecSide(null); },
      onPermission: (status) => { setRecSide(null); alert(window.CT_MIC_HELP(status)); },
      onEnd: async () => {
        setRecSide(null); recRef.current = null;
        const text = (captured || '').trim();
        if (!text) return;
        setBusy(true);
        try {
          if (side === 'me') {
            const out = await translate(text, nativeLang.native, targetLang.native);
            window.CT_SPEAK && window.CT_SPEAK.once(out, targetLang.locale);
            onSendMine(text, out, 'foreign', { noReply: true });
          } else {
            const out = await translate(text, targetLang.native, nativeLang.native);
            onSendThem(text, out);
          }
        } catch (e) {}
        setBusy(false);
      },
    });
    if (!rec) return;
    recRef.current = rec;
    setRecSide(side);
  }

  // PRACTICE mic: my native voice → fills text input.
  async function practiceMic() {
    if (recSide === 'me' && recRef.current) { recRef.current.stop(); return; }
    const rec = await window.CT_RECOGNIZE.startWithPermission(nativeLang.locale, {
      continuous: false,
      onInterim: (t) => setRawInput(t),
      onFinal: (t) => setRawInput(t),
      onError: () => setRecSide(null),
      onPermission: (status) => { setRecSide(null); alert(window.CT_MIC_HELP(status)); },
      onEnd: () => { setRecSide(null); recRef.current = null; },
    });
    if (!rec) return;
    recRef.current = rec;
    setRecSide('me');
  }

  React.useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = 'auto';
      taRef.current.style.height = Math.min(taRef.current.scrollHeight, 100) + 'px';
    }
  }, [rawInput]);

  // Practice: debounced translate/polish of my input → target.
  React.useEffect(() => {
    if (isLive) return;
    const text = rawInput.trim();
    if (!text) { setPreview(''); setTranslating(false); setInputKind('foreign'); return; }
    setTranslating(true);
    const t = setTimeout(async () => {
      try {
        const targetName = targetLang.native;
        const res = await window.CT_API.complete(
          `You are a translation + editing assistant.
Target conversation language: ${targetName}.
User input may be in ${targetName} (lightly polish grammar/clarity) OR another language (translate to natural ${targetName}).
Output one-line JSON: {"kind":"polish"|"translate"|"clean","out":"<final ${targetName}>"}
Strictly JSON, no markdown.

INPUT: ${text}`
        );
        const raw = String(res).trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '');
        let parsed = null;
        try { parsed = JSON.parse(raw); } catch (e) {}
        if (parsed && parsed.out) {
          setPreview(parsed.out);
          setInputKind(parsed.kind === 'translate' ? 'foreign' : parsed.kind === 'polish' ? 'polished' : 'clean');
        } else { setPreview(raw.replace(/^["'`]|["'`]$/g, '')); setInputKind('foreign'); }
      } catch (e) { setPreview('(번역 준비 중…)'); setInputKind('foreign'); }
      finally { setTranslating(false); }
    }, 600);
    return () => clearTimeout(t);
  }, [rawInput, target, isLive]);

  function handleSend() {
    if (!rawInput.trim() || !preview) return;
    onSendMine(rawInput, preview, inputKind);
    setRawInput(''); setPreview(''); setInputKind('foreign');
  }

  return (
    <div style={{ background: c.surface, borderTop: `1px solid ${c.divider}`, padding: '8px 12px 12px' }}>
      <style>{`@keyframes micPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }`}</style>

      {/* MODE SWITCH — stays on the main conversation screen */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 10,
        background: c.bg, borderRadius: 999, padding: 3, border: `1px solid ${c.divider}`,
      }}>
        <button onClick={() => onModeChange('live')} style={{
          flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          height: 36, borderRadius: 999, border: 'none', cursor: 'pointer',
          background: isLive ? c.ai : 'transparent',
          color: isLive ? '#fff' : c.ink2, fontSize: 12.5, fontWeight: 800,
          transition: 'color .15s',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h2l2-6 4 12 3-9 2 5h5"/></svg>
          실시간 대화
        </button>
        <button onClick={() => onModeChange('practice')} style={{
          flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          height: 36, borderRadius: 999, border: 'none', cursor: 'pointer',
          background: !isLive ? c.primary : 'transparent',
          color: !isLive ? c.primaryInk : c.ink2, fontSize: 12.5, fontWeight: 800,
          transition: 'color .15s',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
          학습 모드
        </button>
      </div>

      {isLive ? (
        /* LIVE: two speak buttons — both add to the main conversation */
        <div>
          <div style={{ fontSize: 10, color: c.ink3, marginBottom: 8, textAlign: 'center', lineHeight: 1.4 }}>
            누가 말하는지 누른 뒤 말하세요 · {busy && <span style={{ color: c.primary, fontWeight: 700 }}>처리 중…</span>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => liveListen('me')} disabled={recSide === 'them' || busy} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '12px 8px', borderRadius: 16, border: 'none', cursor: 'pointer',
              background: recSide === 'me' ? '#b84a3a' : c.primary, color: '#fff',
              opacity: recSide === 'them' ? 0.4 : 1,
              animation: recSide === 'me' ? 'micPulse 1.1s infinite' : 'none',
              boxShadow: `0 3px 10px ${c.primary}44`,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>
              <span style={{ fontSize: 13, fontWeight: 800 }}>{recSide === 'me' ? '듣는 중 · 탭하면 완료' : '내가 말하기'}</span>
              <span style={{ fontSize: 9, opacity: 0.85 }}>{nativeLang.name} → {targetLang.name}</span>
            </button>
            <button onClick={() => liveListen('them')} disabled={recSide === 'me' || busy} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '12px 8px', borderRadius: 16, border: 'none', cursor: 'pointer',
              background: recSide === 'them' ? '#b84a3a' : c.accent2, color: '#fff',
              opacity: recSide === 'me' ? 0.4 : 1,
              animation: recSide === 'them' ? 'micPulse 1.1s infinite' : 'none',
              boxShadow: `0 3px 10px ${c.accent2}44`,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 4-3 5-3 8a3 3 0 0 1-6 0 3 3 0 0 1 3-3"/></svg>
              <span style={{ fontSize: 13, fontWeight: 800 }}>{recSide === 'them' ? '듣는 중 · 탭하면 완료' : '상대방 말하기'}</span>
              <span style={{ fontSize: 9, opacity: 0.85 }}>{targetLang.name} → 제안 3개</span>
            </button>
          </div>
        </div>
      ) : (
        /* PRACTICE: single input → AI replies as partner */
        <div>
          <div style={{
            fontSize: 10, color: c.ink3, marginBottom: 6, paddingLeft: 4, lineHeight: 1.4,
          }}>
            입력하면 AI가 상대역이 되어 답하고 다음 표현을 제안해요
          </div>
          <div style={{
            background: c.bg, border: `1.5px solid ${c.primary}55`,
            borderRadius: 18, padding: '8px 8px 8px 14px',
          }}>
            <textarea
              ref={taRef}
              value={rawInput}
              onChange={e => setRawInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              rows={1}
              placeholder={`어떤 언어로 입력해도 ${targetLang.name}로 전송돼요…`}
              style={{
                width: '100%', border: 'none', outline: 'none', background: 'transparent',
                fontSize: 14 * fontScale, color: c.ink, fontFamily: 'inherit',
                padding: '4px 0', resize: 'none', minHeight: 22, lineHeight: 1.4,
              }}
            />
            {(rawInput.trim() || preview) && (
              <div style={{
                marginTop: 6, paddingTop: 6, borderTop: `1px dashed ${c.divider}`,
                display: 'flex', alignItems: 'flex-start', gap: 6,
              }}>
                <span style={{
                  fontSize: 9, fontWeight: 800,
                  color: inputKind === 'clean' ? c.accent2 : inputKind === 'polished' ? '#9B59E0' : c.primary,
                  letterSpacing: 0.4, textTransform: 'uppercase', marginTop: 4, flexShrink: 0,
                }}>
                  {inputKind === 'clean' ? `✓ ${targetLang.code} 그대로` : inputKind === 'polished' ? `✏ ${targetLang.code} 정정` : `→ ${targetLang.code} 번역`}
                </span>
                <div style={{
                  flex: 1, fontSize: 14 * fontScale, color: preview ? c.ink : c.ink3,
                  fontWeight: 500, lineHeight: 1.4, padding: '2px 0', fontStyle: preview ? 'normal' : 'italic',
                }}>
                  {preview || (translating ? '자동 처리 중…' : '입력하면 자동 번역됩니다')}
                </div>
              </div>
            )}
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={practiceMic} style={{
                width: 38, height: 38, borderRadius: 999, border: 'none',
                background: recSide === 'me' ? '#b84a3a' : c.primarySoft,
                color: recSide === 'me' ? '#fff' : c.primary, cursor: 'pointer', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: recSide === 'me' ? 'micPulse 1.1s infinite' : 'none',
              }} title={`${nativeLang.name} 음성 입력`}>
                {I.mic}
              </button>
              <button onClick={handleSend} disabled={!preview} style={{
                flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                height: 38, borderRadius: 999, border: 'none',
                background: preview ? c.primary : c.divider,
                color: preview ? c.primaryInk : c.ink3,
                fontSize: 13, fontWeight: 800, cursor: preview ? 'pointer' : 'default',
              }}>
                {targetLang.name}로 보내기 {I.send}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { LiveTranslator });
