// History data — past conversations grouped by date.
// In production this is EMPTY: the only conversations shown are the ones the
// user actually saves (via CT_SAVED, stored in localStorage). The Search
// overlay reads CT_SAVED first, then this list — so leaving this empty means
// search/recents show ONLY the user's real saved conversations.
//
// (If you ever want seeded demo data again, push session objects of shape:
//   { id, date, label, partner, partnerOrg, topic, messages:[{side,orig,trans,time}] }
//  into CT_HISTORY below.)

window.CT_HISTORY = [];

// Flatten for searching: include session metadata so we can group results.
// Searches BOTH the user's saved conversations and (optional) CT_HISTORY seed.
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
