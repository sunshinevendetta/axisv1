(function () {
  "use strict";

  window.FUTURE_RENAISSANCE = Object.freeze({
    date: "2026-10-28",
    displayDate: "October 28, 2026",
    venue: "Bar Oriente",
    venueSlug: "bar-oriente",
    city: "Mexico City",
    slug: "/futurerenaissance-bar-oriente",
    attendees: 250,
    targetAttendance: 250,
    officialClaudeCommunityParty: true,
    venueFacing: true,
    poweredBy: "AXIS",
    allocation: Object.freeze([
      Object.freeze({ id: "budget-hospitality", title: "DRINKS + HOSPITALITY", note: "Complimentary drink allocation and guest hospitality." }),
      Object.freeze({ id: "budget-production", title: "PRODUCTION", note: "Technical systems, staffing and event operation." }),
      Object.freeze({ id: "budget-audiovisual", title: "AUDIOVISUAL", note: "Visual rendering, routing, display integration and event output." }),
      Object.freeze({ id: "budget-programming", title: "PROGRAMMING", note: "Warm-up DJ, Live Coding and Closing DJ." }),
      Object.freeze({ id: "budget-claude", title: "CLAUDE ACTIVATION", note: "Claude onboarding, Claude interaction and Claude Code activities." }),
      Object.freeze({ id: "budget-digital-art", title: "DIGITAL ART", note: "Future Renaissance artworks, visual content and interactive states." }),
      Object.freeze({ id: "budget-activations", title: "TECH WEEK ACTIVATIONS", note: "Small partner experiences integrated throughout the night." }),
      Object.freeze({ id: "budget-media", title: "MEDIA", note: "Photography, video and event documentation." }),
      Object.freeze({ id: "budget-operations", title: "OPERATIONS", note: "Guest flow, technical crew and venue coordination." }),
    ]),
  });

  window.FUTURE_RENAISSANCE_PROGRAM = Object.freeze({
    order: Object.freeze(["warmup", "liveCoding", "closing"]),
    warmup: Object.freeze({
      slot: "01",
      label: "WARM-UP DJ",
      type: "DJ",
      artist: null,
      arc: "ARRIVAL",
      note: "Arrival, initial energy and room activation moving gradually into the central program.",
    }),
    liveCoding: Object.freeze({
      slot: "02",
      label: "LIVE CODING",
      type: "Live Coding",
      artist: null,
      arc: "CREATION",
      note: "Music written, sequenced and modified through code in real time, visible to the room.",
    }),
    closing: Object.freeze({
      slot: "03",
      label: "CLOSING DJ",
      type: "DJ",
      artist: null,
      arc: "CLUB",
      note: "Takes the night from the experimental portion into its final club state.",
    }),
  });

  window.FUTURE_RENAISSANCE_ARTISTS = Object.freeze({
    "alexa-carlota": Object.freeze({
      name: "Alexa Carlota",
      kind: "DIGITAL ARTIST",
      discipline: "CONSTRUCTED ATMOSPHERES",
      identity: "AXIS ARTIST INDEX",
      bio: "Digital artist exploring constructed atmospheres and narrative tension.",
      handle: "AXIS PROFILE",
      href: "/magazine/artists/alexa-carlota",
      linkLabel: "VIEW ARTIST",
    }),
    arvakerm: Object.freeze({
      name: "Arvakerm",
      kind: "DIGITAL ARTIST",
      discipline: "DIGITAL SCULPTURE",
      identity: "AXIS ARTIST INDEX",
      bio: "Digital sculptor creating mythic entities and generative dragon morphologies shaped through procedural evolution.",
      handle: "AXIS PROFILE",
      href: "/magazine/artists/arvakerm",
      linkLabel: "VIEW ARTIST",
    }),
    "fabiola-larios": Object.freeze({
      name: "Fabiola Larios",
      kind: "DIGITAL ARTIST",
      discipline: "MIXED-MEDIA DIGITAL ART",
      identity: "AXIS ARTIST INDEX",
      bio: "Mexican mixed-media digital artist integrating surrealism, hyperreal texture, and symbolic tension.",
      handle: "AXIS PROFILE",
      href: "/magazine/artists/fabiola-larios",
      linkLabel: "VIEW ARTIST",
    }),
    jazmineci: Object.freeze({
      name: "Jazmineci",
      kind: "DIGITAL ARTIST",
      discipline: "NEW MEDIA",
      identity: "AXIS ARTIST INDEX",
      bio: "New media experimentalist navigating depth, texture, and hybrid digital systems.",
      handle: "AXIS PROFILE",
      href: "/magazine/artists/jazmineci",
      linkLabel: "VIEW ARTIST",
    }),
  });

  window.SYNTHETIC_DEMO = Object.freeze({
    leaderboard: Object.freeze([
      Object.freeze({ id: "GUEST 014", role: "COLLECTOR", completed: 8, total: 8, score: 940, brandAction: true, reward: "UNLOCKED", rank: 1 }),
      Object.freeze({ id: "GUEST 027", role: "CREATOR", completed: 8, total: 8, score: 910, brandAction: true, reward: "UNLOCKED", rank: 2 }),
      Object.freeze({ id: "GUEST 041", role: "GUEST", completed: 7, total: 8, score: 845, brandAction: true, reward: "UNLOCKED", rank: 3 }),
      Object.freeze({ id: "GUEST 058", role: "ARTIST", completed: 7, total: 8, score: 820, brandAction: true, reward: "UNLOCKED", rank: 4 }),
      Object.freeze({ id: "GUEST 063", role: "PRESS", completed: 6, total: 8, score: 760, brandAction: true, reward: "READY", rank: 5 }),
      Object.freeze({ id: "GUEST 077", role: "OPERATOR", completed: 6, total: 8, score: 735, brandAction: true, reward: "READY", rank: 6 }),
      Object.freeze({ id: "GUEST 091", role: "AGENT", completed: 5, total: 8, score: 680, brandAction: false, reward: "IN PROGRESS", rank: 7 }),
      Object.freeze({ id: "GUEST 104", role: "PARTNER", completed: 5, total: 8, score: 650, brandAction: false, reward: "IN PROGRESS", rank: 8 }),
    ]),
    missionCounts: Object.freeze([8, 8, 7, 7, 6, 6, 5, 5]),
    sampleRewards: Object.freeze(["UNLOCKED", "READY", "IN PROGRESS"]),
  });
})();
