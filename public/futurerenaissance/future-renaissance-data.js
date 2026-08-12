(function () {
  "use strict";

  window.FUTURE_RENAISSANCE = Object.freeze({
    date: "2026-10-28",
    displayDate: "October 28, 2026",
    venue: "Owl Condesa",
    city: "Mexico City",
    attendees: 120,
    requiredBrandActions: 120,
    eventPartnerPrice: 2500,
    presentingProductPrice: 3500,
    presentingPositions: 1,
    allocation: Object.freeze({
      rewards: 40,
      operations: 25,
      media: 20,
      integration: 15,
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
