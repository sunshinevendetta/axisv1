(function () {
  "use strict";

  var circuit = window.FUTURE_RENAISSANCE;
  var night = circuit.night;
  var focus = circuit.productFocus;
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

  function tierPrice(item) {
    return item.price === null ? item.priceNote : money(item.price);
  }

  function axisMark(tone) {
    return '<img class="axis-mark" src="' + root + '/logos/axis-mark-' + (tone || "ivory") + '.png" alt="AXIS">';
  }

  function frameTop(number, key, label, tone) {
    return '<header class="fr-frame-top" data-reveal>' +
      '<div class="fr-lockup">' + axisMark(tone || "ivory") +
      '<span>AXIS</span><i></i><span data-i18n="brand.claudeEvent">CLAUDE COMMUNITY EVENT</span></div>' +
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

  function programStep(step, index) {
    return conceptNode(
      "frx-timeline-event frx-event-" + step.id,
      "program-" + step.id,
      '<i>' + String(index + 1).padStart(2, "0") + '</i>' +
      '<span data-i18n="program.' + step.id + '.arc">' + step.arc + '</span>' +
      '<b data-i18n="program.' + step.id + '.label">' + step.label.toUpperCase() + '</b>' +
      '<strong>' + step.time + '</strong>',
      step.label
    );
  }

  function lineupCard(act, index) {
    return conceptNode(
      "frx-house-card frx-house-" + act.id,
      "lineup-" + act.id,
      '<i>0' + (index + 1) + '</i>' +
      '<span data-i18n="lineup.' + act.id + '.kind">' + act.kind.toUpperCase() + '</span>' +
      '<b>' + act.name.toUpperCase() + '</b>' +
      '<p data-i18n="lineup.' + act.id + '.discipline">' + act.discipline + '</p>',
      act.name
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

  function operatesTile(item, index) {
    return '<div class="frx-system-tile" data-reveal><i>' + String(index + 1).padStart(2, "0") + '</i><b data-i18n="operates.' + item[0] + '">' + item[1].toUpperCase() + '</b></div>';
  }

  function allocationChip(item) {
    return '<span data-i18n="allocation.' + item[0] + '">' + item[1].toUpperCase() + '</span>';
  }

  function deliverablePill(group) {
    return function (item, index) {
      return '<div class="frx-metric-pill" data-reveal><i>' + String(index + 1).padStart(2, "0") + '</i><b data-i18n="' + group + '.' + item[0] + '">' + item[1].toUpperCase() + '</b></div>';
    };
  }

  function metricPill(name, index) {
    var key = name.toLowerCase().replace(/[^a-z]+/g, "-").replace(/(^-|-$)/g, "");
    return '<div class="frx-metric-pill" data-reveal><i>' + String(index + 1).padStart(2, "0") + '</i><b data-i18n="metrics.' + key + '">' + name.toUpperCase() + '</b></div>';
  }

  /* @generated:cards */
  function mechanicCard(item, index) {
    return conceptNode(
      "frx-function-card",
      "mechanic-" + item.id,
      '<i>' + String(index + 1).padStart(2, "0") + '</i><b data-i18n="mechanics.' + item.id + '.name">' + item.name.toUpperCase() + '</b><p data-i18n="mechanics.' + item.id + '.role">' + item.role + '</p>',
      item.name
    );
  }

  function flowCard(item, index) {
    return conceptNode(
      "frx-week-step",
      "step-" + item.id,
      '<i>' + String(index + 1).padStart(2, "0") + '</i><span data-i18n="step.' + item.id + '.stage">' + item.stage.toUpperCase() + '</span><b data-i18n="step.' + item.id + '.action">' + item.action.toUpperCase() + '</b><small>' + item.context.toUpperCase() + '</small>',
      item.action
    );
  }
    /* @end */

  var activityPartner = tier("activity-partner");
  var categoryExclusive = tier("category-exclusive");

  var slides = [
    '<section class="fr-slide frx-cover is-active" data-slide-id="cover" data-scene="cover" data-label="Cover">' +
      '<div class="frx-cover-art" data-crystallize><img src="' + poster + '" alt="Future Renaissance visual identity"><div class="frx-cover-shade"></div></div>' +
      '<div class="frx-cover-copy" data-reveal>' + axisMark("ivory") +
        '<span class="eyebrow" data-i18n="cover.kicker">CLAUDE COMMUNITY EVENT · MEXICO TECH WEEK 2026</span>' +
        '<h1>Future <em>Renaissance</em></h1>' +
        '<p>' + night.displayDate.toUpperCase() + '<br>' + night.venue.toUpperCase() + ' · ' + night.city.toUpperCase() + '</p>' +
        '<div class="frx-cover-stats"><b><strong>' + night.workshopCapacity + '</strong><span data-i18n="cover.seated">SEATED WORKSHOP</span></b><b><strong>' + night.afterPartyGuests + '</strong><span data-i18n="cover.afterParty">AFTER PARTY</span></b><b><strong>1</strong><span data-i18n="cover.night">NIGHT</span></b></div>' +
        '<div class="frx-axis-line">POWERED BY AXIS</div>' +
      '</div>' + orbitalSvg("frx-cover-orbit") + star("cover-star") +
    '</section>',

    '<section class="fr-slide frx-proposition" data-slide-id="proposition" data-scene="orbit-system" data-label="The proposition">' +
      frameTop("02", "proposition", "THE PROPOSITION") +
      '<div class="frx-heading frx-heading-wide"><span class="eyebrow" data-reveal data-i18n="proposition.kicker">THE PROPOSITION</span><h2 data-reveal data-i18n="proposition.title">A WORKSHOP FOR THE MUSIC INDUSTRY THAT BECOMES THE NIGHT.</h2><p data-reveal data-i18n="proposition.copy">Three seated hours with Claude for producers, artists, labels, managers and studios. At 22:00 the room resets, the doors open again, and the same space runs as Future Renaissance until close.</p></div>' +
      '<div class="frx-proposition-map" data-crystallize>' + orbitalSvg("frx-proposition-orbit") +
        '<div class="frx-proposition-node is-day"><span data-i18n="proposition.earlyLabel">18:00 – 21:00</span><b>CLAUDE<br>WORKSHOP</b><small data-i18n="proposition.earlyCopy">' + night.workshopCapacity + ' SEATED ATTENDEES</small></div>' +
        '<div class="frx-proposition-bridge"><i>→</i><b>AXIS</b><small data-i18n="proposition.axisRole">HOSTS + OPERATES THE WHOLE NIGHT</small></div>' +
        '<div class="frx-proposition-node is-night"><span data-i18n="proposition.lateLabel">22:00 – LATE</span><b>AFTER<br>PARTY</b><small data-i18n="proposition.lateCopy">+' + night.afterPartyGuests + ' FURTHER GUESTS</small></div>' +
      '</div>' +
      '<div class="frx-positioning" data-reveal data-i18n="proposition.positioning">ONE ROOM. ONE NIGHT. TWO AUDIENCES THAT OVERLAP.</div>' +
    '</section>',

    '<section class="fr-slide frx-circuit" data-slide-id="program" data-scene="structured" data-label="Run of show">' +
      frameTop("03", "program", "RUN OF SHOW", "navy") +
      '<div class="frx-heading frx-dark-copy"><span class="eyebrow" data-reveal data-i18n="program.kicker">RUN OF SHOW</span><h2 data-reveal data-i18n="program.title">ONE EVENING THAT CHANGES STATE THREE TIMES.</h2></div>' +
      '<div class="frx-timeline" data-crystallize>' + circuit.program.map(programStep).join("") + '</div>' +
      '<div class="frx-circuit-proof" data-reveal><span><b>' + night.workshopCapacity + '</b><i data-i18n="program.seats">SEATS</i></span><span><b>' + night.afterPartyGuests + '</b><i data-i18n="program.guests">AFTER-PARTY GUESTS</i></span><span><b>1</b><i data-i18n="program.venue">VENUE</i></span><strong>' + night.venue.toUpperCase() + ' · ' + night.displayDateShort + '</strong></div>' +
    '</section>',

    '<section class="fr-slide frx-houses" data-slide-id="lineup" data-scene="structured" data-label="The line-up">' +
      frameTop("04", "lineup", "THE LINE-UP") +
      '<div class="frx-heading"><span class="eyebrow" data-reveal data-i18n="lineup.kicker">THE LINE-UP</span><h2 data-reveal data-i18n="lineup.title">THE ROOM IS BILLED ALONGSIDE THE ARTISTS.</h2><p data-reveal data-i18n="lineup.copy">The public appears on the line-up because the room makes the work. A photo, a video or a prompt from anyone present changes the visuals running on the main LED wall.</p></div>' +
      '<div class="frx-house-grid" data-crystallize>' + circuit.lineup.map(lineupCard).join("") + '</div>' +
    '</section>',

    '<section class="fr-slide frx-claude" data-slide-id="claude" data-scene="orbit-system" data-label="Claude community event">' +
      frameTop("05", "claude", "CLAUDE COMMUNITY EVENT") +
      '<div class="frx-claude-photo" data-crystallize><img src="/futurerenaissanceextended/event-crowd.jpg" alt="Nighttime crowd and light installation"><div class="dither-screen"></div></div>' +
      '<div class="frx-claude-copy"><span class="eyebrow" data-reveal data-i18n="claude.kicker">' + night.day.toUpperCase() + ' · ' + night.displayDateShort + ' · ' + night.venue.toUpperCase() + '</span><h2 data-reveal>CLAUDE <em data-i18n="claude.communityEvent">COMMUNITY EVENT</em></h2><p data-reveal data-i18n="claude.copy">A hands-on Claude workshop for the music industry, led from the screen at the front of the room, followed by the night it turns into.</p>' +
        '<div class="frx-rights-stack" data-reveal>' +
          '<div class="is-hero"><i>01</i><b>CLAUDE</b><span data-i18n="claude.status">CLAUDE COMMUNITY EVENT</span></div>' +
          '<div><i>02</i><b>AXIS</b><span data-i18n="claude.axisRole">HOSTS, PRODUCES + OPERATES</span></div>' +
          '<div><i>03</i><b>' + night.venue.toUpperCase() + '</b><span data-i18n="claude.venueRole">HOST VENUE</span></div>' +
        '</div>' +
        conceptNode("frx-claude-constraint", "claude-rights", '<strong data-i18n="claude.constraint">THE NIGHT IS A CLAUDE COMMUNITY EVENT. THAT STATUS IS NOT FOR RESALE.</strong><span data-i18n="claude.partnerStatus">Product partners participate through authored activities inside the night, in permitted subordinate roles.</span>', "Claude community event status") +
      '</div>' +
    '</section>',

    '<section class="fr-slide frx-system" data-slide-id="system" data-scene="orbit-system" data-label="The Future Renaissance system">' +
      frameTop("06", "system", "THE FUTURE RENAISSANCE SYSTEM") +
      '<div class="frx-heading"><span class="eyebrow" data-reveal data-i18n="system.kicker">THE FUTURE RENAISSANCE SYSTEM</span><h2 data-reveal data-i18n="system.title">ONE ROOM. ONE AUTHORED OPERATING LANGUAGE.</h2><p data-reveal data-i18n="system.copy">Culture, media capture, access, hospitality, AI and code operate as a single environment rather than as separate suppliers.</p></div>' +
      '<div class="frx-system-orbit" data-crystallize>' + orbitalSvg("frx-system-rings") + '<div class="frx-system-core">' + axisMark("gold") + '<b>AXIS</b><small data-i18n="system.core">OPERATES THE NIGHT</small></div>' + circuit.system.map(systemTile).join("") + '</div>' +
    '</section>',

    '<section class="fr-slide frx-guest-flow" data-slide-id="guest-flow" data-scene="structured" data-label="Guest flow">' +
      frameTop("07", "guestFlow", "GUEST FLOW", "navy") +
      '<div class="frx-heading frx-dark-copy"><span class="eyebrow" data-reveal data-i18n="guestFlow.kicker">MISSION PASSPORT</span><h2 data-reveal data-i18n="guestFlow.title">PARTICIPATION MOVES THROUGH A READABLE PATH.</h2><p data-reveal data-i18n="guestFlow.copy">The mission system turns entry, product interaction, validation, rewards and reporting into one continuous guest journey across the evening.</p></div>' +
      '<div class="frx-flow-track" data-crystallize>' + circuit.guestFlow.map(flowStep).join("") + '</div>' +
      '<div class="frx-flow-rule" data-reveal><b data-i18n="guestFlow.ruleA">ONE ACTION BECOMES VISIBLE.</b><span>→</span><b data-i18n="guestFlow.ruleB">ONE REWARD BECOMES EARNED.</b><span>→</span><b data-i18n="guestFlow.ruleC">ONE RESULT BECOMES REPORTABLE.</b></div>' +
    '</section>',

    /* @generated:slides */
    '<section class="fr-slide frx-brand-function" data-slide-id="brand-function" data-scene="structured" data-label="Marketplace function">' +
      frameTop("08", "brandFunction", "MARKETPLACE FUNCTION") +
      '<div class="frx-heading"><span class="eyebrow" data-reveal data-i18n="brandFunction.kicker">MARKETPLACE FUNCTION</span><h2 data-reveal data-i18n="brandFunction.title">THE ROOM GENERATES THE INVENTORY. THE MARKETPLACE RUNS IT.</h2><p data-reveal data-i18n="brandFunction.copy">This is a night that makes its own supply: Verse works that draw themselves from a hash the moment they are collected, Pixelord releases that ship sound and 3D together, and LED wall output the guests generated with Claude. A marketplace partner does not have to simulate scarcity here, it operates the market for work that did not exist before 18:00.</p></div>' +
      '<div class="frx-function-grid" data-crystallize>' + focus.mechanics.map(mechanicCard).join("") + '</div>' +
      '<div class="frx-brand-rule" data-reveal><span data-i18n="brandFunction.noLogoWall">NOT A LOGO BEHIND THE DJ BOOTH.</span><strong data-i18n="brandFunction.distinctFunctions">SEVEN MARKET FUNCTIONS, EACH WITH LISTED WORK AND A COUNTED COLLECTOR.</strong></div>' +
    '</section>',

    '<section class="fr-slide frx-cross-week" data-slide-id="reward-flow" data-scene="structured" data-label="The reward flow">' +
      frameTop("09", "crossWeek", "THE REWARD FLOW") +
      '<div class="frx-heading"><span class="eyebrow" data-reveal data-i18n="crossWeek.kicker">THE REWARD FLOW</span><h2 data-reveal data-i18n="crossWeek.title">COLLECT IN THE APP. REDEEM AT THE BAR. APPEAR IN THE REPORT.</h2><p data-reveal data-i18n="crossWeek.copy">A giveaway ends the moment the prize is handed over. Here the collect is staff-guided, validated by a human, redeemed for a drink at the bar, shown on the LED wall, and counted in the post-event report.</p></div>' +
      '<div class="frx-week-sequence" data-crystallize>' + focus.flow.map(flowCard).join("") + '</div>' +
      '<div class="frx-example-note" data-reveal data-i18n="crossWeek.note">EXAMPLE FLOW · EXACT ACTIONS ARE DESIGNED AROUND THE PRODUCT.</div>' +
    '</section>',
    /* @end */

    '<section class="fr-slide fr-leaderboard" data-slide-id="leaderboard" data-scene="leaderboard" data-label="Live leaderboard">' +
      frameTop("10", "leaderboard", "LIVE LEADERBOARD", "navy") +
      '<div class="leaderboard-heading"><div><span class="eyebrow" data-reveal data-i18n="leaderboard.kicker">LIVE LEADERBOARD</span><h2 data-reveal data-i18n="leaderboard.title">PARTICIPATION BECOMES VISIBLE.</h2></div><span class="synthetic-label" data-reveal data-i18n="leaderboard.synthetic">INTERFACE PREVIEW · SAMPLE ROWS</span></div>' +
      '<div class="leaderboard-shell" data-crystallize>' +
        '<div class="leaderboard-head"><span data-i18n="leaderboard.rank">RANK</span><span data-i18n="leaderboard.participant">PARTICIPANT</span><span data-i18n="leaderboard.role">ROLE</span><span data-i18n="leaderboard.missions">ACTIVITIES</span><span>' + (focus ? focus.slot : "[MARKETPLACE BRAND]") + '</span><span data-i18n="leaderboard.score">SCORE</span><span data-i18n="leaderboard.reward">REWARD</span></div>' +
        '<div id="leaderboard-rows" class="leaderboard-rows" aria-hidden="true"></div>' +
        '<table id="leaderboard-semantic" class="sr-only"><caption>Live participation ranking interface</caption><thead><tr><th>Rank</th><th>Participant</th><th>Role</th><th>Activities</th><th>Action</th><th>Score</th><th>Reward</th></tr></thead><tbody></tbody></table>' +
      '</div>' + star("leader-star") +
    '</section>',

    '<section class="fr-slide frx-measurement" data-slide-id="measurement" data-scene="measurement" data-label="Measurement">' +
      frameTop("11", "measurement", "MEASUREMENT", "navy") +
      '<div class="frx-heading frx-dark-copy"><span class="eyebrow" data-reveal data-i18n="measurement.kicker">MEASUREMENT</span><h2 data-reveal data-i18n="measurement.title">EVIDENCE FIRST. FINANCIAL MODELS ONLY WHEN THE DATA SUPPORTS THEM.</h2><p data-reveal data-i18n="measurement.copy">The night produces an operational record alongside its media. Observed actions and calculated business outcomes are reported separately.</p></div>' +
      '<div class="frx-measurement-grid" data-crystallize><section><h3 data-i18n="measurement.verified">VERIFIED BY THE AXIS SYSTEM</h3><div>' + circuit.measurement.verified.map(metricPill).join("") + '</div></section><section><h3 data-i18n="measurement.calculated">CALCULATED WITH PARTNER-SIDE DATA</h3><div>' + circuit.measurement.calculatedWhenSupported.map(metricPill).join("") + '</div></section></div>' +
      '<div class="frx-measurement-note" data-reveal data-i18n="measurement.note">NO FABRICATED CONVERSION PROMISES. THE REPORT SEPARATES OBSERVED ACTIONS FROM CALCULATED BUSINESS OUTCOMES.</div>' +
    '</section>',

    '<section class="fr-slide frx-system" data-slide-id="operates" data-scene="orbit-system" data-label="What AXIS operates">' +
      frameTop("12", "operates", "WHAT AXIS OPERATES") +
      '<div class="frx-heading"><span class="eyebrow" data-reveal data-i18n="operates.kicker">WHAT AXIS BRINGS</span><h2 data-reveal data-i18n="operates.title">AXIS OPERATES.</h2><p data-reveal data-i18n="operates.copy">Everything below is authored, funded or run by AXIS. The venue provides the room, the bar and the screens.</p></div>' +
      '<div class="frx-system-orbit" data-crystallize>' + orbitalSvg("frx-system-rings") + '<div class="frx-system-core">' + axisMark("gold") + '<b>AXIS</b><small data-i18n="operates.core">FUNDS + RUNS THE NIGHT</small></div>' + circuit.operates.map(operatesTile).join("") + '</div>' +
      '<div class="frx-positioning" data-reveal><b data-i18n="operates.investLabel">WHERE AXIS INVESTS</b> ' + circuit.allocation.map(allocationChip).join(" · ") + '</div>' +
    '</section>',

    '<section class="fr-slide frx-measurement" data-slide-id="deliverables" data-scene="measurement" data-label="What the partner receives">' +
      frameTop("13", "deliverables", "WHAT THE PARTNER RECEIVES", "navy") +
      '<div class="frx-heading frx-dark-copy"><span class="eyebrow" data-reveal data-i18n="deliverables.kicker">POST-EVENT DELIVERY</span><h2 data-reveal data-i18n="deliverables.title">THE NIGHT ARRIVES BACK AS MATERIAL AND AS EVIDENCE.</h2><p data-reveal data-i18n="deliverables.copy">Media production and the operational record are delivered separately, so the night reads as both cultural output and system performance.</p></div>' +
      '<div class="frx-measurement-grid" data-crystallize><section><h3 data-i18n="deliverables.media">MEDIA PRODUCTION INCLUDED</h3><div>' + circuit.deliverables.media.map(deliverablePill("media")).join("") + '</div></section><section><h3 data-i18n="deliverables.report">POST-EVENT REPORT</h3><div>' + circuit.deliverables.report.map(deliverablePill("report")).join("") + '</div></section></div>' +
      '<div class="frx-measurement-note" data-reveal data-i18n="deliverables.note">MEDIA IS PRODUCED FOR THE NIGHT. THE REPORT IS PRODUCED FROM WHAT ACTUALLY HAPPENED IN IT.</div>' +
    '</section>',

    '<section class="fr-slide frx-inventory frx-single-inventory" data-slide-id="inventory" data-scene="structured" data-label="Partner inventory">' +
      frameTop("14", "inventory", "PARTNER INVENTORY") +
      '<div class="frx-heading"><span class="eyebrow" data-reveal data-i18n="single.kicker">PARTNER INVENTORY</span><h2 data-reveal data-i18n="single.title">ONE NIGHT. ONE HIGHLY CUSTOMIZED PRODUCTION.</h2></div>' +
      '<div class="frx-offer-pair" data-crystallize>' +
        conceptNode("frx-offer-card", "tier-activity-partner", '<span data-i18n="tiers.activity.name">ACTIVITY PARTNER</span><strong>' + tierPrice(activityPartner) + '</strong><small data-i18n="tiers.activity.scope">' + night.displayDateShort + ' · ' + night.venue.toUpperCase() + '</small><p data-i18n="tiers.activity.copy">One product function with mission, staff-guided onboarding, validation, reward path, screen presence, media capture and a post-event report.</p>', activityPartner.name) +
        conceptNode("frx-offer-card is-claude", "tier-category-exclusive", '<span data-i18n="tiers.exclusive.name">CATEGORY EXCLUSIVE PARTNER</span><strong>' + tierPrice(categoryExclusive) + '</strong><small>[MARKETPLACE BRAND] · SOLE PRODUCT IN ITS CATEGORY</small><p data-i18n="tiers.exclusive.copy">A hero function with priority onboarding placement, deeper integration, dedicated product media and extended reporting.</p><em data-i18n="tiers.exclusive.restriction">CANNOT OVERRIDE CLAUDE OR VENUE RIGHTS.</em>', categoryExclusive.name) +
      '</div>' +
      '<div class="frx-inventory-note" data-reveal data-i18n="single.note">SMALL · DISTRIBUTED · INTERACTIVE · INTEGRATED. NOT A CONFERENCE HALL, AN EXPO OR A BOOTH FARM.</div>' +
    '</section>',

    '<section class="fr-slide frx-close" data-slide-id="close" data-scene="closing" data-label="Close">' +
      '<div class="frx-close-art" data-crystallize><img src="' + poster + '" alt="Future Renaissance visual identity"><div class="frx-close-shade"></div></div>' +
      '<div class="frx-close-panel" data-reveal>' + axisMark("gold") +
        '<span class="eyebrow" data-i18n="close.kicker">PARTNERSHIP + OPERATING APPROVAL</span><h2>Future <em>Renaissance</em></h2><h3 data-i18n="close.title">CLAUDE COMMUNITY EVENT</h3>' +
        '<div class="frx-close-scale"><span><b>' + night.workshopCapacity + '</b><i data-i18n="close.seated">SEATED WORKSHOP</i></span><span><b>' + night.afterPartyGuests + '</b><i data-i18n="close.afterParty">AFTER PARTY</i></span><span><b>1</b><i data-i18n="close.night">NIGHT</i></span></div>' +
        '<p>' + night.displayDate.toUpperCase() + ' · ' + night.venue.toUpperCase() + ' · ' + night.city.toUpperCase() + '</p>' +
        '<div class="frx-close-statement" data-i18n="close.statement">A WORKSHOP FOR THE MUSIC INDUSTRY.<br>THE NIGHT IT BECOMES.</div>' +
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
        '<span class="concept-modal-foot">AXIS · FUTURE RENAISSANCE · CLAUDE COMMUNITY EVENT</span>' +
      '</div>' +
    '</article>' +
  '</div>';

  var stage = document.getElementById("stage");
  if (stage) stage.innerHTML = slides.join("") + conceptModal;
})();
