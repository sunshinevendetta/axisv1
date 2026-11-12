(function () {
  "use strict";

  window.AI_CREATIVE_CLUB = Object.freeze({
    date: "2026-12-04",
    endDate: "2026-12-05",
    displayDate: "December 4, 2026",
    dayName: "Friday",
    venue: "Casa Luma",
    venueSlug: "casa-luma",
    address: "Tinala 145, Roma Norte, CDMX",
    city: "Mexico City",
    slug: "/aicreativeclub",
    attendees: 120,
    targetAttendance: 120,
    workshopCapacity: 100,
    eventStart: "17:00",
    eventEnd: "02:00",
    workshopStart: "17:30",
    workshopEnd: "21:00",
    workshopSeated: true,
    afterPartyStart: "21:30",
    afterPartyEnd: "02:00",
    afterPartyGuests: 120,
    creativeAICommunityEvent: true,
    venueFacing: true,
    hostVenue: true,
    poweredBy: "AXIS",
    allocation: Object.freeze([
      Object.freeze({ id: "budget-hospitality", title: "DRINKS + HOSPITALITY", note: "Soft drinks bought from the venue bar for the workshop, plus the guest drink allocation." }),
      Object.freeze({ id: "budget-production", title: "PRODUCTION", note: "Technical systems, staffing and event operation." }),
      Object.freeze({ id: "budget-audiovisual", title: "AUDIOVISUAL", note: "Visual rendering, routing, display integration and event output." }),
      Object.freeze({ id: "budget-programming", title: "PROGRAMMING", note: "Business content creation, AI agent building, onchain investing and the four-trader tournament." }),
      Object.freeze({ id: "budget-creative-ai", title: "CREATIVE AI WORKSHOP", note: "Anana: art and business content, image creation, editing and video. Sunshine Vendetta: AI workflows and agent integrations." }),
      Object.freeze({ id: "budget-digital-art", title: "DIGITAL ART", note: "Curated local and international onchain artists, plus people creating onsite." }),
      Object.freeze({ id: "budget-activations", title: "CLUB ACTIVATIONS", note: "Small partner experiences integrated throughout the night." }),
      Object.freeze({ id: "budget-media", title: "MEDIA", note: "Photography, video and event documentation." }),
      Object.freeze({ id: "budget-operations", title: "OPERATIONS", note: "Guest flow, technical crew and venue coordination." }),
    ]),
  });

  window.AI_CREATIVE_CLUB_PROGRAM = Object.freeze({
    order: Object.freeze(["warmup", "liveCoding", "closing"]),
    warmup: Object.freeze({
      slot: "01",
      label: "CONTENT CREATION",
      type: "Session",
      artist: null,
      arc: "ARRIVAL",
      note: "Arrival, initial energy and room activation moving gradually into the central program.",
    }),
    liveCoding: Object.freeze({
      slot: "02",
      label: "TRADING TOURNAMENT",
      type: "Trading tournament",
      artist: null,
      arc: "CREATION",
      note: "Four traders start with the same capital and compete onsite while the event runs. Highest profit at the end wins the prize; liquidated = DSQ. Prize and participants to be announced.",
    }),
    closing: Object.freeze({
      slot: "03",
      label: "AFTER PARTY",
      type: "Session",
      artist: null,
      arc: "CLUB",
      note: "Secondary social continuation after content creation, agents, onchain investing and the tournament.",
    }),
  });

  window.AI_CREATIVE_CLUB_ARTISTS = Object.freeze({
  "national-artists": {
    "name": "Local artists",
    "monogram": "NA",
    "monogramMedia": { "type": "svg", "markup": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z\"/><circle cx=\"12\" cy=\"10\" r=\"2.4\"/></svg>" },
    "kind": "ONCHAIN ART",
    "tag": "LOCAL",
    "role": "Local artists selection",
    "discipline": "ONCHAIN ART + ONSITE CREATION",
    "bio": "A curated selection of local onchain artists. Individual artists and works will be announced.",
    "facts": [
      [
        "FORMAT",
        "Curated onchain art and onsite creation"
      ],
      [
        "AT CASA LUMA",
        "Shared presentation within the event"
      ],
      [
        "SELECTION",
        "Artist names and works to be announced"
      ]
    ],
    "href": "",
    "linkLabel": ""
  },
  "international-artists": {
    "name": "International artists",
    "monogram": "IN",
    "monogramMedia": { "type": "svg", "markup": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"8.6\"/><path d=\"M3.4 12h17.2M12 3.4a13 13 0 0 1 0 17.2 13 13 0 0 1 0-17.2\"/></svg>" },
    "kind": "ONCHAIN ART",
    "tag": "INTERNATIONAL",
    "role": "International artists selection",
    "discipline": "ONCHAIN ART + ONSITE CREATION",
    "bio": "A curated selection of international onchain artists. Individual artists and works will be announced.",
    "facts": [
      [
        "FORMAT",
        "Curated onchain art and onsite creation"
      ],
      [
        "AT CASA LUMA",
        "Shared presentation within the event"
      ],
      [
        "SELECTION",
        "Artist names and works to be announced"
      ]
    ],
    "href": "",
    "linkLabel": ""
  },
  "onsite-creators": {
    "name": "Onsite creators",
    "monogram": "ON",
    "monogramMedia": { "type": "svg", "markup": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 20.2 4.9 16 15.6 5.3a1.9 1.9 0 0 1 2.7 0l.4.4a1.9 1.9 0 0 1 0 2.7L8.2 19.3z\"/><path d=\"M14.2 6.8l3 3\"/></svg>" },
    "kind": "ONCHAIN ART",
    "tag": "ONSITE",
    "role": "People creating onsite",
    "discipline": "ONCHAIN ART + ONSITE CREATION",
    "bio": "People creating onsite contribute works alongside the curated local and international selection.",
    "facts": [
      [
        "FORMAT",
        "Curated onchain art and onsite creation"
      ],
      [
        "AT CASA LUMA",
        "Shared presentation within the event"
      ],
      [
        "SELECTION",
        "Artist names and works to be announced"
      ]
    ],
    "href": "",
    "linkLabel": ""
  }
});

  window.SYNTHETIC_DEMO = Object.freeze({
    leaderboard: Object.freeze([{"id": "Trader slot 1", "role": "TRADER", "completed": 0, "total": 1, "score": 0, "brandAction": false, "reward": "TBA", "rank": 1}, {"id": "Trader slot 2", "role": "TRADER", "completed": 0, "total": 1, "score": 0, "brandAction": false, "reward": "TBA", "rank": 2}, {"id": "Trader slot 3", "role": "TRADER", "completed": 0, "total": 1, "score": 0, "brandAction": false, "reward": "TBA", "rank": 3}, {"id": "Trader slot 4", "role": "TRADER", "completed": 0, "total": 1, "score": 0, "brandAction": false, "reward": "TBA", "rank": 4}]),
    missionCounts: Object.freeze([0, 0, 0, 0]),
    sampleRewards: Object.freeze(["Prize to be announced"]),
  });
})();
