import type { GraphNode, GraphEdge, NodeColor, NodeFilter, NodeType, Tweaks } from "../types";

export const TWEAK_DEFAULTS: Tweaks = {
  accentArtist: "#7C3AFF",
  accentGenre: "#E06030",
  accentEvent: "#1878F0",
  accentRelease: "#14B050",
  accentArticle: "#E02040",
  edgeCurve: 0.3,
  nodeGlow: 21,
  showGrid: true,
  layout: "standard",
};

export const NC: Record<NodeType, NodeColor> = {
  artist:  { fill: "#3A1A7A", stroke: "#7C3AFF", glow: "#7C3AFF" },
  genre:   { fill: "#6A2E0F", stroke: "#E06030", glow: "#E06030" },
  article: { fill: "#660F1A", stroke: "#E02040", glow: "#E02040" },
  event:   { fill: "#0A3470", stroke: "#1878F0", glow: "#1878F0" },
  release: { fill: "#075520", stroke: "#14B050", glow: "#14B050" },
  label:   { fill: "#3D2E08", stroke: "#C89020", glow: "#D4A020" },
};

export const TC: Record<NodeType, string> = {
  artist: "#7C3AFF",
  genre: "#E06030",
  article: "#E02040",
  event: "#1878F0",
  release: "#14B050",
  label: "#D4A020",
};

export const NODES: GraphNode[] = [
  { id: "center", type: "artist", label: "BLAWAN", sublabel: "Artist · London, UK", x: 0, y: 0, r: 54, central: true },
  { id: "a1", type: "artist", label: "Pariah", x: -170, y: -120, r: 26 },
  { id: "a2", type: "artist", label: "Recondite", x: -205, y: 25, r: 26 },
  { id: "a3", type: "artist", label: "Voski", x: -145, y: 145, r: 24 },
  { id: "a4", type: "artist", label: "M.Dettmann", x: -80, y: -215, r: 26 },
  { id: "g1", type: "genre", label: "Ind.Techno", x: 100, y: -205, r: 24 },
  { id: "g2", type: "genre", label: "Raw Techno", x: 205, y: -148, r: 22 },
  { id: "g3", type: "genre", label: "Hypnotic", x: 230, y: -40, r: 20 },
  { id: "g4", type: "genre", label: "Dark Techno", x: 185, y: 72, r: 19 },
  { id: "e1", type: "event", label: "Berghain", meta: "May 24, 2024", x: -215, y: -58, r: 26 },
  { id: "e2", type: "event", label: "Dekmantel", meta: "Aug 2, 2024", x: -188, y: 82, r: 24 },
  { id: "e3", type: "event", label: "Keep Hush", meta: "Jan 14, 2024", x: -160, y: 196, r: 22 },
  { id: "ar1", type: "article", label: "Machine Room", meta: "RA · Nov 2019", x: 185, y: 152, r: 24 },
  { id: "ar2", type: "article", label: "UK Techno", meta: "RA · Feb 2020", x: 218, y: 248, r: 22 },
  { id: "ar3", type: "article", label: "Why They Hide", meta: "RA · Apr 2017", x: 92, y: 268, r: 21 },
  { id: "r1", type: "release", label: "Careless", meta: "2018", x: -48, y: 258, r: 24 },
  { id: "r2", type: "release", label: "WWALD", meta: "2019", x: -128, y: 278, r: 22 },
  { id: "r3", type: "release", label: "Braila", meta: "2016", x: -222, y: 232, r: 21 },
  { id: "cnt1", type: "artist", count: 12, x: -248, y: -172, r: 18 },
  { id: "cnt2", type: "event", count: 8, x: -268, y: 158, r: 18 },
  { id: "cnt3", type: "release", count: 6, x: 44, y: 298, r: 18 },
  { id: "l1", type: "label", label: "Ternesc", meta: "Glasgow · Est. 2012", x: 310, y: -220, r: 26 },
  { id: "l2", type: "label", label: "Hessle Audio", meta: "London · Est. 2007", x: 370, y: -100, r: 28 },
  { id: "l3", type: "label", label: "Cold Recordings", meta: "UK · Est. 2015", x: 360, y: 50, r: 24 },
  { id: "l4", type: "label", label: "Dj Stingray", meta: "Detroit · Est. 2009", x: 320, y: 180, r: 22 },
  { id: "cnt4", type: "label", count: 4, x: 380, y: 280, r: 18 },
];

export const EDGES: GraphEdge[] = [
  { from: "center", to: "a1", label: "similar sound" },
  { from: "center", to: "a2", label: "similar sound" },
  { from: "center", to: "a3" },
  { from: "center", to: "a4", label: "co-headline" },
  { from: "center", to: "g1" },
  { from: "center", to: "g2" },
  { from: "center", to: "g3", inferred: true },
  { from: "center", to: "g4", inferred: true },
  { from: "center", to: "e1", label: "played at" },
  { from: "center", to: "e2", label: "played at" },
  { from: "center", to: "e3", label: "played at" },
  { from: "center", to: "ar1", label: "about" },
  { from: "center", to: "ar2", label: "about" },
  { from: "center", to: "ar3", label: "about", inferred: true },
  { from: "center", to: "r1", label: "released" },
  { from: "center", to: "r2", label: "released" },
  { from: "center", to: "r3", label: "released" },
  { from: "a1", to: "cnt1" },
  { from: "e2", to: "cnt2", inferred: true },
  { from: "r1", to: "cnt3", inferred: true },
  { from: "a2", to: "g2", inferred: true },
  { from: "a4", to: "g1", inferred: true },
  { from: "e1", to: "ar1", inferred: true },
  { from: "center", to: "l1", label: "released on" },
  { from: "center", to: "l2", label: "released on" },
  { from: "center", to: "l3", label: "released on" },
  { from: "center", to: "l4", label: "released on", inferred: true },
  { from: "r1", to: "l2", inferred: true },
  { from: "r2", to: "l1", inferred: true },
  { from: "r3", to: "l3", inferred: true },
  { from: "l1", to: "cnt4", inferred: true },
];

