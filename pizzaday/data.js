// AXIS PIZZA DAY QUEST — sample data
window.DATA = {
  brand: {
    name: 'AXIS PIZZA DAY QUEST',
    short: 'AXIS · PDQ',
    tag: 'A ONE-DAY PIZZA RALLY',
    episode: 'PDQ·01',
    date: '21·06·2026',
    address: 'CHIHUAHUA 10 · ROMA NORTE · CDMX',
    venue: 'Chihuahua 10, Roma Norte',
    hashtag: '#PIZZADAYQUEST',
  },

  ranks: [
    { id: 'initiate',  title: 'INITIATE',  index: 1, req: 0,    desc: 'You smell the dough. Tap your first chip.' },
    { id: 'slice',     title: 'SLICE',     index: 2, req: 5,    desc: 'Cleared the threshold. Live quests unlocked.' },
    { id: 'pie',       title: 'PIE',       index: 3, req: 14,   desc: 'You see the whole pizza. Hidden quests surface.' },
    { id: 'capo',      title: 'CAPO',      index: 4, req: 28,   desc: 'You shape the rally. Open-call gating bypassed.' },
    { id: 'monolith',  title: 'MONOLITH',  index: 5, req: 60,   desc: 'Mythic-tier. Your medal becomes a venue.' },
  ],

  // Floors of the venue (used by the map view)
  floors: [
    { id: 'ground',  code: 'GF',  name: 'GROUND',  sub: 'WOOD-FIRE FLOOR',  zones: ['G1','G2','G3'] },
    { id: 'floor2',  code: '02',  name: 'FLOOR 02', sub: 'GALLERY · BOOTHS', zones: ['F1','F2'] },
    { id: 'floor3',  code: '03',  name: 'FLOOR 03', sub: 'ROUNDS · STUDIO',  zones: ['T1','T2'] },
    { id: 'terrace', code: 'TR',  name: 'TERRACE',  sub: 'OPEN AIR · ROOFTOP', zones: ['R1','R2'] },
  ],

  missionTypes: [
    { id: 'nfc',    code: 'Q-01', name: 'NFC CHECKPOINT', short: 'TAP',     glyph: '◈', blurb: 'Tap a physical chip embedded around the building.' },
    { id: 'social', code: 'Q-02', name: 'SOCIAL BROADCAST', short: 'POST',  glyph: '◊', blurb: 'Post your slice with the day hashtag.' },
    { id: 'record', code: 'Q-03', name: 'VOICE / VIDEO LOG', short: 'REC',  glyph: '◉', blurb: 'Leave a clip at a marked recording point.' },
    { id: 'chain',  code: 'Q-04', name: 'ON-CHAIN COLLECT', short: 'MINT',  glyph: '◇', blurb: 'Claim a free on-chain collectible at the booth.' },
    { id: 'debate', code: 'Q-05', name: 'DEBATE TABLE',    short: 'TALK',   glyph: '◐', blurb: 'Join a moderated debate. Speak or hold the silence.' },
    { id: 'ar',     code: 'Q-06', name: 'AR SCAN',         short: 'SCAN',   glyph: '◑', blurb: 'Scan a solo art piece with your device.' },
    { id: 'group',  code: 'Q-07', name: 'GROUP RALLY',     short: 'PARTY',  glyph: '◒', blurb: 'Form a party of N holders to unlock the medal.' },
    { id: 'hidden', code: 'Q-08', name: 'CLASSIFIED',      short: 'HIDDEN', glyph: '✕', blurb: 'Reveal terms after PIE rank.' },
  ],

  missions: [
    // Ground floor — wood-fire kitchen / entrance
    { id: 'q-001', code: 'PDQ·G·01', floor: 'ground', type: 'nfc',    title: 'CHECKPOINT — DOOR DESK',     zone: 'G1', xp: 2, time: '00:30', rarity: 'common', status: 'live',   desc: 'The chip cast into the entry counter. Single tap.', payoff: 'Initiate Marker' },
    { id: 'q-002', code: 'PDQ·G·02', floor: 'ground', type: 'nfc',    title: 'CHECKPOINT — OVEN BAY',      zone: 'G2', xp: 3, time: '00:45', rarity: 'common', status: 'live',   desc: 'Tap beside the wood-fire oven. Watch the launch.', payoff: 'Hearth Medal' },
    { id: 'q-003', code: 'PDQ·G·03', floor: 'ground', type: 'social', title: 'BROADCAST — #PIZZADAYQUEST', zone: 'G3', xp: 2, time: '02:00', rarity: 'common', status: 'live',   desc: 'Post any slice from the floor. Public account required.', payoff: 'Signal Medal' },
    { id: 'q-004', code: 'PDQ·G·04', floor: 'ground', type: 'chain',  title: 'ON-CHAIN — FREE SLICE NFT',  zone: 'G2', xp: 5, time: '01:00', rarity: 'rare',   status: 'live',   desc: 'Free mint at the chain booth. Bring an EVM wallet.', payoff: 'Foil Slice' },

    // Floor 02 — gallery and booths
    { id: 'q-005', code: 'PDQ·F·01', floor: 'floor2', type: 'ar',     title: 'SCAN — PIECE №·02',          zone: 'F1', xp: 5, time: '02:00', rarity: 'rare',   status: 'live',   desc: 'Point your device at the marked piece for 8 seconds.', payoff: 'Spectrum Medal' },
    { id: 'q-006', code: 'PDQ·F·02', floor: 'floor2', type: 'record', title: 'VOICE LOG — BOOTH 03',       zone: 'F2', xp: 4, time: '03:00', rarity: 'rare',   status: 'live',   desc: 'Leave a 30-second voice log at the kiosk.', payoff: 'Echo Medal' },
    { id: 'q-007', code: 'PDQ·F·03', floor: 'floor2', type: 'nfc',    title: 'CHECKPOINT — GALLERY',       zone: 'F1', xp: 3, time: '00:45', rarity: 'common', status: 'live',   desc: 'Tap the chip seated in the gallery rail.', payoff: 'Initiate Marker' },

    // Floor 03 — debate rounds + recording studio
    { id: 'q-008', code: 'PDQ·R·01', floor: 'floor3', type: 'debate', title: 'TABLE — ON CRUST DOCTRINE',  zone: 'T1', xp: 6, time: '30:00', rarity: 'epic',   status: 'queued', desc: 'Six chairs. Open the topic or hold the silence.', payoff: 'Witness Medal' },
    { id: 'q-009', code: 'PDQ·R·02', floor: 'floor3', type: 'record', title: 'STUDIO — CONFESSION CLIP',   zone: 'T2', xp: 4, time: '03:00', rarity: 'rare',   status: 'live',   desc: 'Sit in the studio. Speak for up to 30 seconds.', payoff: 'Echo Medal' },
    { id: 'q-010', code: 'PDQ·R·03', floor: 'floor3', type: 'hidden', title: '████████████████',           zone: '?',  xp: 12,time: '?',     rarity: 'mythic', status: 'locked', desc: 'Requires PIE rank. Coordinates redacted.', payoff: '████████' },

    // Terrace — open-air finale
    { id: 'q-011', code: 'PDQ·T·01', floor: 'terrace', type: 'group',  title: 'PARTY — RALLY OF FOUR',     zone: 'R1', xp: 8, time: '15:00', rarity: 'epic',   status: 'live',   desc: 'Form a party of 4 holders. All tap within 60s.', payoff: 'Convergence Medal' },
    { id: 'q-012', code: 'PDQ·T·02', floor: 'terrace', type: 'nfc',    title: 'CHECKPOINT — ROOFTOP',      zone: 'R2', xp: 4, time: '00:45', rarity: 'rare',   status: 'live',   desc: 'The highest tap. Above the Roma rooftops.', payoff: 'Skyline Medal' },
    { id: 'q-013', code: 'PDQ·T·03', floor: 'terrace', type: 'social', title: 'BROADCAST — SUNSET POST',   zone: 'R1', xp: 3, time: '02:00', rarity: 'rare',   status: 'live',   desc: 'Post a sunset slice. Public account required.', payoff: 'Signal Medal' },
    { id: 'q-014', code: 'PDQ·T·04', floor: 'terrace', type: 'hidden', title: '████████████████',          zone: '?',  xp: 18,time: '?',     rarity: 'mythic', status: 'locked', desc: 'Requires CAPO rank.', payoff: '████████' },
  ],

  episodes: [
    { id: 'pdq-01', code: 'PDQ·01', date: '21·06·2026', city: 'CDMX',   venue: 'Chihuahua 10 · Roma Norte', state: 'LIVE',     missions: 14, capacity: 240 },
    { id: 'pdq-00', code: 'PDQ·00', date: '24·05·2026', city: 'CDMX',   venue: 'Pilot · Condesa',           state: 'CLOSED',   missions: 8,  capacity: 80 },
    { id: 'pdq-02', code: 'PDQ·02', date: '02·08·2026', city: 'CDMX',   venue: 'TBA · Juárez',              state: 'GUESTLIST',missions: 18, capacity: 280 },
    { id: 'pdq-03', code: 'PDQ·03', date: '14·09·2026', city: 'CDMX',   venue: 'TBA · Polanco',             state: 'GUESTLIST',missions: 20, capacity: 320 },
  ],

  feed: [
    { who: 'KARA·V',     what: 'CHECKPOINT — OVEN BAY',       rank: 'SLICE' },
    { who: 'NILE·77',    what: 'BROADCAST — #PIZZADAYQUEST',  rank: 'INITIATE' },
    { who: 'OBSIDIA',    what: 'TABLE — ON CRUST DOCTRINE',   rank: 'PIE' },
    { who: 'M·KORE',     what: 'SCAN — PIECE №·02',           rank: 'SLICE' },
    { who: 'PALE·AXEL',  what: 'PARTY — RALLY OF FOUR',       rank: 'SLICE' },
    { who: 'STR·X',      what: 'STUDIO — CONFESSION CLIP',    rank: 'INITIATE' },
    { who: 'AZURE·9',    what: 'ON-CHAIN — FREE SLICE NFT',   rank: 'SLICE' },
    { who: 'GREY·ECHO',  what: '████████████████',            rank: 'CAPO' },
    { who: 'VITRUVIA',   what: 'CHECKPOINT — ROOFTOP',        rank: 'INITIATE' },
    { who: 'NIX·NOIR',   what: 'TABLE — ON CRUST DOCTRINE',   rank: 'PIE' },
    { who: 'BIM·H',      what: 'BROADCAST — SUNSET POST',     rank: 'SLICE' },
    { who: 'SERAPH·0',   what: 'PARTY — RALLY OF FOUR',       rank: 'SLICE' },
  ],

  me: {
    handle: 'OPERATOR·X',
    rank: 'SLICE',
    xp: 8,
    nextRank: 'PIE',
    nextReq: 14,
    chip: 'NFC·#0A·F2·19·8B',
    joined: '12·03·2026',
    medals: [
      { id: 'm1', type: 'nfc',    label: 'INITIATE MARKER',   ep: 'PDQ·00' },
      { id: 'm2', type: 'nfc',    label: 'HEARTH MEDAL',      ep: 'PDQ·00' },
      { id: 'm3', type: 'social', label: 'SIGNAL MEDAL',      ep: 'PDQ·00' },
      { id: 'm4', type: 'record', label: 'ECHO MEDAL',        ep: 'PDQ·00' },
      { id: 'm5', type: 'chain',  label: 'FOIL SLICE',        ep: 'PDQ·00' },
      { id: 'm6', type: 'ar',     label: 'SPECTRUM MEDAL',    ep: 'PDQ·01' },
      { id: 'm7', type: 'nfc',    label: 'INITIATE MARKER',   ep: 'PDQ·01' },
      { id: 'm8', type: 'social', label: 'SIGNAL MEDAL',      ep: 'PDQ·01' },
    ],
  },
};
