// Live interactive prototype — single screen with full state.
// Used as a focus-mode-friendly artboard with Tweaks support.

function LiveTranslator({ tweaks, setTweak }) {
  const dark = tweaks.theme === 'dark';
  const mode = dark ? 'dark' : 'light';
  const basePalette = window.CT_BRAND[mode];

  // Selected color skin (blue | gold | rose). localStorage takes priority so a
  // user's saved choice survives reloads; falls back to tweaks default, then blue.
  const skinId = (function(){
    try {
      const saved = localStorage.getItem('ct_skin');
      if (saved && window.CT_SKINS && window.CT_SKINS[saved]) return saved;
    } catch (e) {}
    return tweaks.skin || 'blue';
  })();

  // Apply skin tokens on top of the base palette for this light/dark mode.
  const palette = React.useMemo(() => {
    return (window.CT_applySkin ? window.CT_applySkin(basePalette, skinId, mode) : basePalette);
  }, [basePalette, skinId, mode]);

  // The skin already sets `primary`. We no longer override from tweaks.primary
  // so the skin stays coherent (buttons + cards matched).
  const c = palette;

  // Switching practice/live with an in-progress conversation: ask keep/clear.
  function handleModeChange(nextMode) {
    if (nextMode === appMode) return;
    if (convo.length > 0) {
      setPendingMode(nextMode);   // opens the confirm popup
      return;
    }
    setAppMode(nextMode);
  }

  const DRAFT_KEY = 'ct_draft_convo_v1';
  const DRAFT_TTL = 30 * 60 * 1000; // reopen after >30 min of inactivity → start fresh

  // Change color skin: persist + update tweaks so it applies immediately.
  function setSkin(id) {
    try { localStorage.setItem('ct_skin', id); } catch (e) {}
    if (setTweak) setTweak('skin', id);
    const sk = (window.CT_SKINS && window.CT_SKINS[id]) || {};
    const nm = (window.CT_LOCALE === 'EN' ? (sk.nameEn || sk.name) : sk.name) || '';
    setSkinToast(window.t('skinChanged', { name: nm }));
    setTimeout(() => setSkinToast(null), 2600);
  }
  const [convo, setConvo] = React.useState(() => {
    // Restore an in-progress (unsaved) conversation if the app was reopened —
    // but only if it was active within the last 30 minutes. Older drafts are
    // dropped so a long-abandoned chat opens fresh.
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        // New format: { savedAt, msgs }. Old format: a bare array (no timestamp).
        const arr = Array.isArray(data) ? data : (data && data.msgs);
        const savedAt = Array.isArray(data) ? 0 : (data && data.savedAt) || 0;
        if (Array.isArray(arr) && arr.length) {
          if (!savedAt || (Date.now() - savedAt) <= DRAFT_TTL) return arr;
          localStorage.removeItem(DRAFT_KEY); // stale → start fresh
        }
      }
    } catch (e) {}
    return [];
  });
  const [appMode, setAppMode] = React.useState('live'); // 'practice' | 'live' — home opens in live mode
  const [pendingMode, setPendingMode] = React.useState(null); // mode-switch confirm
  const [skinToast, setSkinToast] = React.useState(null); // brief "applied" message
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchMode, setSearchMode] = React.useState('search'); // 'search' | 'history'
  const [langPicker, setLangPicker] = React.useState(null);  // 'target' | 'native' | null
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [saveOpen, setSaveOpen] = React.useState(false);
  const [saveAuto, setSaveAuto] = React.useState(false); // did the save sheet auto-open?
  const [pendingNew, setPendingNew] = React.useState(false); // save sheet opened via "새 대화"
  const [confirmNew, setConfirmNew] = React.useState(false); // styled "start new conversation?" modal
  const [viewSession, setViewSession] = React.useState(null); // saved session opened read-only
  const [wordPop, setWordPop] = React.useState(null); // { term, translation, loading, x, y } | null
  const promptedRef = React.useRef(false);   // only auto-prompt once per conversation
  const idleRef = React.useRef(null);
  const wordCacheRef = React.useRef({});      // cache word-tap translations (avoid re-calling for the same word)

  // Auto-popup suppressed for the rest of today?
  function autoPromptSnoozed() {
    try { return localStorage.getItem('ct_save_prompt_off') === new Date().toDateString(); } catch (e) { return false; }
  }
  const target = tweaks.target || 'EN';
  const native = tweaks.native || 'KO';
  // UI language: Korean if my language is Korean, otherwise English.
  window.CT_LOCALE = native === 'KO' ? 'KO' : 'EN';
  const scrollRef = window.useDragScroll();

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [convo]);

  // Auto-backup the in-progress conversation so an accidental app switch /
  // reload doesn't lose it. Cleared on explicit save or "새 대화".
  React.useEffect(() => {
    try {
      // Store with a timestamp = time of last activity, so reopening after a
      // long gap can decide whether to restore or start fresh.
      if (convo.length) localStorage.setItem(DRAFT_KEY, JSON.stringify({ savedAt: Date.now(), msgs: convo }));
      else localStorage.removeItem(DRAFT_KEY);
    } catch (e) {}
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
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
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
    // Styled confirm (not the native window.confirm, which shows the page URL
    // and looks unbranded) prevents accidental loss of an unsaved conversation.
    setConfirmNew(true);
  }

  // Share the app: native share sheet (KakaoTalk, Messages, Mail…) on devices
  // that support it; copy the link to the clipboard as a fallback.
  async function handleShare() {
    const url = 'https://convotrans.jennyryu3d.com';
    const text = window.t('shareText');
    // Native share sheet: the recipient gets the intro line + the link together
    // (apps render text then url).
    if (navigator.share) {
      try { await navigator.share({ title: 'ConvoTrans', text, url }); return; }
      catch (e) { if (e && e.name === 'AbortError') return; /* else fall through to copy */ }
    }
    // Fallback (desktop): copy the intro AND the link so both travel together.
    try { await navigator.clipboard.writeText(`${text}\n${url}`); setSkinToast(window.t('linkCopied')); }
    catch (e) { setSkinToast(url); }
    setTimeout(() => setSkinToast(null), 1800);
  }

  function nowStamp() {
    const d = new Date();
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    const hr = (h % 12) || 12;
    if (window.CT_LOCALE === 'EN') return hr + ':' + m + (h < 12 ? ' AM' : ' PM');
    return (h < 12 ? '오전 ' : '오후 ') + hr + ':' + m;
  }

  // Tap a word in any bubble → ask the AI whether the tapped word is part of a
  // phrase/idiom (translate the whole phrase) or standalone (just the word),
  // then translate it into the OTHER conversation language. Shows a popup.
  function handleWordTap(word, fullSentence, sentenceLang, ev, tapId) {
    try { ev && ev.stopPropagation(); } catch (e) {}
    const rect = (ev && ev.currentTarget && ev.currentTarget.getBoundingClientRect)
      ? ev.currentTarget.getBoundingClientRect() : null;
    const anchor = rect
      ? { x: rect.left + rect.width / 2, y: rect.top, bottom: rect.bottom }
      : { x: window.innerWidth / 2, y: window.innerHeight / 2, bottom: window.innerHeight / 2 };

    const targetName = window.CT_LANG.byCode(target).native;
    const nativeName = window.CT_LANG.byCode(native).native;
    const fromName = sentenceLang === 'target' ? targetName : nativeName;
    const toName   = sentenceLang === 'target' ? nativeName : targetName;

    // term = text to pronounce. translation = result. hl* drive the highlight.
    // x/y/bottom position the floating popup above the tapped word.
    setWordPop({ term: word, translation: '', loading: true, hlSentence: fullSentence, hlSelected: word, tapId: tapId || null, x: anchor.x, y: anchor.y, bottom: anchor.bottom });

    (async () => {
      // Cache: the same tapped word in the same sentence always resolves to the
      // same answer — serve repeats from memory instead of re-calling the API.
      const cacheKey = `${fromName}>${toName}|${fullSentence}|${word}`;
      const cached = wordCacheRef.current[cacheKey];
      if (cached) {
        setWordPop(wp => wp ? { ...wp, term: cached.selected || word, translation: cached.translation, hlSelected: cached.selected || word, loading: false } : null);
        return;
      }
      try {
        const res = await window.CT_API.complete(
          `In the ${fromName} sentence below, the user tapped the word "${word}". ` +
          `Translate it into natural ${toName}. ` +
          `By DEFAULT translate ONLY the single tapped word. ` +
          `Expand to a multi-word unit ONLY if the tapped word does not carry its own meaning alone — ` +
          `i.e. it is part of a fixed idiom, phrasal verb, or set expression whose meaning cannot be ` +
          `understood from the word by itself (e.g. "look forward to", "give up", "by the way"). ` +
          `Do NOT include surrounding objects, time phrases, or modifiers that have their own separate meaning ` +
          `(e.g. for "reschedule for tomorrow", select just "reschedule"). ` +
          `Keep the selection as SHORT as possible.\n` +
          `Return strict one-line JSON: {"selected":"<the word or minimal phrase in ${fromName}>","translation":"<${toName} translation>"}\n\n` +
          `Sentence: ${fullSentence}`,
          { silent: true }
        );
        const raw = String(res).trim().replace(/^```json\s*/i,'').replace(/```\s*$/,'');
        let p = null;
        try { p = JSON.parse(raw); } catch (e) {}
        if (p && p.translation) {
          wordCacheRef.current[cacheKey] = { selected: p.selected || word, translation: p.translation };
          setWordPop(wp => wp ? { ...wp, term: p.selected || word, translation: p.translation, hlSelected: p.selected || word, loading: false } : null);
        } else {
          setWordPop(wp => wp ? { ...wp, translation: raw || window.t('transFailed'), loading: false } : null);
        }
      } catch (e) {
        setWordPop(wp => wp ? { ...wp, translation: window.t('transFetchFail'), loading: false } : null);
      }
    })();
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
          `Conversation so far:\n${recent}`,
          { silent: true }
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
          `Conversation so far:\n${recent}`,
          { silent: true }
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
          `Conversation so far:\n${recent}\n\nTheir last words: ${targetText}`,
          { silent: true }
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
   <WordTapCtx.Provider value={{ onTap: handleWordTap, highlight: wordPop ? { sentence: wordPop.hlSentence, selected: wordPop.hlSelected, tapId: wordPop.tapId } : null }}>
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: c.bg, color: c.ink, fontSize: 14 * fontScale,
      fontFamily: "'Plus Jakarta Sans', -apple-system, system-ui, sans-serif",
    }}>
      <TopBar palette={c} dark={dark} showMascot={tweaks.showMascot}
        onToggleDark={() => setTweak('theme', dark ? 'light' : 'dark')}
        onSearch={() => { setSearchMode('search'); setSearchOpen(true); }}
        onHistory={() => { setSearchMode('history'); setSearchOpen(true); }}
        onSettings={() => setSettingsOpen(true)}
        onShare={handleShare}
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
            }}>{window.t('startConvo')}</div>
            <div style={{ fontSize: 13, color: c.ink2, lineHeight: 1.6 }}>
              {window.t('emptyHintPre')} <b style={{ color: c.ai }}>{window.t('liveMode')}</b> {window.t('emptyHintMid')} <b style={{ color: c.primary }}>{window.t('learnMode')}</b>{window.t('emptyHintPost')}
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
                  native={native}
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
        appMode={appMode} onModeChange={handleModeChange}
        onSendMine={sendMine} onSendThem={sendThem}
        target={target} native={native} />

      {searchOpen && (
        <window.SearchOverlay
          palette={c}
          dark={dark}
          mode={searchMode}
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
          skinId={skinId} onPickSkin={setSkin}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {saveOpen && (
        <window.SaveConvoSheet
          palette={c} dark={dark}
          convo={convo} target={target} native={native}
          mode={appMode}
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

    <WordPopup pop={wordPop} palette={c} onClose={() => setWordPop(null)} />

    {pendingMode && (
      <ModeSwitchConfirm
        palette={c}
        toMode={pendingMode}
        onKeep={() => { setAppMode(pendingMode); setPendingMode(null); }}
        onClear={() => { startNewConversation(); setAppMode(pendingMode); setPendingMode(null); }}
        onCancel={() => setPendingMode(null)}
      />
    )}
    {confirmNew && (
      <NewConvoConfirm
        palette={c}
        onConfirm={() => { startNewConversation(); setConfirmNew(false); }}
        onCancel={() => setConfirmNew(false)}
      />
    )}
    {skinToast && (
      <div style={{
        position: 'fixed', left: '50%', bottom: 90, transform: 'translateX(-50%)',
        zIndex: 330, maxWidth: '88%',
        background: c.ai, color: c.aiInk || '#fff',
        padding: '10px 16px', borderRadius: 999,
        fontSize: 12.5, fontWeight: 700, lineHeight: 1.3, textAlign: 'center',
        boxShadow: '0 8px 24px rgba(0,18,38,0.3)',
        animation: 'svvIn .2s ease-out',
      }}>{skinToast}</div>
    )}

   </WordTapCtx.Provider>
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
        {window.t('meSent')}
        {msg.inputKind === 'clean' && (
          <span style={{ fontSize: 9 * fontScale, color: c.accent2, fontWeight: 800, letterSpacing: 0.4 }}>· {window.t('asIs')}</span>
        )}
        {isFixed && (
          <span style={{ fontSize: 9 * fontScale, color: '#9B59E0', fontWeight: 800, letterSpacing: 0.4 }}>· {window.t('corrected')}</span>
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
            <TappableText text={msg.trans} lang="target" id={`me-${msg.id}-t`} />
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
                {isFixed ? window.t('correctedMine') : window.t('myInput')}
              </div>
              <div style={isFixed ? { textDecoration: 'line-through wavy #9B59E055', textDecorationSkipInk: 'none' } : null}>
                <TappableText text={msg.orig} lang="native" id={`me-${msg.id}-o`} />
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
        }}>{window.t('them')}</div>
      </div>
      <div style={{ maxWidth: '92%', width: '100%' }}>
        <div style={{
          background: c.them, border: `1px solid ${c.themBorder}`,
          padding: '12px 14px 10px',
          borderRadius: `4px ${radius}px ${radius}px ${radius}px`,
          boxShadow: shadow,
        }}>
          <div style={{ fontSize: 15 * fontScale, lineHeight: 1.5, color: c.themInk || c.ink, fontWeight: 500 }}><TappableText text={msg.orig} lang="target" id={`them-${msg.id}-o`} /></div>
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
                {window.t('translation')}
              </span>
            </div>
            <TappableText text={msg.trans} lang="native" id={`them-${msg.id}-t`} />
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
// Context to pass the word-tap handler down to bubbles without prop drilling.
const WordTapCtx = React.createContext(null);
window.CT_WordTapCtx = WordTapCtx;

// Renders text where each word is tappable; separators preserved.
// When this instance is the one the user tapped, the selected word/phrase is
// highlighted. `id` uniquely identifies this text element.
let __ttSeq = 0;
function TappableText({ text, lang, id }) {
  const ctx = React.useContext(WordTapCtx);
  const selfId = React.useMemo(() => id || ('tt-' + (++__ttSeq)), [id]);
  if (text == null) return null;
  const str = String(text);
  if (!ctx || !ctx.onTap) return <span>{str}</span>;
  const onTap = ctx.onTap;
  const hl = ctx.highlight;

  // Build a set of character ranges to highlight (only if this element was tapped).
  let hlRange = null;
  if (hl && hl.tapId === selfId && hl.selected) {
    const lc = str.toLowerCase();
    const sel = String(hl.selected).toLowerCase().trim();
    const at = sel ? lc.indexOf(sel) : -1;
    if (at >= 0) hlRange = [at, at + sel.length];
  }

  const tokens = str.split(/(\s+)/);
  let cursor = 0;
  return (
    <span>
      {tokens.map((tok, i) => {
        const start = cursor; cursor += tok.length;
        if (tok === '' || /^\s+$/.test(tok)) return <span key={i}>{tok}</span>;
        const core = tok.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
        if (!core) return <span key={i}>{tok}</span>;
        const inHL = hlRange && start < hlRange[1] && (start + tok.length) > hlRange[0];
        return (
          <span key={i}
            onClick={(e) => onTap(core, str, lang, e, selfId)}
            style={{
              cursor: 'pointer', borderRadius: 3,
              background: inHL ? '#FFE26A' : 'transparent',
              color: inHL ? '#3A2E00' : 'inherit',
              padding: inHL ? '0 1px' : 0,
              transition: 'background .1s',
            }}
          >{tok}</span>
        );
      })}
    </span>
  );
}

// Confirm dialog when switching modes with an in-progress conversation.
function ModeSwitchConfirm({ palette, toMode, onKeep, onClear, onCancel }) {
  const c = palette;
  const toName = toMode === 'live' ? window.t('liveMode') : window.t('learnMode');
  return (
    <div onClick={onCancel} style={{
      position: 'fixed', inset: 0, zIndex: 320,
      background: 'rgba(0,18,38,0.45)', backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: c.surface, borderRadius: 20, padding: '20px 20px 16px',
        maxWidth: 340, width: '100%',
        boxShadow: '0 20px 48px rgba(0,18,38,0.3)',
      }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: c.ink, marginBottom: 6, fontFamily: "'Chakra Petch', system-ui, sans-serif" }}>
          {window.t('modeSwitchTo', { name: toName })}
        </div>
        <div style={{ fontSize: 13, color: c.ink2, lineHeight: 1.55, marginBottom: 18 }}>
          {window.t('modeSwitchBody')}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={onKeep} style={{
            height: 44, borderRadius: 999, border: 'none', cursor: 'pointer',
            background: c.primary, color: c.primaryInk, fontSize: 14, fontWeight: 800,
          }}>{window.t('keepAndSwitch')}</button>
          <button onClick={onClear} style={{
            height: 44, borderRadius: 999, cursor: 'pointer',
            background: 'transparent', color: '#C0392B', border: `1.5px solid ${c.divider}`,
            fontSize: 14, fontWeight: 800,
          }}>{window.t('clearAndSwitch')}</button>
          <button onClick={onCancel} style={{
            height: 40, borderRadius: 999, border: 'none', cursor: 'pointer',
            background: 'transparent', color: c.ink3, fontSize: 13, fontWeight: 700,
          }}>{window.t('cancel')}</button>
        </div>
      </div>
    </div>
  );
}

// Branded, centered "start a new conversation?" confirm — replaces the native
// window.confirm (which leaks the page URL and looks like dev mode). Small logo
// on top for a designed feel.
function NewConvoConfirm({ palette, onConfirm, onCancel }) {
  const c = palette;
  return (
    <div onClick={onCancel} style={{
      position: 'fixed', inset: 0, zIndex: 320,
      background: 'rgba(0,18,38,0.45)', backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: c.surface, borderRadius: 20, padding: '22px 20px 16px',
        maxWidth: 320, width: '100%', textAlign: 'center',
        boxShadow: '0 20px 48px rgba(0,18,38,0.3)',
      }}>
        <img src="convotrans-design/assets/app-icon.png" alt="ConvoTrans" style={{
          width: 44, height: 44, borderRadius: 12, display: 'block', margin: '0 auto 12px',
          boxShadow: '0 4px 12px rgba(8,27,27,0.18)',
        }} />
        <div style={{ fontSize: 16, fontWeight: 800, color: c.ink, marginBottom: 6, fontFamily: "'Chakra Petch', system-ui, sans-serif" }}>
          {window.t('startNewQ')}
        </div>
        <div style={{ fontSize: 13, color: c.ink2, lineHeight: 1.55, marginBottom: 18 }}>
          {window.t('clearAndRestart')}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={onConfirm} style={{
            height: 44, borderRadius: 999, border: 'none', cursor: 'pointer',
            background: c.primary, color: c.primaryInk, fontSize: 14, fontWeight: 800,
          }}>{window.t('startFresh')}</button>
          <button onClick={onCancel} style={{
            height: 40, borderRadius: 999, border: 'none', cursor: 'pointer',
            background: 'transparent', color: c.ink3, fontSize: 13, fontWeight: 700,
          }}>{window.t('cancel')}</button>
        </div>
      </div>
    </div>
  );
}

// Floating mini popup anchored above the tapped word. No backdrop dim — just a
// transparent layer to catch outside taps. Sized to its content.
function WordPopup({ pop, palette, onClose }) {
  const c = palette;
  if (!pop) return null;

  const PADDING = 8; // viewport edge padding
  const popW = 240;  // max width; actual box shrinks to content via inline-flex
  // Horizontal: center on the word but clamp so the (centered) box stays on-screen.
  const half = popW / 2;
  let left = (pop.x || 0);
  const vw = (typeof window !== 'undefined' ? window.innerWidth : 380);
  left = Math.max(half + PADDING, Math.min(left, vw - half - PADDING));
  // Vertical: prefer above the word; if too close to top, drop below.
  const above = (pop.y || 0) > 90;
  const top = above ? (pop.y - 10) : ((pop.bottom || pop.y) + 10);

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 300, background: 'transparent',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        position: 'fixed',
        left, top,
        transform: `translate(-50%, ${above ? '-100%' : '0'})`,
        maxWidth: popW,
        background: c.surface, borderRadius: 12, padding: '8px 10px',
        boxShadow: '0 8px 24px rgba(0,18,38,0.30), 0 2px 6px rgba(0,18,38,0.18)',
        border: `1px solid ${c.divider}`,
        display: 'inline-flex', alignItems: 'center', gap: 8,
        whiteSpace: 'nowrap',
      }}>
        <span style={{ fontSize: 15, color: c.primary, fontWeight: 700, lineHeight: 1.3,
          whiteSpace: 'normal', maxWidth: popW - 50, display: 'inline-block' }}>
          {pop.loading ? <span style={{ color: c.ink3, fontWeight: 500 }}>{window.t('translating')}</span> : pop.translation}
        </span>
        <button onClick={() => window.CT_SPEAK && window.CT_SPEAK.once(pop.term)} style={{
          flexShrink: 0, width: 28, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer',
          background: c.primarySoft, color: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} title={window.t('listen')} aria-label={window.t('listen')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a4 4 0 0 1 0 7"/><path d="M19 5a8 8 0 0 1 0 14"/></svg>
        </button>
      </div>
    </div>
  );
}

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
        }} title={window.t('close')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: c.ink, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'Chakra Petch', system-ui, sans-serif" }}>
            {session.title || session.partner || window.t('savedConvoTopic')}
          </div>
          <div style={{ fontSize: 11, color: c.ink3, marginTop: 1 }}>
            {(session.label || window.t('savedLabel'))} · {session.date || ''} · {window.t('msgsCount', { n: msgs.length })}
          </div>
        </div>
        <span style={{
          fontSize: 9, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase',
          color: c.ink3, background: c.bg, border: `1px solid ${c.divider}`,
          padding: '3px 8px', borderRadius: 999, flexShrink: 0,
        }}>{window.t('readOnly')}</span>
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
            {window.t('noMsgsInConvo')}
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
      <button onClick={onNew} title={window.t('newConvo')} style={{ ...fab(false), pointerEvents: 'auto' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
      {/* 대화 저장 */}
      <button onClick={onSave} title={window.t('saveConvoBold')} style={{ ...fab(true), pointerEvents: 'auto' }}>
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
      // continuous: keep recording through pauses; user taps the mic again to stop.
      continuous: true,
      onInterim: () => {},
      onFinal: (t) => { captured = t; },
      onError: () => { setRecSide(null); },
      onPermission: (status) => { setRecSide(null); alert(window.CT_MIC_HELP(status)); },
      onEnd: async () => {
        setRecSide(null); recRef.current = null;
        const text = (captured || '').trim();
        if (!text) return;
        // Wrap so the connection notice's "retry" can re-run this exact
        // translation+send (the captured text), not re-record the mic.
        const doTranslate = async () => {
          setBusy(true);
          try {
            if (side === 'me') {
              const out = await translate(text, nativeLang.native, targetLang.native);
              // Do NOT auto-play through the speaker — it can startle the other
              // person. The message bubble has a speaker button for manual play.
              onSendMine(text, out, 'foreign', { noReply: true });
            } else {
              const out = await translate(text, targetLang.native, nativeLang.native);
              onSendThem(text, out);
            }
          } catch (e) {}
          setBusy(false);
        };
        window.CT_API.arm(doTranslate);
        doTranslate();
      },
    });
    if (!rec) return;
    recRef.current = rec;
    setRecSide(side);
  }

  // PRACTICE mic: my native voice → fills text input.
  async function practiceMic() {
    if (recSide === 'me' && recRef.current) { recRef.current.stop(); return; }
    setPreview(''); setInputKind('foreign');  // new voice input → re-translate before sending
    const rec = await window.CT_RECOGNIZE.startWithPermission(nativeLang.locale, {
      // continuous: keep recording through pauses; user taps the mic again to stop.
      continuous: true,
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

  // Switching mode or target language drops any stale preview so we never send
  // a translation that no longer matches the current settings.
  React.useEffect(() => { setPreview(''); setInputKind('foreign'); }, [target, isLive]);

  // Practice: ONE tap = translate/polish my input → target → send it straight to
  // the conversation. Still a single API call per finished message (the cost
  // lever: no per-keystroke calls), with no separate review/confirm step.
  async function handleSend() {
    if (isLive || translating) return;
    const text = rawInput.trim();
    if (!text) return;
    // Register this send as the retriable action. On failure the input is kept,
    // so re-running re-translates the same text; on success the input is cleared
    // and a re-run safely no-ops.
    window.CT_API.arm(() => handleSend());
    setTranslating(true);
    try {
      const targetName = targetLang.native;
      const res = await window.CT_API.complete(
        `You are a translation + editing assistant. The message will be sent to a NATIVE ${targetName} speaker, so the output MUST be fully correct, natural, native-level ${targetName}.
Decide the kind and produce "out":
- If the input is in another language → translate it into natural ${targetName}. kind = "translate".
- If the input is already in ${targetName} but has ANY grammar mistakes, awkward wording, wrong word choice, or anything a native speaker would not say (or could misunderstand) → REWRITE it into correct, natural, native-level ${targetName}. kind = "polish".
- ONLY if the input is already fully correct and natural ${targetName} that needs no change → keep it as-is. kind = "clean".
Preserve the speaker's original meaning and tone; do not add new information.
Output one-line JSON only, no markdown: {"kind":"polish"|"translate"|"clean","out":"<final ${targetName}>"}

INPUT: ${text}`
      );
      const raw = String(res).trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '');
      let parsed = null;
      try { parsed = JSON.parse(raw); } catch (e) {}
      let out, kind;
      if (parsed && parsed.out) {
        out = parsed.out;
        kind = parsed.kind === 'translate' ? 'foreign' : parsed.kind === 'polish' ? 'polished' : 'clean';
      } else {
        out = raw.replace(/^["'`]|["'`]$/g, '');
        kind = 'foreign';
      }
      if (out) { onSendMine(rawInput, out, kind); setRawInput(''); setPreview(''); setInputKind('foreign'); }
    } catch (e) {
      // Translation failed — keep the text so the user can retry.
    } finally {
      setTranslating(false);
    }
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
          {window.t('liveMode')}
        </button>
        <button onClick={() => onModeChange('practice')} style={{
          flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          height: 36, borderRadius: 999, border: 'none', cursor: 'pointer',
          background: !isLive ? c.primary : 'transparent',
          color: !isLive ? c.primaryInk : c.ink2, fontSize: 12.5, fontWeight: 800,
          transition: 'color .15s',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
          {window.t('learnMode')}
        </button>
      </div>

      {isLive ? (
        /* LIVE: two speak buttons — both add to the main conversation */
        <div>
          <div style={{ fontSize: 10, color: c.ink3, marginBottom: 8, textAlign: 'center', lineHeight: 1.4 }}>
            {window.t('whoSpeaksHint')} · {busy && <span style={{ color: c.primary, fontWeight: 700 }}>{window.t('processing')}</span>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => liveListen('me')} disabled={recSide === 'them' || busy} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '12px 8px', borderRadius: 16, border: 'none', cursor: 'pointer',
              background: recSide === 'me' ? '#b84a3a' : (c.meBtn || c.primary), color: (c.meBtnInk || '#fff'),
              opacity: recSide === 'them' ? 0.4 : 1,
              animation: recSide === 'me' ? 'micPulse 1.1s infinite' : 'none',
              boxShadow: `0 3px 10px ${(c.meBtn || c.primary)}44`,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>
              <span style={{ fontSize: 13, fontWeight: 800 }}>{recSide === 'me' ? window.t('listeningTapDone') : window.t('iSpeak')}</span>
              <span style={{ fontSize: 9, opacity: 0.85 }}>{nativeLang.name} → {targetLang.name}</span>
            </button>
            <button onClick={() => liveListen('them')} disabled={recSide === 'me' || busy} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '12px 8px', borderRadius: 16, border: 'none', cursor: 'pointer',
              background: recSide === 'them' ? '#b84a3a' : (c.themBtn || c.accent2), color: (c.themBtnInk || '#fff'),
              opacity: recSide === 'me' ? 0.4 : 1,
              animation: recSide === 'them' ? 'micPulse 1.1s infinite' : 'none',
              boxShadow: `0 3px 10px ${(c.themBtn || c.accent2)}44`,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 4-3 5-3 8a3 3 0 0 1-6 0 3 3 0 0 1 3-3"/></svg>
              <span style={{ fontSize: 13, fontWeight: 800 }}>{recSide === 'them' ? window.t('listeningTapDone') : window.t('theySpeak')}</span>
              <span style={{ fontSize: 9, opacity: 0.85 }}>{targetLang.name} → {window.t('suggest3')}</span>
            </button>
          </div>
        </div>
      ) : (
        /* PRACTICE: single input → AI replies as partner */
        <div>
          <div style={{
            fontSize: 10, color: c.ink3, marginBottom: 6, paddingLeft: 4, lineHeight: 1.4,
          }}>
            {window.t('practiceHint')}
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
              placeholder={window.t('placeholderAnyLang', { lang: targetLang.name })}
              style={{
                width: '100%', border: 'none', outline: 'none', background: 'transparent',
                fontSize: 14 * fontScale, color: c.ink, fontFamily: 'inherit',
                padding: '4px 0', resize: 'none', minHeight: 22, lineHeight: 1.4,
              }}
            />
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={practiceMic} style={{
                width: 38, height: 38, borderRadius: 999, border: 'none',
                background: recSide === 'me' ? '#b84a3a' : (c.micBtn || c.primary),
                color: recSide === 'me' ? '#fff' : (c.micBtnInk || '#fff'), cursor: 'pointer', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: recSide === 'me' ? 'micPulse 1.1s infinite' : 'none',
              }} title={window.t('voiceInput', { lang: nativeLang.name })}>
                {I.mic}
              </button>
              <button onClick={handleSend} disabled={!rawInput.trim() || translating} style={{
                flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                height: 38, borderRadius: 999, border: 'none',
                background: (rawInput.trim() && !translating) ? (c.sendBtn || c.primary) : c.divider,
                color: (rawInput.trim() && !translating) ? (c.sendBtnInk || c.primaryInk) : c.ink3,
                fontSize: 13, fontWeight: 800, cursor: (rawInput.trim() && !translating) ? 'pointer' : 'default',
              }}>
                {translating
                  ? window.t('translating')
                  : <>{window.t('sendTo', { lang: targetLang.name })} {I.send}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { LiveTranslator, TappableText });
