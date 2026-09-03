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

  // What a partner is buying into. Only the tier actually scoped to this
  // night carries a number; category exclusivity is quoted per conversation.
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
      price: null,
      priceNote: "ON APPLICATION",
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
      id: "exchange",
      name: "Exchange",
      slot: "[EXCHANGE BRAND]",
      discipline: "Verified accounts, funding and trading in one app",
      mechanics: [
        { id: "verify", name: "Verify", role: "KYC completed at the onboarding desk" },
        { id: "deposit", name: "Deposit", role: "First balance funded before the DJ starts" },
        { id: "trade", name: "First Trade", role: "The first convert or spot order, in the room" },
        { id: "outcomes", name: "Outcomes", role: "A live position taken on the night itself" },
        { id: "invite", name: "Invite", role: "The referral sent to someone in the room" },
        { id: "withdraw", name: "Withdraw", role: "Proof the money leaves when asked" },
        { id: "retain", name: "Retain", role: "A verified account still open in November" },
      ],
      flow: [
        { id: "onboard", stage: "Onboard", context: "Workshop", action: "Verify at the onboarding desk" },
        { id: "act", stage: "Act", context: "Doors", action: "First order placed in the app" },
        { id: "validate", stage: "Validate", context: "After party", action: "Staff validation on the floor" },
        { id: "redeem", stage: "Redeem", context: "Bar", action: "Drink released at the bar" },
        { id: "screen", stage: "Screen", context: "LED wall", action: "Partner state on the LED wall" },
        { id: "report", stage: "Report", context: "Post-event", action: "Report delivered after the night" },
      ],
    },
  });

  window.FUTURE_RENAISSANCE_ARTISTS = deepFreeze({});

  window.SYNTHETIC_DEMO = deepFreeze({
    leaderboard: [],
    missionCounts: [],
    sampleRewards: [],
  });
})();
