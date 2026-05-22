export type RankId = "initiate" | "slice" | "pie" | "capo" | "monolith";

export interface Rank {
  id: RankId;
  title: string;
  index: number;
  req: number;
  desc: string;
}

export interface Floor {
  id: string;
  code: string;
  name: string;
  sub: string;
  zones: string[];
}

export type MissionTypeId =
  | "nfc"
  | "social"
  | "record"
  | "chain"
  | "debate"
  | "ar"
  | "group"
  | "hidden";

export interface MissionType {
  id: MissionTypeId;
  code: string;
  name: string;
  short: string;
  glyph: string;
  blurb: string;
}

export interface MedalRule {
  en: string;
  es: string;
}

export type MissionStatus = "live" | "queued" | "locked";
export type MissionRarity = "common" | "rare" | "epic" | "mythic";

export interface Mission {
  id: string;
  code: string;
  floor: string;
  type: MissionTypeId;
  title: string;
  zone: string;
  xp: number;
  time: string;
  rarity: MissionRarity;
  status: MissionStatus;
  desc: string;
  payoff: string;
}

export interface Episode {
  id: string;
  code: string;
  date: string;
  city: string;
  venue: string;
  state: string;
  missions: number;
  capacity: number;
}

export interface FeedItem {
  who: string;
  what: string;
  rank: string;
  xp?: number;
}

export interface Medal {
  id: string;
  type: MissionTypeId;
  label: string;
  ep: string;
}

export interface Operator {
  handle: string;
  rank: string;
  xp: number;
  nextRank: string;
  nextReq: number;
  chip: string;
  joined: string;
  medals: Medal[];
}

