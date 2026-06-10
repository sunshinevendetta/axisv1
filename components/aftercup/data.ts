export type RankId = "fan" | "explorer" | "expert" | "legend";

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
  | "chain"
  | "bet"
  | "ar";

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
  poster?: string;
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
  poster?: string;
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

export type AgendaKind = "match" | "after" | "closed";

export interface AgendaItem {
  id: string;
  month: "June" | "July";
  date: string;
  day: string;
  kind: AgendaKind;
  time?: string;
  title: string;
  detail?: string;
  price?: string;
  poster?: string;
}

export interface ActivityItem {
  title: string;
  detail: string;
}

export const DATA = {
  brand: {
    name: "AXIS AFTERCUP",
    short: "AXIS · ACQ",
    tag: "Match by day. After by night. / Partido de dia. After de noche.",
    episode: "ACQ·01",
    date: "11·06-19·07·2026",
    address: "Fronton Bucareli · Bucareli 118 · Centro · CDMX",
    venue: "Fronton Bucareli, Bucareli 118",
    hashtag: "#AftercupMX",
  },

  activities: [
    {
      title: "Giant screens + live broadcasts / Pantallas gigantes + transmisiones",
      detail:
        "Match Cup is built around arriving before kickoff, watching live, and staying after the final whistle. / Match Cup esta pensado para llegar antes, ver el partido en vivo y quedarse despues del silbatazo.",
    },
    {
      title: "Shared tables + group reservations / Mesas compartidas + grupos",
      detail:
        "Tables are available for 4, 6, and 8 people through Fever, with QR codes for every guest. / Hay mesas para 4, 6 y 8 personas via Fever, con QR individual para cada invitado.",
    },
    {
      title: "Food court + culinary hotspot / Food court + hotspot culinario",
      detail:
        "Aftercup lists a curated food court and rotating culinary collaborations during the tournament. / Aftercup anuncia food court curado y colaboraciones culinarias rotativas durante el torneo.",
    },
    {
      title: "Party nights + collaborations / Noches de fiesta + colaboraciones",
      detail:
        "After Cup brings international concerts, club nights, and collective parties after the matches. / After Cup trae conciertos internacionales, club nights y fiestas de colectivos despues de los partidos.",
    },
  ] satisfies ActivityItem[],

  agenda: [
    {
      id: "jun-11-match-1",
      month: "June",
      date: "11",
      day: "Thursday",
      kind: "match",
      time: "13:00",
      title: "Mexico vs South Africa / Mexico vs Sudafrica",
    },
    {
      id: "jun-11-match-2",
      month: "June",
      date: "11",
      day: "Thursday",
      kind: "match",
      time: "20:00",
      title: "South Korea vs Czechia / Corea del Sur vs Chequia",
    },
    {
      id: "jun-12-match-1",
      month: "June",
      date: "12",
      day: "Friday",
      kind: "match",
      time: "13:00",
      title: "Canada vs Bosnia and Herzegovina / Canada vs Bosnia y Herzegovina",
    },
    {
      id: "jun-12-match-2",
      month: "June",
      date: "12",
      day: "Friday",
      kind: "match",
      time: "19:00",
      title: "United States vs Paraguay / Estados Unidos vs Paraguay",
    },
    {
      id: "jun-12-after",
      month: "June",
      date: "12",
      day: "Friday",
      kind: "after",
      title: "Dombrance",
      price: "General $1,200 MXN / VIP $1,800 MXN",
      poster: "/aftercup/posters/june-12-dombrance.jpg",
    },
    {
      id: "jun-13-match-1",
      month: "June",
      date: "13",
      day: "Saturday",
      kind: "match",
      time: "16:00",
      title: "Brazil vs Morocco / Brasil vs Marruecos",
    },
    {
      id: "jun-13-match-2",
      month: "June",
      date: "13",
      day: "Saturday",
      kind: "match",
      time: "19:00",
      title: "Haiti vs Scotland / Haiti vs Escocia",
    },
    {
      id: "jun-14-match-1",
      month: "June",
      date: "14",
      day: "Sunday",
      kind: "match",
      time: "14:00",
      title: "Netherlands vs Japan / Paises Bajos vs Japon",
    },
    {
      id: "jun-14-match-2",
      month: "June",
      date: "14",
      day: "Sunday",
      kind: "match",
      time: "17:00",
      title: "Ivory Coast vs Ecuador / Costa de Marfil vs Ecuador",
    },
    { id: "jun-15-closed", month: "June", date: "15", day: "Monday", kind: "closed", title: "No event / No hay evento" },
    { id: "jun-16-closed", month: "June", date: "16", day: "Tuesday", kind: "closed", title: "No event / No hay evento" },
    {
      id: "jun-17-match-1",
      month: "June",
      date: "17",
      day: "Wednesday",
      kind: "match",
      time: "14:00",
      title: "England vs Croatia / Inglaterra vs Croacia",
    },
    {
      id: "jun-17-match-2",
      month: "June",
      date: "17",
      day: "Wednesday",
      kind: "match",
      time: "17:00",
      title: "Ghana vs Panama / Ghana vs Panama",
    },
    {
      id: "jun-18-match-1",
      month: "June",
      date: "18",
      day: "Thursday",
      kind: "match",
      time: "16:00",
      title: "Canada vs Qatar / Canada vs Catar",
    },
    {
      id: "jun-18-match-2",
      month: "June",
      date: "18",
      day: "Thursday",
      kind: "match",
      time: "19:00",
      title: "Mexico vs South Korea / Mexico vs Corea del Sur",
    },
    {
      id: "jun-18-after",
      month: "June",
      date: "18",
      day: "Thursday",
      kind: "after",
      title: "Midnight Generation",
      price: "General $1,200 MXN / VIP $1,800 MXN",
      poster: "/aftercup/posters/june-18-midnight-generation.jpg",
    },
    {
      id: "jun-19-match-1",
      month: "June",
      date: "19",
      day: "Friday",
      kind: "match",
      time: "13:00",
      title: "United States vs Australia / Estados Unidos vs Australia",
    },
    {
      id: "jun-19-match-2",
      month: "June",
      date: "19",
      day: "Friday",
      kind: "match",
      time: "19:00",
      title: "Brazil vs Haiti / Brasil vs Haiti",
    },
    {
      id: "jun-19-after",
      month: "June",
      date: "19",
      day: "Friday",
      kind: "after",
      title: "HVOB",
      price: "General $1,750 MXN / VIP $2,300 MXN",
      poster: "/aftercup/posters/june-19-hvob.jpeg",
    },
    {
      id: "jun-20-match-1",
      month: "June",
      date: "20",
      day: "Saturday",
      kind: "match",
      time: "11:00",
      title: "Netherlands vs Sweden / Paises Bajos vs Suecia",
    },
    {
      id: "jun-20-match-2",
      month: "June",
      date: "20",
      day: "Saturday",
      kind: "match",
      time: "18:00",
      title: "Ecuador vs Curacao / Ecuador vs Curazao",
    },
    {
      id: "jun-21-match-1",
      month: "June",
      date: "21",
      day: "Sunday",
      kind: "match",
      time: "10:00",
      title: "Spain vs Saudi Arabia / Espana vs Arabia Saudi",
    },
    {
      id: "jun-21-match-2",
      month: "June",
      date: "21",
      day: "Sunday",
      kind: "match",
      time: "19:00",
      title: "New Zealand vs Egypt / Nueva Zelanda vs Egipto",
    },
    { id: "jun-22-closed", month: "June", date: "22", day: "Monday", kind: "closed", title: "No event / No hay evento" },
    { id: "jun-23-closed", month: "June", date: "23", day: "Tuesday", kind: "closed", title: "No event / No hay evento" },
    {
      id: "jun-24-match-1",
      month: "June",
      date: "24",
      day: "Wednesday",
      kind: "match",
      time: "13:00",
      title: "Switzerland vs Canada / Suiza vs Canada",
    },
    {
      id: "jun-24-match-2",
      month: "June",
      date: "24",
      day: "Wednesday",
      kind: "match",
      time: "19:00",
      title: "Mexico vs Czechia / Mexico vs Chequia",
    },
    {
      id: "jun-24-after",
      month: "June",
      date: "24",
      day: "Wednesday",
      kind: "after",
      title: "Los Guitarrazos",
      price: "General $1,100 MXN / VIP $1,800 MXN",
      poster: "/aftercup/posters/june-24-los-guitarrazos.jpg",
    },
    {
      id: "jun-25-after",
      month: "June",
      date: "25",
      day: "Thursday",
      kind: "after",
      title: "Barba Azul",
      price: "General $720 MXN",
      poster: "/aftercup/posters/june-25-barba-azul.jpeg",
    },
    {
      id: "jun-26-match-1",
      month: "June",
      date: "26",
      day: "Friday",
      kind: "match",
      time: "13:00",
      title: "Senegal vs Iraq / Senegal vs Iraq",
    },
    {
      id: "jun-26-match-2",
      month: "June",
      date: "26",
      day: "Friday",
      kind: "match",
      time: "18:00",
      title: "Uruguay vs Spain / Uruguay vs Espana",
    },
    {
      id: "jun-26-after",
      month: "June",
      date: "26",
      day: "Friday",
      kind: "after",
      title: "Kungs",
      price: "General $1,500 MXN / VIP $2,000 MXN",
      poster: "/aftercup/posters/june-26-kungs.jpg",
    },
    {
      id: "jun-27-match",
      month: "June",
      date: "27",
      day: "Saturday",
      kind: "match",
      time: "20:00",
      title: "Algeria vs Austria / Argelia vs Austria",
    },
    {
      id: "jun-28-after",
      month: "June",
      date: "28",
      day: "Sunday",
      kind: "after",
      title: "SBTRKT",
      price: "General $1,350 MXN / VIP $1,800 MXN",
      poster: "/aftercup/posters/june-28-sbtrkt.jpg",
    },
    {
      id: "jul-03-after",
      month: "July",
      date: "03",
      day: "Friday",
      kind: "after",
      title: "Todd Terje",
      price: "General $1,500 MXN / VIP $2,000 MXN",
      poster: "/aftercup/posters/july-3-todd-terje.jpg",
    },
    { id: "jul-04-closed", month: "July", date: "04", day: "Saturday", kind: "closed", title: "No event / No hay evento" },
    {
      id: "jul-05-after",
      month: "July",
      date: "05",
      day: "Sunday",
      kind: "after",
      title: "Cut Copy",
      price: "General $1,350 MXN / VIP $1,800 MXN",
      poster: "/aftercup/posters/july-5-cut-copy.jpg",
    },
    { id: "jul-06-closed", month: "July", date: "06", day: "Monday", kind: "closed", title: "No event / No hay evento" },
    { id: "jul-07-closed", month: "July", date: "07", day: "Tuesday", kind: "closed", title: "No event / No hay evento" },
    { id: "jul-08-closed", month: "July", date: "08", day: "Wednesday", kind: "closed", title: "No event / No hay evento" },
    {
      id: "jul-09-after",
      month: "July",
      date: "09",
      day: "Thursday",
      kind: "after",
      title: "Echonomist B2B Jenia Tarsol",
      price: "General $1,200 MXN / VIP $1,800 MXN",
      poster: "/aftercup/posters/july-9-echonomist-b2b-jenia-tarsol.jpeg",
    },
  ] satisfies AgendaItem[],

  medalRules: [
    {
      en: "One medal per Match Cup quest.",
      es: "Una medalla por quest de Match Cup.",
    },
    {
      en: "One medal per After Cup event quest.",
      es: "Una medalla por quest de After Cup.",
    },
    {
      en: "Poster medals are collected by tapping or scanning at the venue.",
      es: "Las medallas poster se obtienen tocando o escaneando en la sede.",
    },
  ] satisfies MedalRule[],

  ranks: [
    {
      id: "fan",
      title: "FAN",
      index: 1,
      req: 0,
      desc: "Start here. Find your first NFC cube. / Empieza aqui. Encuentra tu primer cubo NFC.",
    },
    {
      id: "explorer",
      title: "EXPLORER",
      index: 2,
      req: 5,
      desc: "You're moving. More missions unlock across the venue. / Vas avanzando. Se desbloquean mas misiones en la sede.",
    },
    {
      id: "expert",
      title: "EXPERT",
      index: 3,
      req: 20,
      desc: "Rare missions, poster medals, and hidden scans appear. / Aparecen misiones raras, medallas poster y scans ocultos.",
    },
    {
      id: "legend",
      title: "LEGEND",
      index: 4,
      req: 50,
      desc: "Full run status across the venue. / Estatus completo en toda la sede.",
    },
  ] satisfies Rank[],

  floors: [
    {
      id: "matchday",
      code: "MD",
      name: "MATCH DAY",
      sub: "Giant screens, tables, check-ins, predictions / Pantallas gigantes, mesas, check-ins, pronosticos",
      zones: ["M1", "M2", "M3"],
    },
    {
      id: "night",
      code: "NT",
      name: "NIGHT EVENT",
      sub: "After Cup stage, art scans, poster medals / Escenario After Cup, scans de arte, medallas poster",
      zones: ["N1", "N2", "N3"],
    },
    {
      id: "areas",
      code: "AR",
      name: "AREAS · FOOD",
      sub: "Restaurants, food court, bars / Restaurantes, food court, barras",
      zones: ["A1", "A2", "A3"],
    },
  ] satisfies Floor[],

  missionTypes: [
    {
      id: "nfc",
      code: "Q-01",
      name: "CHECK-IN",
      short: "TAP",
      glyph: "◈",
      blurb: "Tap the NFC cube to check in. / Toca el cubo NFC para hacer check-in.",
    },
    {
      id: "social",
      code: "Q-02",
      name: "POST",
      short: "POST",
      glyph: "◇",
      blurb: "Post your moment with #AftercupMX. / Publica tu momento con #AftercupMX.",
    },
    {
      id: "ar",
      code: "Q-03",
      name: "ART SCAN",
      short: "SCAN",
      glyph: "◔",
      blurb: "Scan venue artwork or stage marks. / Escanea arte de la sede o marcas del escenario.",
    },
    {
      id: "chain",
      code: "Q-04",
      name: "POSTER MEDAL",
      short: "MEDAL",
      glyph: "◌",
      blurb: "Scan the event QR to collect the poster medal. / Escanea el QR del evento para obtener la medalla poster.",
    },
    {
      id: "bet",
      code: "Q-05",
      name: "MATCH PREDICTION",
      short: "PICK",
      glyph: "◎",
      blurb: "Pick the match outcome before kickoff. / Elige el resultado del partido antes del inicio.",
    },
  ] satisfies MissionType[],

  missions: [
    // ---- MATCH DAY ----
    {
      id: "q-001",
      code: "ACQ·MD·01",
      floor: "matchday",
      type: "nfc",
      title: "CHECK-IN, FRONTON GATE",
      zone: "M1",
      xp: 2,
      time: "00:30",
      rarity: "common",
      status: "live",
      desc: "Tap the NFC cube at the Fronton Bucareli entry before the match. / Toca el cubo NFC en la entrada de Fronton Bucareli antes del partido.",
      payoff: "Gate Medal / Medalla de entrada",
    },
    {
      id: "q-002",
      code: "ACQ·MD·02",
      floor: "matchday",
      type: "bet",
      title: "PREDICT, MATCH RESULT",
      zone: "M2",
      xp: 5,
      time: "02:00",
      rarity: "rare",
      status: "live",
      desc: "Pick the match result before kickoff. / Elige el resultado del partido antes del inicio.",
      payoff: "Prediction Medal / Medalla pronostico",
    },
    {
      id: "q-003",
      code: "ACQ·MD·03",
      floor: "matchday",
      type: "social",
      title: "POST, GIANT SCREEN",
      zone: "M2",
      xp: 3,
      time: "02:00",
      rarity: "common",
      status: "live",
      desc: "Post the match moment with #AftercupMX and tag the venue. / Publica el momento del partido con #AftercupMX y etiqueta la sede.",
      payoff: "Match Medal / Medalla Match",
    },
    {
      id: "q-004",
      code: "ACQ·MD·04",
      floor: "matchday",
      type: "bet",
      title: "PREDICT, FIRST GOAL",
      zone: "M2",
      xp: 6,
      time: "01:00",
      rarity: "rare",
      status: "live",
      desc: "Pick the first scorer before kickoff. / Elige el primer goleador antes del inicio.",
      payoff: "First Goal Medal / Medalla primer gol",
    },
    {
      id: "q-005",
      code: "ACQ·MD·05",
      floor: "matchday",
      type: "nfc",
      title: "CHECK-IN, YOUR TABLE",
      zone: "M3",
      xp: 3,
      time: "00:30",
      rarity: "common",
      status: "live",
      desc: "Tap the NFC cube at your reserved match table. / Toca el cubo NFC en tu mesa reservada del partido.",
      payoff: "Table Medal / Medalla de mesa",
    },
    // ---- NIGHT EVENT ----
    {
      id: "q-006",
      code: "ACQ·NT·01",
      floor: "night",
      type: "nfc",
      title: "CHECK-IN, AFTER CUP",
      zone: "N1",
      xp: 3,
      time: "00:30",
      rarity: "common",
      status: "live",
      desc: "Tap the NFC cube when the venue shifts into the night event. / Toca el cubo NFC cuando la sede cambia al evento nocturno.",
      payoff: "After Medal / Medalla After",
    },
    {
      id: "q-007",
      code: "ACQ·NT·02",
      floor: "night",
      type: "ar",
      title: "SCAN, ART MARK",
      zone: "N2",
      xp: 5,
      time: "02:00",
      rarity: "rare",
      status: "live",
      desc: "Scan the marked digital art piece near the stage. / Escanea la pieza de arte digital marcada junto al escenario.",
      payoff: "Digital Art Medal / Medalla de arte digital",
    },
    {
      id: "q-008",
      code: "ACQ·NT·03",
      floor: "night",
      type: "chain",
      title: "COLLECT, NIGHT POSTER",
      zone: "N2",
      xp: 7,
      time: "01:00",
      rarity: "epic",
      status: "live",
      desc: "Scan the event QR for the artist or collective of the night. / Escanea el QR del evento del artista o colectivo de la noche.",
      payoff: "Night Poster Medal / Medalla poster nocturna",
    },
    {
      id: "q-009",
      code: "ACQ·NT·04",
      floor: "night",
      type: "social",
      title: "POST, FIRST TRACK",
      zone: "N3",
      xp: 3,
      time: "02:00",
      rarity: "rare",
      status: "live",
      desc: "Post the first track or first lights of the night set. / Publica el primer track o las primeras luces del set nocturno.",
      payoff: "Night Medal / Medalla nocturna",
    },
    // ---- AREAS · FOOD ----
    {
      id: "q-010",
      code: "ACQ·AR·01",
      floor: "areas",
      type: "nfc",
      title: "CHECK-IN, FOOD COURT",
      zone: "A1",
      xp: 3,
      time: "00:30",
      rarity: "common",
      status: "live",
      desc: "Tap the NFC cube at the food court entry. / Toca el cubo NFC en la entrada del food court.",
      payoff: "Food Court Medal / Medalla food court",
    },
    {
      id: "q-011",
      code: "ACQ·AR·02",
      floor: "areas",
      type: "nfc",
      title: "CHECK-IN, RESTAURANT",
      zone: "A2",
      xp: 4,
      time: "00:30",
      rarity: "rare",
      status: "live",
      desc: "Tap the NFC cube at a partner restaurant inside the venue. / Toca el cubo NFC en un restaurante aliado dentro de la sede.",
      payoff: "Restaurant Medal / Medalla restaurante",
    },
    {
      id: "q-012",
      code: "ACQ·AR·03",
      floor: "areas",
      type: "chain",
      title: "COLLECT, FOOD PARTNER",
      zone: "A3",
      xp: 5,
      time: "01:00",
      rarity: "rare",
      status: "live",
      desc: "Scan the QR from a food or bar partner. / Escanea el QR de un aliado de comida o barra.",
      payoff: "Food Partner Medal / Medalla de aliado",
    },
    {
      id: "q-013",
      code: "ACQ·EV·01",
      floor: "night",
      type: "chain",
      title: "EVENT MEDAL, DOMBRANCE",
      zone: "N2",
      xp: 8,
      time: "01:00",
      rarity: "epic",
      status: "live",
      desc: "Collect the Dombrance poster medal during the June 12 After Cup event. / Obten la medalla poster de Dombrance durante After Cup del 12 de junio.",
      payoff: "Dombrance Poster Medal / Medalla poster Dombrance",
      poster: "/aftercup/posters/june-12-dombrance.jpg",
    },
    {
      id: "q-014",
      code: "ACQ·EV·02",
      floor: "night",
      type: "chain",
      title: "EVENT MEDAL, MIDNIGHT GENERATION",
      zone: "N2",
      xp: 8,
      time: "01:00",
      rarity: "epic",
      status: "live",
      desc: "Collect the Midnight Generation poster medal during the June 18 After Cup event. / Obten la medalla poster de Midnight Generation durante After Cup del 18 de junio.",
      payoff: "Midnight Generation Poster Medal / Medalla poster Midnight Generation",
      poster: "/aftercup/posters/june-18-midnight-generation.jpg",
    },
    {
      id: "q-015",
      code: "ACQ·EV·03",
      floor: "night",
      type: "chain",
      title: "EVENT MEDAL, HVOB",
      zone: "N2",
      xp: 9,
      time: "01:00",
      rarity: "epic",
      status: "live",
      desc: "Collect the HVOB poster medal during the June 19 After Cup event. / Obten la medalla poster de HVOB durante After Cup del 19 de junio.",
      payoff: "HVOB Poster Medal / Medalla poster HVOB",
      poster: "/aftercup/posters/june-19-hvob.jpeg",
    },
    {
      id: "q-016",
      code: "ACQ·EV·04",
      floor: "night",
      type: "chain",
      title: "EVENT MEDAL, LOS GUITARRAZOS",
      zone: "N2",
      xp: 8,
      time: "01:00",
      rarity: "rare",
      status: "live",
      desc: "Collect the Los Guitarrazos poster medal during the June 24 After Cup event. / Obten la medalla poster de Los Guitarrazos durante After Cup del 24 de junio.",
      payoff: "Los Guitarrazos Poster Medal / Medalla poster Los Guitarrazos",
      poster: "/aftercup/posters/june-24-los-guitarrazos.jpg",
    },
    {
      id: "q-017",
      code: "ACQ·EV·05",
      floor: "night",
      type: "chain",
      title: "EVENT MEDAL, BARBA AZUL",
      zone: "N2",
      xp: 7,
      time: "01:00",
      rarity: "rare",
      status: "live",
      desc: "Collect the Barba Azul poster medal during the June 25 After Cup event. / Obten la medalla poster de Barba Azul durante After Cup del 25 de junio.",
      payoff: "Barba Azul Poster Medal / Medalla poster Barba Azul",
      poster: "/aftercup/posters/june-25-barba-azul.jpeg",
    },
    {
      id: "q-018",
      code: "ACQ·EV·06",
      floor: "night",
      type: "chain",
      title: "EVENT MEDAL, KUNGS",
      zone: "N2",
      xp: 9,
      time: "01:00",
      rarity: "epic",
      status: "live",
      desc: "Collect the Kungs poster medal during the June 26 After Cup event. / Obten la medalla poster de Kungs durante After Cup del 26 de junio.",
      payoff: "Kungs Poster Medal / Medalla poster Kungs",
      poster: "/aftercup/posters/june-26-kungs.jpg",
    },
    {
      id: "q-019",
      code: "ACQ·EV·07",
      floor: "night",
      type: "chain",
      title: "EVENT MEDAL, SBTRKT",
      zone: "N2",
      xp: 9,
      time: "01:00",
      rarity: "epic",
      status: "live",
      desc: "Collect the SBTRKT poster medal during the June 28 After Cup event. / Obten la medalla poster de SBTRKT durante After Cup del 28 de junio.",
      payoff: "SBTRKT Poster Medal / Medalla poster SBTRKT",
      poster: "/aftercup/posters/june-28-sbtrkt.jpg",
    },
    {
      id: "q-020",
      code: "ACQ·EV·08",
      floor: "night",
      type: "chain",
      title: "EVENT MEDAL, TODD TERJE",
      zone: "N2",
      xp: 9,
      time: "01:00",
      rarity: "epic",
      status: "live",
      desc: "Collect the Todd Terje poster medal during the July 3 After Cup event. / Obten la medalla poster de Todd Terje durante After Cup del 3 de julio.",
      payoff: "Todd Terje Poster Medal / Medalla poster Todd Terje",
      poster: "/aftercup/posters/july-3-todd-terje.jpg",
    },
    {
      id: "q-021",
      code: "ACQ·EV·09",
      floor: "night",
      type: "chain",
      title: "EVENT MEDAL, CUT COPY",
      zone: "N2",
      xp: 9,
      time: "01:00",
      rarity: "epic",
      status: "live",
      desc: "Collect the Cut Copy poster medal during the July 5 After Cup event. / Obten la medalla poster de Cut Copy durante After Cup del 5 de julio.",
      payoff: "Cut Copy Poster Medal / Medalla poster Cut Copy",
      poster: "/aftercup/posters/july-5-cut-copy.jpg",
    },
    {
      id: "q-022",
      code: "ACQ·EV·10",
      floor: "night",
      type: "chain",
      title: "EVENT MEDAL, ECHONOMIST B2B JENIA TARSOL",
      zone: "N2",
      xp: 10,
      time: "01:00",
      rarity: "mythic",
      status: "live",
      desc: "Collect the Echonomist B2B Jenia Tarsol poster medal during the July 9 After Cup event. / Obten la medalla poster de Echonomist B2B Jenia Tarsol durante After Cup del 9 de julio.",
      payoff: "Echonomist B2B Jenia Tarsol Poster Medal / Medalla poster Echonomist B2B Jenia Tarsol",
      poster: "/aftercup/posters/july-9-echonomist-b2b-jenia-tarsol.jpeg",
    },
  ] satisfies Mission[],

  episodes: [
    {
      id: "acq-01",
      code: "ACQ·01",
      date: "11·06-19·07·2026",
      city: "CDMX",
      venue: "Fronton Bucareli · Bucareli 118",
      state: "LIVE",
      missions: 22,
      capacity: 1500,
    },
    {
      id: "acq-00",
      code: "ACQ·00",
      date: "07·06·2026",
      city: "CDMX",
      venue: "Restaurant pilots · CDMX",
      state: "CLOSED",
      missions: 6,
      capacity: 120,
    },
    {
      id: "acq-02",
      code: "ACQ·02",
      date: "TBA",
      city: "CDMX",
      venue: "Partner restaurant network",
      state: "GUESTLIST",
      missions: 10,
      capacity: 300,
    },
  ] satisfies Episode[],

  feed: [
    { who: "MEX·NORTE", what: "CHECK-IN, FRONTON GATE", rank: "FAN" },
    { who: "MESA·08", what: "PREDICT, MATCH RESULT", rank: "EXPLORER" },
    { who: "LUMA·77", what: "SCAN, ART MARK", rank: "EXPERT" },
    { who: "CREW·SUR", what: "CHECK-IN, RESTAURANT", rank: "EXPLORER" },
    { who: "NIGHT·PAX", what: "COLLECT, NIGHT POSTER", rank: "EXPERT" },
    { who: "BASS·12", what: "POST, FIRST TRACK", rank: "FAN" },
    { who: "FOOD·04", what: "CHECK-IN, FOOD COURT", rank: "EXPLORER" },
    { who: "DANCE·MX", what: "CHECK-IN, AFTER CUP", rank: "LEGEND" },
  ] satisfies FeedItem[],

  me: {
    handle: "OPERATOR·AC",
    rank: "EXPLORER",
    xp: 8,
    nextRank: "EXPERT",
    nextReq: 20,
    chip: "NFC·AC·26·MX·01",
    joined: "11·06·2026",
    medals: [
      { id: "m1", type: "nfc", label: "GATE MEDAL / MEDALLA DE ENTRADA", ep: "ACQ·00" },
      { id: "m2", type: "bet", label: "PREDICTION MEDAL / MEDALLA PRONOSTICO", ep: "ACQ·00" },
      { id: "m3", type: "social", label: "MATCH MEDAL / MEDALLA MATCH", ep: "ACQ·00" },
      { id: "m4", type: "ar", label: "DIGITAL ART MEDAL / MEDALLA DE ARTE DIGITAL", ep: "ACQ·01" },
    ],
  } satisfies Operator,
} as const;

export type MedalVariant = "chrome" | "coin" | "foil" | "poly";
