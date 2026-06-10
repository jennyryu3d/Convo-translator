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
