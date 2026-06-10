// Shared mock conversation + brand tokens.
// Palette: ConvoTrans blue — navy #002854, blue #006898, cyan #05A9CF, greys.
window.CT_BRAND = {
  light: {
    bg: '#F2F5F8',           // cool light grey-blue app surface
    surface: '#FFFFFF',      // cards
    ink: '#002854',          // deep navy — primary text
    ink2: '#3A5A78',         // muted navy secondary
    ink3: '#8A9AAB',         // blue-grey meta
    divider: '#DDE4EA',      // light blue-grey
    primary: '#006898',      // mid blue — primary CTA
    primaryInk: '#FFFFFF',
    primarySoft: '#D6EAF3',  // pale blue
    // My bubble: cyan, dark navy text
    mine: '#05A9CF',
    mineInk: '#002854',
    // Their bubble: pure white
    them: '#FFFFFF',
    themInk: '#002854',
    themBorder: '#DDE4EA',
    themAvatar: '#3A5A78',
    themAvatarBg: '#E5EBF1',
    // AI uses DEEP NAVY (distinct from cyan "me" and white "them")
    ai: '#002854',
    aiInk: '#FFFFFF',
    aiSoft: '#E3EAF1',
    aiDeep: '#001B3C',
    accent2: '#05A9CF',      // bright cyan — success/secondary accent
  },
  dark: {
    bg: '#001226',           // near-black navy
    surface: '#04203F',      // deep navy card
    ink: '#EAF1F7',
    ink2: '#A8C0D4',
    ink3: '#5E7A95',
    divider: 'rgba(255,255,255,0.10)',
    primary: '#05A9CF',
    primaryInk: '#002854',
    primarySoft: '#0A2E50',
    mine: '#05A9CF',
    mineInk: '#002854',
    them: '#04203F',
    themInk: '#EAF1F7',
    themBorder: 'rgba(255,255,255,0.12)',
    themAvatar: '#A8C0D4',
    themAvatarBg: '#0A2E50',
    ai: '#0E4C7A',
    aiInk: '#FFFFFF',
    aiSoft: '#0A2E50',
    aiDeep: '#002854',
    accent2: '#05A9CF',
  },
};

// Demo conversation removed for production — the app starts with an empty
// conversation. (Variation/artboard screens that referenced CT_CONVO will
// simply render the empty state.)
window.CT_CONVO = [];

// ── Color skins ───────────────────────────────────────────────────────
// Three selectable skins. Each overrides the color-bearing tokens of
// CT_BRAND (buttons, my-card, AI-suggestion-card, accents). The neutral
// "them" card stays white. Light & dark variants keep tone (light→light,
// dark→dark). 'blue' is the default and matches the original palette.
window.CT_SKINS = {
  blue: {
    name: '블루', swatch: '#006898',
    light: {
      primary: '#006898', primaryInk: '#FFFFFF', primarySoft: '#D6EAF3',
      mine: '#05A9CF', mineInk: '#002854',
      ai: '#002854', aiInk: '#FFFFFF', aiSoft: '#E3EAF1', aiDeep: '#001B3C',
      accent2: '#05A9CF',
    },
    dark: {
      primary: '#05A9CF', primaryInk: '#002854', primarySoft: '#0A2E50',
      mine: '#05A9CF', mineInk: '#002854',
      ai: '#0E4C7A', aiInk: '#FFFFFF', aiSoft: '#0A2E50', aiDeep: '#002854',
      accent2: '#05A9CF',
    },
  },
  gold: {
    name: '골드', swatch: '#F19502',
    light: {
      primary: '#F19502', primaryInk: '#FFFFFF', primarySoft: '#FFEDCA',
      mine: '#F6B24A', mineInk: '#3A2A00',          // warm amber my-card (light tone)
      ai: '#5A4A12', aiInk: '#FFF7E6', aiSoft: '#F3E9CF', aiDeep: '#3A2E08', // olive/coffee deep (dark tone)
      accent2: '#F19502',
    },
    dark: {
      primary: '#F6B24A', primaryInk: '#3A2A00', primarySoft: '#4A3A12',
      mine: '#F6B24A', mineInk: '#3A2A00',
      ai: '#6E5A1F', aiInk: '#FFF7E6', aiSoft: '#3A2E08', aiDeep: '#250E02',
      accent2: '#F6B24A',
    },
  },
  rose: {
    name: '로즈', swatch: '#DB7F8E',
    light: {
      primary: '#DB7F8E', primaryInk: '#FFFFFF', primarySoft: '#FFDBDA',
      mine: '#E89AA6', mineInk: '#4A2730',          // soft rose my-card (light tone)
      ai: '#604D53', aiInk: '#FFF0F1', aiSoft: '#EADEE0', aiDeep: '#43353A', // taupe-grey deep (dark tone)
      accent2: '#DB7F8E',
    },
    dark: {
      primary: '#E89AA6', primaryInk: '#4A2730', primarySoft: '#5A434A',
      mine: '#E89AA6', mineInk: '#4A2730',
      ai: '#6E565C', aiInk: '#FFF0F1', aiSoft: '#43353A', aiDeep: '#2A2024',
      accent2: '#E89AA6',
    },
  },
};

// Merge a skin's tokens onto the base brand palette for a given mode.
window.CT_applySkin = function(basePalette, skinId, mode) {
  const skin = window.CT_SKINS[skinId] || window.CT_SKINS.blue;
  const over = skin[mode] || skin.light;
  return Object.assign({}, basePalette, over);
};
