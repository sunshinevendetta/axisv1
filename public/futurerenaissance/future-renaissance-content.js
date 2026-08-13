(function () {
  "use strict";

  var event = window.FUTURE_RENAISSANCE;
  var root = "/futurerenaissance/brand-assets/axis_future_renaissance_brand_assets";
  var orientation = document.documentElement.dataset.orientation || "horizontal";
  var poster = orientation === "vertical"
    ? "/futurerenaissance/poster-vertical.png"
    : "/futurerenaissance/poster-horizontal.png";

  function money(value) {
    return "$" + Number(value).toLocaleString("en-US") + " USD";
  }

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

  function missionBadge(name, index) {
    var slug = name.toLowerCase();
    return '<li class="mission-step" data-reveal><button class="mission-badge concept-trigger" type="button" data-mission-index="' + index + '" data-concept-id="mission-' + slug + '" aria-label="Open ' + name.toLowerCase() + ' mission details">' +
      '<img loading="lazy" src="' + root + '/badges/missions/' + slug + '.svg" alt="' + name + ' mission badge">' +
      '<span>' + name + '</span><i aria-hidden="true">' + (index < 7 ? "›" : "✦") + '</i></button>' +
    '</li>';
  }

  function conceptNode(className, id, content, label) {
    return '<button class="' + className + ' concept-trigger" type="button" data-concept-id="' + id + '" aria-label="Open details about ' + (label || id) + '">' + content + '</button>';
  }

  function systemItem(className, item, index) {
    return conceptNode(className, item[0], '<i>' + String(index + 1).padStart(2, "0") + '</i><span><b>' + item[1] + '</b><small>' + item[2] + '</small></span>', item[1]);
  }

  function formatGroup(group) {
    return '<section class="format-group fg-' + group.key + '"><h3>' + group.letter + '. ' + group.title + '</h3><div>' +
      group.items.map(function (item, index) { return systemItem("format-item", item, index); }).join("") +
    '</div></section>';
  }

  function cycleNode(item, index) {
    return conceptNode("system-cycle-node scn-" + (index + 1), item[0], '<i>' + String(index + 1).padStart(2, "0") + '</i><b>' + item[1] + '</b>', item[1]);
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

  var roles = ["ARTIST", "CREATOR", "AGENT", "PARTNER", "PRESS", "OPERATOR", "GUEST", "COLLECTOR"];
  var missions = ["CONNECT", "CHECK-IN", "CREATE", "INTERVENE", "VOTE", "COLLECT", "STREAM", "COMPLETE"];
  var musicArtists = ["saturna", "isaac-olmos", "lulu", "malu-go"];
  var digitalArtists = ["alexa-carlota", "arvakerm", "fabiola-larios", "jazmineci"];
  var formatGroups = [
    { key: "a", letter: "A", title: "CULTURE", items: [
      ["format-gallery", "ART GALLERY", "Digital works presented inside the event environment."],
      ["format-djs", "DJ SETS", "Live music programming recorded for post-event use."],
      ["format-mapping", "VIDEO MAPPING", "Projected visuals authored for Owl Condesa."],
    ] },
    { key: "b", letter: "B", title: "ON-SITE MEDIA", items: [
      ["format-led", "12 M LED SCREEN", "Mapping, onboarding, missions and reward states."],
      ["format-stream", "LIVESTREAM RECORDING", "Live or recorded broadcast captured on site."],
      ["format-photo", "PHOTOGRAPHY", "Event archive, product use and post-event video."],
    ] },
    { key: "c", letter: "C", title: "CONTENT PRODUCTION", items: [
      ["format-aftermovie", "AFTERMOVIE", "Edited recap material prepared for brand use."],
      ["format-testimonials", "TESTIMONIAL CAPTURE", "Guest and artist quotes when available."],
      ["format-collectibles", "POST-EVENT COLLECTIBLES", "Selected moments can become digital assets."],
    ] },
    { key: "d", letter: "D", title: "ACCESS SYSTEM", items: [
      ["format-passport", "MISSION PASSPORT", "A readable guest state opens the interaction path."],
      ["format-nfc", "AXIS NFC / QR", "Fast entry into the selected sponsor mission."],
      ["format-onboarding", "ONBOARDING SCREENS", "Clear instructions before any action begins."],
    ] },
    { key: "e", letter: "E", title: "EVENT FLOW", items: [
      ["format-staff", "STAFF-GUIDED FLOW", "Staff supports actions, validation and exceptions."],
      ["format-reward", "REWARD REDEMPTION", "Action and benefit remain two distinct gates."],
      ["format-guestlist", "SELECTED GUESTLIST", "120 attendees across cultural and partner networks."],
    ] },
    { key: "f", letter: "F", title: "ACTIONS + REPORTING", items: [
      ["format-action", "SPONSOR ACTION", "One useful behavior defined before the event."],
      ["format-flow", "REWARD FLOW", "Register, act, validate, unlock a drink or reward, and report."],
      ["format-report", "POST-EVENT REPORT", "Participation, redemptions, content and attendance."],
    ] },
  ];
  var systemCycle = [
    ["system-produce", "AXIS PRODUCES THE FORMAT"],
    ["system-build", "AXIS BUILDS THE REWARD LAYER"],
    ["system-arrive", "GUESTS ARRIVE ON SITE"],
    ["system-enter", "GUESTS TAP NFC / QR"],
    ["system-mission", "SPONSOR MISSION STARTS"],
    ["system-action", "GUEST COMPLETES THE ACTION"],
    ["system-validate", "STAFF / SYSTEM VALIDATES"],
    ["system-reward", "DRINK / REWARD UNLOCKS"],
    ["system-score", "SCORE + TIER UPDATE"],
    ["system-leaderboard", "LEADERBOARD REFLECTS IT"],
    ["system-capture", "AXIS CAPTURES THE EXPERIENCE"],
    ["system-report", "THE BRAND GETS THE REPORT"],
  ];
  var mediaDeliverables = [
    ["deliverable-photography", "PHOTOGRAPHY"], ["deliverable-aftermovie", "AFTERMOVIE"],
    ["deliverable-livestream", "LIVESTREAM RECORDING"], ["deliverable-clips", "SHORT CLIPS"],
    ["deliverable-placement", "PLACEMENT CAPTURES"], ["deliverable-led", "LED INTERVENTION"],
    ["deliverable-mapping", "PROJECTION MAPPING"], ["deliverable-guest-testimonials", "GUEST TESTIMONIALS"],
    ["deliverable-artist-testimonials", "ARTIST TESTIMONIALS"], ["deliverable-social", "SOCIAL CONTENT"],
  ];
  var reportDeliverables = [
    ["report-photo-folder", "PHOTO FOLDER"], ["report-aftermovie", "AFTERMOVIE MATERIAL"],
    ["report-short-clips", "SHORT VIDEO CLIPS"], ["report-placement", "PLACEMENT CAPTURES"],
    ["report-actions", "QUALIFIED ACTION COUNT"], ["report-participation", "MISSION PARTICIPATION COUNT"],
    ["report-attendance", "ATTENDANCE ESTIMATE"], ["report-redemptions", "REWARD REDEMPTION COUNT"],
    ["report-social", "SOCIAL ACTIONS"], ["report-collectibles", "MINTED COLLECTIBLES WHEN AVAILABLE"],
    ["report-testimonials", "TESTIMONIAL EXCERPTS WHEN AVAILABLE"], ["report-written", "BRIEF WRITTEN REPORT"],
  ];
  var offerItems = [
    ["offer-mission-entry", "AXIS NFC / QR mission entry"], ["offer-rewards", "Reward inventory"],
    ["offer-mission-design", "Sponsor mission design"], ["offer-validation", "Staff and system validation"],
    ["offer-onboarding", "Onboarding screen presence"], ["offer-redemption", "Reward redemption control"],
    ["offer-led", "12 m LED visual integration"], ["offer-mapping", "Projection mapping placement"],
    ["offer-gallery", "Art gallery placement"], ["offer-livestream", "Livestream / recording placement"],
    ["offer-photography", "Photography"], ["offer-aftermovie", "Aftermovie inclusion"],
    ["offer-testimonials", "Testimonial capture"], ["offer-product", "Product-use documentation"],
    ["offer-participation", "Qualified action tracking"], ["offer-placement", "Placement captures"],
    ["offer-attendance", "Attendance report"], ["offer-performance", "Post-event performance report"],
  ];

  var slides = [
    '<section class="fr-slide fr-cover is-active" data-slide-id="cover" data-scene="cover" data-label="Cover">' +
      '<div class="cover-poster" data-crystallize><img src="' + poster + '" alt="Official Future Renaissance poster"></div>' +
      '<div class="cover-data" data-reveal>' +
        axisMark("ivory") +
        '<span class="eyebrow" data-i18n="brand.techWeek">TECH WEEK MEXICO EDITION</span>' +
        '<h1>Future <em>Renaissance</em></h1>' +
        '<p>' + event.displayDate.toUpperCase() + '<br>' + event.city.toUpperCase() + '</p>' +
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
      '</div>' +
      '<div class="idea-visual" data-crystallize>' +
        '<img loading="lazy" src="' + root + '/social/stream-cover.png" alt="Future Renaissance classical figure and orbital architecture">' +
        '<div class="dither-screen" aria-hidden="true"></div>' + orbitalSvg("idea-orbit") +
      '</div>' + star("idea-star") +
    '</section>',

    '<section class="fr-slide fr-event" data-slide-id="event" data-scene="event-map" data-label="The event">' +
      frameTop("03", "event") +
      '<div class="event-photo" data-crystallize><img loading="lazy" src="/futurerenaissance/event-crowd.jpg" alt="Crowd and LED installation inside Owl Condesa"><div class="dither-screen" aria-hidden="true"></div></div>' +
      '<div class="fr-reading event-heading">' +
        '<span class="eyebrow" data-reveal data-i18n="event.kicker">THE EVENT</span>' +
        '<h2 data-reveal>' + event.displayDate.toUpperCase() + '</h2>' +
        '<p class="venue-lock" data-reveal>' + event.venue.toUpperCase() + '<br>' + event.city.toUpperCase() + '</p>' +
      '</div>' +
      '<div class="event-operating-map" data-reveal>' +
        conceptNode("event-core", "venue", '<strong>' + event.attendees + '</strong><span data-i18n="event.attendees">ATTENDEES</span>', "Owl Condesa and the event format") +
        '<div class="event-node n1" data-i18n="program.art">ART</div><div class="event-node n2" data-i18n="program.music">MUSIC</div>' +
        '<div class="event-node n3" data-i18n="program.technology">TECHNOLOGY</div><div class="event-node n4" data-i18n="program.culture">CULTURE</div>' +
        '<div class="event-node n5" data-i18n="program.hospitality">HOSPITALITY</div><div class="event-node n6" data-i18n="program.missions">MISSIONS</div>' +
        '<div class="event-node n7" data-i18n="program.livestream">LIVESTREAM</div>' +
        orbitalSvg("event-orbit") +
      '</div>' +
      '<div class="artist-lineups" data-reveal>' +
        artistLineup("event.musicCuration", "MUSIC CURATION / RITMOS DE LA NOCHE", musicArtists) +
        artistLineup("event.digitalLineup", "DIGITAL ARTIST LINEUP", digitalArtists) +
      '</div>' +
    '</section>',

    '<section class="fr-slide fr-audience" data-slide-id="audience" data-scene="badges" data-label="The audience">' +
      frameTop("04", "audience") +
      '<div class="audience-copy">' +
        '<span class="eyebrow" data-reveal data-i18n="audience.kicker">THE AUDIENCE</span>' +
        '<h2 data-reveal><strong>' + event.attendees + '</strong> <span data-i18n="audience.title">SELECTED GUESTS.</span></h2>' +
        '<p data-reveal data-i18n="audience.copy">Artists, musicians, builders, founders, collectors, curators, creators, media, operators and selected cultural guests.</p>' +
      '</div>' +
      '<div class="role-orbit" aria-label="Future Renaissance audience roles">' + orbitalSvg("role-orbit-lines") +
        roles.map(function (role, index) { return roleBadge(role, "role-pos-" + (index + 1)); }).join("") +
        '<div class="role-orbit-core" data-crystallize>' + axisMark("gold") + '<span data-i18n="audience.accessState">ROLE / ACCESS / AUTHORITY</span></div>' +
      '</div>' + star("audience-star") +
    '</section>',

    '<section class="fr-slide fr-format" data-slide-id="program" data-scene="structured" data-label="Event format">' +
      frameTop("05", "event-format") +
      '<div class="format-titlebar"><div><span class="eyebrow" data-reveal>EVENT FORMAT</span><h2 data-reveal>ONE ROOM. SIX OPERATING LAYERS.</h2></div><p data-reveal>Future Renaissance puts culture, media capture, access, guest rewards and sponsor reporting into one authored environment.</p></div>' +
      '<div class="event-format-map" data-crystallize>' +
        '<div class="format-hub" aria-hidden="true">' + axisMark("gold") + '<span>FUTURE<br>RENAISSANCE</span></div>' +
        formatGroups.map(formatGroup).join("") +
      '</div>' +
    '</section>',

    '<section class="fr-slide fr-system-flow" data-slide-id="roles" data-scene="structured" data-label="How it works">' +
      frameTop("06", "how-it-works") +
      '<div class="system-flow-heading"><span class="eyebrow" data-reveal>SYSTEM DESIGN</span><h2 data-reveal>HOW IT WORKS.</h2></div>' +
      '<div class="system-cycle" data-crystallize>' + orbitalSvg("system-cycle-rings") +
        '<div class="system-cycle-hub">' + axisMark("gold") + '<b>AXIS</b><p>From format and guest entry to reward, capture and final report.</p></div>' +
        systemCycle.map(cycleNode).join("") +
      '</div>' +
      '<div class="system-phase phase-a">' + conceptNode("phase-card", "phase-produce", '<i>A</i><b>FUND + PRODUCE</b><p>AXIS authors the format, sponsor function, mission, validation and reward layer before doors open.</p>', "fund and produce") + '</div>' +
      '<div class="system-phase phase-b">' + conceptNode("phase-card", "phase-live", '<i>B</i><b>ON-SITE FLOW</b><p>Guests enter, act, validate, unlock rewards and advance through the live participation system.</p>', "on-site flow") + '</div>' +
      '<div class="system-phase phase-c">' + conceptNode("phase-card", "phase-report", '<i>C</i><b>CAPTURE + REPORT</b><p>AXIS documents the activation and delivers participation, redemption and media evidence.</p>', "capture and report") + '</div>' +
    '</section>',

    '<section class="fr-slide fr-components" data-slide-id="missions" data-scene="structured" data-label="Experience components">' +
      frameTop("07", "experience-components") +
      '<div class="components-copy"><span class="eyebrow" data-reveal>EXPERIENCE COMPONENTS</span><h2 data-reveal>THE FORMAT STARTS WITH THE GUEST.</h2><p data-reveal>Every sponsor activation is distributed across four concrete blocks. Nothing exists as isolated logo placement.</p>' +
        '<div class="components-table" data-reveal><span>EXPERIENCE COMPONENTS</span>' +
          conceptNode("component-row", "component-rewards", '<i>01</i><b>REWARDS</b><small>GUEST BENEFIT</small>', "rewards") +
          conceptNode("component-row", "component-operations", '<i>02</i><b>OPERATIONS</b><small>ON-SITE EXECUTION</small>', "operations") +
          conceptNode("component-row", "component-capture", '<i>03</i><b>CAPTURE</b><small>MEDIA PRODUCTION</small>', "capture") +
          conceptNode("component-row", "component-integration", '<i>04</i><b>INTEGRATION</b><small>VISUAL + TECHNICAL</small>', "integration") +
        '</div>' +
      '</div>' +
      '<div class="components-diagram" data-crystallize>' +
        '<div class="components-donut"><i></i><div><b>TOTAL</b><span>EXPERIENCE<br>SYSTEM</span><p>Mission, action, validation, reward, media and report operate as one whole.</p></div></div>' +
        conceptNode("component-call cc1", "component-rewards", '<i>01</i><b>REWARDS</b><strong>ATTENDEE VALUE</strong><p>Benefits unlock only after the selected behavior is verified.</p>', "rewards") +
        conceptNode("component-call cc2", "component-operations", '<i>02</i><b>OPERATIONS</b><strong>ON-SITE FLOW</strong><p>Staff guidance, access, validation, exceptions and redemption.</p>', "operations") +
        conceptNode("component-call cc3", "component-capture", '<i>03</i><b>CAPTURE</b><strong>MEDIA PRODUCTION</strong><p>Photography, video, product use, placement and testimonials.</p>', "capture") +
        conceptNode("component-call cc4", "component-integration", '<i>04</i><b>INTEGRATION</b><strong>VISUAL SYSTEMS</strong><p>LED, mapping, onboarding, missions and reward states.</p>', "integration") +
        '<div class="components-takeaway">' + axisMark("ivory") + '<p>Guests experience the function.<br>The brand receives the evidence.</p></div>' +
      '</div>' +
    '</section>',

    '<section class="fr-slide fr-reward-flow" data-slide-id="brand-function" data-scene="structured" data-label="Reward flow">' +
      frameTop("08", "reward-flow") +
      '<div class="reward-heading"><span class="eyebrow" data-reveal>SYSTEM DESIGN</span><h2 data-reveal>REWARD FLOW.</h2></div>' +
      '<div class="reward-compare" data-reveal>' +
        '<div class="giveaway-card"><span>BASIC GIVEAWAY</span><ul><li>Passive and easily forgotten</li><li>No access layer</li><li>No measurable registration</li><li>No clear reporting</li><li>Ends at delivery</li></ul></div>' +
        '<div class="axis-system-card"><span>AXIS PARTICIPATION SYSTEM</span><ul><li>Staff-guided</li><li>Readable guest state</li><li>Verified action</li><li>Controlled redemption</li><li>Post-event report</li></ul></div>' +
      '</div>' +
      '<div class="reward-cycle" data-crystallize>' +
        '<div class="reward-cycle-hub">' + axisMark("gold") + '<b>[brand]</b><p>The experience becomes action, access, benefit, content and report.</p></div>' +
        conceptNode("reward-step rs1", "dynamic-register", '<i>01</i><b>REGISTER</b>', "register") +
        conceptNode("reward-step rs2", "system-mission", '<i>02</i><b>MISSION</b>', "mission") +
        conceptNode("reward-step rs3", "dynamic-act", '<i>03</i><b>ACT</b>', "act") +
        conceptNode("reward-step rs4", "dynamic-verify", '<i>04</i><b>VALIDATE</b>', "validate") +
        conceptNode("reward-step rs5", "system-reward", '<i>05</i><b>DRINK / REWARD</b>', "drink or reward") +
        conceptNode("reward-step rs6", "system-score", '<i>06</i><b>ADVANCE</b>', "advance") +
        conceptNode("reward-step rs7", "system-capture", '<i>07</i><b>CAPTURE</b>', "capture") +
        conceptNode("reward-step rs8", "system-report", '<i>08</i><b>REPORT</b>', "report") +
      '</div>' +
      '<div class="reward-memory" data-reveal><span>WHY GUESTS REMEMBER</span><p>People remember who gave them access, what action they completed and what benefit they unlocked.</p><div><i>LOGO PLACEMENT</i><b>SEEN, FORGOTTEN</b><strong>VS</strong><i>PARTICIPATION SYSTEM</i><b>ACCESS, ACTION, REWARD, PROOF</b></div></div>' +
    '</section>',

    '<section class="fr-slide fr-leaderboard" data-slide-id="leaderboard" data-scene="leaderboard" data-label="Live leaderboard">' +
      frameTop("09", "leaderboard") +
      '<div class="leaderboard-heading"><div><span class="eyebrow" data-reveal data-i18n="leaderboard.kicker">LIVE LEADERBOARD</span><h2 data-reveal data-i18n="leaderboard.title">PARTICIPATION BECOMES VISIBLE.</h2></div></div>' +
      '<div class="leaderboard-shell" data-crystallize>' +
        '<div class="leaderboard-head"><span data-i18n="leaderboard.rank">RANK</span><span data-i18n="leaderboard.participant">PARTICIPANT</span><span data-i18n="leaderboard.role">ROLE</span><span data-i18n="leaderboard.missions">MISSIONS</span><span>[brand] ACTION</span><span data-i18n="leaderboard.score">SCORE</span><span data-i18n="leaderboard.reward">REWARD</span></div>' +
        '<div id="leaderboard-rows" class="leaderboard-rows" aria-hidden="true"></div>' +
        '<table id="leaderboard-semantic" class="sr-only"><caption>Live participation ranking interface</caption><thead><tr><th>Rank</th><th>Participant</th><th>Role</th><th>Missions</th><th>[brand] action</th><th>Score</th><th>Reward</th></tr></thead><tbody></tbody></table>' +
      '</div>' + star("leader-star") +
    '</section>',

    '<section class="fr-slide fr-deliverables" data-slide-id="measurement" data-scene="structured" data-label="Deliverables">' +
      frameTop("10", "deliverables") +
      '<div class="deliverables-heading"><span class="eyebrow" data-reveal>INSIGHTS + DELIVERY</span><h2 data-reveal>WHAT THE BRAND RECEIVES AFTER THE EVENT.</h2><p data-reveal>Production assets and verified operational records are separated so the sponsor can see both cultural output and system performance.</p></div>' +
      '<div class="media-included" data-reveal><h3>MEDIA PRODUCTION INCLUDED</h3><div>' + mediaDeliverables.map(deliverableButton).join("") + '</div></div>' +
      '<div class="report-included" data-crystallize><h3>POST-EVENT DELIVERY</h3><div>' + reportDeliverables.map(deliverableButton).join("") + '</div></div>' +
      '<div class="deliverables-note" data-reveal><b>MEASURED</b><span>Attendance · mission completion · qualified actions · stage conversion · reward redemption</span><b>CALCULATED WHEN DATA SUPPORTS IT</b><span>CPQA · CPA · CAC · ROI · LTV:CAC · NPV</span></div>' +
    '</section>',

    '<section class="fr-slide fr-offer" data-slide-id="event-partner" data-scene="structured" data-label="Event partner">' +
      frameTop("11", "event-partner") +
      '<div class="offer-heading"><span class="eyebrow" data-reveal>WHAT AXIS BUILDS FOR YOU</span><h2 data-reveal>EVENT PARTNER.</h2></div>' +
      '<div class="offer-card" data-crystallize>' +
        '<div class="offer-card-head"><div><span>FUTURE RENAISSANCE</span><b>1 NIGHT</b><small>' + event.displayDate.toUpperCase() + ' · ' + event.venue.toUpperCase() + '</small></div>' + conceptNode("offer-price", "partner-investment", money(event.eventPartnerPrice), "Event Partner investment") + '</div>' +
        '<p>A complete sponsor system built into the event: one defined function, one required mission, clear validation, controlled rewards, live integration, media capture and a post-event report.</p>' +
        '<div class="offer-enforce">THE INVESTMENT FUNDS THE SYSTEM. IT DOES NOT PURCHASE ATTENDEES OR GUARANTEE A COST PER ACTION.</div>' +
        '<div class="offer-budget"><span>BUDGET ALLOCATION</span>' +
          conceptNode("budget-cell", "budget-rewards", '<b>' + event.allocation.rewards + '%</b><small>REWARDS</small>', "reward allocation") +
          conceptNode("budget-cell", "budget-operations", '<b>' + event.allocation.operations + '%</b><small>OPERATIONS</small>', "operations allocation") +
          conceptNode("budget-cell", "budget-media", '<b>' + event.allocation.media + '%</b><small>MEDIA</small>', "media allocation") +
          conceptNode("budget-cell", "budget-integration", '<b>' + event.allocation.integration + '%</b><small>INTEGRATION</small>', "integration allocation") +
        '</div>' +
        '<div class="offer-proof"><span>DEFINED FUNCTION</span><span>MISSION + REWARD</span><span>VALIDATION</span><span>REPORT</span></div>' +
        '<div class="offer-allocation-notes">' +
          conceptNode("budget-explain", "budget-rewards", '<b>40% · REWARDS</b><small>Guest benefits, inventory and fulfillment</small>', "what rewards pay for") +
          conceptNode("budget-explain", "budget-operations", '<b>25% · OPERATIONS</b><small>Staff, guidance, validation and redemption</small>', "what operations pay for") +
          conceptNode("budget-explain", "budget-media", '<b>20% · MEDIA</b><small>Photography, video and delivery</small>', "what media pays for") +
          conceptNode("budget-explain", "budget-integration", '<b>15% · INTEGRATION</b><small>Mission UI, screens and reporting setup</small>', "what integration pays for") +
        '</div>' +
      '</div>' +
      '<div class="offer-inventory" data-reveal><h3>WHAT YOU GET</h3><div>' + offerItems.map(offerItem).join("") + '</div></div>' +
      '<div class="offer-cycle" data-reveal><span>REGISTER</span><i>→</i><span>ACT</span><i>→</i><span>VALIDATE</span><i>→</i><span>DRINK / REWARD</span><i>→</i><span>REPORT</span></div>' +
    '</section>',

    '<section class="fr-slide fr-presenting" data-slide-id="presenting" data-scene="presenting-product" data-label="Exclusive presenting product">' +
      frameTop("12", "presenting") +
      '<div class="presenting-heading"><span class="eyebrow" data-reveal data-i18n="presenting.exclusive">EXCLUSIVE PRESENTING PRODUCT</span><h2 data-reveal>[brand] <em data-i18n="presenting.title">BECOMES A SIGNATURE PART OF FUTURE RENAISSANCE.</em></h2><div class="presenting-price" data-reveal><strong>' + money(event.presentingProductPrice) + '</strong><span>' + event.presentingPositions + ' <i data-i18n="presenting.position">POSITION</i></span></div></div>' +
      '<div class="presenting-object" data-crystallize>' +
        '<div class="product-halo" data-orbit-loop></div>' + conceptNode("product-vessel", "presenting-system", '<span>[brand]</span><b data-i18n="presenting.signature">SIGNATURE PRODUCT EXPERIENCE</b>' + star("product-star"), "the presenting product system") +
        orbitalSvg("presenting-orbit") +
      '</div>' +
      '<div class="presenting-plus" data-reveal><b data-i18n="presenting.includes">EVERYTHING IN EVENT PARTNER</b><i>+</i>' + conceptNode("presenting-benefit", "presenting-exclusive", '<span>CATEGORY EXCLUSIVITY · HERO [brand] MISSION · PRIORITY INTEGRATION</span>', "presenting exclusivity") + conceptNode("presenting-benefit", "presenting-continuation", '<span>DEDICATED PRODUCT MEDIA · 30-DAY CONTINUATION · ONE ADDITIONAL AXIS ACTIVATION · EXTENDED REPORTING</span>', "presenting continuation") + '</div>' +
    '</section>',

    '<section class="fr-slide fr-signature" data-slide-id="signature" data-scene="signature-product" data-label="Signature product experience">' +
      frameTop("13", "signature") +
      '<div class="signature-heading"><span class="eyebrow" data-reveal data-i18n="signature.kicker">SIGNATURE PRODUCT EXPERIENCE</span><h2 data-reveal data-i18n="signature.title">THE PRESENTING PRODUCT BECOMES A SIGNATURE.</h2><p data-reveal data-i18n="signature.definition">AXIS creates one event-specific expression of [brand] that guests use, consume, wear, collect, activate, unlock, create with or interact with inside Future Renaissance.</p></div>' +
      '<div class="signature-stage" data-crystallize>' + orbitalSvg("signature-orbit") +
        conceptNode("signature-vessel", "signature-system", '<span data-i18n="signature.example">CONCEPT DEMONSTRATION</span><h3>THE ORBITAL</h3><b>[brand]</b><small data-i18n="signature.serve">Future Renaissance signature expression by [brand]</small>' + star("signature-star"), "Signature Product Experience") +
        conceptNode("signature-expression se1", "signature-serve", '<span data-i18n="signature.serveType">SIGNATURE SERVE</span>', "signature serve") + conceptNode("signature-expression se2", "signature-object", '<span data-i18n="signature.object">LIMITED OBJECT</span>', "limited object") + conceptNode("signature-expression se3", "signature-ritual", '<span data-i18n="signature.ritual">PRODUCT RITUAL</span>', "product ritual") + conceptNode("signature-expression se4", "signature-creation", '<span data-i18n="signature.creation">PRODUCT-POWERED CREATION</span>', "product-powered creation") + conceptNode("signature-expression se5", "signature-edition", '<span data-i18n="signature.edition">EVENT EDITION</span>', "event edition") + conceptNode("signature-expression se6", "signature-reward", '<span data-i18n="signature.reward">NAMED REWARD</span>', "named reward") +
      '</div>' +
      '<p class="signature-note" data-reveal data-i18n="signature.note">The expression is authored for the sponsor category. It is a possibility framework, not a preselected commitment.</p>' +
    '</section>',

    '<section class="fr-slide fr-continuation" data-slide-id="continuation" data-scene="continuation" data-label="Before live after">' +
      frameTop("14", "continuation") +
      '<div class="continuation-heading"><span class="eyebrow" data-reveal data-i18n="continuation.kicker">BEFORE / LIVE / AFTER</span><h2 data-reveal data-i18n="continuation.title">THE RELATIONSHIP MOVES THROUGH TIME.</h2></div>' +
      '<div class="temporal-system" data-crystallize>' + orbitalSvg("temporal-orbit") +
        '<div class="time-core"><b>FUTURE<br>RENAISSANCE</b><span>' + event.displayDate.toUpperCase() + '</span></div>' +
        conceptNode("time-state ts1", "time-before", '<span data-i18n="continuation.world">WORLD</span><b data-i18n="continuation.before">BEFORE</b><small data-i18n="continuation.beforeCopy">Activation design · mission UX · reward system</small>', "before the event") +
        conceptNode("time-state ts2", "time-live", '<span data-i18n="continuation.people">PEOPLE</span><b data-i18n="continuation.live">LIVE</b><small data-i18n="continuation.liveCopy">Required action · product use · media · measurement</small>', "live event operation") +
        conceptNode("time-state ts3", "time-after", '<span data-i18n="continuation.systems">SYSTEMS</span><b data-i18n="continuation.after">AFTER</b><small data-i18n="continuation.afterCopy">Content · report · verified analysis</small>', "after the event") +
        conceptNode("time-state ts4", "time-continuation", '<span data-i18n="continuation.proof">PROOF</span><b>+30 DAYS</b><small data-i18n="continuation.presentingOnly">PRESENTING PRODUCT ONLY · CONTINUATION + ONE SMALLER AXIS ACTIVATION</small>', "presenting continuation") +
      '</div>' +
      '<div class="continuation-compare" data-reveal><div><b data-i18n="partner.title">EVENT PARTNER</b><span data-i18n="continuation.eventPartner">FUTURE RENAISSANCE · LIVE ACTIVATION · MEDIA · MEASUREMENT · REPORT</span></div><div><b data-i18n="presenting.exclusive">EXCLUSIVE PRESENTING PRODUCT</b><span data-i18n="continuation.presentingProduct">FUTURE RENAISSANCE + 30-DAY CONTINUATION + 1 ADDITIONAL SMALLER AXIS ACTIVATION</span></div></div>' +
    '</section>',

    '<section class="fr-slide fr-close" data-slide-id="close" data-scene="closing" data-label="Investment and close">' +
      '<div class="close-poster" data-crystallize><img loading="lazy" src="' + poster + '" alt="Official Future Renaissance poster"></div>' +
      '<div class="close-panel">' +
        '<div class="close-lockup" data-reveal>' + axisMark("gold") + '<div><span>AXIS</span><small data-i18n="brand.techWeek">TECH WEEK MEXICO EDITION</small></div></div>' +
        '<span class="eyebrow" data-reveal data-i18n="close.kicker">INVESTMENT + CLOSE</span>' +
        '<div class="close-offers" data-reveal>' + conceptNode("close-offer", "close-event-partner", '<span data-i18n="partner.title">EVENT PARTNER</span><strong>' + money(event.eventPartnerPrice) + '</strong>', "Event Partner") + conceptNode("close-offer is-presenting", "close-presenting", '<span data-i18n="presenting.exclusive">EXCLUSIVE PRESENTING PRODUCT</span><strong>' + money(event.presentingProductPrice) + '</strong><small>' + event.presentingPositions + ' <i data-i18n="presenting.position">POSITION</i></small>', "Exclusive Presenting Product") + '</div>' +
        '<div class="allocation" data-reveal>' + conceptNode("allocation-item", "budget-rewards", '<i style="--value:' + event.allocation.rewards + '%"></i><b>' + event.allocation.rewards + '%</b><small data-i18n="close.rewards">REWARDS</small>', "reward allocation") + conceptNode("allocation-item", "budget-operations", '<i style="--value:' + event.allocation.operations + '%"></i><b>' + event.allocation.operations + '%</b><small data-i18n="close.operations">OPERATIONS</small>', "operations allocation") + conceptNode("allocation-item", "budget-media", '<i style="--value:' + event.allocation.media + '%"></i><b>' + event.allocation.media + '%</b><small data-i18n="close.media">MEDIA CAPTURE</small>', "media allocation") + conceptNode("allocation-item", "budget-integration", '<i style="--value:' + event.allocation.integration + '%"></i><b>' + event.allocation.integration + '%</b><small data-i18n="close.integration">INTEGRATION</small>', "integration allocation") + '</div>' +
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
