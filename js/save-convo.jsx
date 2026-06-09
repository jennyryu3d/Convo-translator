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

function SaveConvoSheet({ palette, dark, convo, target, native, onSaved, onDelete, onDismiss, onSnooze, autoOpened }) {
  const c = palette;
  const nativeLang = window.CT_LANG.byCode(native);
  const [title, setTitle] = React.useState('');
  const [summary, setSummary] = React.useState('');
  const [loadingSummary, setLoadingSummary] = React.useState(true);

  // Auto-generate a title + summary from the transcript on open.
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const transcript = convo.map(m => {
        const who = m.side === 'me' ? 'Me' : 'Them';
        return `${who}: ${m.orig}${m.trans ? ' (' + m.trans + ')' : ''}`;
      }).join('\n');
      try {
        const res = await window.CT_API.complete(
          `Here is a bilingual conversation transcript. In ${nativeLang.native}, produce:\n` +
          `1) a short title (max 6 words) — guess the other person's name if mentioned, else the topic\n` +
          `2) a 2-3 sentence summary of what was discussed.\n` +
          `Return strict JSON on one line: {"title":"...","summary":"..."}\n\nTranscript:\n${transcript}`
        );
        if (cancelled) return;
        const raw = String(res).trim().replace(/^```json\s*/i,'').replace(/```\s*$/,'');
        let parsed = null;
        try { parsed = JSON.parse(raw); } catch (e) {}
        if (parsed) {
          setTitle(parsed.title || '');
          setSummary(parsed.summary || '');
        } else {
          setSummary(raw);
        }
      } catch (e) {
        if (!cancelled) { setTitle(''); setSummary(''); }
      } finally {
        if (!cancelled) setLoadingSummary(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function doSave() {
    const entry = {
      id: 'saved-' + Date.now(),
      title: (title || '제목 없는 대화').trim(),
      summary: summary.trim(),
      partner: (title || '대화').trim(),
      topic: summary.trim().slice(0, 60) || '저장된 대화',
      date: todayLabel(),
      label: '저장됨',
      messages: convo.map(m => ({ side: m.side, orig: m.orig, trans: m.trans, time: m.time })),
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
              이 대화를 저장할까요?
            </div>
            <div style={{ fontSize: 11, color: c.ink3 }}>제목과 요약을 편집할 수 있어요 · 나중에 검색으로 찾기</div>
          </div>
        </div>

        {/* Title */}
        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', color: c.ink3, fontFamily: "'Chakra Petch', system-ui, sans-serif" }}>제목</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={loadingSummary ? '제목 생성 중…' : '예: 토마스와의 미팅'}
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
            요약 {loadingSummary && <span style={{ color: c.primary }}>· AI 작성 중…</span>}
          </label>
          <textarea
            value={summary}
            onChange={e => setSummary(e.target.value)}
            rows={4}
            placeholder={loadingSummary ? '대화 내용을 요약하고 있어요…' : '대화 요약을 입력하세요'}
            style={{
              width: '100%', marginTop: 5, border: `1.5px solid ${c.divider}`, borderRadius: 12,
              padding: '10px 12px', fontSize: 13, color: c.ink, background: c.bg,
              outline: 'none', fontFamily: 'inherit', lineHeight: 1.5, resize: 'vertical',
            }}
          />
        </div>

        <div style={{ fontSize: 11, color: c.ink3, marginTop: 8, lineHeight: 1.5 }}>
          💬 {convo.length}개 메시지가 함께 저장돼요 · 영어 학습 자료로 다시 볼 수 있어요
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
          <button onClick={onDelete} style={{
            padding: '12px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: 'transparent', color: '#C0392B', fontSize: 13, fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
            대화 삭제
          </button>
          <div style={{ flex: 1 }} />
          <button onClick={onDismiss} style={{
            padding: '12px 16px', borderRadius: 999, border: `1.5px solid ${c.divider}`, cursor: 'pointer',
            background: 'transparent', color: c.ink2, fontSize: 13, fontWeight: 700,
          }}>나중에</button>
          <button onClick={doSave} style={{
            padding: '12px 22px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: c.primary, color: c.primaryInk, fontSize: 13, fontWeight: 800,
            boxShadow: `0 4px 12px ${c.primary}55`,
          }}>저장</button>
        </div>

        {/* Snooze auto-popup for today — only relevant when it auto-opened */}
        {autoOpened && (
          <div style={{ textAlign: 'center', marginTop: 10 }}>
            <button onClick={onSnooze} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: 11, color: c.ink3, fontWeight: 600, textDecoration: 'underline',
            }}>오늘 하루 자동으로 띄우지 않기</button>
          </div>
        )}
      </div>
    </div>
  );
}

window.SaveConvoSheet = SaveConvoSheet;