export const DATA = {
  brand: {
    name: "AXIS PIZZA DAY",
    short: "AXIS · PDQ",
    tag: "One day. One venue. One chip. / Un día. Un lugar. Un chip.",
    episode: "PDQ·01",
    date: "21·06·2026",
    address: "Supremo · Dr. Carmona y Valle 147 · Doctores · CDMX",
    venue: "Supremo, Dr. Carmona y Valle 147",
    hashtag: "#PizzaDay",
  },

  medalRules: [
    {
      en: "One medal per sponsor.",
      es: "Una medalla por patrocinador.",
    },
    {
      en: "One medal per artist.",
      es: "Una medalla por artista.",
    },
    {
      en: "Special activity medals can be defined later.",
      es: "Las medallas especiales de actividad se definen después.",
    },
  ] satisfies MedalRule[],

  ranks: [
    {
      id: "initiate",
      title: "INITIATE",
      index: 1,
      req: 0,
      desc: "Start here. Tap your first chip. / Empieza aquí. Acerca tu primer chip.",
    },
    {
      id: "slice",
      title: "SLICE",
      index: 2,
      req: 5,
      desc: "You unlocked the first set of tasks. / Ya desbloqueaste el primer grupo de tareas.",
    },
    {
      id: "pie",
      title: "PIE",
      index: 3,
      req: 14,
      desc: "Hidden tasks open at this rank. / Las tareas ocultas se abren en este nivel.",
    },
    {
      id: "capo",
      title: "CAPO",
      index: 4,
      req: 28,
      desc: "You can access higher tier tasks. / Puedes entrar a tareas de nivel más alto.",
    },
    {
      id: "monolith",
      title: "MONOLITH",
      index: 5,
      req: 60,
      desc: "Top rank. You have full access. / Rango máximo. Tienes acceso total.",
    },
  ] satisfies Rank[],

  floors: [
    {
      id: "entrance",
      code: "EN",
      name: "ENTRANCE",
      sub: "Mirrors and door desk / Espejos y mostrador",
      zones: ["E1", "E2"],
    },
    {
      id: "lobby",
      code: "LB",
      name: "LOBBY",
      sub: "Welcome and booths / Bienvenida y stands",
      zones: ["L1", "L2"],
    },
    {
      id: "main",
      code: "MH",
      name: "MAIN HALL",
      sub: "Back hall, stage and bar / Salón principal, escenario y barra",
      zones: ["M1", "M2", "M3"],
    },
  ] satisfies Floor[],

  missionTypes: [
    {
      id: "nfc",
      code: "Q-01",
      name: "NFC CHECKPOINT",
      short: "TAP",
      glyph: "◈",
      blurb: "Tap the chip at a marked station. / Acerca el chip a una estación marcada.",
    },
    {
      id: "social",
      code: "Q-02",
      name: "SOCIAL POST",
      short: "POST",
      glyph: "◇",
      blurb: "Post your slice with the event tag. / Publica tu slice con el tag del evento.",
    },
    {
      id: "record",
      code: "Q-03",
      name: "VOICE LOG",
      short: "REC",
      glyph: "◉",
      blurb: "Record a short clip at the booth. / Graba un clip corto en el stand.",
    },
    {
      id: "chain",
      code: "Q-04",
      name: "FREE MINT",
      short: "MINT",
      glyph: "◌",
      blurb: "Claim the free on-chain item. / Reclama el objeto gratis en cadena.",
    },
    {
      id: "debate",
      code: "Q-05",
      name: "DEBATE TABLE",
      short: "TALK",
      glyph: "◐",
      blurb: "Join the table and speak when called. / Toma asiento y habla cuando te llamen.",
    },
    {
      id: "ar",
      code: "Q-06",
      name: "AR SCAN",
      short: "SCAN",
      glyph: "◔",
      blurb: "Scan the marked piece with your device. / Escanea la pieza marcada con tu dispositivo.",
    },
    {
      id: "group",
      code: "Q-07",
      name: "GROUP QUEST",
      short: "PARTY",
      glyph: "✦",
      blurb: "Bring 4 holders to the same station. / Lleva 4 holders a la misma estación.",
    },
    {
      id: "hidden",
      code: "Q-08",
      name: "HIDDEN TASK",
      short: "HIDDEN",
      glyph: "✕",
      blurb: "Unlock after PIE rank. / Se desbloquea después de PIE.",
    },
  ] satisfies MissionType[],

  missions: [
    {
      id: "q-001",
      code: "PDQ·E·01",
      floor: "entrance",
      type: "nfc",
      title: "CHECKPOINT, MIRROR ENTRY",
      zone: "E1",
      xp: 2,
      time: "00:30",
      rarity: "common",
      status: "live",
      desc: "Tap your chip at the entry desk by the mirrors. / Acerca tu chip al mostrador de entrada junto a los espejos.",
      payoff: "Entry Medal / Medalla de entrada",
    },
    {
      id: "q-002",
      code: "PDQ·L·01",
      floor: "lobby",
      type: "nfc",
      title: "CHECKPOINT, OVEN BAY",
      zone: "L1",
      xp: 3,
      time: "00:45",
      rarity: "common",
      status: "live",
      desc: "Tap near the wood-fired oven. / Acerca el chip junto al horno.",
      payoff: "Sponsor Medal / Medalla de patrocinador",
    },
    {
      id: "q-003",
      code: "PDQ·L·02",
      floor: "lobby",
      type: "social",
      title: "POST, #PizzaDay",
      zone: "L2",
      xp: 2,
      time: "02:00",
      rarity: "common",
      status: "live",
      desc: "Post a photo of your slice. Use a public account. / Publica una foto de tu slice. Usa una cuenta pública.",
      payoff: "Artist Medal / Medalla de artista",
    },
    {
      id: "q-004",
      code: "PDQ·L·03",
      floor: "lobby",
      type: "chain",
      title: "FREE MINT, SLICE DROP",
      zone: "L1",
      xp: 5,
      time: "01:00",
      rarity: "rare",
      status: "live",
      desc: "Mint the free item at the booth. Bring an EVM wallet. / Reclama el objeto gratis en el stand. Trae una wallet EVM.",
      payoff: "Activity Medal / Medalla de actividad",
    },
    {
      id: "q-005",
      code: "PDQ·M·01",
      floor: "main",
      type: "ar",
      title: "SCAN, PIECE 02",
      zone: "M1",
      xp: 5,
      time: "02:00",
      rarity: "rare",
      status: "live",
      desc: "Hold your device on the marked piece for 8 seconds. / Mantén tu dispositivo sobre la pieza marcada por 8 segundos.",
      payoff: "Artist Medal / Medalla de artista",
    },
    {
      id: "q-006",
      code: "PDQ·M·02",
      floor: "main",
      type: "record",
      title: "VOICE LOG, BOOTH 03",
      zone: "M2",
      xp: 4,
      time: "03:00",
      rarity: "rare",
      status: "live",
      desc: "Record a 30-second clip at the kiosk. / Graba un clip de 30 segundos en el kiosco.",
      payoff: "Sponsor Medal / Medalla de patrocinador",
    },
    {
      id: "q-007",
      code: "PDQ·L·04",
      floor: "lobby",
      type: "nfc",
      title: "CHECKPOINT, LOBBY WALL",
      zone: "L2",
      xp: 3,
      time: "00:45",
      rarity: "common",
      status: "live",
      desc: "Tap the chip at the gallery rail. / Acerca el chip a la baranda de la galería.",
      payoff: "Entry Medal / Medalla de entrada",
    },
    {
      id: "q-008",
      code: "PDQ·M·03",
      floor: "main",
      type: "debate",
      title: "TABLE, CRUST TALK",
      zone: "M3",
      xp: 6,
      time: "30:00",
      rarity: "epic",
      status: "queued",
      desc: "Take a seat. Join the discussion. / Toma asiento. Únete a la conversación.",
      payoff: "Activity Medal / Medalla de actividad",
    },
    {
      id: "q-009",
      code: "PDQ·M·04",
      floor: "main",
      type: "record",
      title: "STUDIO, SHORT CLIP",
      zone: "M2",
      xp: 4,
      time: "03:00",
      rarity: "rare",
      status: "live",
      desc: "Sit in the studio and speak for 30 seconds. / Siéntate en el estudio y habla durante 30 segundos.",
      payoff: "Artist Medal / Medalla de artista",
    },
    {
      id: "q-010",
      code: "PDQ·M·05",
      floor: "main",
      type: "hidden",
      title: "LOCKED TASK",
      zone: "?",
      xp: 12,
      time: "?",
      rarity: "mythic",
      status: "locked",
      desc: "PIE rank required. / Se requiere rango PIE.",
      payoff: "Locked Medal / Medalla bloqueada",
    },
    {
      id: "q-011",
      code: "PDQ·M·06",
      floor: "main",
      type: "group",
      title: "GROUP TASK, FOUR PEOPLE",
      zone: "M1",
      xp: 8,
      time: "15:00",
      rarity: "epic",
      status: "live",
      desc: "Bring 4 holders. Tap within 60 seconds. / Reúne 4 holders. Toca dentro de 60 segundos.",
      payoff: "Activity Medal / Medalla de actividad",
    },
    {
      id: "q-012",
      code: "PDQ·M·07",
      floor: "main",
      type: "nfc",
      title: "CHECKPOINT, BACK BAR",
      zone: "M3",
      xp: 4,
      time: "00:45",
      rarity: "rare",
      status: "live",
      desc: "Tap at the back bar station. / Acerca el chip a la estación de la barra del fondo.",
      payoff: "Sponsor Medal / Medalla de patrocinador",
    },
    {
      id: "q-013",
      code: "PDQ·M·08",
      floor: "main",
      type: "social",
      title: "POST, STAGE",
      zone: "M1",
      xp: 3,
      time: "02:00",
      rarity: "rare",
      status: "live",
      desc: "Post a photo from the main hall during a set. / Publica una foto del salón principal durante un set.",
      payoff: "Artist Medal / Medalla de artista",
    },
    {
      id: "q-014",
      code: "PDQ·M·09",
      floor: "main",
      type: "hidden",
      title: "LOCKED TASK",
      zone: "?",
      xp: 18,
      time: "?",
      rarity: "mythic",
      status: "locked",
      desc: "CAPO rank required. / Se requiere rango CAPO.",
      payoff: "Locked Medal / Medalla bloqueada",
    },
  ] satisfies Mission[],

  episodes: [
    {
      id: "pdq-01",
      code: "PDQ·01",
      date: "21·06·2026",
      city: "CDMX",
      venue: "Supremo · Dr. Carmona y Valle 147",
      state: "LIVE",
      missions: 14,
      capacity: 240,
    },
    {
      id: "pdq-00",
      code: "PDQ·00",
      date: "24·05·2026",
      city: "CDMX",
      venue: "Pilot · Condesa",
      state: "CLOSED",
      missions: 8,
      capacity: 80,
    },
    {
      id: "pdq-02",
      code: "PDQ·02",
      date: "02·08·2026",
      city: "CDMX",
      venue: "TBA · Juárez",
      state: "GUESTLIST",
      missions: 18,
      capacity: 280,
    },
    {
      id: "pdq-03",
      code: "PDQ·03",
      date: "14·09·2026",
      city: "CDMX",
      venue: "TBA · Polanco",
      state: "GUESTLIST",
      missions: 20,
      capacity: 320,
    },
  ] satisfies Episode[],

  feed: [
    { who: "KARA·V", what: "CHECKPOINT, OVEN BAY", rank: "SLICE" },
    { who: "NILE·77", what: "POST, #PizzaDay", rank: "INITIATE" },
    { who: "OBSIDIA", what: "TABLE, CRUST TALK", rank: "PIE" },
    { who: "M·KORE", what: "SCAN, PIECE 02", rank: "SLICE" },
    { who: "PALE·AXEL", what: "GROUP TASK, FOUR PEOPLE", rank: "SLICE" },
    { who: "STR·X", what: "STUDIO, SHORT CLIP", rank: "INITIATE" },
    { who: "AZURE·9", what: "FREE MINT, SLICE DROP", rank: "SLICE" },
    { who: "GREY·ECHO", what: "LOCKED TASK", rank: "CAPO" },
    { who: "VITRUVIA", what: "CHECKPOINT, ROOFTOP", rank: "INITIATE" },
    { who: "NIX·NOIR", what: "TABLE, CRUST TALK", rank: "PIE" },
    { who: "BIM·H", what: "POST, SUNSET", rank: "SLICE" },
    { who: "SERAPH·0", what: "GROUP TASK, FOUR PEOPLE", rank: "SLICE" },
  ] satisfies FeedItem[],

  me: {
    handle: "OPERATOR·X",
    rank: "SLICE",
    xp: 8,
    nextRank: "PIE",
    nextReq: 14,
    chip: "NFC·#0A·F2·19·8B",
    joined: "12·03·2026",
    medals: [
      { id: "m1", type: "nfc", label: "ENTRY MEDAL / MEDALLA DE ENTRADA", ep: "PDQ·00" },
      {
        id: "m2",
        type: "nfc",
        label: "SPONSOR MEDAL / MEDALLA DE PATROCINADOR",
        ep: "PDQ·00",
      },
      { id: "m3", type: "social", label: "ARTIST MEDAL / MEDALLA DE ARTISTA", ep: "PDQ·00" },
      { id: "m4", type: "record", label: "ARTIST MEDAL / MEDALLA DE ARTISTA", ep: "PDQ·00" },
      { id: "m5", type: "chain", label: "ACTIVITY MEDAL / MEDALLA DE ACTIVIDAD", ep: "PDQ·00" },
      { id: "m6", type: "ar", label: "ARTIST MEDAL / MEDALLA DE ARTISTA", ep: "PDQ·01" },
      { id: "m7", type: "nfc", label: "ENTRY MEDAL / MEDALLA DE ENTRADA", ep: "PDQ·01" },
      { id: "m8", type: "social", label: "ARTIST MEDAL / MEDALLA DE ARTISTA", ep: "PDQ·01" },
    ],
  } satisfies Operator,
} as const;

export type MedalVariant = "chrome" | "coin" | "foil" | "poly";

