// One "screen" component used by every artboard.
// Variation only changes how suggestions are displayed.

function ChatScreen({ variant, palette, dark, convo, maxSugg, showMascot = true, hideInput, hideTopBar, scale = 1, hideActions }) {
  const c = palette;
  const [mode, setMode] = React.useState('them');
  const scrollRef = window.useDragScroll();
  return (
    <div style={{
      flex: 1, minHeight: 0,
      display: 'flex', flexDirection: 'column',
      background: c.bg, overflow: 'hidden',
    }}>
      {!hideTopBar && <TopBar palette={c} dark={dark} showMascot={showMascot} />}

      <div ref={scrollRef} style={{
        flex: 1, minHeight: 0, overflowY: 'auto',
        padding: '12px 14px 6px',
      }}>
        {convo.map((m, i) => (
          m.side === 'me'
            ? <MyBubble key={m.id} msg={m} palette={c} />
            : (
              <TheirBubble key={m.id} msg={m} palette={c} dark={dark} hideActions={hideActions}>
                {/* attach suggestions only if this 'them' message has them AND it's the LAST one */}
                {m.suggestions && i === convo.length - 1 && (
                  <SuggestionDisplay
                    variant={variant}
                    palette={c}
                    suggestions={m.suggestions}
                    dark={dark}
                    max={maxSugg}
                  />
                )}
              </TheirBubble>
            )
        ))}
      </div>

      {!hideInput && <InputBar palette={c} dark={dark} mode={mode} onModeChange={setMode} />}
    </div>
  );
}

Object.assign(window, { ChatScreen });
