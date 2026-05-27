// Search overlay — searches all past conversations by keyword across
// both original text and translations. Results group by session/date,
// highlight matched terms, and tap to jump to that message in the chat.

function SearchOverlay({ palette, dark, onClose, embedded = false, onJump, initialEmpty = false }) {
  const c = palette;
  const I = window.CT_ICONS;
  const [q, setQ] = React.useState(embedded && !initialEmpty ? '디자인' : '');
  const [filter, setFilter] = React.useState('all');  // all | mine | them
  const inputRef = React.useRef(null);
  const bodyRef = window.useDragScroll();

  React.useEffect(() => {
    if (!embedded) setTimeout(() => inputRef.current?.focus(), 60);
  }, [embedded]);

  // Group results by session for nicer presentation
  const grouped = React.useMemo(() => {
    const raw = window.CT_searchAll(q);
    const f = raw.filter(r => filter === 'all' || r.msg.side === (filter === 'mine' ? 'me' : 'them'));
    const byId = new Map();
    for (const r of f) {
      if (!byId.has(r.session.id)) byId.set(r.session.id, { session: r.session, hits: [] });
      byId.get(r.session.id).hits.push(r);
    }
    return [...byId.values()];
  }, [q, filter]);

  const totalHits = grouped.reduce((n, g) => n + g.hits.length, 0);
  const recent = window.CT_HISTORY.slice(0, 5);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 90,
      background: c.bg, color: c.ink,
      display: 'flex', flexDirection: 'column',
      animation: embedded ? 'none' : 'searchIn .2s ease-out',
    }}>
      <style>{`
        @keyframes searchIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        mark.ct-mark { background: ${c.primary}33; color: ${c.primary}; padding: 1px 3px; border-radius: 3px; font-weight: 700; }
      `}</style>

      {/* Search bar */}
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
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 8,
          background: c.bg, border: `1.5px solid ${q ? c.primary : c.divider}`,
          borderRadius: 999, padding: '7px 12px',
          transition: 'border-color .15s',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.ink3} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
          </svg>
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="대화 기록에서 한글·영어 검색…"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 14, color: c.ink, fontFamily: 'inherit',
            }}
          />
          {q && (
            <button onClick={() => setQ('')} style={{
              width: 18, height: 18, borderRadius: 999, border: 'none',
              background: c.ink3 + '44', color: c.ink2, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, lineHeight: 1, flexShrink: 0,
            }}>✕</button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      {q && (
        <div style={{
          flexShrink: 0, padding: '8px 12px 10px',
          background: c.surface,
          borderBottom: `1px solid ${c.divider}`,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <FilterPill c={c} on={filter === 'all'}  onClick={() => setFilter('all')}  label="전체"  count={totalHits} />
          <FilterPill c={c} on={filter === 'mine'} onClick={() => setFilter('mine')} label="내 말" />
          <FilterPill c={c} on={filter === 'them'} onClick={() => setFilter('them')} label="상대 말" />
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: c.ink3 }}>
            한글·영어 모두 검색
          </span>
        </div>
      )}

      {/* Body */}
      <div ref={bodyRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '12px 12px 20px' }}>
        {!q && <RecentList c={c} sessions={recent} onPickSession={s => setQ(s.topic.split(' ')[0])} />}
        {q && grouped.length === 0 && <EmptyResults c={c} q={q} />}
        {q && grouped.map(g => (
          <ResultGroup key={g.session.id} c={c} group={g} q={q} onJump={onJump} />
        ))}
      </div>
    </div>
  );
}

function FilterPill({ c, on, onClick, label, count }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      border: 'none', cursor: 'pointer',
      padding: '5px 11px', borderRadius: 999,
      background: on ? c.primary : c.bg,
      color: on ? c.primaryInk : c.ink2,
      fontSize: 11, fontWeight: 700,
      boxShadow: on ? 'none' : `inset 0 0 0 1px ${c.divider}`,
    }}>
      {label}
      {typeof count === 'number' && (
        <span style={{
          padding: '0 5px', borderRadius: 999,
          background: on ? 'rgba(255,255,255,0.22)' : c.divider,
          fontSize: 10, fontWeight: 800,
        }}>{count}</span>
      )}
    </button>
  );
}

function RecentList({ c, sessions, onPickSession }) {
  return (
    <>
      <SectionHeader c={c} label="최근 대화" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sessions.map(s => (
          <button key={s.id} onClick={() => onPickSession?.(s)} style={{
            textAlign: 'left', cursor: 'pointer', border: 'none',
            background: c.surface, borderRadius: 14, padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: `0 1px 3px rgba(0,0,0,0.05), 0 0 0 1px ${c.divider}`,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12, flexShrink: 0,
              background: c.primarySoft, color: c.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 800,
            }}>{s.partner.charAt(0).toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.ink, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {s.partner}
                </div>
                <div style={{ fontSize: 10, color: c.ink3, flexShrink: 0 }}>{s.label}</div>
              </div>
              <div style={{ fontSize: 11, color: c.ink2, marginTop: 2, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {s.topic}
              </div>
            </div>
          </button>
        ))}
      </div>
      <SectionHeader c={c} label="검색 팁" mt={20} />
      <div style={{
        background: c.surface, borderRadius: 12, padding: '12px 14px',
        border: `1px dashed ${c.divider}`,
        fontSize: 12, color: c.ink2, lineHeight: 1.7,
      }}>
        한글 또는 영어로 자유롭게 검색하세요.<br />
        예: <Pill c={c}>일정</Pill> <Pill c={c}>timeline</Pill> <Pill c={c}>OAuth</Pill> <Pill c={c}>벨렘</Pill>
      </div>
    </>
  );
}

function Pill({ c, children }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 999,
      background: c.primarySoft, color: c.primary, fontSize: 11, fontWeight: 700,
      margin: '0 2px',
    }}>{children}</span>
  );
}

