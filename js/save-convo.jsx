// Save Conversation — store finished conversations with an editable title +
// summary so they're findable later (also feeds the Search history).
//
// Storage: localStorage key 'ct_saved_convos_v1' → array of
//   { id, title, summary, partner, date, label, messages }
// Shape matches CT_HISTORY entries so Search can read both.

window.CT_SAVED = {
  KEY: 'ct_saved_convos_v1',
  all() {
    try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); } catch (e) { return []; }
  },
  save(entry) {
    const list = this.all();
    list.unshift(entry);
    try { localStorage.setItem(this.KEY, JSON.stringify(list)); } catch (e) {}
    window.dispatchEvent(new CustomEvent('ct-saved-changed'));
  },
  remove(id) {
    const list = this.all().filter(e => e.id !== id);
    try { localStorage.setItem(this.KEY, JSON.stringify(list)); } catch (e) {}
    window.dispatchEvent(new CustomEvent('ct-saved-changed'));
  },
};

function todayLabel() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function SaveConvoSheet({ palette, dark, convo, target, native, mode = 'practice', onSaved, onDelete, onDismiss, onSnooze, autoOpened, pendingNew }) {
  const c = palette;
  const nativeLang = window.CT_LANG.byCode(native);
  const [title, setTitle] = React.useState('');
  const [summary, setSummary] = React.useState('');
  // Manual open → generate immediately (the user came here to save). Auto-open
  // (the 45s idle nudge) → defer: most nudges get dismissed, so we only spend an
  // API call once the user actually engages (focuses a field or taps Save).
  const [loadingSummary, setLoadingSummary] = React.useState(!autoOpened);
  const genRef = React.useRef(false);      // has generation already started?
  const mountedRef = React.useRef(true);
  React.useEffect(() => () => { mountedRef.current = false; }, []);

  // Generate a title + summary from the transcript. Runs at most once; returns
  // the generated { title, summary } so a caller (doSave) can use the values
  // without waiting for a state update.
  async function generate() {
    if (genRef.current) return { title, summary };
    genRef.current = true;
    if (mountedRef.current) setLoadingSummary(true);
    const transcript = convo.map(m => {
      const who = m.side === 'me' ? 'Me' : 'Them';
      let line = `${who}: ${m.orig}${m.trans ? ' (' + m.trans + ')' : ''}`;
      if (m.side === 'them' && typeof m.pickedIdx === 'number' && m.suggestions && m.suggestions[m.pickedIdx]) {
        const pick = m.suggestions[m.pickedIdx];
        line += `\nMe: ${pick.en}${pick.ko ? ' (' + pick.ko + ')' : ''}`;
      }
      return line;
    }).join('\n');
    let t = '', s = '';
    try {
      const res = await window.CT_API.complete(
        `Here is a bilingual conversation transcript. In ${nativeLang.native}, produce:\n` +
        `1) a short title (max 6 words) — guess the other person's name if mentioned, else the topic\n` +
        `2) a 2-3 sentence summary of what was discussed.\n` +
        `Return strict JSON on one line: {"title":"...","summary":"..."}\n\nTranscript:\n${transcript}`
      );
      const raw = String(res).trim().replace(/^```json\s*/i,'').replace(/```\s*$/,'');
      let parsed = null;
      try { parsed = JSON.parse(raw); } catch (e) {}
      if (parsed) { t = parsed.title || ''; s = parsed.summary || ''; }
      else { s = raw; }
    } catch (e) { /* leave blank on failure */ }
    if (mountedRef.current) { setTitle(t); setSummary(s); setLoadingSummary(false); }
    return { title: t, summary: s };
  }

  // Manual open: generate now. Auto-open: defer until the user engages.
  React.useEffect(() => { if (!autoOpened) generate(); }, []);

  async function doSave() {
    // If the sheet auto-opened and the user taps Save without engaging, generate
    // the title/summary now (once) so the saved entry still gets one.
    let t = title, s = summary;
    if (!genRef.current && convo.length) {
      const g = await generate();
      t = g.title || t; s = g.summary || s;
    }
    const entry = {
      id: 'saved-' + Date.now(),
      title: (t || window.t('untitledConvo')).trim(),
      summary: s.trim(),
      partner: (t || window.t('convoWord')).trim(),
      topic: s.trim().slice(0, 60) || window.t('savedConvoTopic'),
      date: todayLabel(),
      label: window.t('savedLabel'),
      mode: mode === 'live' ? 'live' : 'practice',  // which screen produced it
      // Flatten: for each "them" message, keep it; if I picked one of its
      // suggestions, append my chosen reply as a "me" message so the saved
      // transcript reads as a real back-and-forth.
      messages: (() => {
        const out = [];
        for (const m of convo) {
          out.push({ side: m.side, orig: m.orig, trans: m.trans, time: m.time });
          if (m.side === 'them' && typeof m.pickedIdx === 'number' && m.suggestions && m.suggestions[m.pickedIdx]) {
            const pick = m.suggestions[m.pickedIdx];
            out.push({ side: 'me', orig: pick.ko, trans: pick.en, time: m.time, inputKind: 'picked' });
          }
        }
        return out;
      })(),
    };
    window.CT_SAVED.save(entry);
    onSaved && onSaved(entry);
  }

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 95,
      background: 'rgba(0,18,38,0.55)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'flex-end',
      animation: 'svFade .15s ease-out',
    }}>
      <style>{`
        @keyframes svFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes svSlide { from { transform: translateY(100%); } to { transform: none; } }
      `}</style>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', background: c.surface, borderRadius: '24px 24px 0 0',
        padding: '10px 18px 20px',
        animation: 'svSlide .24s ease-out',
        boxShadow: '0 -8px 24px rgba(0,18,38,0.22)',
        maxHeight: '88%', overflowY: 'auto',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 999, background: c.divider, margin: '0 auto 14px' }} />

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: c.primarySoft, color: c.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: c.ink, fontFamily: "'Chakra Petch', system-ui, sans-serif" }}>
              {pendingNew ? window.t('startNewQ') : window.t('saveThisQ')}
            </div>
            <div style={{ fontSize: 11, color: c.ink3 }}>{pendingNew ? window.t('startNewDesc') : window.t('saveThisDesc')}</div>
          </div>
        </div>

        {/* Title */}
        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', color: c.ink3, fontFamily: "'Chakra Petch', system-ui, sans-serif" }}>{window.t('titleLabel')}</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onFocus={() => generate()}
            placeholder={loadingSummary ? window.t('titleGenerating') : window.t('titlePlaceholder')}
            style={{
              width: '100%', marginTop: 5, border: `1.5px solid ${c.divider}`, borderRadius: 12,
              padding: '10px 12px', fontSize: 14, color: c.ink, background: c.bg,
              outline: 'none', fontFamily: 'inherit', fontWeight: 600,
            }}
          />
        </div>

        {/* Summary */}
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', color: c.ink3, fontFamily: "'Chakra Petch', system-ui, sans-serif" }}>
            {window.t('summaryLabel')} {loadingSummary && <span style={{ color: c.primary }}>· {window.t('aiWriting')}</span>}
          </label>
          <textarea
            value={summary}
            onChange={e => setSummary(e.target.value)}
            onFocus={() => generate()}
            rows={4}
            placeholder={loadingSummary ? window.t('summaryGenerating') : window.t('summaryPlaceholder')}
            style={{
              width: '100%', marginTop: 5, border: `1.5px solid ${c.divider}`, borderRadius: 12,
              padding: '10px 12px', fontSize: 13, color: c.ink, background: c.bg,
              outline: 'none', fontFamily: 'inherit', lineHeight: 1.5, resize: 'vertical',
            }}
          />
        </div>

        <div style={{ fontSize: 11, color: c.ink3, marginTop: 8, lineHeight: 1.5 }}>
          {window.t('msgsSavedNote', { n: convo.length })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
          <button onClick={onDelete} style={{
            padding: '12px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: 'transparent', color: '#C0392B', fontSize: 13, fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
            {window.t('deleteConvo')}
          </button>
          <div style={{ flex: 1 }} />
          <button onClick={onDismiss} style={{
            padding: '12px 16px', borderRadius: 999, border: `1.5px solid ${c.divider}`, cursor: 'pointer',
            background: 'transparent', color: c.ink2, fontSize: 13, fontWeight: 700,
          }}>{pendingNew ? window.t('dontSave') : window.t('later')}</button>
          <button onClick={doSave} style={{
            padding: '12px 22px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: c.primary, color: c.primaryInk, fontSize: 13, fontWeight: 800,
            boxShadow: `0 4px 12px ${c.primary}55`,
          }}>{window.t('save')}</button>
        </div>

        {/* Snooze auto-popup for today — only relevant when it auto-opened */}
        {autoOpened && (
          <div style={{ textAlign: 'center', marginTop: 10 }}>
            <button onClick={onSnooze} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: 11, color: c.ink3, fontWeight: 600, textDecoration: 'underline',
            }}>{window.t('dontShowToday')}</button>
          </div>
        )}
      </div>
    </div>
  );
}

window.SaveConvoSheet = SaveConvoSheet;
