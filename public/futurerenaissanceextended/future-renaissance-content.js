(function () {
  "use strict";

  var circuit = window.FUTURE_RENAISSANCE;
  var root = "/futurerenaissanceextended/brand-assets/axis_future_renaissance_brand_assets";
  var orientation = document.documentElement.dataset.orientation || "horizontal";
  var poster = orientation === "vertical"
    ? "/futurerenaissanceextended/poster-vertical.png"
    : "/futurerenaissanceextended/poster-horizontal.png";

  function money(value) {
    return "$" + Number(value).toLocaleString("en-US") + " USD";
  }

  function tier(id) {
    return circuit.commercialTiers.filter(function (item) { return item.id === id; })[0];
  }

  function axisMark(tone) {
    return '<img class="axis-mark" src="' + root + '/logos/axis-mark-' + (tone || "ivory") + '.png" alt="AXIS">';
  }

  function frameTop(number, key, label, tone) {
    return '<header class="fr-frame-top" data-reveal>' +
      '<div class="fr-lockup">' + axisMark(tone || "ivory") +
      '<span>AXIS</span><i></i><span data-i18n="brand.afterHours">MEXICO TECH WEEK AFTER HOURS</span></div>' +
      '<div class="fr-coordinate"><span>' + number + ' / 15</span><span data-i18n="nav.' + key + '">' + label + '</span></div>' +
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

  function conceptNode(className, id, content, label) {
    return '<button class="' + className + ' concept-trigger" type="button" data-concept-id="' + id + '" aria-label="Open details about ' + (label || id) + '">' + content + '</button>';
  }

  function timelineEvent(event, index) {
    var venue = event.venue
      ? '<small>' + event.venue.toUpperCase() + '</small>'
      : '<small data-i18n="events.venueTba">VENUE TO BE CONFIRMED</small>';
    return conceptNode(
      "frx-timeline-event frx-event-" + event.id,
      "event-" + event.id,
      '<i>' + String(index + 1).padStart(2, "0") + '</i>' +
      '<span data-i18n="events.' + event.id + '.day">' + event.day.toUpperCase() + '</span>' +
      '<b data-i18n="events.' + event.id + '.name">' + event.name.toUpperCase() + '</b>' +
      '<strong data-i18n="events.' + event.id + '.date">' + event.displayDate.toUpperCase() + '</strong>' + venue,
      event.name
    );
  }

  function houseCard(event, index) {
    return conceptNode(
      "frx-house-card frx-house-" + event.id,
      "house-" + event.id,
      '<i>0' + (index + 1) + '</i>' +
      '<span data-i18n="houses.' + event.id + '.label">' + event.house.toUpperCase() + ' HOUSE</span>' +
      '<b data-i18n="houses.' + event.id + '.character">' + event.character.toUpperCase() + '</b>' +
      '<p data-i18n="houses.' + event.id + '.music">' + event.music + '</p>',
      event.house + " House"
    );
  }

  function systemTile(item, index) {
    return '<div class="frx-system-tile" data-reveal><i>' + String(index + 1).padStart(2, "0") + '</i><b data-i18n="system.' + item + '">' + item.toUpperCase() + '</b></div>';
  }

  function flowStep(item, index) {
    var key = item.replace(" ", "-");
    return conceptNode(
      "frx-flow-step",
      "flow-" + key,
      '<i>' + String(index + 1).padStart(2, "0") + '</i><b data-i18n="flow.' + key + '">' + item.toUpperCase() + '</b><span aria-hidden="true">' + (index === circuit.guestFlow.length - 1 ? "✦" : "→") + '</span>',
      item
    );
  }

  function functionCard(item, index) {
    var key = ["wallet", "exchange", "dex", "marketplace", "launchpad", "defi", "payments"][index];
    return conceptNode(
      "frx-function-card",
      "function-" + key,
      '<i>' + String(index + 1).padStart(2, "0") + '</i><b data-i18n="functions.' + key + '.name">' + item[0].toUpperCase() + '</b><p data-i18n="functions.' + key + '.role">' + item[1] + '</p>',
      item[0]
    );
  }

  function metricPill(name, index) {
    var key = name.toLowerCase().replace(/[^a-z]+/g, "-").replace(/(^-|-$)/g, "");
    return '<div class="frx-metric-pill" data-reveal><i>' + String(index + 1).padStart(2, "0") + '</i><b data-i18n="metrics.' + key + '">' + name.toUpperCase() + '</b></div>';
  }

  var singleHouse = tier("single-house");
  var claudeParty = tier("claude-party");
  var threeHouse = tier("three-house");
  var techTown = tier("tech-town-circuit");
  var completeWeek = tier("complete-week");
  var categoryExclusive = tier("category-exclusive");
  var presenting = tier("tech-town-presenting");
  var houseEvents = circuit.events.filter(function (event) { return event.isHouse; });

  var slides = [
    '<section class="fr-slide frx-cover is-active" data-slide-id="cover" data-scene="cover" data-label="Cover">' +
      '<div class="frx-cover-art" data-crystallize><img src="' + poster + '" alt="Future Renaissance visual identity"><div class="frx-cover-shade"></div></div>' +
      '<div class="frx-cover-copy" data-reveal>' + axisMark("ivory") +
        '<span class="eyebrow" data-i18n="cover.kicker">MEXICO TECH WEEK AFTER HOURS</span>' +
        '<h1>Future <em>Renaissance</em></h1>' +
        '<p data-i18n="cover.dates">OCT 27 – NOV 1, 2026<br>MEXICO CITY</p>' +
        '<div class="frx-cover-stats"><b><strong>' + circuit.eventCount + '</strong><span data-i18n="cover.nights">NIGHTS</span></b><b><strong>' + circuit.houseCount + '</strong><span data-i18n="cover.houses">HOUSES</span></b><b><strong>1</strong><span data-i18n="cover.program">CONTINUOUS PROGRAM</span></b></div>' +
        '<div class="frx-axis-line">AXIS</div>' +
      '</div>' + orbitalSvg("frx-cover-orbit") + star("cover-star") +
    '</section>',

    '<section class="fr-slide frx-proposition" data-slide-id="proposition" data-scene="orbit-system" data-label="The proposition">' +
      frameTop("02", "proposition", "THE PROPOSITION") +
      '<div class="frx-heading frx-heading-wide"><span class="eyebrow" data-reveal data-i18n="proposition.kicker">THE PROPOSITION</span><h2 data-reveal data-i18n="proposition.title">DAYTIME CREATES CONCENTRATED COMMUNITIES. AFTER HOURS KEEPS THEM MOVING.</h2><p data-reveal data-i18n="proposition.copy">Mexico Tech Town gathers five House communities by day. Future Renaissance extends them into coordinated nighttime experiences through culture, music, technology, hospitality, and participation.</p></div>' +
      '<div class="frx-proposition-map" data-crystallize>' + orbitalSvg("frx-proposition-orbit") +
        '<div class="frx-proposition-node is-day"><span data-i18n="proposition.dayLabel">BY DAY</span><b>MEXICO<br>TECH TOWN</b><small data-i18n="proposition.dayCopy">FIVE HOUSE COMMUNITIES</small></div>' +
        '<div class="frx-proposition-bridge"><i>→</i><b>AXIS</b><small data-i18n="proposition.axisRole">HOSTS + OPERATES THE AFTER-HOURS LAYER</small></div>' +
        '<div class="frx-proposition-node is-night"><span data-i18n="proposition.nightLabel">AFTER HOURS</span><b>FUTURE<br>RENAISSANCE</b><small data-i18n="proposition.nightCopy">ONE CONTINUOUS CULTURAL PROGRAM</small></div>' +
      '</div>' +
      '<div class="frx-positioning" data-reveal data-i18n="proposition.positioning">MEXICO TECH TOWN BY DAY. FUTURE RENAISSANCE AFTER HOURS.</div>' +
    '</section>',

    '<section class="fr-slide frx-circuit" data-slide-id="circuit" data-scene="structured" data-label="The complete circuit">' +
      frameTop("03", "circuit", "THE COMPLETE CIRCUIT", "navy") +
      '<div class="frx-heading frx-dark-copy"><span class="eyebrow" data-reveal data-i18n="circuit.kicker">THE COMPLETE CIRCUIT</span><h2 data-reveal data-i18n="circuit.title">SIX CONSECUTIVE NIGHTS. ONE RECOGNIZABLE OPERATING LAYER.</h2></div>' +
      '<div class="frx-timeline" data-crystallize>' + circuit.events.map(timelineEvent).join("") + '</div>' +
      '<div class="frx-circuit-proof" data-reveal><span><b>' + circuit.eventCount + '</b><i data-i18n="circuit.events">EVENTS</i></span><span><b>' + circuit.houseCount + '</b><i data-i18n="circuit.techTownHouses">TECH TOWN HOUSES</i></span><span><b>1</b><i data-i18n="circuit.claudeParty">OFFICIAL CLAUDE PARTY</i></span><strong data-i18n="circuit.axisEveryNight">AXIS APPEARS EVERY NIGHT</strong></div>' +
    '</section>',

    '<section class="fr-slide frx-houses" data-slide-id="houses" data-scene="structured" data-label="Five Houses / five identities">' +
      frameTop("04", "houses", "FIVE HOUSES / FIVE IDENTITIES") +
      '<div class="frx-heading"><span class="eyebrow" data-reveal data-i18n="houses.kicker">FIVE HOUSES / FIVE IDENTITIES</span><h2 data-reveal data-i18n="houses.title">THE SYSTEM REPEATS. THE NIGHT CHANGES WITH THE AUDIENCE.</h2><p data-reveal data-i18n="houses.copy">Each House receives a distinct social rhythm, musical language, sponsor context, and energy curve.</p></div>' +
      '<div class="frx-house-grid" data-crystallize>' + houseEvents.map(houseCard).join("") + '</div>' +
    '</section>',

    '<section class="fr-slide frx-claude" data-slide-id="claude" data-scene="orbit-system" data-label="Claude Official Party">' +
      frameTop("05", "claude", "CLAUDE OFFICIAL PARTY") +
      '<div class="frx-claude-photo" data-crystallize><img src="/futurerenaissanceextended/event-crowd.jpg" alt="Nighttime crowd and light installation"><div class="dither-screen"></div></div>' +
      '<div class="frx-claude-copy"><span class="eyebrow" data-reveal data-i18n="claude.kicker">WEDNESDAY · OCTOBER 28 · BAR ORIENTE</span><h2 data-reveal>CLAUDE <em data-i18n="claude.officialParty">OFFICIAL PARTY</em></h2><p data-reveal data-i18n="claude.copy">A major credibility night inside the circuit, with its own clear rights hierarchy and a leftfield club identity.</p>' +
        '<div class="frx-rights-stack" data-reveal>' +
          '<div class="is-hero"><i>01</i><b>CLAUDE</b><span data-i18n="claude.presented">PRESENTED BY CLAUDE</span></div>' +
          '<div><i>02</i><b>AXIS</b><span data-i18n="claude.axisRole">HOSTED + PRODUCED BY AXIS</span></div>' +
          '<div><i>03</i><b>FUTURE RENAISSANCE</b><span data-i18n="claude.systemRole">AFTER-HOURS SYSTEM</span></div>' +
        '</div>' +
        conceptNode("frx-claude-constraint", "claude-rights", '<strong data-i18n="claude.constraint">NO THIRD-PARTY PRESENTING POSITION IS AVAILABLE ON WEDNESDAY.</strong><span data-i18n="claude.partnerStatus">Other brands may participate in permitted subordinate partner or activation roles.</span>', "Claude presenting rights") +
        '<small class="frx-booking-note" data-reveal data-i18n="claude.bookingNote">Plastician is a booking target only—not a confirmed artist.</small>' +
      '</div>' +
    '</section>',

    '<section class="fr-slide frx-system" data-slide-id="system" data-scene="orbit-system" data-label="The Future Renaissance system">' +
      frameTop("06", "system", "THE FUTURE RENAISSANCE SYSTEM") +
      '<div class="frx-heading"><span class="eyebrow" data-reveal data-i18n="system.kicker">THE FUTURE RENAISSANCE SYSTEM</span><h2 data-reveal data-i18n="system.title">SIX STATES. ONE AUTHORED OPERATING LANGUAGE.</h2><p data-reveal data-i18n="system.copy">AXIS carries the same recognizable cultural and participation framework through every night.</p></div>' +
      '<div class="frx-system-orbit" data-crystallize>' + orbitalSvg("frx-system-rings") + '<div class="frx-system-core">' + axisMark("gold") + '<b>AXIS</b><small data-i18n="system.core">CONTINUOUS OPERATING LAYER</small></div>' + circuit.system.map(systemTile).join("") + '</div>' +
    '</section>',

    '<section class="fr-slide frx-guest-flow" data-slide-id="guest-flow" data-scene="structured" data-label="Guest flow">' +
      frameTop("07", "guestFlow", "GUEST FLOW", "navy") +
      '<div class="frx-heading frx-dark-copy"><span class="eyebrow" data-reveal data-i18n="guestFlow.kicker">MISSION PASSPORT</span><h2 data-reveal data-i18n="guestFlow.title">PARTICIPATION MOVES THROUGH A READABLE PATH.</h2><p data-reveal data-i18n="guestFlow.copy">The mission system turns entry, product interaction, validation, rewards, and reporting into one continuous guest journey.</p></div>' +
      '<div class="frx-flow-track" data-crystallize>' + circuit.guestFlow.map(flowStep).join("") + '</div>' +
      '<div class="frx-flow-rule" data-reveal><b data-i18n="guestFlow.ruleA">ONE ACTION BECOMES VISIBLE.</b><span>→</span><b data-i18n="guestFlow.ruleB">ONE REWARD BECOMES EARNED.</b><span>→</span><b data-i18n="guestFlow.ruleC">ONE RESULT BECOMES REPORTABLE.</b></div>' +
    '</section>',

    '<section class="fr-slide frx-brand-function" data-slide-id="brand-function" data-scene="structured" data-label="Brand function">' +
      frameTop("08", "brandFunction", "BRAND FUNCTION") +
      '<div class="frx-heading"><span class="eyebrow" data-reveal data-i18n="brandFunction.kicker">BRAND FUNCTION</span><h2 data-reveal data-i18n="brandFunction.title">ONE PRODUCT. ONE FUNCTION. ONE MEASURABLE BEHAVIOR.</h2><p data-reveal data-i18n="brandFunction.copy">A sponsor does not buy decorative placement. Its product owns a useful, distinct function inside the mission system.</p></div>' +
      '<div class="frx-function-grid" data-crystallize>' + circuit.onchainFunctions.map(functionCard).join("") + '</div>' +
      '<div class="frx-brand-rule" data-reveal><span data-i18n="brandFunction.noLogoWall">NOT SEVEN GENERIC CRYPTO LOGOS.</span><strong data-i18n="brandFunction.distinctFunctions">SEVEN DIFFERENT PRODUCT FUNCTIONS WITH DIFFERENT MEASURABLE OUTCOMES.</strong></div>' +
    '</section>',

    '<section class="fr-slide frx-cross-week" data-slide-id="cross-week" data-scene="structured" data-label="Cross-week participation">' +
      frameTop("09", "crossWeek", "CROSS-WEEK PARTICIPATION") +
      '<div class="frx-heading"><span class="eyebrow" data-reveal data-i18n="crossWeek.kicker">CROSS-WEEK PARTICIPATION</span><h2 data-reveal data-i18n="crossWeek.title">ONE SPONSOR ACTION CAN BUILD THROUGH THE WEEK.</h2><p data-reveal data-i18n="crossWeek.copy">A central activation architecture can persist across several audiences while adapting its expression to each House.</p></div>' +
      '<div class="frx-week-sequence" data-crystallize>' +
        conceptNode("frx-week-step", "week-tuesday", '<i>01</i><span data-i18n="events.investors.day">TUESDAY</span><b data-i18n="crossWeek.account">ACCOUNT CREATION</b><small>INVESTORS</small>', "Tuesday example") +
        conceptNode("frx-week-step", "week-wednesday", '<i>02</i><span data-i18n="events.claude.day">WEDNESDAY</span><b data-i18n="crossWeek.productUse">PRODUCT USE</b><small>CLAUDE</small>', "Wednesday example") +
        conceptNode("frx-week-step", "week-thursday", '<i>03</i><span data-i18n="events.founders.day">THURSDAY</span><b data-i18n="crossWeek.secondAction">SECOND ACTION</b><small>FOUNDERS</small>', "Thursday example") +
        conceptNode("frx-week-step", "week-friday", '<i>04</i><span data-i18n="events.developers.day">FRIDAY</span><b data-i18n="crossWeek.technical">TECHNICAL ACTION</b><small>DEVELOPERS</small>', "Friday example") +
        conceptNode("frx-week-step", "week-saturday", '<i>05</i><span data-i18n="events.ai.day">SATURDAY</span><b data-i18n="crossWeek.advanced">ADVANCED INTERACTION</b><small>AI</small>', "Saturday example") +
        conceptNode("frx-week-step", "week-sunday", '<i>06</i><span data-i18n="events.wellness.day">SUNDAY</span><b data-i18n="crossWeek.completion">COMPLETION / REWARD</b><small>WELLNESS</small>', "Sunday example") +
      '</div>' +
      '<div class="frx-example-note" data-reveal data-i18n="crossWeek.note">EXAMPLE PATH ONLY · EACH SPONSOR JOURNEY IS DESIGNED AROUND THE PRODUCT.</div>' +
    '</section>',

    '<section class="fr-slide frx-measurement" data-slide-id="measurement" data-scene="measurement" data-label="Measurement">' +
      frameTop("10", "measurement", "MEASUREMENT", "navy") +
      '<div class="frx-heading frx-dark-copy"><span class="eyebrow" data-reveal data-i18n="measurement.kicker">MEASUREMENT</span><h2 data-reveal data-i18n="measurement.title">EVIDENCE FIRST. FINANCIAL MODELS ONLY WHEN THE DATA SUPPORTS THEM.</h2><p data-reveal data-i18n="measurement.copy">Every event receives an operational record. Circuit partners receive per-event context and a combined performance view.</p></div>' +
      '<div class="frx-measurement-grid" data-crystallize><section><h3 data-i18n="measurement.verified">VERIFIED BY THE AXIS SYSTEM</h3><div>' + circuit.measurement.verified.map(metricPill).join("") + '</div></section><section><h3 data-i18n="measurement.calculated">CALCULATED WITH SPONSOR-SIDE DATA</h3><div>' + circuit.measurement.calculatedWhenSupported.map(metricPill).join("") + '</div></section></div>' +
      '<div class="frx-measurement-note" data-reveal data-i18n="measurement.note">NO FABRICATED CONVERSION PROMISES. THE REPORT SEPARATES OBSERVED ACTIONS FROM CALCULATED BUSINESS OUTCOMES.</div>' +
    '</section>',

    '<section class="fr-slide frx-inventory frx-single-inventory" data-slide-id="single-inventory" data-scene="structured" data-label="Single event inventory">' +
      frameTop("11", "singleInventory", "SINGLE EVENT INVENTORY") +
      '<div class="frx-heading"><span class="eyebrow" data-reveal data-i18n="single.kicker">SINGLE EVENT INVENTORY</span><h2 data-reveal data-i18n="single.title">HIGH CUSTOMIZATION FOR ONE FOCUSED AUDIENCE.</h2></div>' +
      '<div class="frx-offer-pair" data-crystallize>' +
        conceptNode("frx-offer-card", "tier-single-house", '<span data-i18n="tiers.singleHouse.name">SINGLE HOUSE PARTNER</span><strong>' + money(singleHouse.price) + '</strong><small data-i18n="tiers.singleHouse.scope">ONE HOUSE · INVESTORS / FOUNDERS / DEVELOPERS / AI / WELLNESS</small><p data-i18n="tiers.singleHouse.copy">One event-specific function, mission, validation, reward path, integration, media capture, qualified-action measurement, and event report.</p>', singleHouse.name) +
        conceptNode("frx-offer-card is-claude", "tier-claude-party", '<span data-i18n="tiers.claude.name">CLAUDE OFFICIAL PARTY PARTNER</span><strong>' + money(claudeParty.price) + '</strong><small data-i18n="tiers.claude.scope">WEDNESDAY · BAR ORIENTE · PARTNER STATUS BENEATH CLAUDE</small><p data-i18n="tiers.claude.copy">Sponsor activation, mission, media, measurement, and reporting for the official party.</p><em data-i18n="tiers.claude.restriction">CLAUDE RETAINS PRESENTING STATUS.</em>', claudeParty.name) +
      '</div>' +
      '<div class="frx-inventory-note" data-reveal data-i18n="single.note">SINGLE EVENT = ONE HIGHLY CUSTOMIZED PRODUCTION. CIRCUIT PACKAGES USE ONE REPEATABLE CORE SYSTEM.</div>' +
    '</section>',

    '<section class="fr-slide frx-inventory frx-circuit-inventory" data-slide-id="circuit-inventory" data-scene="structured" data-label="Circuit inventory">' +
      frameTop("12", "circuitInventory", "CIRCUIT INVENTORY", "navy") +
      '<div class="frx-heading frx-dark-copy"><span class="eyebrow" data-reveal data-i18n="circuitInventory.kicker">CIRCUIT INVENTORY</span><h2 data-reveal data-i18n="circuitInventory.title">REPETITION CREATES RECOGNITION—WITHOUT PRETENDING EACH NIGHT IS A NEW CAMPAIGN.</h2></div>' +
      '<div class="frx-tier-ladder" data-crystallize>' +
        conceptNode("frx-tier-card", "tier-three-house", '<i>03</i><span data-i18n="tiers.threeHouse.name">THREE-HOUSE CIRCUIT</span><strong>' + money(threeHouse.price) + '</strong><small data-i18n="tiers.threeHouse.scope">ANY THREE TECH TOWN HOUSES</small><p data-i18n="tiers.threeHouse.copy">One primary sponsor concept with contextual adaptation and combined reporting.</p>', threeHouse.name) +
        conceptNode("frx-tier-card is-primary", "tier-tech-town", '<i>05</i><span data-i18n="tiers.techTown.name">TECH TOWN CIRCUIT</span><strong>' + money(techTown.price) + '</strong><small data-i18n="tiers.techTown.scope">ALL FIVE HOUSES</small><p data-i18n="tiers.techTown.copy">One sponsor system across Investors, Founders, Developers, AI, and Wellness.</p>', techTown.name) +
        conceptNode("frx-tier-card is-complete", "tier-complete-week", '<i>06</i><span data-i18n="tiers.completeWeek.name">COMPLETE WEEK PARTNER</span><strong>' + money(completeWeek.price) + '</strong><small data-i18n="tiers.completeWeek.scope">CLAUDE + ALL FIVE HOUSES</small><p data-i18n="tiers.completeWeek.copy">Permitted partner integration at Claude, plus normal circuit integration across the five Houses.</p><em data-i18n="tiers.completeWeek.restriction">PARTNER—NOT PRESENTING—AT CLAUDE.</em>', completeWeek.name) +
      '</div>' +
      '<div class="frx-deployment-rule" data-reveal><b data-i18n="circuitInventory.ruleTitle">ONE CENTRAL ACTIVATION ARCHITECTURE</b><span>→</span><p data-i18n="circuitInventory.ruleCopy">REPEATED DEPLOYMENT · HOUSE-SPECIFIC CONTEXT · COMBINED REPORTING</p></div>' +
    '</section>',

    '<section class="fr-slide frx-exclusive" data-slide-id="category-exclusive" data-scene="orbit-system" data-label="Category exclusive">' +
      frameTop("13", "categoryExclusive", "CATEGORY EXCLUSIVE") +
      '<div class="frx-heading"><span class="eyebrow" data-reveal data-i18n="exclusive.kicker">CATEGORY EXCLUSIVE CIRCUIT PARTNER</span><h2 data-reveal data-i18n="exclusive.title">OWN A DISTINCT FUNCTION ACROSS THE COMPLETE CIRCUIT.</h2><div class="frx-hero-price" data-reveal><strong>' + money(categoryExclusive.price) + '</strong><span data-i18n="exclusive.scope">SIX-EVENT ACCESS</span></div></div>' +
      '<div class="frx-exclusive-orbit" data-crystallize>' + orbitalSvg("frx-exclusive-rings") + conceptNode("product-vessel frx-exclusive-core", "tier-category-exclusive", '<b>[BRAND]</b><span data-i18n="exclusive.hero">HERO SPONSOR MISSION</span>', categoryExclusive.name) +
        '<div class="frx-exclusive-benefits"><span data-i18n="exclusive.b1">CATEGORY EXCLUSIVITY</span><span data-i18n="exclusive.b2">HOUSE-SPECIFIC ADAPTATIONS</span><span data-i18n="exclusive.b3">DEDICATED PRODUCT MEDIA</span><span data-i18n="exclusive.b4">PER-EVENT + COMBINED REPORTING</span><span data-i18n="exclusive.b5">PRIORITY CONTENT CAPTURE</span></div>' +
      '</div>' +
      '<div class="frx-rights-note" data-reveal data-i18n="exclusive.restriction">EXCLUSIVITY APPLIES ONLY TO AXIS-CONTROLLED INVENTORY AND CANNOT OVERRIDE CLAUDE OR PRE-EXISTING TECH WEEK RIGHTS.</div>' +
    '</section>',

    '<section class="fr-slide frx-presenting" data-slide-id="tech-town-presenting" data-scene="presenting-product" data-label="Tech Town presenting">' +
      frameTop("14", "techTownPresenting", "TECH TOWN PRESENTING") +
      '<div class="frx-presenting-copy"><span class="eyebrow" data-reveal data-i18n="presenting.kicker">TECH TOWN PRESENTING PARTNER</span><h2 data-reveal data-i18n="presenting.title">ONE POSITION. PRESENTING ACROSS FIVE HOUSE EVENTS.</h2><div class="frx-presenting-price" data-reveal><strong>' + money(presenting.price) + '</strong><span>' + presenting.positions + ' <i data-i18n="presenting.position">POSITION</i></span></div><p data-reveal data-i18n="presenting.copy">The presenting system carries through Investors, Founders, Developers, AI, and Wellness with priority mission, integration, media, and reporting.</p></div>' +
      '<div class="frx-presenting-diagram" data-crystallize>' + orbitalSvg("frx-presenting-orbit") +
        '<div class="product-vessel frx-presenting-core"><span>[BRAND]</span><b data-i18n="presenting.houseCircuit">HOUSE CIRCUIT PRESENTING PARTNER</b><small data-i18n="presenting.fiveHouses">FIVE TECH TOWN HOUSES</small></div>' +
        '<div class="frx-presenting-houses"><span>INVESTORS</span><span>FOUNDERS</span><span>DEVELOPERS</span><span>AI</span><span>WELLNESS</span></div>' +
      '</div>' +
      conceptNode("frx-presenting-constraint", "tech-town-presenting-rights", '<b data-i18n="presenting.constraint">CLAUDE RETAINS PRESENTING STATUS FOR THE OFFICIAL CLAUDE PARTY.</b><p data-i18n="presenting.constraintCopy">At Wednesday’s event, this partner receives only its permitted subordinate partner integration—not presenting status.</p>', "Tech Town presenting rights") +
    '</section>',

    '<section class="fr-slide frx-close" data-slide-id="close" data-scene="closing" data-label="Close">' +
      '<div class="frx-close-art" data-crystallize><img src="' + poster + '" alt="Future Renaissance visual identity"><div class="frx-close-shade"></div></div>' +
      '<div class="frx-close-panel" data-reveal>' + axisMark("gold") +
        '<span class="eyebrow" data-i18n="close.kicker">PARTNERSHIP + OPERATING APPROVAL</span><h2>Future <em>Renaissance</em></h2><h3 data-i18n="close.title">MEXICO TECH WEEK AFTER HOURS</h3>' +
        '<div class="frx-close-scale"><span><b>6</b><i data-i18n="close.events">EVENTS</i></span><span><b>5</b><i data-i18n="close.houses">TECH TOWN HOUSES</i></span><span><b>1</b><i data-i18n="close.claude">OFFICIAL CLAUDE PARTY</i></span></div>' +
        '<p data-i18n="close.dates">OCTOBER 27 – NOVEMBER 1 · MEXICO CITY</p>' +
        '<div class="frx-close-statement" data-i18n="close.statement">MEXICO TECH TOWN BY DAY.<br>FUTURE RENAISSANCE AFTER HOURS.</div>' +
        '<div class="frx-close-by">BY <strong>AXIS</strong></div>' +
        '<a href="https://axis.show" target="_blank" rel="noopener noreferrer" data-i18n="close.cta">START THE PARTNERSHIP DISCUSSION →</a>' +
      '</div>' + star("close-star") +
    '</section>'
  ];

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
        '<span class="concept-modal-foot">AXIS · FUTURE RENAISSANCE · MEXICO TECH WEEK AFTER HOURS</span>' +
      '</div>' +
    '</article>' +
  '</div>';

  var stage = document.getElementById("stage");
  if (stage) stage.innerHTML = slides.join("") + conceptModal;
})();