function EmptyResults({ c, q }) {
  return (
    <div style={{
      marginTop: 32, textAlign: 'center', padding: '0 24px',
    }}>
      <div style={{ fontSize: 36, opacity: 0.4, marginBottom: 8 }}>🔍</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: c.ink2, marginBottom: 4 }}>
        "{q}"와(과) 일치하는 결과가 없어요
      </div>
      <div style={{ fontSize: 12, color: c.ink3, lineHeight: 1.5 }}>
        다른 키워드를 시도해 보거나<br/>한글·영어 중 한 쪽으로 다시 검색해 보세요
      </div>
    </div>
  );
}

function SectionHeader({ c, label, mt = 0 }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 800, letterSpacing: 0.8,
      color: c.ink3, textTransform: 'uppercase',
      marginTop: mt, marginBottom: 8, paddingLeft: 4,
    }}>{label}</div>
  );
}

// ── Highlighted text ──────────────────────────────────────────────────
function Highlight({ text, q }) {
  if (!q) return <span>{text}</span>;
  const lower = String(text).toLowerCase();
  const ql = q.toLowerCase();
  const parts = [];
  let i = 0;
  while (i < text.length) {
    const j = lower.indexOf(ql, i);
    if (j < 0) { parts.push({ t: text.slice(i), m: false }); break; }
    if (j > i) parts.push({ t: text.slice(i, j), m: false });
    parts.push({ t: text.slice(j, j + q.length), m: true });
    i = j + q.length;
  }
  return (
    <>
      {parts.map((p, k) =>
        p.m ? <mark key={k} className="ct-mark">{p.t}</mark> : <span key={k}>{p.t}</span>
      )}
    </>
  );
}

// ── Result group (one session) ────────────────────────────────────────
function ResultGroup({ c, group, q, onJump }) {
  const s = group.session;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '4px 6px 8px', borderBottom: `1px solid ${c.divider}`,
        marginBottom: 8,
      }}>
        <div style={{
          width: 26, height: 26, borderRadius: 8, flexShrink: 0,
          background: c.primarySoft, color: c.primary,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800,
        }}>{s.partner.charAt(0).toUpperCase()}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: c.ink, lineHeight: 1.3 }}>
            {s.partner} · <span style={{ color: c.ink3, fontWeight: 500 }}>{s.topic}</span>
          </div>
          <div style={{ fontSize: 10, color: c.ink3, marginTop: 1 }}>
            {s.label} · {s.date}
          </div>
        </div>
        <div style={{
          fontSize: 10, fontWeight: 800, color: c.primary,
          background: c.primarySoft, padding: '2px 8px', borderRadius: 999,
        }}>{group.hits.length}건</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {group.hits.map((h, i) => (
          <ResultRow key={i} c={c} hit={h} q={q} onJump={onJump} />
        ))}
      </div>
    </div>
  );
}

function ResultRow({ c, hit, q, onJump }) {
  const isMine = hit.msg.side === 'me';
  const accent = isMine ? c.primary : c.ink2;
  return (
    <button onClick={() => onJump?.(hit)} style={{
      textAlign: 'left', cursor: 'pointer', border: 'none',
      background: c.surface, borderRadius: 12, padding: '10px 12px',
      display: 'flex', alignItems: 'flex-start', gap: 10,
      boxShadow: `inset 0 0 0 1px ${c.divider}`,
    }}>
      <div style={{
        width: 4, alignSelf: 'stretch', borderRadius: 999, background: accent, flexShrink: 0,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4,
        }}>
          <span style={{
            fontSize: 9, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase',
            color: accent, background: isMine ? c.primarySoft : c.bg,
            padding: '2px 6px', borderRadius: 4,
          }}>{isMine ? '내 말' : '상대 말'}</span>
          <span style={{ fontSize: 10, color: c.ink3 }}>{hit.msg.time}</span>
        </div>
        <div style={{ fontSize: 13, color: c.ink, fontWeight: 500, lineHeight: 1.45, marginBottom: 3 }}>
          <Highlight text={isMine ? hit.msg.trans : hit.msg.orig} q={q} />
        </div>
        <div style={{ fontSize: 11, color: c.ink3, lineHeight: 1.4 }}>
          <Highlight text={isMine ? hit.msg.orig : hit.msg.trans} q={q} />
        </div>
      </div>
      <div style={{ color: c.ink3, opacity: 0.6, marginTop: 4, flexShrink: 0 }}>
        {window.CT_ICONS.arrow}
      </div>
    </button>
  );
}

window.SearchOverlay = SearchOverlay;
