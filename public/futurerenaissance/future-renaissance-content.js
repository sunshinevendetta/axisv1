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

  function asciiField(variant) {
    return '<pre class="ascii-field ascii-' + (variant || "a") + '" data-orbit-loop aria-hidden="true">' +
      '0 1 0 0 1 0 1 1 0 0 1 0\n' +
      '  0 1  ·  AXIS  ·  1 0\n' +
      '1 0 1 1 0 0 1 0 1 1 0 1\n' +
      '  1 0  ·  MMXXVI  ·  0 1\n' +
      '0 1 0 1 1 0 0 1 0 1 1 0' +
    '</pre>';
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
    return '<figure class="role-badge ' + (extraClass || "") + '" data-role="' + role + '" data-reveal>' +
      '<img loading="lazy" src="' + root + '/badges/roles/' + slug + '.svg" alt="' + role + ' role badge">' +
      '<figcaption>' + role + '</figcaption>' +
    '</figure>';
  }

  function missionBadge(name, index) {
    var slug = name.toLowerCase();
    return '<li class="mission-badge" data-mission-index="' + index + '" data-reveal>' +
      '<img loading="lazy" src="' + root + '/badges/missions/' + slug + '.svg" alt="' + name + ' mission badge">' +
      '<span>' + name + '</span><i aria-hidden="true">' + (index < 7 ? "›" : "✦") + '</i>' +
    '</li>';
  }

  var roles = ["ARTIST", "CREATOR", "AGENT", "PARTNER", "PRESS", "OPERATOR", "GUEST", "COLLECTOR"];
  var missions = ["CONNECT", "CHECK-IN", "CREATE", "INTERVENE", "VOTE", "COLLECT", "STREAM", "COMPLETE"];

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
      frameTop("02", "idea") + asciiField("idea") +
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
        '<div class="event-core"><strong>' + event.attendees + '</strong><span data-i18n="event.attendees">ATTENDEES</span></div>' +
        '<div class="event-node n1" data-i18n="program.art">ART</div><div class="event-node n2" data-i18n="program.music">MUSIC</div>' +
        '<div class="event-node n3" data-i18n="program.technology">TECHNOLOGY</div><div class="event-node n4" data-i18n="program.culture">CULTURE</div>' +
        '<div class="event-node n5" data-i18n="program.hospitality">HOSPITALITY</div><div class="event-node n6" data-i18n="program.missions">MISSIONS</div>' +
        '<div class="event-node n7" data-i18n="program.livestream">LIVESTREAM</div>' +
        orbitalSvg("event-orbit") +
      '</div>' +
      '<div class="lineup-rail" data-reveal><span data-i18n="event.musicCuration">MUSIC CURATION / RITMOS DE LA NOCHE</span><b>SATURNA</b><b>ISAAC OLMOS</b><b>LULÚ</b><b>MALU GO</b></div>' +
    '</section>',

    '<section class="fr-slide fr-audience" data-slide-id="audience" data-scene="badges" data-label="The audience">' +
      frameTop("04", "audience") + asciiField("audience") +
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

    '<section class="fr-slide fr-program" data-slide-id="program" data-scene="program" data-label="The program">' +
      frameTop("05", "program") +
      '<div class="program-architecture" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>' +
      '<div class="glass-ribbon ribbon-a" data-orbit-loop aria-hidden="true"></div><div class="glass-ribbon ribbon-b" data-orbit-loop aria-hidden="true"></div>' +
      '<div class="fr-reading program-title"><span class="eyebrow" data-reveal data-i18n="program.kicker">THE PROGRAM</span><h2 data-reveal data-i18n="program.title">ART IS THE INTERFACE.</h2><p data-reveal data-i18n="program.copy">A single night where live culture, the room and the mission system operate as one authored environment.</p></div>' +
      '<div class="program-constellation" data-reveal>' +
        '<div class="program-core"><span>AXIS</span><b>FUTURE<br>RENAISSANCE</b></div>' +
        '<div class="program-node p1"><b data-i18n="program.art">ART</b><small data-i18n="program.gallery">GALLERY / DIGITAL WORKS</small></div>' +
        '<div class="program-node p2"><b data-i18n="program.music">MUSIC</b><small>SATURNA / ISAAC OLMOS / LULÚ / MALU GO</small></div>' +
        '<div class="program-node p3"><b data-i18n="program.liveSystems">LIVE SYSTEMS</b><small data-i18n="program.mapping">12 M LED / VIDEO MAPPING</small></div>' +
        '<div class="program-node p4"><b data-i18n="program.hospitality">HOSPITALITY</b><small data-i18n="program.hospitalityDetail">BEER + CANAPÉS</small></div>' +
        '<div class="program-node p5"><b>[brand]</b><small data-i18n="program.function">DEFINED FUNCTION</small></div>' +
        '<div class="program-node p6"><b data-i18n="program.missions">MISSIONS</b><small data-i18n="program.rewardLogic">ACTION / REWARD / PROOF</small></div>' +
        '<div class="program-node p7"><b data-i18n="program.livestream">LIVESTREAM</b><small data-i18n="program.media">MEDIA / DOCUMENTATION</small></div>' +
      '</div>' +
    '</section>',

    '<section class="fr-slide fr-roles" data-slide-id="roles" data-scene="badges" data-label="Role and access">' +
      frameTop("06", "roles") +
      '<div class="roles-heading"><span class="eyebrow" data-reveal data-i18n="roles.kicker">ROLE + ACCESS SYSTEM</span><h2 data-reveal data-i18n="roles.title">EVERY PARTICIPANT ENTERS WITH A READABLE STATE.</h2><p data-reveal data-i18n="roles.copy">Role, access and authority become visible before the first mission begins.</p></div>' +
      '<div class="role-grid">' + roles.map(function (role) { return roleBadge(role); }).join("") + '</div>' +
      '<div class="access-rail" data-reveal><span>ROLE</span><i></i><span>ACCESS</span><i></i><span>AUTHORITY</span><i></i><span data-i18n="roles.state">LIVE STATE</span>' + star("inline-star") + '</div>' +
      asciiField("roles") +
    '</section>',

    '<section class="fr-slide fr-missions" data-slide-id="missions" data-scene="mission-path" data-label="Mission passport">' +
      frameTop("07", "missions") +
      '<div class="mission-heading"><span class="eyebrow" data-reveal data-i18n="mission.kicker">MISSION PASSPORT</span><h2 data-reveal><span data-i18n="mission.titleA">COMPLETE THE MISSIONS.</span><br><em data-i18n="mission.titleB">CHANGE THE ROOM.</em></h2></div>' +
      '<ol class="mission-path" aria-label="Future Renaissance mission progression">' + missions.map(missionBadge).join("") + '</ol>' +
      '<div class="mission-logic" data-reveal><span data-i18n="mission.trigger">TRIGGER</span><i>›</i><span data-i18n="mission.action">ACTION</span><i>›</i><span data-i18n="mission.consequence">CONSEQUENCE</span><i>›</i><span data-i18n="mission.reward">REWARD</span><i>›</i><span data-i18n="mission.measurement">MEASUREMENT</span></div>' +
      '<p class="mission-note" data-reveal data-i18n="mission.note">An active mission gains a live signal. A verified mission receives the gold-star state.</p>' +
      orbitalSvg("mission-orbit") +
    '</section>',

    '<section class="fr-slide fr-function" data-slide-id="brand-function" data-scene="product-function" data-label="Brand function">' +
      frameTop("08", "function") + asciiField("function") +
      '<div class="function-copy"><span class="eyebrow" data-reveal>[brand] <span data-i18n="function.kicker">BECOMES A FUNCTION</span></span><h2 data-reveal data-i18n="function.title">YOUR PRODUCT BECOMES PART OF THE NIGHT.</h2><p data-reveal data-i18n="function.rule">ONE [brand]. ONE FUNCTION. ONE MEASURABLE BEHAVIOR.</p></div>' +
      '<div class="function-orbit" data-crystallize>' + orbitalSvg("function-rings") +
        '<div class="function-core"><span>[brand]</span><small data-i18n="function.defined">DEFINED EVENT FUNCTION</small></div>' +
        '<span class="function-word fw1">ACCESS</span><span class="function-word fw2">CREATE</span><span class="function-word fw3">TASTE</span><span class="function-word fw4">COLLECT</span><span class="function-word fw5">PAY</span><span class="function-word fw6">WEAR</span><span class="function-word fw7">CLAIM</span><span class="function-word fw8">VOTE</span><span class="function-word fw9">UNLOCK</span><span class="function-word fw10">PLAY</span>' +
      '</div>' +
      '<div class="function-proof" data-reveal><div><strong>' + event.attendees + '</strong><span data-i18n="event.attendees">ATTENDEES</span></div><div><strong>' + event.requiredBrandActions + '</strong><span data-i18n="function.requiredActions">REQUIRED [brand] ACTIONS</span></div></div>' +
    '</section>',

    '<section class="fr-slide fr-leaderboard" data-slide-id="leaderboard" data-scene="leaderboard" data-label="Live leaderboard">' +
      frameTop("09", "leaderboard") +
      '<div class="leaderboard-heading"><div><span class="eyebrow" data-reveal data-i18n="leaderboard.kicker">LIVE LEADERBOARD</span><h2 data-reveal data-i18n="leaderboard.title">PARTICIPATION BECOMES VISIBLE.</h2></div><span class="synthetic-label" data-reveal data-i18n="leaderboard.synthetic">SYNTHETIC DEMO DATA</span></div>' +
      '<div class="leaderboard-shell" data-crystallize>' +
        '<div class="leaderboard-head"><span data-i18n="leaderboard.rank">RANK</span><span data-i18n="leaderboard.participant">PARTICIPANT</span><span data-i18n="leaderboard.role">ROLE</span><span data-i18n="leaderboard.missions">MISSIONS</span><span>[brand] ACTION</span><span data-i18n="leaderboard.score">SCORE</span><span data-i18n="leaderboard.reward">REWARD</span></div>' +
        '<div id="leaderboard-rows" class="leaderboard-rows" aria-hidden="true"></div>' +
        '<table id="leaderboard-semantic" class="sr-only"><caption data-i18n="leaderboard.caption">Synthetic demonstration of live participation</caption><thead><tr><th>Rank</th><th>Participant</th><th>Role</th><th>Missions</th><th>[brand] action</th><th>Score</th><th>Reward</th></tr></thead><tbody></tbody></table>' +
      '</div>' + star("leader-star") +
    '</section>',

    '<section class="fr-slide fr-measurement" data-slide-id="measurement" data-scene="measurement" data-label="Measurement">' +
      frameTop("10", "measurement", "navy") +
      '<div class="measurement-heading"><span class="eyebrow" data-reveal data-i18n="measurement.kicker">MEASUREMENT</span><h2 data-reveal data-i18n="measurement.title">EVERY ACTION BECOMES PROOF.</h2></div>' +
      '<div class="proof-system" data-crystallize>' +
        '<svg viewBox="0 0 720 720" aria-hidden="true"><circle class="proof-ring r1" cx="360" cy="360" r="312"></circle><circle class="proof-ring r2" cx="360" cy="360" r="238"></circle><circle class="proof-ring r3" cx="360" cy="360" r="164"></circle><path class="proof-axis" d="M48 360H672M360 48V672"></path></svg>' +
        '<div class="proof-core"><strong data-count="' + event.requiredBrandActions + '">' + event.requiredBrandActions + '</strong><span data-i18n="measurement.verified">REQUIRED [brand] ACTIONS</span><small data-i18n="measurement.live">LIVE VERIFIED TRACKING</small></div>' +
        '<div class="proof-node pn1"><b>' + event.attendees + '</b><span data-i18n="event.attendees">ATTENDEES</span></div>' +
        '<div class="proof-node pn2"><b>100%</b><span data-i18n="measurement.coverage">DESIGNED MISSION COVERAGE</span></div>' +
        '<div class="proof-node pn3"><b>1</b><span data-i18n="measurement.report">POST-EVENT COHORT REPORT</span></div>' +
        '<div class="proof-node pn4"><b data-i18n="measurement.rewards">REWARD REDEMPTIONS</b><span data-i18n="measurement.content">CONTENT OUTPUTS</span></div>' +
      '</div>' +
      '<div class="metric-rails" data-reveal><div><b data-i18n="measurement.primary">PRIMARY METRICS</b><span data-i18n="measurement.primaryList">Attendance · Mission completion rate · Qualified actions · Stage conversion · Reward redemption</span></div><div><b data-i18n="measurement.secondary">POST-EVENT FINANCIAL METRICS</b><span>CPQA · CPA · CAC · ROI · LTV:CAC · NPV</span></div></div>' +
      '<p class="measurement-note" data-reveal data-i18n="measurement.note">Secondary financial metrics are calculated after the event from verified results when sponsor-side economic data supports them.</p>' +
    '</section>',

    '<section class="fr-slide fr-partner" data-slide-id="event-partner" data-scene="partner-system" data-label="Event partner">' +
      frameTop("11", "eventPartner") +
      '<div class="partner-heading"><span class="eyebrow" data-reveal data-i18n="partner.kicker">SPONSOR INVESTMENT</span><h2 data-reveal data-i18n="partner.title">EVENT PARTNER</h2><strong class="price" data-reveal>' + money(event.eventPartnerPrice) + '</strong><p data-reveal data-i18n="partner.proposition">A complete [brand] activation across the full 120-person Future Renaissance event.</p></div>' +
      '<div class="activation-system" data-crystallize>' + orbitalSvg("partner-orbit") +
        '<div class="activation-core"><b>[brand]</b><span data-i18n="partner.core">COMPLETE ACTIVATION SYSTEM</span></div>' +
        '<div class="activation-node an1"><b data-i18n="partner.n1">120-PERSON COHORT</b><small data-i18n="partner.n1s">ONE DEFINED FUNCTION</small></div>' +
        '<div class="activation-node an2"><b data-i18n="partner.n2">REQUIRED MISSION</b><small data-i18n="partner.n2s">MISSION UX + REWARD DESIGN</small></div>' +
        '<div class="activation-node an3"><b data-i18n="partner.n3">VALIDATION</b><small data-i18n="partner.n3s">STAFF EXECUTION + PRODUCT USE</small></div>' +
        '<div class="activation-node an4"><b data-i18n="partner.n4">EVENT SYSTEMS</b><small data-i18n="partner.n4s">SCREEN + LIVESTREAM INTEGRATION</small></div>' +
        '<div class="activation-node an5"><b data-i18n="partner.n5">MEDIA CAPTURE</b><small data-i18n="partner.n5s">PHOTOGRAPHY + VIDEO + DOCUMENTATION</small></div>' +
        '<div class="activation-node an6"><b data-i18n="partner.n6">PROOF</b><small data-i18n="partner.n6s">LIVE MEASUREMENT + POST-EVENT REPORT</small></div>' +
      '</div>' +
      '<div class="partner-proofline" data-reveal><span><strong>' + event.attendees + '</strong> <i data-i18n="event.attendees">ATTENDEES</i></span><b>→</b><span><strong>' + event.requiredBrandActions + '</strong> <i data-i18n="function.requiredActions">REQUIRED [brand] ACTIONS</i></span><b>→</b><span><strong>1</strong> <i data-i18n="measurement.report">POST-EVENT COHORT REPORT</i></span></div>' +
    '</section>',

    '<section class="fr-slide fr-presenting" data-slide-id="presenting" data-scene="presenting-product" data-label="Exclusive presenting product">' +
      frameTop("12", "presenting") + asciiField("presenting") +
      '<div class="presenting-heading"><span class="eyebrow" data-reveal data-i18n="presenting.exclusive">EXCLUSIVE PRESENTING PRODUCT</span><h2 data-reveal>[brand] <em data-i18n="presenting.title">BECOMES A SIGNATURE PART OF FUTURE RENAISSANCE.</em></h2><div class="presenting-price" data-reveal><strong>' + money(event.presentingProductPrice) + '</strong><span>' + event.presentingPositions + ' <i data-i18n="presenting.position">POSITION</i></span></div></div>' +
      '<div class="presenting-object" data-crystallize>' +
        '<div class="product-halo" data-orbit-loop></div><div class="product-vessel"><span>[brand]</span><b data-i18n="presenting.signature">SIGNATURE PRODUCT EXPERIENCE</b>' + star("product-star") + '</div>' +
        orbitalSvg("presenting-orbit") +
      '</div>' +
      '<div class="presenting-plus" data-reveal><b data-i18n="presenting.includes">EVERYTHING IN EVENT PARTNER</b><i>+</i><span data-i18n="presenting.listA">CATEGORY EXCLUSIVITY · HERO [brand] MISSION · PRIORITY INTEGRATION</span><span data-i18n="presenting.listB">DEDICATED PRODUCT MEDIA · 30-DAY CONTINUATION · ONE ADDITIONAL AXIS ACTIVATION · EXTENDED REPORTING</span></div>' +
    '</section>',

    '<section class="fr-slide fr-signature" data-slide-id="signature" data-scene="signature-product" data-label="Signature product experience">' +
      frameTop("13", "signature") +
      '<div class="signature-heading"><span class="eyebrow" data-reveal data-i18n="signature.kicker">SIGNATURE PRODUCT EXPERIENCE</span><h2 data-reveal data-i18n="signature.title">THE PRESENTING PRODUCT BECOMES A SIGNATURE.</h2><p data-reveal data-i18n="signature.definition">AXIS creates one event-specific expression of [brand] that guests use, consume, wear, collect, activate, unlock, create with or interact with inside Future Renaissance.</p></div>' +
      '<div class="signature-stage" data-crystallize>' + orbitalSvg("signature-orbit") +
        '<div class="signature-vessel"><span data-i18n="signature.example">CONCEPT DEMONSTRATION</span><h3>THE ORBITAL</h3><b>[brand]</b><small data-i18n="signature.serve">Future Renaissance signature expression by [brand]</small>' + star("signature-star") + '</div>' +
        '<span class="signature-expression se1" data-i18n="signature.serveType">SIGNATURE SERVE</span><span class="signature-expression se2" data-i18n="signature.object">LIMITED OBJECT</span><span class="signature-expression se3" data-i18n="signature.ritual">PRODUCT RITUAL</span><span class="signature-expression se4" data-i18n="signature.creation">PRODUCT-POWERED CREATION</span><span class="signature-expression se5" data-i18n="signature.edition">EVENT EDITION</span><span class="signature-expression se6" data-i18n="signature.reward">NAMED REWARD</span>' +
      '</div>' +
      '<p class="signature-note" data-reveal data-i18n="signature.note">The expression is authored for the sponsor category. It is a possibility framework, not a preselected commitment.</p>' +
    '</section>',

    '<section class="fr-slide fr-continuation" data-slide-id="continuation" data-scene="continuation" data-label="Before live after">' +
      frameTop("14", "continuation") +
      '<div class="continuation-heading"><span class="eyebrow" data-reveal data-i18n="continuation.kicker">BEFORE / LIVE / AFTER</span><h2 data-reveal data-i18n="continuation.title">THE RELATIONSHIP MOVES THROUGH TIME.</h2></div>' +
      '<div class="temporal-system" data-crystallize>' + orbitalSvg("temporal-orbit") +
        '<div class="time-core"><b>FUTURE<br>RENAISSANCE</b><span>' + event.displayDate.toUpperCase() + '</span></div>' +
        '<div class="time-state ts1"><span data-i18n="continuation.world">WORLD</span><b data-i18n="continuation.before">BEFORE</b><small data-i18n="continuation.beforeCopy">Activation design · mission UX · reward system</small></div>' +
        '<div class="time-state ts2"><span data-i18n="continuation.people">PEOPLE</span><b data-i18n="continuation.live">LIVE</b><small data-i18n="continuation.liveCopy">Required action · product use · media · measurement</small></div>' +
        '<div class="time-state ts3"><span data-i18n="continuation.systems">SYSTEMS</span><b data-i18n="continuation.after">AFTER</b><small data-i18n="continuation.afterCopy">Content · report · verified analysis</small></div>' +
        '<div class="time-state ts4"><span data-i18n="continuation.proof">PROOF</span><b>+30 DAYS</b><small data-i18n="continuation.presentingOnly">PRESENTING PRODUCT ONLY · CONTINUATION + ONE SMALLER AXIS ACTIVATION</small></div>' +
      '</div>' +
      '<div class="continuation-compare" data-reveal><div><b data-i18n="partner.title">EVENT PARTNER</b><span data-i18n="continuation.eventPartner">FUTURE RENAISSANCE · LIVE ACTIVATION · MEDIA · MEASUREMENT · REPORT</span></div><div><b data-i18n="presenting.exclusive">EXCLUSIVE PRESENTING PRODUCT</b><span data-i18n="continuation.presentingProduct">FUTURE RENAISSANCE + 30-DAY CONTINUATION + 1 ADDITIONAL SMALLER AXIS ACTIVATION</span></div></div>' +
    '</section>',

    '<section class="fr-slide fr-close" data-slide-id="close" data-scene="closing" data-label="Investment and close">' +
      '<div class="close-poster" data-crystallize><img loading="lazy" src="' + poster + '" alt="Official Future Renaissance poster"></div>' +
      '<div class="close-panel">' +
        '<div class="close-lockup" data-reveal>' + axisMark("gold") + '<div><span>AXIS</span><small data-i18n="brand.techWeek">TECH WEEK MEXICO EDITION</small></div></div>' +
        '<span class="eyebrow" data-reveal data-i18n="close.kicker">INVESTMENT + CLOSE</span>' +
        '<div class="close-offers" data-reveal><div><span data-i18n="partner.title">EVENT PARTNER</span><strong>' + money(event.eventPartnerPrice) + '</strong></div><div class="is-presenting"><span data-i18n="presenting.exclusive">EXCLUSIVE PRESENTING PRODUCT</span><strong>' + money(event.presentingProductPrice) + '</strong><small>' + event.presentingPositions + ' <i data-i18n="presenting.position">POSITION</i></small></div></div>' +
        '<div class="allocation" data-reveal><span><i style="--value:' + event.allocation.rewards + '%"></i><b>' + event.allocation.rewards + '%</b><small data-i18n="close.rewards">REWARDS</small></span><span><i style="--value:' + event.allocation.operations + '%"></i><b>' + event.allocation.operations + '%</b><small data-i18n="close.operations">OPERATIONS</small></span><span><i style="--value:' + event.allocation.media + '%"></i><b>' + event.allocation.media + '%</b><small data-i18n="close.media">MEDIA CAPTURE</small></span><span><i style="--value:' + event.allocation.integration + '%"></i><b>' + event.allocation.integration + '%</b><small data-i18n="close.integration">INTEGRATION</small></span></div>' +
        '<div class="close-proof" data-reveal><span><b>' + event.attendees + '</b> <i data-i18n="event.attendees">ATTENDEES</i></span><span><b>' + event.requiredBrandActions + '</b> <i data-i18n="function.requiredActions">REQUIRED [brand] ACTIONS</i></span></div>' +
        '<div class="close-event" data-reveal><b>' + event.displayDate.toUpperCase() + '</b><span>' + event.venue.toUpperCase() + ' · ' + event.city.toUpperCase() + '</span><strong>FUTURE RENAISSANCE</strong><a href="https://axis.show" target="_blank" rel="noopener noreferrer">AXIS.SHOW</a></div>' +
      '</div>' + star("close-star") +
    '</section>'
  ];

  var stage = document.getElementById("stage");
  if (stage) stage.innerHTML = slides.join("");
})();
