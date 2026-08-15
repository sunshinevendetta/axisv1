(function () {
  "use strict";

  var event = window.FUTURE_RENAISSANCE;
  var program = window.FUTURE_RENAISSANCE_PROGRAM;
  var root = "/futurerenaissance-bar-oriente/brand-assets/axis_future_renaissance_brand_assets";
  var claudeRoot = "/futurerenaissance-bar-oriente/brand-assets/anthropic";
  var orientation = document.documentElement.dataset.orientation || "horizontal";
  var poster = orientation === "vertical"
    ? "/futurerenaissance-bar-oriente/poster-vertical.png"
    : "/futurerenaissance-bar-oriente/poster-horizontal.png";

  function axisMark(tone) {
    return '<img class="axis-mark" src="' + root + '/logos/axis-mark-' + tone + '.png" alt="AXIS">';
  }

  function frameTop(number, label, tone) {
    return '<header class="fr-frame-top" data-reveal>' +
      '<div class="fr-lockup">' + axisMark(tone || "ivory") +
      '<span>AXIS</span><i></i><span data-i18n="brand.techWeek">TECH WEEK MEXICO EDITION</span></div>' +
      '<div class="fr-coordinate"><span>' + number + ' / 15</span><span data-i18n="nav.' + label + '">' + label.replace(/-/g, " ") + '</span></div>' +
    '</header>';
  }

  function star(className) {
    return '<span class="gold-star ' + (className || "") + '" aria-hidden="true">✦</span>';
  }

  // Line-drawn pictograms. One vocabulary across the deck: 24x24 grid, 1.6 stroke,
  // round joins. Every system item, cycle step and venue zone is read as a mark
  // first and a label second.
  var GLYPHS = {
    gallery: '<rect x="3" y="4.5" width="18" height="15" rx="1"/><path d="m3.6 16 4.7-4 3.6 2.8 3.4-2.6L20.4 16"/><circle cx="8.6" cy="9" r="1.3"/>',
    disc: '<circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="2.2"/><path d="M14.6 6.2A6.4 6.4 0 0 1 17.8 9.4M9.4 17.8a6.4 6.4 0 0 1-3.2-3.2"/>',
    projector: '<rect x="2.6" y="7" width="12.4" height="10" rx="1"/><path d="m15 12 6-3.6v7.2z"/>',
    screen: '<rect x="2.6" y="4.4" width="18.8" height="12.4" rx="1"/><path d="M9 20.2h6M12 16.8v3.4"/>',
    broadcast: '<circle cx="12" cy="12" r="2.1"/><path d="M8.2 8.2a5.4 5.4 0 0 0 0 7.6M15.8 15.8a5.4 5.4 0 0 0 0-7.6M5.4 5.4a9.4 9.4 0 0 0 0 13.2M18.6 18.6a9.4 9.4 0 0 0 0-13.2"/>',
    camera: '<path d="M3 8.4h3.4l1.5-2.3h8.2l1.5 2.3H21v10.2H3z"/><circle cx="12" cy="13.2" r="3.4"/>',
    film: '<rect x="2.8" y="5" width="18.4" height="14" rx="1"/><path d="M7.6 5v14M16.4 5v14M2.8 12h18.4"/>',
    quote: '<path d="M20.4 15.6a2 2 0 0 1-2 2H8.2L4 21V6.4a2 2 0 0 1 2-2h12.4a2 2 0 0 1 2 2z"/><path d="M8.6 10.8h3M8.6 13.8h6.4"/>',
    cube: '<path d="m12 3 8 4.4v9.2L12 21l-8-4.4V7.4z"/><path d="m4 7.4 8 4.3 8-4.3M12 11.7V21"/>',
    passport: '<rect x="4.6" y="3" width="14.8" height="18" rx="1.4"/><circle cx="12" cy="10" r="2.6"/><path d="M8.4 16.6h7.2"/>',
    nfc: '<path d="M6.6 4.6A9.6 9.6 0 0 1 6.6 19.4M10.4 7.4a5.6 5.6 0 0 1 0 9.2M14.2 10a2.2 2.2 0 0 1 0 4"/>',
    phone: '<rect x="6.6" y="2.6" width="10.8" height="18.8" rx="1.8"/><path d="M10.6 5.6h2.8M12 18.2h.01"/>',
    staff: '<circle cx="9.2" cy="7.6" r="3.4"/><path d="M3.4 20a5.8 5.8 0 0 1 11.6 0"/><path d="m15.6 12.4 1.9 1.9 3.4-3.8"/>',
    drink: '<path d="M4.4 4.6h15.2L12 13.2z"/><path d="M12 13.2V20M8.4 20h7.2"/>',
    guests: '<circle cx="9" cy="8" r="3.2"/><path d="M3.4 19.4a5.6 5.6 0 0 1 11.2 0"/><path d="M16.4 5.2a3.2 3.2 0 0 1 0 5.6M17.6 14.6a5.6 5.6 0 0 1 3 4.8"/>',
    spark: '<path d="M12 2.6v18.8M2.6 12h18.8M5.4 5.4l13.2 13.2M18.6 5.4 5.4 18.6"/>',
    code: '<path d="m8.6 8.4-4.4 3.6 4.4 3.6M15.4 8.4l4.4 3.6-4.4 3.6M13.4 4.6l-2.8 14.8"/>',
    grid: '<rect x="3.4" y="3.4" width="7" height="7" rx="1"/><rect x="13.6" y="3.4" width="7" height="7" rx="1"/><rect x="3.4" y="13.6" width="7" height="7" rx="1"/><path d="M17.1 13.9v6.2M14 17h6.2"/>',
    author: '<path d="M4 20.2 4.9 16 15.6 5.3a1.9 1.9 0 0 1 2.7 0l.4.4a1.9 1.9 0 0 1 0 2.7L8.2 19.3z"/><path d="M14.2 6.8l3 3"/>',
    layers: '<path d="m12 3.2 8.6 4.5-8.6 4.5-8.6-4.5z"/><path d="m3.4 12.4 8.6 4.5 8.6-4.5M3.4 16.8 12 21.3l8.6-4.5"/>',
    arrive: '<path d="M14 3.4h4.2a1.8 1.8 0 0 1 1.8 1.8v13.6a1.8 1.8 0 0 1-1.8 1.8H14"/><path d="m9.4 16 4-4-4-4M13.4 12H3.6"/>',
    target: '<circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="4.2"/><circle cx="12" cy="12" r="1"/>',
    check: '<circle cx="12" cy="12" r="8.6"/><path d="m8.2 12.2 2.6 2.6 5-5.4"/>',
    shield: '<path d="M12 3.2 5 6v5.6c0 4 2.9 7.5 7 9.2 4.1-1.7 7-5.2 7-9.2V6z"/><path d="m9.1 12 2 2 3.8-4.2"/>',
    chart: '<path d="M4 20h16"/><rect x="5.6" y="12.4" width="3.4" height="6"/><rect x="10.8" y="8.4" width="3.4" height="10"/><rect x="16" y="4.8" width="3.4" height="13.6"/>',
    list: '<path d="M9 6.6h11M9 12h11M9 17.4h11"/><path d="M4.6 6.6h.01M4.6 12h.01M4.6 17.4h.01"/>',
    file: '<path d="M14 3.2H6.8A1.8 1.8 0 0 0 5 5v14a1.8 1.8 0 0 0 1.8 1.8h10.4A1.8 1.8 0 0 0 19 19V8.2z"/><path d="M14 3.2V8.2h5M8.6 13h6.8M8.6 16.6h4.6"/>',
    door: '<path d="M4.6 20.4h14.8"/><path d="M7.4 20.4V4.6l8.4-1.4v18.2"/><circle cx="13.4" cy="12.2" r=".9"/>',
    sound: '<path d="M4 9.6h3l4.4-3.8v12.4L7 14.4H4z"/><path d="M15 9.6a3.6 3.6 0 0 1 0 4.8M17.8 7a7.2 7.2 0 0 1 0 10"/>',
    wave: '<path d="M2.8 12h2.6l1.8-5.4 2.6 11L12.6 6l2 8.4 1.6-2.4h5"/>',
    power: '<path d="M13.6 2.6 5.4 13.4h6l-1 8 8.2-10.8h-6z"/>',
    globe: '<circle cx="12" cy="12" r="8.6"/><path d="M3.4 12h17.2M12 3.4a13 13 0 0 1 0 17.2 13 13 0 0 1 0-17.2"/>',
    lock: '<rect x="4.6" y="10.4" width="14.8" height="10" rx="1.4"/><path d="M8.2 10.4V7.6a3.8 3.8 0 0 1 7.6 0v2.8"/>',
    star: '<path d="m12 3.4 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.9l6.1-.9z"/>',
  };

  function glyph(name, className) {
    var body = GLYPHS[name] || GLYPHS.spark;
    return '<svg class="fr-glyph ' + (className || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  function orbitalSvg(className) {
    return '<svg class="orbital-svg ' + (className || "") + '" viewBox="0 0 800 800" aria-hidden="true">' +
      '<circle class="orbit-line orbit-line-a" cx="400" cy="400" r="310"></circle>' +
      '<circle class="orbit-line orbit-line-b" cx="400" cy="400" r="220"></circle>' +
      '<ellipse class="orbit-line orbit-line-c" cx="400" cy="400" rx="360" ry="122" transform="rotate(-18 400 400)"></ellipse>' +
      '<path class="orbit-line orbit-line-d" d="M114 520 C250 90 610 72 706 370 C782 610 438 760 170 642"></path>' +
      '<g class="orbit-nodes"><circle cx="91" cy="399" r="7"></circle><circle cx="628" cy="183" r="7"></circle><circle cx="691" cy="525" r="7"></circle></g>' +
    '</svg>';
  }

  function roleBadge(role, extraClass) {
    var slug = role.toLowerCase();
    return '<button class="role-badge concept-trigger ' + (extraClass || "") + '" type="button" data-role="' + role + '" data-concept-id="role-' + slug + '" aria-label="Open ' + role.toLowerCase() + ' role details" data-reveal>' +
      '<img loading="lazy" src="' + root + '/badges/roles/' + slug + '.svg" alt="' + role + ' role badge">' +
      '<span class="role-caption">' + role + '</span>' +
    '</button>';
  }

  function conceptNode(className, id, content, label) {
    return '<button class="' + className + ' concept-trigger" type="button" data-concept-id="' + id + '" aria-label="Open details about ' + (label || id) + '">' + content + '</button>';
  }

  function systemItem(className, item) {
    return conceptNode(className, item[0], '<i>' + glyph(item[3]) + '</i><span><b>' + item[1] + '</b><small>' + item[2] + '</small></span>', item[1]);
  }

  function formatGroup(group) {
    return '<section class="format-group fg-' + group.key + '"><h3>' + group.letter + '. ' + group.title + '</h3><div>' +
      group.items.map(function (item) { return systemItem("format-item", item); }).join("") +
    '</div></section>';
  }

  function cycleNode(item, index) {
    return conceptNode("system-cycle-node scn-" + (index + 1), item[0],
      '<span class="scn-disc"><i>' + String(index + 1).padStart(2, "0") + '</i>' + glyph(item[2]) + '</span><b>' + item[1] + '</b>',
      item[1]);
  }

  function rewardStep(position, id, index, mark, label, description) {
    return conceptNode("reward-step " + position, id,
      '<span class="scn-disc"><i>' + index + '</i>' + glyph(mark) + '</span><b>' + label + '</b>',
      description);
  }

  function deliverableButton(item) {
    return conceptNode("deliverable-item", item[0], '<span>' + item[1] + '</span><i>✓</i>', item[1]);
  }

  function offerItem(item) {
    return conceptNode("offer-item", item[0], '<i>✦</i><span>' + item[1] + '</span>', item[1]);
  }

  function artistButton(id) {
    var artist = window.FUTURE_RENAISSANCE_ARTISTS[id];
    return '<button class="artist-button" type="button" data-artist-id="' + id + '" aria-haspopup="dialog">' +
      '<span>' + artist.name + '</span><i aria-hidden="true">+</i>' +
    '</button>';
  }

  function artistLineup(labelKey, label, ids) {
    return '<div class="artist-lineup"><span class="lineup-label" data-i18n="' + labelKey + '">' + label + '</span>' +
      '<div class="lineup-buttons">' + ids.map(artistButton).join("") + '</div></div>';
  }

  function programSlot(key) {
    var slot = program[key];
    return conceptNode("program-slot ps-" + slot.slot, "program-" + key,
      '<i>' + slot.slot + '</i><b>' + slot.label + '</b><small>' + slot.arc + '</small>',
      slot.label);
  }

  function programLineup() {
    return '<div class="program-lineup" data-reveal>' +
      '<span class="lineup-label" data-i18n="event.musicProgram">MUSIC PROGRAM</span>' +
      '<div class="program-slots">' +
        program.order.map(programSlot).join('<i class="program-arrow" aria-hidden="true">→</i>') +
      '</div>' +
    '</div>';
  }

  function allocationCell(entry) {
    return conceptNode("budget-cell", entry.id, '<b>' + entry.title + '</b><small>' + entry.note + '</small>', entry.title.toLowerCase() + " investment");
  }

  var roles = ["ARTIST", "CREATOR", "AGENT", "PARTNER", "PRESS", "OPERATOR", "GUEST", "COLLECTOR"];
  var missions = ["CONNECT", "CHECK-IN", "CREATE", "INTERVENE", "VOTE", "COLLECT", "STREAM", "COMPLETE"];
  var digitalArtists = ["alexa-carlota", "arvakerm", "fabiola-larios", "jazmineci"];

  var formatGroups = [
    { key: "a", letter: "A", title: "CULTURE", items: [
      ["format-gallery", "ART GALLERY", "Digital works presented inside the event environment.", "gallery"],
      ["format-djs", "DJ SETS", "Warm-up and closing music programming.", "disc"],
      ["format-mapping", "VIDEO MAPPING", "Projected visuals authored for " + event.venue + ".", "projector"],
    ] },
    { key: "b", letter: "B", title: "ON-SITE MEDIA", items: [
      ["format-screens", "VENUE SCREENS", "Venue display infrastructure carries the visual system.", "screen"],
      ["format-stream", "LIVE RECORDING", "Live or recorded capture produced on site.", "broadcast"],
      ["format-photo", "PHOTOGRAPHY", "Event archive, environment and post-event video.", "camera"],
    ] },
    { key: "c", letter: "C", title: "CONTENT PRODUCTION", items: [
      ["format-aftermovie", "AFTERMOVIE", "Edited recap material from the night.", "film"],
      ["format-testimonials", "TESTIMONIAL CAPTURE", "Guest and artist quotes when available.", "quote"],
      ["format-collectibles", "POST-EVENT COLLECTIBLES", "Selected moments become digital assets.", "cube"],
    ] },
    { key: "d", letter: "D", title: "ACCESS SYSTEM", items: [
      ["format-passport", "ACTIVITY PASSPORT", "A readable guest state opens the interaction path.", "passport"],
      ["format-nfc", "AXIS NFC / QR", "Fast entry into any activity on the floor.", "nfc"],
      ["format-onboarding", "ONBOARDING SCREENS", "Clear instructions before any action begins.", "phone"],
    ] },
    { key: "e", letter: "E", title: "EVENT FLOW", items: [
      ["format-staff", "STAFF-GUIDED FLOW", "Staff supports actions, validation and exceptions.", "staff"],
      ["format-hospitality", "COMPLIMENTARY HOSPITALITY", "AXIS funds the drink allocation for the night.", "drink"],
      ["format-guestlist", "EXPECTED AUDIENCE", event.attendees + " Future Renaissance guests, plus venue clientele.", "guests"],
    ] },
    { key: "f", letter: "F", title: "AI + CODE", items: [
      ["format-claude", "CLAUDE ACTIVITY", "Guests discover Claude, activate access and interact live.", "spark"],
      ["format-live-coding", "LIVE CODING", "Code becomes sound and image in real time.", "code"],
      ["format-activations", "TECH WEEK MICRO-ACTIVATIONS", "Small partner experiences through the night.", "grid"],
    ] },
  ];

  var systemCycle = [
    ["system-produce", "AXIS PRODUCES THE FORMAT", "author"],
    ["system-build", "AXIS BUILDS THE ACTIVITY LAYER", "layers"],
    ["system-arrive", "GUESTS ARRIVE ON SITE", "arrive"],
    ["system-enter", "GUESTS TAP NFC / QR", "nfc"],
    ["system-mission", "AN ACTIVITY STARTS", "target"],
    ["system-action", "GUEST COMPLETES THE ACTION", "check"],
    ["system-validate", "STAFF / SYSTEM VALIDATES", "shield"],
    ["system-reward", "DRINK / REWARD UNLOCKS", "drink"],
    ["system-score", "SCORE + TIER UPDATE", "chart"],
    ["system-leaderboard", "LEADERBOARD REFLECTS IT", "list"],
    ["system-capture", "AXIS CAPTURES THE EXPERIENCE", "camera"],
    ["system-report", "THE NIGHT IS DOCUMENTED", "file"],
  ];

  var mediaDeliverables = [
    ["deliverable-photography", "PHOTOGRAPHY"], ["deliverable-aftermovie", "AFTERMOVIE"],
    ["deliverable-livestream", "LIVE RECORDING"], ["deliverable-clips", "SHORT CLIPS"],
    ["deliverable-environment", "VENUE ENVIRONMENT"], ["deliverable-screens", "SCREEN MOMENTS"],
    ["deliverable-mapping", "PROJECTION MAPPING"], ["deliverable-guest-testimonials", "GUEST TESTIMONIALS"],
    ["deliverable-artist-testimonials", "ARTIST TESTIMONIALS"], ["deliverable-social", "SOCIAL CONTENT"],
  ];

  var reportDeliverables = [
    ["report-photo-folder", "PHOTO FOLDER"], ["report-aftermovie", "AFTERMOVIE MATERIAL"],
    ["report-short-clips", "SHORT VIDEO CLIPS"], ["report-attendance", "ATTENDANCE ESTIMATE"],
    ["report-participation", "ACTIVITY PARTICIPATION COUNT"], ["report-claude", "CLAUDE ACTIVATION COUNT"],
    ["report-live-coding", "LIVE CODING INTERACTION"], ["report-redemptions", "REWARD REDEMPTION COUNT"],
    ["report-hospitality", "HOSPITALITY USAGE"], ["report-screens", "SCREEN INTERACTIONS"],
    ["report-social", "SOCIAL ACTIONS"], ["report-written", "BRIEF WRITTEN REPORT"],
  ];

  var offerItems = [
    ["offer-concept", "Future Renaissance concept + creative direction"], ["offer-programming", "Event and music programming"],
    ["offer-live-coding", "Live Coding programming"], ["offer-claude", "Claude activity integration"],
    ["offer-claude-onboarding", "Claude onboarding flow"], ["offer-claude-code", "Claude Code creative workflow"],
    ["offer-interactive", "Interactive systems"], ["offer-digital-art", "Digital art + visual content"],
    ["offer-render", "Rendering workstation + routing"], ["offer-operators", "Technical operators"],
    ["offer-activations", "Tech Week micro-activity coordination"], ["offer-media", "Media direction"],
    ["offer-artists", "Artist coordination"], ["offer-documentation", "Event documentation"],
    ["offer-hospitality", "Complimentary drink allocation funding"], ["offer-production", "Production coordination"],
    ["offer-guest-logic", "Guest-experience logic"], ["offer-activity-mechanics", "Activity mechanics"],
  ];

  var venueZones = [
    ["zone-entry", "ENTRY", "door"], ["zone-checkin", "CHECK-IN / DISCOVERY", "passport"],
    ["zone-social", "SOCIAL / HOSPITALITY", "drink"], ["zone-digital-art", "DIGITAL ART", "gallery"],
    ["zone-warmup", "WARM-UP DJ", "disc"], ["zone-claude", "CLAUDE ACTIVITY", "spark"],
    ["zone-claude-access", "CLAUDE ACCESS + CREDITS", "lock"], ["zone-activations", "TECH WEEK MICRO-ACTIVITIES", "grid"],
    ["zone-visuals", "LIVE VISUALS", "projector"], ["zone-live-coding", "LIVE CODING", "code"],
    ["zone-closing", "CLOSING DJ", "disc"], ["zone-media", "MEDIA", "camera"],
    ["zone-venue-clients", "VENUE CLIENT FLOW", "guests"],
  ];

  var venueRequirements = [
    ["req-screens", "SCREENS / DISPLAYS", "Venue-provided display infrastructure required.", "screen"],
    ["req-inputs", "SCREEN INPUTS", "Access to inputs and routing for an AXIS workstation.", "projector"],
    ["req-internet", "INTERNET", "Reliable connection; wired production line preferred.", "globe"],
    ["req-audio", "AUDIO + DJ", "Audio and DJ infrastructure where available.", "sound"],
    ["req-power", "POWER + ACCESS", "Technical access, load-in and a venue technical contact.", "power"],
    ["req-bar", "BAR + SECURITY", "Bar operation, staffing, security and capacity.", "shield"],
  ];

  var slides = [
    '<section class="fr-slide fr-cover is-active" data-slide-id="cover" data-scene="cover" data-label="Cover">' +
      '<div class="cover-poster" data-crystallize><img src="' + poster + '" alt="Official Future Renaissance poster"></div>' +
      '<div class="cover-data" data-reveal>' +
        axisMark("ivory") +
        '<span class="eyebrow" data-i18n="brand.techWeek">TECH WEEK MEXICO EDITION</span>' +
        '<h1>Future <em>Renaissance</em></h1>' +
        '<p class="cover-status" data-i18n="cover.status">FIRST OFFICIAL ANTHROPIC CLAUDE AI COMMUNITY PARTY</p>' +
        '<p>' + event.displayDate.toUpperCase() + '<br>' + event.venue.toUpperCase() + ' · ' + event.city.toUpperCase() + '</p>' +
        '<p class="cover-flagship" data-i18n="cover.flagship">A FUTURE RENAISSANCE FLAGSHIP POWERED BY AXIS</p>' +
        '<div class="cover-axis">AXIS.SHOW</div>' +
      '</div>' +
      orbitalSvg("cover-orbit") + star("cover-star") +
    '</section>',

    '<section class="fr-slide fr-idea" data-slide-id="idea" data-scene="orbit-system" data-label="The idea">' +
      frameTop("02", "idea") +
      '<div class="fr-reading fr-reading-left">' +
        '<span class="eyebrow" data-reveal data-i18n="idea.kicker">THE IDEA</span>' +
        '<h2 data-reveal data-i18n="idea.title">THE FUTURE RENAISSANCE IS A LIVE SYSTEM.</h2>' +
        '<div class="idea-triptych" data-reveal><span data-i18n="idea.human">Human direction.</span><span data-i18n="idea.machine">Machine extension.</span><span data-i18n="idea.public">Public transformation.</span></div>' +
        '<p data-reveal data-i18n="idea.copy">The Renaissance connected art, science, architecture and public knowledge. Future Renaissance stages their contemporary convergence through artists, machines and participating guests.</p>' +
        '<p data-reveal data-i18n="idea.code">Art, music, technology, culture, AI, code, community, interaction, hospitality and media operate as one environment.</p>' +
      '</div>' +
      '<div class="idea-visual" data-crystallize>' +
        '<img loading="lazy" src="' + root + '/social/stream-cover.png" alt="Future Renaissance classical figure and orbital architecture">' +
        '<div class="dither-screen" aria-hidden="true"></div>' + orbitalSvg("idea-orbit") +
      '</div>' + star("idea-star") +
    '</section>',

    '<section class="fr-slide fr-event" data-slide-id="event" data-scene="event-map" data-label="The event">' +
      frameTop("03", "event") +
      '<div class="event-photo" data-crystallize><img loading="lazy" src="/futurerenaissance-bar-oriente/event-crowd.jpg" alt="Crowd and screen installation inside the event environment"><div class="dither-screen" aria-hidden="true"></div></div>' +
      '<div class="fr-reading event-heading">' +
        '<span class="eyebrow" data-reveal data-i18n="event.kicker">THE EVENT</span>' +
        '<h2 data-reveal>' + event.displayDate.toUpperCase() + '</h2>' +
        '<p class="venue-lock" data-reveal>' + event.venue.toUpperCase() + '<br>' + event.city.toUpperCase() + '</p>' +
        '<p class="event-status" data-reveal data-i18n="event.status">FIRST OFFICIAL ANTHROPIC CLAUDE AI COMMUNITY PARTY · MEXICO TECH WEEK 2026</p>' +
      '</div>' +
      '<div class="event-operating-map" data-reveal>' +
        conceptNode("event-core", "venue", '<strong>' + event.attendees + '</strong><span data-i18n="event.attendees">EXPECTED GUESTS</span>', event.venue + " and the event format") +
        '<div class="event-node n1" data-i18n="program.art">ART</div><div class="event-node n2" data-i18n="program.music">MUSIC</div>' +
        '<div class="event-node n3" data-i18n="program.technology">TECHNOLOGY</div><div class="event-node n4" data-i18n="program.culture">CULTURE</div>' +
        '<div class="event-node n5" data-i18n="program.hospitality">HOSPITALITY</div><div class="event-node n6" data-i18n="program.missions">ACTIVITIES</div>' +
        '<div class="event-node n7" data-i18n="program.claude">CLAUDE</div>' +
        orbitalSvg("event-orbit") +
      '</div>' +
      '<div class="artist-lineups" data-reveal>' +
        programLineup() +
        artistLineup("event.digitalLineup", "DIGITAL ARTIST LINEUP", digitalArtists) +
      '</div>' +
    '</section>',

    '<section class="fr-slide fr-audience" data-slide-id="audience" data-scene="badges" data-label="The audience">' +
      frameTop("04", "audience") +
      '<div class="audience-copy">' +
        '<span class="eyebrow" data-reveal data-i18n="audience.kicker">THE AUDIENCE</span>' +
        '<h2 data-reveal><strong>' + event.attendees + '</strong> <span data-i18n="audience.title">EXPECTED GUESTS.</span></h2>' +
        '<p data-reveal data-i18n="audience.copy">Artists, musicians, builders, founders, collectors, curators, creators, media, operators and selected cultural guests.</p>' +
        '<p data-reveal data-i18n="audience.openCopy">This is the expected Future Renaissance audience, not the absolute venue population. Where operationally agreed, the venue can continue receiving its regular clientele, and those guests can discover and participate in selected activities.</p>' +
      '</div>' +
      '<div class="role-orbit" aria-label="Future Renaissance audience roles">' + orbitalSvg("role-orbit-lines") +
        roles.map(function (role, index) { return roleBadge(role, "role-pos-" + (index + 1)); }).join("") +
        '<div class="role-orbit-core" data-crystallize>' + axisMark("gold") + '<span data-i18n="audience.accessState">ROLE / ACCESS / AUTHORITY</span></div>' +
      '</div>' + star("audience-star") +
    '</section>',

    '<section class="fr-slide fr-format" data-slide-id="program" data-scene="structured" data-label="Event format">' +
      frameTop("05", "event-format") +
      '<div class="format-titlebar"><div><span class="eyebrow" data-reveal>EVENT FORMAT</span><h2 data-reveal>ONE ROOM. SIX OPERATING LAYERS.</h2></div><p data-reveal>Future Renaissance puts culture, media capture, access, hospitality, AI and code into one authored environment.</p></div>' +
      '<div class="event-format-map" data-crystallize>' +
        '<div class="format-hub" aria-hidden="true">' + axisMark("gold") + '<span>FUTURE<br>RENAISSANCE</span></div>' +
        formatGroups.map(formatGroup).join("") +
      '</div>' +
    '</section>',

    '<section class="fr-slide fr-system-flow" data-slide-id="roles" data-scene="structured" data-label="How it works">' +
      frameTop("06", "how-it-works") +
      '<div class="system-flow-heading"><span class="eyebrow" data-reveal>SYSTEM DESIGN</span><h2 data-reveal>HOW IT WORKS.</h2></div>' +
      '<div class="system-cycle" data-crystallize>' + orbitalSvg("system-cycle-rings") +
        '<div class="system-cycle-hub">' + axisMark("gold") + '<b>AXIS</b><p>From format and guest entry to reward, capture and documentation.</p></div>' +
        systemCycle.map(cycleNode).join("") +
      '</div>' +
      '<div class="system-phase phase-a">' + conceptNode("phase-card", "phase-produce", '<i>A</i><b>FUND + PRODUCE</b><p>AXIS authors the format, activities, validation and reward layer before doors open.</p>', "fund and produce") + '</div>' +
      '<div class="system-phase phase-b">' + conceptNode("phase-card", "phase-live", '<i>B</i><b>ON-SITE FLOW</b><p>Guests enter, act, validate, unlock rewards and advance through the live participation system.</p>', "on-site flow") + '</div>' +
      '<div class="system-phase phase-c">' + conceptNode("phase-card", "phase-report", '<i>C</i><b>CAPTURE + DOCUMENT</b><p>AXIS documents the night and delivers participation and media evidence.</p>', "capture and document") + '</div>' +
    '</section>',

    '<section class="fr-slide fr-components" data-slide-id="missions" data-scene="structured" data-label="Experience components">' +
      frameTop("07", "experience-components") +
      '<div class="components-copy"><span class="eyebrow" data-reveal>EXPERIENCE COMPONENTS</span><h2 data-reveal>THE FORMAT STARTS WITH THE GUEST.</h2><p data-reveal>Every activity is distributed across four blocks. Nothing exists as isolated logo placement.</p>' +
        '<div class="components-activities" data-reveal><span>ACTIVITY TYPES ON THE FLOOR</span><div>' + missions.map(function (name) {
          var slug = name.toLowerCase();
          return conceptNode("mission-badge", "mission-" + slug, '<img loading="lazy" src="' + root + '/badges/missions/' + slug + '.svg" alt="' + name + ' activity badge"><span>' + name + '</span>', name.toLowerCase() + " activity");
        }).join("") + '</div></div>' +
      '</div>' +
      '<div class="components-diagram" data-crystallize>' +
        '<div class="components-donut"><i></i><div><b>TOTAL</b><span>EXPERIENCE<br>SYSTEM</span><p>Activity, action, validation, reward, media and documentation operate as one whole.</p></div></div>' +
        conceptNode("component-call cc1", "component-rewards", '<i>' + glyph("star") + '01</i><b>REWARDS</b><strong>GUEST VALUE</strong><p>Benefits unlock through participation, not through purchase.</p>', "rewards") +
        conceptNode("component-call cc2", "component-operations", '<i>' + glyph("staff") + '02</i><b>OPERATIONS</b><strong>ON-SITE FLOW</strong><p>Staff guidance, access, validation and redemption.</p>', "operations") +
        conceptNode("component-call cc3", "component-capture", '<i>' + glyph("camera") + '03</i><b>CAPTURE</b><strong>MEDIA PRODUCTION</strong><p>Photography, video, environment and testimonials.</p>', "capture") +
        conceptNode("component-call cc4", "component-integration", '<i>' + glyph("screen") + '04</i><b>INTEGRATION</b><strong>VISUAL SYSTEMS</strong><p>Venue screens, mapping, onboarding and activity states.</p>', "integration") +
      '</div>' +
      '<div class="components-takeaway" data-reveal>' + axisMark("ivory") + '<p>Guests experience the function.<br>The room produces the evidence.</p></div>' +
    '</section>',

    '<section class="fr-slide fr-reward-flow" data-slide-id="brand-function" data-scene="structured" data-label="Claude to screen">' +
      frameTop("08", "claude-to-screen") +
      '<div class="reward-heading"><span class="eyebrow" data-reveal>SYSTEM DESIGN</span><h2 data-reveal>CODE BECOMES SOUND. CODE BECOMES IMAGE.</h2></div>' +
      '<div class="reward-compare" data-reveal>' +
        '<div class="giveaway-card"><span>WHAT CLAUDE DOES</span><ul><li>Interprets guest intent</li><li>Assists the coding process</li><li>Generates and modifies code</li><li>Works inside controlled limits</li><li>Operates live in the room</li></ul></div>' +
        '<div class="axis-system-card"><span>WHAT THE RUNTIME DOES</span><ul><li>Executes the controlled code</li><li>Applies Future Renaissance visual rules</li><li>Renders the final output</li><li>Routes to venue screens</li><li>Holds a fallback scene</li></ul></div>' +
      '</div>' +
      '<div class="reward-cycle" data-crystallize>' +
        '<div class="reward-cycle-hub">' + axisMark("gold") + '<b>LIVE</b><p>Guest intent becomes code, and code becomes the room.</p></div>' +
        rewardStep("rs1", "flow-guest", "01", "guests", "GUEST", "guest input") +
        rewardStep("rs2", "flow-claude", "02", "spark", "CLAUDE", "Claude") +
        rewardStep("rs3", "flow-claude-code", "03", "code", "CLAUDE CODE", "Claude Code") +
        rewardStep("rs4", "flow-code", "04", "file", "CODE", "code generation") +
        rewardStep("rs5", "flow-rules", "05", "grid", "FR VISUAL RULES", "Future Renaissance visual rules") +
        rewardStep("rs6", "flow-render", "06", "projector", "RENDER", "render") +
        rewardStep("rs7", "flow-screens", "07", "screen", "VENUE SCREENS", "venue screens") +
        rewardStep("rs8", "flow-fallback", "08", "shield", "SAFE FALLBACK", "safe fallback") +
      '</div>' +
      '<div class="reward-memory" data-reveal><span>VISUAL CONTROL</span><p>Guest prompts never produce arbitrary output. Every live result is constrained by the Future Renaissance visual language before it reaches a screen.</p><div><i>UNCONTROLLED PROMPT</i><b>RANDOM STYLE</b><strong>VS</strong><i>CONSTRAINED SYSTEM</i><b>STILL FUTURE RENAISSANCE</b></div></div>' +
    '</section>',

    '<section class="fr-slide fr-leaderboard" data-slide-id="leaderboard" data-scene="leaderboard" data-label="Live leaderboard">' +
      frameTop("09", "leaderboard") +
      '<div class="leaderboard-heading"><div><span class="eyebrow" data-reveal data-i18n="leaderboard.kicker">LIVE LEADERBOARD</span><h2 data-reveal data-i18n="leaderboard.title">PARTICIPATION BECOMES VISIBLE.</h2></div></div>' +
      '<div class="leaderboard-shell" data-crystallize>' +
        '<div class="leaderboard-head"><span data-i18n="leaderboard.rank">RANK</span><span data-i18n="leaderboard.participant">PARTICIPANT</span><span data-i18n="leaderboard.role">ROLE</span><span data-i18n="leaderboard.missions">ACTIVITIES</span><span data-i18n="leaderboard.action">ACTION</span><span data-i18n="leaderboard.score">SCORE</span><span data-i18n="leaderboard.reward">REWARD</span></div>' +
        '<div id="leaderboard-rows" class="leaderboard-rows" aria-hidden="true"></div>' +
        '<table id="leaderboard-semantic" class="sr-only"><caption>Live participation ranking interface</caption><thead><tr><th>Rank</th><th>Participant</th><th>Role</th><th>Activities</th><th>Action</th><th>Score</th><th>Reward</th></tr></thead><tbody></tbody></table>' +
      '</div>' + star("leader-star") +
    '</section>',

    '<section class="fr-slide fr-deliverables" data-slide-id="measurement" data-scene="structured" data-label="Measurement">' +
      frameTop("10", "measurement") +
      '<div class="deliverables-heading"><span class="eyebrow" data-reveal>MEASUREMENT + MEDIA</span><h2 data-reveal>AXIS OPERATES A MEASURED EVENT.</h2><p data-reveal>Production assets and verified operational records are separated, so the night can be understood as both cultural output and system performance.</p></div>' +
      '<div class="media-included" data-reveal><h3>MEDIA PRODUCTION INCLUDED</h3><div>' + mediaDeliverables.map(deliverableButton).join("") + '</div></div>' +
      '<div class="report-included" data-crystallize><h3>POST-EVENT DELIVERY</h3><div>' + reportDeliverables.map(deliverableButton).join("") + '</div></div>' +
      '<div class="deliverables-note" data-reveal><b>MEASURED</b><span>Attendance · check-ins · activity participation · Claude activations · live coding interaction · reward redemption · hospitality usage · screen interactions · content produced</span></div>' +
    '</section>',

    '<section class="fr-slide fr-offer" data-slide-id="event-partner" data-scene="structured" data-label="Tech Week activity layer">' +
      frameTop("11", "activity-layer") +
      '<div class="offer-heading"><span class="eyebrow" data-reveal>WHAT AXIS BRINGS</span><h2 data-reveal>TECH WEEK ACTIVITY LAYER.</h2></div>' +
      '<div class="offer-card" data-crystallize>' +
        '<div class="offer-card-head"><div><span>FUTURE RENAISSANCE</span><b>1 NIGHT</b><small>' + event.displayDate.toUpperCase() + ' · ' + event.venue.toUpperCase() + '</small></div>' + conceptNode("offer-status", "official-status", '<span>FIRST OFFICIAL</span><b>ANTHROPIC CLAUDE AI COMMUNITY PARTY</b>', "official Claude community party status") + '</div>' +
        '<p>Additional Tech Week and technology partners participate through small, distributed, digital-first activities integrated into Future Renaissance. Claude holds flagship status; the other partners operate at a smaller scale.</p>' +
        '<div class="offer-enforce">SMALL · DISTRIBUTED · INTERACTIVE · INTEGRATED. NOT A CONFERENCE HALL, AN EXPO OR A BOOTH FARM.</div>' +
        '<div class="offer-budget"><span>WHERE AXIS INVESTS</span>' +
          event.allocation.map(allocationCell).join("") +
        '</div>' +
        '<div class="offer-proof"><span>AI INFRASTRUCTURE</span><span>DEVELOPER PRODUCTS</span><span>ONCHAIN + PAYMENTS</span><span>DIGITAL ART</span><span>HARDWARE</span><span>CONSUMER TECH</span></div>' +
      '</div>' +
      '<div class="offer-inventory" data-reveal><h3>AXIS OPERATES</h3><div>' + offerItems.map(offerItem).join("") + '</div></div>' +
      '<div class="offer-cycle" data-reveal><span>DISCOVER</span><i>→</i><span>PARTICIPATE</span><i>→</i><span>VALIDATE</span><i>→</i><span>DRINK / REWARD</span><i>→</i><span>DOCUMENT</span></div>' +
    '</section>',

    '<section class="fr-slide fr-presenting claude-slide" data-slide-id="presenting" data-scene="presenting-product" data-label="Claude by Anthropic">' +
      '<header class="fr-frame-top claude-frame-top" data-reveal>' +
        '<div class="fr-lockup"><img class="claude-mark" src="' + claudeRoot + '/claude-logo-slate.svg" alt="Claude"></div>' +
        '<div class="fr-coordinate"><span>12 / 15</span><span data-i18n="nav.claude">CLAUDE</span></div>' +
      '</header>' +
      '<div class="claude-body">' +
        '<div class="claude-copy">' +
          '<span class="eyebrow" data-reveal data-i18n="claude.kicker">CLAUDE BY ANTHROPIC</span>' +
          '<h2 data-reveal data-i18n="claude.title">FIRST OFFICIAL ANTHROPIC CLAUDE AI COMMUNITY PARTY.</h2>' +
          '<p class="claude-meta" data-reveal>MEXICO TECH WEEK 2026 · ' + event.city.toUpperCase() + '<br>' + event.attendees + ' EXPECTED FUTURE RENAISSANCE GUESTS</p>' +
          '<p class="claude-flagship" data-reveal data-i18n="claude.flagship">A FUTURE RENAISSANCE FLAGSHIP POWERED BY AXIS</p>' +
        '</div>' +
        '<div class="claude-object" data-crystallize>' +
          '<img class="claude-spark" src="' + claudeRoot + '/claude-spark-clay.svg" alt="" aria-hidden="true">' +
          '<img class="claude-wordmark" src="' + claudeRoot + '/claude-logo-slate.svg" alt="Claude by Anthropic">' +
        '</div>' +
        '<div class="claude-markers" data-reveal>' +
          conceptNode("claude-marker", "claude-access", '<span>COMPLIMENTARY CLAUDE ACCESS</span>', "complimentary Claude access") +
          conceptNode("claude-marker", "claude-credits", '<span>CLAUDE CREDITS</span>', "Claude credits") +
          conceptNode("claude-marker", "claude-ai", '<span>CLAUDE AI</span>', "Claude AI") +
          conceptNode("claude-marker", "claude-code", '<span>CLAUDE CODE</span>', "Claude Code") +
          conceptNode("claude-marker", "claude-live-creation", '<span>LIVE CREATION</span>', "live creation") +
          conceptNode("claude-marker", "claude-community", '<span>COMMUNITY INTERACTION</span>', "community interaction") +
        '</div>' +
      '</div>' +
    '</section>',

    '<section class="fr-slide fr-signature" data-slide-id="signature" data-scene="signature-product" data-label="Future Renaissance at the venue">' +
      frameTop("13", "venue") +
      '<div class="signature-heading"><span class="eyebrow" data-reveal data-i18n="venue.kicker">VENUE INTEGRATION</span><h2 data-reveal>FUTURE RENAISSANCE<br>AT ' + event.venue.toUpperCase() + '.</h2><p data-reveal data-i18n="venue.definition">A proposed experience flow across the night. Zones are conceptual until the venue technical inventory is confirmed.</p></div>' +
      '<div class="signature-stage" data-crystallize>' + orbitalSvg("signature-orbit") +
        '<div class="venue-core"><b>' + event.venue.toUpperCase() + '</b><span>' + event.city.toUpperCase() + '</span><small>' + event.displayDate.toUpperCase() + '</small></div>' +
        '<div class="venue-zones">' + venueZones.map(function (zone, index) {
          return conceptNode("venue-zone vz-" + (index + 1), zone[0],
            '<i>' + glyph(zone[2]) + '</i><span><em>' + String(index + 1).padStart(2, "0") + '</em>' + zone[1] + '</span>',
            zone[1].toLowerCase());
        }).join("") + '</div>' +
      '</div>' +
      '<p class="signature-note" data-reveal data-i18n="venue.note">Future Renaissance guests and existing venue clientele can occupy the same environment where agreed. This is an event layer inside the venue, not a closed bubble.</p>' +
    '</section>',

    '<section class="fr-slide fr-continuation" data-slide-id="continuation" data-scene="continuation" data-label="Production and requirements">' +
      frameTop("14", "production") +
      '<div class="continuation-heading"><span class="eyebrow" data-reveal data-i18n="continuation.kicker">BEFORE / LIVE / AFTER</span><h2 data-reveal data-i18n="continuation.title">WHAT AXIS OPERATES. WHAT THE VENUE PROVIDES.</h2></div>' +
      '<div class="temporal-system" data-crystallize>' + orbitalSvg("temporal-orbit") +
        '<div class="time-core"><b>FUTURE<br>RENAISSANCE</b><span>' + event.displayDate.toUpperCase() + '</span></div>' +
        conceptNode("time-state ts1", "time-before", '<span data-i18n="continuation.world">BEFORE</span><b data-i18n="continuation.before">LOAD-IN</b><small data-i18n="continuation.beforeCopy">Technical access · rehearsal · soundcheck · screen routing</small>', "before the event") +
        conceptNode("time-state ts2", "time-live", '<span data-i18n="continuation.people">LIVE</span><b data-i18n="continuation.live">THE NIGHT</b><small data-i18n="continuation.liveCopy">Programming · Claude activity · live coding · hospitality</small>', "live event operation") +
        conceptNode("time-state ts3", "time-after", '<span data-i18n="continuation.systems">AFTER</span><b data-i18n="continuation.after">DOCUMENTATION</b><small data-i18n="continuation.afterCopy">Content · recap material · participation summary</small>', "after the event") +
        conceptNode("time-state ts4", "time-continuation", '<span data-i18n="continuation.proof">REQUIRED</span><b>SCREENS</b><small data-i18n="continuation.screens">VENUE-PROVIDED DISPLAY INFRASTRUCTURE REQUIRED</small>', "screen requirement") +
      '</div>' +
      '<div class="venue-requirements" data-reveal><span>VENUE PROVIDES</span><div>' + venueRequirements.map(function (req) {
        return conceptNode("requirement-item", req[0], '<i>' + glyph(req[3]) + '</i><span><b>' + req[1] + '</b><small>' + req[2] + '</small></span>', req[1].toLowerCase());
      }).join("") + '</div></div>' +
    '</section>',

    '<section class="fr-slide fr-close" data-slide-id="close" data-scene="closing" data-label="Close">' +
      '<div class="close-poster" data-crystallize><img loading="lazy" src="' + poster + '" alt="Official Future Renaissance poster"></div>' +
      '<div class="close-panel">' +
        '<div class="close-lockup" data-reveal>' + axisMark("gold") + '<div><span>AXIS</span><small data-i18n="brand.techWeek">TECH WEEK MEXICO EDITION</small></div></div>' +
        '<span class="eyebrow" data-reveal data-i18n="close.kicker">FUTURE RENAISSANCE AT ' + event.venue.toUpperCase() + '</span>' +
        '<div class="close-offers" data-reveal>' +
          conceptNode("close-offer is-presenting", "official-status", '<span data-i18n="close.official">FIRST OFFICIAL ANTHROPIC CLAUDE AI COMMUNITY PARTY</span><strong>' + event.attendees + ' EXPECTED GUESTS</strong>', "official Claude community party") +
          conceptNode("close-offer", "close-hospitality", '<span data-i18n="close.hospitality">COMPLIMENTARY HOSPITALITY</span><strong data-i18n="close.hospitalityValue">FUNDED BY AXIS</strong>', "complimentary hospitality funded by AXIS") +
        '</div>' +
        '<div class="allocation" data-reveal><span class="allocation-label">WHERE AXIS INVESTS</span>' + event.allocation.map(function (entry) {
          return conceptNode("allocation-item", entry.id, '<b>' + entry.title + '</b><small>' + entry.note + '</small>', entry.title.toLowerCase());
        }).join("") + '</div>' +
        '<div class="close-event" data-reveal><b>' + event.displayDate.toUpperCase() + '</b><span>' + event.venue.toUpperCase() + ' · ' + event.city.toUpperCase() + '</span><strong>FUTURE RENAISSANCE</strong><a href="https://axis.show" target="_blank" rel="noopener noreferrer">AXIS.SHOW</a></div>' +
      '</div>' + star("close-star") +
    '</section>'
  ];

  var artistModal = '<div class="artist-modal" id="artist-modal" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="artist-modal-name" aria-describedby="artist-modal-bio">' +
    '<div class="artist-modal-backdrop" data-artist-modal-close></div>' +
    '<article class="artist-modal-panel" tabindex="-1">' +
      '<button class="artist-modal-close" type="button" data-artist-modal-close aria-label="Close artist profile"><span aria-hidden="true">×</span></button>' +
      '<div class="artist-modal-medal" aria-hidden="true"><img src="' + root + '/badges/roles/artist.svg" alt=""></div>' +
      '<div class="artist-modal-copy">' +
        '<span class="artist-modal-kind" id="artist-modal-kind">ARTIST</span>' +
        '<h2 id="artist-modal-name">ARTIST</h2>' +
        '<p class="artist-modal-discipline" id="artist-modal-discipline"></p>' +
        '<p class="artist-modal-bio" id="artist-modal-bio"></p>' +
        '<div class="artist-modal-meta"><span data-i18n="artist.identity">IDENTITY / INDEX</span><strong id="artist-modal-identity"></strong></div>' +
        '<a class="artist-modal-link" id="artist-modal-link" href="#" target="_blank" rel="noopener noreferrer"><span id="artist-modal-link-label">VIEW ARTIST</span><i aria-hidden="true">↗</i></a>' +
      '</div>' +
    '</article>' +
  '</div>';

  var conceptModal = '<div class="concept-modal" id="concept-modal" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="concept-modal-title" aria-describedby="concept-modal-summary">' +
    '<div class="concept-modal-backdrop" data-concept-modal-close></div>' +
    '<article class="concept-modal-panel" tabindex="-1">' +
      '<button class="concept-modal-close" type="button" data-concept-modal-close aria-label="Close concept details"><span aria-hidden="true">×</span></button>' +
      '<div class="concept-modal-orbit" aria-hidden="true">' + orbitalSvg("concept-modal-rings") + '<span id="concept-modal-index">01</span>' + star("concept-modal-star") + '</div>' +
      '<div class="concept-modal-copy">' +
        '<span class="concept-modal-code" id="concept-modal-code">SYSTEM / DETAIL</span>' +
        '<h2 id="concept-modal-title">CONCEPT</h2>' +
        '<p id="concept-modal-summary"></p>' +
        '<ol id="concept-modal-details"></ol>' +
        '<span class="concept-modal-foot">AXIS · FUTURE RENAISSANCE · SYSTEM DETAIL</span>' +
      '</div>' +
    '</article>' +
  '</div>';

  var stage = document.getElementById("stage");
  if (stage) stage.innerHTML = slides.join("") + artistModal + conceptModal;
})();
