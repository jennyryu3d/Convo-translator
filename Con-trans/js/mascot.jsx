// Translation mascot — a friendly chibi peach character with expressions.
// Drawn as simple SVG so we control it cleanly. No external image needed.

const MASCOT_PALETTE = {
  skin: '#FFD4A8',
  skinShade: '#F4B380',
  hair: '#3D2818',
  hairLight: '#5A3A24',
  jacket: '#9B2C2C',     // soft burgundy — nod to the reference sticker
  jacketShade: '#6E1F1F',
  shirt: '#F0E6D6',
  cheek: '#FF8B8B',
  eyeWhite: '#FFFFFF',
  eyeInk: '#1F1410',
};

function Mascot({ mood = 'idle', size = 64, dark = false }) {
  // mood: idle | thinking | pointing | happy | listening
  const p = MASCOT_PALETTE;
  const wrap = { width: size, height: size, display: 'inline-block' };

  // Eye shapes vary by mood
  const eyeY = 32;
  const eye = (cx) => {
    if (mood === 'thinking') {
      return <path d={`M${cx - 4} ${eyeY} Q${cx} ${eyeY - 2} ${cx + 4} ${eyeY}`} stroke={p.eyeInk} strokeWidth="1.8" fill="none" strokeLinecap="round" />;
    }
    if (mood === 'happy') {
      return <path d={`M${cx - 4} ${eyeY + 1} Q${cx} ${eyeY - 3} ${cx + 4} ${eyeY + 1}`} stroke={p.eyeInk} strokeWidth="1.8" fill="none" strokeLinecap="round" />;
    }
    return (
      <g>
        <ellipse cx={cx} cy={eyeY} rx="3.2" ry="3.6" fill={p.eyeInk} />
        <circle cx={cx + 0.8} cy={eyeY - 1.2} r="1.2" fill="#fff" />
      </g>
    );
  };

  const mouth = () => {
    if (mood === 'thinking') return <ellipse cx="32" cy="42" rx="2.4" ry="1.6" fill={p.eyeInk} />;
    if (mood === 'pointing' || mood === 'listening') return <path d="M28 41 Q32 45 36 41" stroke={p.eyeInk} strokeWidth="1.8" fill="none" strokeLinecap="round" />;
    if (mood === 'happy') return <path d="M27 41 Q32 47 37 41" stroke={p.eyeInk} strokeWidth="2" fill={p.cheek} fillOpacity="0.3" strokeLinecap="round" strokeLinejoin="round" />;
    // idle — soft smile
    return <path d="M29 41 Q32 43.5 35 41" stroke={p.eyeInk} strokeWidth="1.6" fill="none" strokeLinecap="round" />;
  };

  return (
    <span style={wrap} aria-hidden="true">
      <svg viewBox="0 0 64 64" width={size} height={size}>
        {/* hair back */}
        <path d="M14 30 Q12 16 24 12 Q32 6 42 12 Q54 16 52 30 L50 36 Q44 32 32 32 Q20 32 14 36 Z"
          fill={p.hair} />
        {/* face */}
        <ellipse cx="32" cy="36" rx="16" ry="17" fill={p.skin} />
        {/* hair tuft on top */}
        <path d="M22 18 Q28 8 34 14 Q36 8 42 14 Q44 8 48 16 Q44 22 32 22 Q24 22 22 18 Z"
          fill={p.hair} />
        <path d="M24 16 Q28 12 32 16" stroke={p.hairLight} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* cheeks */}
        <ellipse cx="22" cy="40" rx="3" ry="2" fill={p.cheek} opacity="0.55" />
        <ellipse cx="42" cy="40" rx="3" ry="2" fill={p.cheek} opacity="0.55" />
        {/* eyes */}
        {eye(26)}
        {eye(38)}
        {/* mouth */}
        {mouth()}
        {/* jacket collar peeking */}
        <path d="M16 56 Q22 50 32 50 Q42 50 48 56 L48 64 L16 64 Z" fill={p.jacket} />
        <path d="M28 50 L32 56 L36 50" stroke={p.shirt} strokeWidth="3" fill="none" strokeLinejoin="round" />
        <path d="M16 56 Q20 53 24 54 L22 64 L16 64 Z" fill={p.jacketShade} />
        <path d="M48 56 Q44 53 40 54 L42 64 L48 64 Z" fill={p.jacketShade} />

        {/* speech bubble accent for pointing */}
        {mood === 'pointing' && (
          <g>
            <circle cx="54" cy="14" r="9" fill={dark ? '#FFB94A' : '#FFD58A'} />
            <text x="54" y="18" textAnchor="middle" fontSize="11" fontWeight="700" fill="#7A4A00">!</text>
          </g>
        )}
        {mood === 'thinking' && (
          <g>
            <circle cx="54" cy="14" r="3" fill={dark ? '#FFB94A' : '#FFD58A'} />
            <circle cx="50" cy="22" r="2" fill={dark ? '#FFB94A' : '#FFD58A'} opacity="0.7" />
          </g>
        )}
        {mood === 'happy' && (
          <g>
            <path d="M52 12 L54 8 L56 12 L60 14 L56 16 L54 20 L52 16 L48 14 Z"
              fill="#FFB94A" />
          </g>
        )}
      </svg>
    </span>
  );
}

// Tiny inline mascot (16-20px) for chip badges
function MascotMini({ size = 18 }) {
  const p = MASCOT_PALETTE;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M14 30 Q12 16 24 12 Q32 6 42 12 Q54 16 52 30 L50 36 Q44 32 32 32 Q20 32 14 36 Z" fill={p.hair} />
      <ellipse cx="32" cy="36" rx="16" ry="17" fill={p.skin} />
      <path d="M22 18 Q28 8 34 14 Q36 8 42 14 Q44 8 48 16 Q44 22 32 22 Q24 22 22 18 Z" fill={p.hair} />
      <ellipse cx="22" cy="40" rx="3" ry="2" fill={p.cheek} opacity="0.55" />
      <ellipse cx="42" cy="40" rx="3" ry="2" fill={p.cheek} opacity="0.55" />
      <ellipse cx="26" cy="32" rx="2.6" ry="3" fill={p.eyeInk} />
      <ellipse cx="38" cy="32" rx="2.6" ry="3" fill={p.eyeInk} />
      <path d="M28 41 Q32 45 36 41" stroke={p.eyeInk} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M16 56 Q22 50 32 50 Q42 50 48 56 L48 64 L16 64 Z" fill={p.jacket} />
    </svg>
  );
}

Object.assign(window, { Mascot, MascotMini });
