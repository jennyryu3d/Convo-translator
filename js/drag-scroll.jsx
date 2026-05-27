// Drag-to-scroll helper.
// • On TOUCH: enables native momentum scrolling (-webkit-overflow-scrolling) and hides scrollbars.
// • On MOUSE: drag the surface to pan vertically (like mobile). Click-through still works.
// Apply to any container with overflow-y: auto.
//
// Usage:  const ref = useDragScroll(); <div ref={ref} className="ct-scroll">…</div>
// or with the class alone for touch-only momentum (no mouse drag).

(function () {
  // Inject CSS once.
  if (!document.getElementById('ct-scroll-style')) {
    const s = document.createElement('style');
    s.id = 'ct-scroll-style';
    s.textContent = `
      .ct-scroll {
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
        scrollbar-width: none;
        touch-action: pan-y;
      }
      .ct-scroll::-webkit-scrollbar { display: none; width: 0; height: 0; }
      .ct-scroll.dragging { cursor: grabbing !important; user-select: none; }
      .ct-scroll.dragging * { pointer-events: none; }
    `;
    document.head.appendChild(s);
  }
})();

function useDragScroll() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Always tag with our scroll class (gets momentum + hidden scrollbar).
    el.classList.add('ct-scroll');

    // Mouse-drag panning so the desktop preview feels like a phone.
    let down = false, startY = 0, startTop = 0, moved = false;
    const TH = 4; // pixels of movement before suppressing clicks

    function onDown(e) {
      if (e.button !== 0) return;
      // Don't hijack drags that start on form controls / textareas.
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      down = true; moved = false;
      startY = e.clientY;
      startTop = el.scrollTop;
    }
    function onMove(e) {
      if (!down) return;
      const dy = e.clientY - startY;
      if (!moved && Math.abs(dy) > TH) {
        moved = true;
        el.classList.add('dragging');
      }
      if (moved) {
        el.scrollTop = startTop - dy;
        e.preventDefault();
      }
    }
    function onUp(e) {
      if (!down) return;
      down = false;
      if (moved) {
        el.classList.remove('dragging');
        // Swallow the trailing click so we don't accidentally tap a button.
        const swallow = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
        window.addEventListener('click', swallow, { capture: true, once: true });
        setTimeout(() => window.removeEventListener('click', swallow, true), 0);
      }
    }
    el.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      el.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);
  return ref;
}

window.useDragScroll = useDragScroll;
