(function () {
  "use strict";

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  // One night. October 28, 2026, Bar Oriente, Mexico City. A Claude community
  // event powered by AXIS. The seated workshop runs first, then the room
  // resets and the same space opens as the after party.
  var night = {
    date: "2026-10-28",
    displayDate: "October 28, 2026",
    displayDateShort: "OCT 28, 2026",
    day: "Wednesday",
    venue: "Bar Oriente",
    city: "Mexico City",
    context: "Mexico Tech Week 2026",
    status: "Claude community event",
    poweredBy: "AXIS",
    workshopStart: "18:00",
    workshopEnd: "21:00",
    workshopCapacity: 200,
    afterPartyStart: "22:00",
    afterPartyGuests: 250,
  };

  // The run of show is the spine of every operational claim in this deck.
  var program = [
    { id: "workshop", slot: "01", time: "18:00 – 21:00", label: "Claude workshop", arc: "SEATED", note: "Three hands-on hours for the music industry, led from the screen at the front of the room." },
    { id: "reset", slot: "02", time: "21:00 – 22:00", label: "Room reset", arc: "CHANGEOVER", note: "The seated room becomes the night. Production, sound and lighting change state." },
    { id: "warmup", slot: "03", time: "22:00", label: "Warm-up DJ", arc: "ARRIVAL", note: "Doors open again for the after party. Arrival, initial energy, room activation." },
    { id: "live-coding", slot: "04", time: "LATE", label: "Live coding", arc: "CREATION", note: "Music written, sequenced and modified through code in real time, visible to the room." },
    { id: "closing", slot: "05", time: "CLOSE", label: "Closing DJ", arc: "CLUB", note: "Takes the night from the experimental portion into its final club state." },
  ];

  // Billed on the line-up. The public is listed deliberately: the room makes
  // the work that runs on the main LED wall.
  var lineup = [
    {
      id: "verse",
      name: "Verse Works",
      kind: "Platform",
      discipline: "Generative and digital art · London",
      note: "A generative work reads a hash when it is collected and draws itself from that seed, so no two outputs are the same.",
    },
    {
      id: "pixelord",
      name: "Pixelord",
      kind: "Artist",
      discipline: "Sound and 3D visuals · Hyperboloid Records",
      note: "Releases sound and 3D visuals together onchain, moving between IDM, breakbeat, bass and glitch.",
    },
    {
      id: "public",
      name: "The Public",
      kind: "Every guest",
      discipline: "Real-time visuals created with Claude",
      note: "A photo, a video or a prompt from anyone in the room changes the visuals running on the main LED wall.",
    },
  ];

  // Authored, funded or run by AXIS. The venue provides the room, the bar and
  // the screens; everything below arrives with the production.
  var operates = [
    ["concept", "Concept + direction"], ["programming", "Music programming"],
    ["live-coding", "Live coding"], ["claude", "Claude integration"],
    ["claude-onboarding", "Claude onboarding"], ["claude-code", "Claude Code workflow"],
    ["interactive", "Interactive systems"], ["digital-art", "Digital art"],
    ["render", "Render + routing"], ["operators", "Technical operators"],
    ["activations", "Activity coordination"], ["media", "Media direction"],
    ["artists", "Artist coordination"], ["documentation", "Documentation"],
    ["hospitality", "Drink allocation"], ["production", "Production"],
    ["guest-logic", "Guest-experience logic"], ["activity-mechanics", "Activity mechanics"],
  ];

  // Where AXIS puts its own money into the night.
  var allocation = [
    ["hospitality", "Drinks + hospitality"], ["production", "Production"],
    ["audiovisual", "Audiovisual"], ["programming", "Programming"],
    ["claude", "Claude workshop"], ["digital-art", "Digital art"],
    ["activations", "Tech Week activations"], ["media", "Media"],
    ["operations", "Operations"],
  ];

  // What the partner actually receives afterwards.
  var deliverables = {
    media: [
      ["photography", "Photography"], ["aftermovie", "Aftermovie"],
      ["live-recording", "Live recording"], ["short-clips", "Short clips"],
      ["environment", "Venue environment"], ["screen-moments", "Screen moments"],
      ["mapping", "Projection mapping"], ["guest-testimonials", "Guest testimonials"],
      ["artist-testimonials", "Artist testimonials"], ["social", "Social content"],
    ],
    report: [
      ["photo-folder", "Photo folder"], ["aftermovie-material", "Aftermovie material"],
      ["clips", "Short video clips"], ["attendance", "Attendance estimate"],
      ["participation", "Activity participation"], ["claude-activations", "Claude activations"],
      ["live-coding", "Live coding interaction"], ["redemptions", "Reward redemptions"],
      ["hospitality", "Hospitality usage"], ["screens", "Screen interactions"],
      ["social-actions", "Social actions"], ["written-report", "Written report"],
    ],
  };

  // The two agreed packages. Both are for the single night of October 28 —
  // there is no multi-night ladder here and no per-event maths behind these
  // figures.
  var commercialTiers = [
    {
      id: "activity-partner",
      name: "Activity Partner",
      price: 2500,
      scope: "One product function inside the October 28 Claude community event.",
      deployment: "One authored activity with mission, staff validation, reward path, screen presence and reporting.",
      rights: ["Product function on the floor", "Staff-guided onboarding point", "Reward redemption at the bar", "Venue screen presence", "Media capture", "Post-event report"],
      restriction: "Claude retains community-event status for the night. Partner integration is subordinate to it.",
    },
    {
      id: "category-exclusive",
      name: "Category Exclusive Partner",
      price: 3500,
      scope: "Sole product in its category inside AXIS-controlled inventory for the night.",
      deployment: "A hero function with priority placement, deeper integration and dedicated product media.",
      rights: ["Category exclusivity", "Priority onboarding placement", "Dedicated product media", "Extended reporting"],
      restriction: "Exclusivity applies only to AXIS-controlled inventory and cannot override Claude or venue rights.",
    },
  ];

  window.FUTURE_RENAISSANCE = deepFreeze({
    seriesName: "Future Renaissance",
    subtitle: "Claude community event",
    night: night,
    program: program,
    lineup: lineup,
    operates: operates,
    allocation: allocation,
    deliverables: deliverables,
    commercialTiers: commercialTiers,
    proposition: "A workshop for the music industry that becomes the night.",
    system: ["art", "music", "technology", "culture", "hospitality", "missions", "media", "participation"],
    guestFlow: ["register", "check in", "act", "validate", "unlock", "progress", "collect", "report"],
    measurement: {
      verified: ["attendance", "check-ins", "activity participation", "qualified actions", "reward redemption", "content outputs"],
      calculatedWhenSupported: ["CPQA", "CPA", "CAC", "ROI", "LTV:CAC", "NPV"],
    },
    // Replaced per deck by scripts/build-product-decks.mjs.
    productFocus: {
      id: "payments",
      name: "Payments",
      slot: "[PAYMENTS BRAND]",
      discipline: "Card, tap and stablecoin rails for real-world spend",
      mechanics: [
        { id: "issue", name: "Issue", role: "A card provisioned at a staffed point" },
        { id: "tap", name: "Tap", role: "One tap buys a drink at the bar" },
        { id: "repeat", name: "Repeat", role: "The most repeated action of the night" },
        { id: "tab", name: "Tab", role: "Opened at the door, closed before close" },
        { id: "allocation", name: "Allocation", role: "The funded drink settles on the rail" },
        { id: "split", name: "Split", role: "Rounds split, refunds done in the room" },
        { id: "merchant", name: "Merchant", role: "Bar Oriente is the real counterparty" },
      ],
      flow: [
        { id: "provision", stage: "Provision", context: "Doors", action: "Card provisioned at check-in" },
        { id: "tap", stage: "Tap", context: "Bar", action: "First drink paid with a tap" },
        { id: "validate", stage: "Validate", context: "Bar", action: "Transaction verified at the bar" },
        { id: "redeem", stage: "Redeem", context: "Bar", action: "Funded drink settles on the rail" },
        { id: "screen", stage: "Screen", context: "LED wall", action: "The night's total on the wall" },
        { id: "report", stage: "Report", context: "Post-event", action: "Reconciled with the venue" },
      ],
    },
  });

  window.FUTURE_RENAISSANCE_ARTISTS = deepFreeze({});

  // Illustrative rows for the live leaderboard interface on slide 10. These
  // are not projections or past results — the slide labels them as a preview
  // of the interface, and no deck should present them as attendance data.
  window.SYNTHETIC_DEMO = deepFreeze({
    leaderboard: [
      { id: "GUEST 014", role: "COLLECTOR", completed: 8, total: 8, score: 940, brandAction: true, reward: "UNLOCKED", rank: 1 },
      { id: "GUEST 027", role: "CREATOR", completed: 8, total: 8, score: 910, brandAction: true, reward: "UNLOCKED", rank: 2 },
      { id: "GUEST 041", role: "GUEST", completed: 7, total: 8, score: 845, brandAction: true, reward: "UNLOCKED", rank: 3 },
      { id: "GUEST 058", role: "ARTIST", completed: 7, total: 8, score: 820, brandAction: true, reward: "READY", rank: 4 },
      { id: "GUEST 063", role: "PRESS", completed: 6, total: 8, score: 760, brandAction: true, reward: "READY", rank: 5 },
      { id: "GUEST 077", role: "OPERATOR", completed: 6, total: 8, score: 735, brandAction: true, reward: "READY", rank: 6 },
      { id: "GUEST 091", role: "AGENT", completed: 5, total: 8, score: 680, brandAction: false, reward: "IN PROGRESS", rank: 7 },
      { id: "GUEST 104", role: "PARTNER", completed: 5, total: 8, score: 650, brandAction: false, reward: "IN PROGRESS", rank: 8 },
    ],
    missionCounts: [8, 8, 7, 7, 6, 6, 5, 5],
    sampleRewards: ["UNLOCKED", "READY", "IN PROGRESS"],
  });
})();