export const NODE_FILTERS: NodeFilter[] = [
  { key: "artist", label: "Artists", color: "#7C3AFF" },
  { key: "genre", label: "Genres", color: "#E06030" },
  { key: "event", label: "Events", color: "#1878F0" },
  { key: "release", label: "Releases", color: "#14B050" },
  { key: "article", label: "Articles", color: "#E02040" },
  { key: "label", label: "Labels", color: "#D4A020" },
];

export const TOP_TRACKS = [
  { title: "Why They Hide Their Bodies...", dur: "6:27" },
  { title: "Careless", dur: "5:38" },
  { title: "We Will Always Drip", dur: "6:27" },
  { title: "Braila", dur: "5:11" },
  { title: "Raw", dur: "4:34" },
];

export const TOP_CONNECTIONS = [
  { label: "Pariah", score: 0.91, type: "artist" as NodeType },
  { label: "Recondite", score: 0.89, type: "artist" as NodeType },
  { label: "M. Dettmann", score: 0.88, type: "artist" as NodeType },
  { label: "Voski", score: 0.84, type: "artist" as NodeType },
  { label: "Surgeon", score: 0.81, type: "artist" as NodeType },
];

export const ARTICLES = [
  { title: "Blawan: In The Machine Room", meta: "Resident Advisor · Feb 2020" },
  { title: "The Evolution of UK Techno", meta: "Resident Advisor · Nov 2019" },
  { title: "Premiere: Blawan – Why They Hide...", meta: "RA · Apr 2017" },
  { title: "Interview: Blawan on Hardware...", meta: "RA · Feb 2021" },
  { title: "Mix: Dekmantel 2023", meta: "Dekmantel · Aug 2023" },
];

export const UPCOMING_EVENTS = [
  { name: "Berghain", detail: "May 24, 2024 · Berlin, DE", type: "event" as NodeType },
  { name: "Dekmantel Selectors", detail: "Aug 2, 2024 · Amsterdam, NL", type: "event" as NodeType },
  { name: "Keep Hush", detail: "Jun 14, 2024 · London, UK", type: "event" as NodeType },
];

export const FEED_ITEMS: { time: string; text: string; type: NodeType }[] = [
  { time: "14:31", text: "New event added · London", type: "event" },
  { time: "14:22", text: "Article published · RA", type: "article" },
  { time: "14:18", text: "New release on Bandcamp", type: "release" },
  { time: "14:07", text: "Lineup update: Dekmantel", type: "event" },
  { time: "13:58", text: "Venue added: Basement NY", type: "event" },
];

export const CITY_PLAY = [
  { city: "London, UK", pct: 68 },
  { city: "Berlin, DE", pct: 47 },
  { city: "Amsterdam, NL", pct: 33 },
  { city: "New York, US", pct: 21 },
  { city: "Mexico City, MX", pct: 18 },
];

export const COUNTRY_PLAYS: Record<string, number> = {
  GB: 1.0, DE: 0.95, NL: 0.85, US: 0.7, MX: 0.55, FR: 0.75, BE: 0.65, PL: 0.6, CZ: 0.5,
  AT: 0.45, CH: 0.4, ES: 0.35, IT: 0.3, PT: 0.28, AU: 0.4, JP: 0.35, CA: 0.3, AR: 0.25, BR: 0.22,
  DK: 0.4, SE: 0.35, NO: 0.3, FI: 0.25, HU: 0.3, RO: 0.2, HR: 0.2, RS: 0.18, GR: 0.15,
};

export const MATRIX_ARTISTS = ["BLWN", "PAR", "REC", "MD", "VOI", "SUR"];
export const MATRIX_DATA: (number | null)[][] = [
  [null, 0.91, 0.89, 0.88, 0.84, 0.81],
  [0.91, null, 0.87, null, 0.79, 0.75],
  [0.89, 0.87, null, null, 0.83, 0.79],
  [0.88, null, null, null, 0.83, null],
  [0.84, 0.81, 0.80, 0.83, null, 0.78],
  [0.81, 0.77, 0.75, 0.74, 0.71, null],
];

export const AGE_DATA = [
  { g: "18-24", p: 14 },
  { g: "25-34", p: 38 },
  { g: "35-44", p: 31 },
  { g: "45-54", p: 15 },
  { g: "55+", p: 7 },
];

export const COUNTRY_TOP = [
  { c: "UK", p: 28 },
  { c: "Germany", p: 19 },
  { c: "Netherlands", p: 14 },
  { c: "USA", p: 10 },
  { c: "France", p: 6 },
];

export const SPARK = [4, 6, 3, 8, 5, 9, 7, 12, 8, 14, 10, 16, 12, 18, 14, 20];

export const NODE_DEPTH: Record<string, number> = {
  a1: 1, a2: 1, g1: 1, g2: 1, e1: 1, e2: 1, ar1: 1, r1: 1, r2: 1, l2: 1,
  a3: 2, a4: 2, g3: 2, g4: 2, e3: 2, ar2: 2, r3: 2, l1: 2, l3: 2,
  ar3: 3, l4: 3, cnt1: 3, cnt2: 3, cnt3: 3, cnt4: 3,
};
