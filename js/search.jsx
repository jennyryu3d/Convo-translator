// Search overlay — searches all past conversations by keyword across
// both original text and translations. Results group by session/date,
// highlight matched terms, and tap to jump to that message in the chat.

function SearchOverlay({ palette, dark, onClose, embedded = false, onJump, onOpenSession, initialEmpty = false, mode = 'search' }) {
  const c = palette;
  const I = window.CT_ICONS;
  // Unified "saved conversations" page: one place to browse, search, filter by
  // date, and delete. (Both the top-bar search and history buttons open this.)
  const isHistory = true;
  const [q, setQ] = React.useState('');
  const [filter, setFilter] = React.useState('all');  // all | mine | them
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');
  const [savedVersion, setSavedVersion] = React.useState(0); // bump to re-read saved list after delete
  const inputRef = React.useRef(null);
  const bodyRef = window.useDragScroll();

  React.useEffect(() => {
    // History mode opens to browse, not type — don't steal focus into the box.
    if (!embedded && !isHistory) setTimeout(() => inputRef.current?.focus(), 60);
  }, [embedded, isHistory]);

  React.useEffect(() => {
    function onChange() { setSavedVersion(v => v + 1); }
    window.addEventListener('ct-saved-changed', onChange);
    return () => window.removeEventListener('ct-saved-changed', onChange);
  }, []);

  // Keep only dates inside the chosen [from, to] window. Non-YYYY-MM-DD dates
  // are excluded when a window is active.
  const hasDateFilter = !!(dateFrom || dateTo);
  function inRange(dateStr) {
    if (!hasDateFilter) return true;
    const d = String(dateStr || '').slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
    if (dateFrom && d < dateFrom) return false;
    if (dateTo && d > dateTo) return false;
    return true;
  }

  function deleteSaved(s) {
    if (!String(s.id).startsWith('saved-')) return;
    if (window.confirm('이 대화를 삭제할까요? 되돌릴 수 없어요.')) {
      window.CT_SAVED.remove(s.id);  // dispatches ct-saved-changed → re-render
    }
  }

  // Group results by session for nicer presentation
  const grouped = React.useMemo(() => {
    const raw = window.CT_searchAll(q);
    const f = raw.filter(r =>
      (filter === 'all' || r.msg.side === (filter === 'mine' ? 'me' : 'them')) &&
      inRange(r.session.date)
    );
    const byId = new Map();
    for (const r of f) {
      if (!byId.has(r.session.id)) byId.set(r.session.id, { session: r.session, hits: [] });
      byId.get(r.session.id).hits.push(r);
    }
    return [...byId.values()];
  }, [q, filter, dateFrom, dateTo]);

  const totalHits = grouped.reduce((n, g) => n + g.hits.length, 0);

  // List shown when there's no query. History mode lists all saved (so you can
  // manage/delete them); search mode shows a short recents preview.
  const allSaved = (window.CT_SAVED && window.CT_SAVED.all()) || [];
  const recentSource = isHistory ? allSaved : [...allSaved, ...window.CT_HISTORY];
  const recentFiltered = recentSource.filter(s => inRange(s.date));
  const recent = isHistory ? recentFiltered : recentFiltered.slice(0, 6);

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

      {/* Title strip — tells you which page you're on (history vs search) */}
      <div style={{
        flexShrink: 0, padding: '12px 14px 2px',
        background: c.surface,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{
          width: 26, height: 26, borderRadius: 8, flexShrink: 0,
          background: c.primarySoft, color: c.primary,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {isHistory ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          )}
        </span>
        <div style={{ fontSize: 15, fontWeight: 800, color: c.ink, fontFamily: "'Chakra Petch', system-ui, sans-serif" }}>
          {isHistory ? '저장된 대화' : '대화 검색'}
        </div>
      </div>

      {/* Search bar */}
      <div style={{
        flexShrink: 0, padding: '8px 12px 10px',
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

      {/* Date range filter — find conversations saved within a period */}
      <div style={{
        flexShrink: 0, padding: '8px 12px',
        background: c.surface, borderBottom: `1px solid ${c.divider}`,
        display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: c.ink3, letterSpacing: 0.4 }}>기간</span>
        <input
          type="date"
          value={dateFrom}
          max={dateTo || undefined}
          onChange={e => setDateFrom(e.target.value)}
          style={{
            border: `1.5px solid ${dateFrom ? c.primary : c.divider}`, borderRadius: 10,
            padding: '5px 8px', fontSize: 12, color: c.ink, background: c.bg,
            outline: 'none', fontFamily: 'inherit',
          }}
        />
        <span style={{ color: c.ink3, fontSize: 12 }}>~</span>
        <input
          type="date"
          value={dateTo}
          min={dateFrom || undefined}
          onChange={e => setDateTo(e.target.value)}
          style={{
            border: `1.5px solid ${dateTo ? c.primary : c.divider}`, borderRadius: 10,
            padding: '5px 8px', fontSize: 12, color: c.ink, background: c.bg,
            outline: 'none', fontFamily: 'inherit',
          }}
        />
        {hasDateFilter && (
          <button onClick={() => { setDateFrom(''); setDateTo(''); }} style={{
            border: 'none', cursor: 'pointer', background: c.divider, color: c.ink2,
            borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 700,
          }}>기간 해제</button>
        )}
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
        {!q && (recent.length > 0
          ? <RecentList c={c} sessions={recent}
              heading={isHistory ? '저장된 대화' : '최근 대화'}
              showTips={!isHistory}
              onDelete={deleteSaved}
              onPickSession={s => onOpenSession ? onOpenSession(s) : setQ((s.topic || s.partner || '').split(' ')[0])} />
          : (hasDateFilter
              ? <EmptyResults c={c} q={dateFrom || dateTo ? '해당 기간' : ''} />
              : <NoSavedYet c={c} />)
        )}
        {q && grouped.length === 0 && <EmptyResults c={c} q={q} />}
        {q && grouped.map(g => (
          <ResultGroup key={g.session.id} c={c} group={g} q={q} onJump={onJump} onOpenSession={onOpenSession} />
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

function NoSavedYet({ c }) {
  return (
    <div style={{ marginTop: 36, textAlign: 'center', padding: '0 28px' }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16, margin: '0 auto 14px',
        background: c.primarySoft, color: c.primary,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: c.ink2, marginBottom: 6 }}>
        아직 저장된 대화가 없어요
      </div>
      <div style={{ fontSize: 12, color: c.ink3, lineHeight: 1.6 }}>
        대화를 나눈 뒤 <b style={{ color: c.primary }}>대화 저장</b>을 누르면<br/>
        여기에서 한글·영어로 검색해 다시 찾을 수 있어요
      </div>
    </div>
  );
}

function RecentList({ c, sessions, onPickSession, heading = '최근 대화', showTips = true, onDelete }) {
  return (
    <>
      <SectionHeader c={c} label={heading} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sessions.map(s => {
          const canDelete = onDelete && String(s.id).startsWith('saved-');
          return (
            <div key={s.id} style={{
              background: c.surface, borderRadius: 14, padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: `0 1px 3px rgba(0,0,0,0.05), 0 0 0 1px ${c.divider}`,
            }}>
              <button onClick={() => onPickSession?.(s)} style={{
                flex: 1, minWidth: 0, textAlign: 'left', cursor: 'pointer', border: 'none',
                background: 'transparent', color: 'inherit', fontFamily: 'inherit', padding: 0,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                  background: c.primarySoft, color: c.primary,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800,
                }}>{(s.partner || '?').charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: c.ink, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.partner}
                    </div>
                    <div style={{ fontSize: 10, color: c.ink3, flexShrink: 0 }}>{s.date || s.label}</div>
                  </div>
                  <div style={{ fontSize: 11, color: c.ink2, marginTop: 2, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.topic}
                  </div>
                </div>
              </button>
              {canDelete && (
                <button onClick={() => onDelete(s)} title="삭제" style={{
                  width: 32, height: 32, borderRadius: 999, flexShrink: 0, border: 'none',
                  background: 'transparent', color: '#C0392B', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
              )}
            </div>
          );
        })}
      </div>
      {showTips && (
        <>
          <SectionHeader c={c} label="검색 팁" mt={20} />
          <div style={{
            background: c.surface, borderRadius: 12, padding: '12px 14px',
            border: `1px dashed ${c.divider}`,
            fontSize: 12, color: c.ink2, lineHeight: 1.7,
          }}>
            한글 또는 영어로 자유롭게 검색하세요.<br />
            제목·요약·대화 내용 모두 검색돼요.
          </div>
        </>
      )}
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
function ResultGroup({ c, group, q, onJump, onOpenSession }) {
  const s = group.session;
  return (
    <div style={{ marginBottom: 14 }}>
      <button onClick={() => onOpenSession && onOpenSession(s)} style={{
        width: '100%', textAlign: 'left', border: 'none', cursor: onOpenSession ? 'pointer' : 'default',
        background: 'transparent',
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
      </button>
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
