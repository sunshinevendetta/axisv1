(function () {
  "use strict";

  var concepts = {};

  function add(id, code, title, summary, details) {
    concepts[id] = { code: code, title: title, summary: summary, details: details };
  }

  add("venue", "03 / VENUE", "Owl Condesa", "The venue is the physical operating layer where culture, hospitality, missions, media and sponsor behavior meet.", [
    "October 28, 2026 · Mexico City",
    "A selected 120-person room",
    "The LED environment, live program and hospitality operate together",
    "AXIS staff connect participation, validation and documentation on site",
  ]);

  var roles = {
    artist: ["Creates or performs an authored work inside the program.", "Artwork and performance access", "Creation and intervention authority", "Artist-specific missions"],
    creator: ["Translates the night into original social or editorial material.", "Creator access state", "Capture and publishing missions", "Opt-in content attribution"],
    agent: ["Connects people, ideas and opportunities across the room.", "Network-oriented access", "Connection and invitation missions", "Verified introductions can affect score"],
    partner: ["Represents an organization contributing a defined function.", "Partner access", "Activation and hosting authority", "Sponsor actions remain separately validated"],
    press: ["Documents the cultural context with editorial independence.", "Press access", "Interview and documentation permissions", "No required endorsement"],
    operator: ["Runs the systems that keep the event and mission flow moving.", "Operational access", "Validation and exception authority", "Not ranked against guests"],
    guest: ["Participates through the general mission journey.", "General event access", "All public missions", "Can advance through participation tiers"],
    collector: ["Engages with works, editions and reward objects.", "Collector access state", "Collect and claim missions", "Limited-object moments"],
  };

  Object.keys(roles).forEach(function (role) {
    var copy = roles[role];
    add("role-" + role, "04 / " + role.toUpperCase(), role.toUpperCase(), copy[0], copy.slice(1));
  });

  add("program-system", "05 / PROGRAM", "One authored environment", "The program is an interconnected system rather than a sequence of unrelated attractions.", ["Art establishes the premise", "Music controls energy", "Live systems make participation visible", "Hospitality, missions, sponsor function and media reinforce one another"]);
  add("program-art", "05 / ART", "Art", "Digital works and gallery moments establish the visual language of the night.", ["Curated digital artists", "Works integrated into venue screens", "Cultural context for every interaction"]);
  add("program-music", "05 / MUSIC", "Music", "Ritmos de la Noche becomes the emotional clock of the event.", ["Saturna", "Isaac Olmos", "Lulú", "Malu Go"]);
  add("program-live", "05 / LIVE SYSTEMS", "Live systems", "The LED environment, mapping and live data states let the room respond to participation.", ["12-meter LED environment", "Video mapping", "Mission and reward states", "Livestream-ready visual moments"]);
  add("program-hospitality", "05 / HOSPITALITY", "Hospitality", "Beer and canapés support the pace of the night and can enter a validated reward flow.", ["Guest care", "Timed service moments", "Potential sponsor-linked serve", "Staff-assisted redemption"]);
  add("program-brand", "05 / [brand]", "Defined sponsor function", "The sponsor performs one useful role instead of appearing as decorative logo inventory.", ["One behavior", "One validation rule", "One reward or consequence", "One measurable result"]);
  add("program-missions", "05 / MISSIONS", "Mission system", "Missions convert attendance into directed participation without interrupting the cultural program.", ["Clear trigger", "Simple action", "Visible consequence", "Reward and proof"]);
  add("program-stream", "05 / LIVESTREAM", "Livestream and media", "Selected moments extend beyond the room while the event remains the primary experience.", ["Livestream integration where relevant", "Photography", "Video", "Post-event documentation"]);

  add("dynamic-register", "06 / 01", "Register", "A guest enters through an AXIS QR, NFC or staff-assisted check-in and receives a readable state.", ["Consent and identity state", "Role or access assignment", "Mission passport opens", "No score without an action"]);
  add("dynamic-act", "06 / 02", "Act", "The guest completes a visible action connected to the program or sponsor function.", ["Attend", "Create", "Vote", "Use, taste, collect or share"]);
  add("dynamic-verify", "06 / 03", "Verify", "AXIS staff or the interaction system confirms that the action actually happened.", ["Staff check", "Scan or tap", "Digital completion state", "Reward gate remains separate"]);
  add("dynamic-advance", "06 / 04", "Advance", "Verified actions accumulate into score, participation tier and leaderboard state.", ["Score updates", "Tier changes", "Reward eligibility", "Post-event record"]);
  add("tier-observer", "06 / TIER 01", "Observer", "Entry state for a guest who has arrived but has not completed meaningful participation.", ["0–1 verified missions", "Can browse and discover", "No automatic reward", "Invitation to begin"]);
  add("tier-participant", "06 / TIER 02", "Participant", "A guest who has moved from presence into active involvement.", ["2–3 verified missions", "Appears in live participation", "Eligible for an initial benefit", "Progress remains visible"]);
  add("tier-contributor", "06 / TIER 03", "Contributor", "A guest whose repeated actions materially affect the room and program.", ["4–5 verified missions", "Higher score weight", "Expanded reward access", "Strong documentation signal"]);
  add("tier-catalyst", "06 / TIER 04", "Catalyst", "The highest state, reserved for guests who complete the most demanding path.", ["6+ verified missions", "Top leaderboard visibility", "Final reward eligibility", "Gold-star completion state"]);

  var missions = {
    connect: ["Begin the passport by making a verified connection.", "Tap AXIS NFC or scan QR", "Open the mission state", "Confirm the connection", "Receive the first progress signal"],
    "check-in": ["Turn arrival into a verified event state.", "Present access credential", "Staff confirms entry", "Role and permissions load", "Check-in becomes reportable"],
    create: ["Respond to an authored prompt with a visible contribution.", "Choose a prompt", "Create with an installation, artist or product", "Capture the output", "Approve or collect the result"],
    intervene: ["Change a live element of the room through an intentional action.", "Receive a physical or digital trigger", "Complete the intervention", "System or staff confirms it", "The room displays the consequence"],
    vote: ["Register one choice that can affect a bounded live outcome.", "Open the choice", "Submit once", "Display aggregate state", "Record participation, not personal opinion"],
    collect: ["Claim a work, edition or reward after meeting its condition.", "Complete prerequisite", "Validate eligibility", "Unlock claim", "Record redemption separately"],
    stream: ["Join a live or social media moment through explicit opt-in.", "Choose the media action", "Complete or approve capture", "Attribute correctly", "Count only the verified action"],
    complete: ["Close the passport and resolve the final participation state.", "Review completed missions", "Verify final score", "Unlock eligible reward", "Write the result to the event report"],
  };

  Object.keys(missions).forEach(function (mission) {
    var copy = missions[mission];
    add("mission-" + mission, "07 / " + mission.toUpperCase(), mission.toUpperCase(), copy[0], copy.slice(1));
  });

  var sponsorMissions = {
    register: ["REGISTER", "Create a verified account, RSVP or product state."],
    taste: ["TASTE", "Complete an action, then unlock a serve or sample."],
    create: ["CREATE", "Use the product or prompt to make a live output."],
    vote: ["VOTE", "Register one choice that affects a bounded result."],
    claim: ["CLAIM", "Validate eligibility, then redeem a limited benefit."],
    share: ["SHARE", "Opt into a documented social or media action."],
  };

  Object.keys(sponsorMissions).forEach(function (mission, index) {
    var copy = sponsorMissions[mission];
    var details = mission === "taste"
      ? ["Register or complete the agreed action", "Staff validates completion", "Drink or product reward unlocks", "Redemption is tracked separately"]
      : ["Define one useful guest behavior", "Choose a simple validation rule", "Separate action from reward", "Report the verified result"];
    add("sponsor-" + mission, "08 / IDEA " + String(index + 1).padStart(2, "0"), copy[0], copy[1], details);
  });

  add("measurement-proof", "10 / PROOF", "Verified event proof", "AXIS converts completed actions into a reportable record without presenting synthetic outcomes as forecasts.", ["Live validation log", "Mission completion record", "Reward redemption record", "Post-event cohort report"]);
  add("metric-actions", "10 / ACTIONS", "Qualified actions", "Only actions that meet the agreed validation rule are counted.", ["Rule defined before doors", "Validation at the point of action", "Duplicates and incomplete states excluded", "Reported by mission and stage"]);
  add("metric-coverage", "10 / COVERAGE", "Mission coverage", "Coverage confirms that the complete guest journey has been designed before launch.", ["Entry", "Action", "Validation", "Reward and reporting"]);
  add("metric-report", "10 / REPORT", "Cohort report", "The sponsor receives a post-event view of how the activation performed as a system.", ["Attendance and participation", "Mission completion", "Qualified sponsor actions", "Reward redemption and media outputs"]);
  add("metric-output", "10 / OUTPUTS", "Rewards and content", "Redemptions and documented content show what the activation produced beyond exposure.", ["Reward claims", "Photo and video moments", "Product-use evidence", "Approved reporting assets"]);

  add("partner-investment", "11 / INVESTMENT", "$2,500 Event Partner", "The investment purchases a complete activation system, not individual attendees or a cost-per-action guarantee.", ["40% rewards", "25% operations", "20% media capture", "15% integration"]);
  add("partner-cohort", "11 / SYSTEM 01", "Event-wide function", "One defined sponsor function is available across the complete Future Renaissance room.", ["Authored before the event", "Integrated where product use occurs", "Clear guest-facing instruction", "No logo wall"]);
  add("partner-mission", "11 / SYSTEM 02", "Mission and reward design", "AXIS turns the selected sponsor behavior into a clear mission with a distinct reward gate.", ["Trigger", "Action", "Validation", "Reward"]);
  add("partner-validation", "11 / SYSTEM 03", "Staff execution", "On-site staff guide the interaction and validate completion without confusing action with reward.", ["Guest guidance", "Point-of-use validation", "Exception handling", "Redemption control"]);
  add("partner-systems", "11 / SYSTEM 04", "Event integration", "The sponsor function appears in screens and live systems exactly where it helps the guest journey.", ["Mission screen", "Reward state", "Livestream where relevant", "Product-use moment"]);
  add("partner-media", "11 / SYSTEM 05", "Media capture", "Photography and video document the activation as an experience, not a collection of logo impressions.", ["Dedicated activation moments", "Product interaction", "Room context", "Delivery-ready documentation"]);
  add("partner-report", "11 / SYSTEM 06", "Measurement and report", "Live tracking becomes a post-event performance report tied to the agreed activation mechanics.", ["Qualified actions", "Mission conversion", "Reward redemption", "Content outputs"]);

  add("presenting-system", "12 / PRESENTING PRODUCT", "A signature role", "The presenting product is a qualitatively different cultural role—not simply more placement.", ["Category exclusivity", "Hero mission", "Signature Product Experience", "Priority integration and dedicated media"]);
  add("presenting-exclusive", "12 / EXCLUSIVITY", "One position", "Only one product receives the presenting designation and category exclusivity.", ["Single presenting position", "Clear hierarchy beneath AXIS", "No competing category sponsor", "Priority visual and mission integration"]);
  add("presenting-continuation", "12 / CONTINUATION", "Beyond the event", "The presenting relationship continues for 30 days and includes one additional smaller AXIS activation.", ["30-day continuation", "One smaller activation", "Dedicated product media", "Extended reporting"]);

  add("signature-system", "13 / SIGNATURE", "Signature Product Experience", "AXIS authors one event-specific expression guests use, consume, wear, collect, activate, unlock or create with.", ["Designed for the sponsor category", "Embedded in the Future Renaissance world", "Connected to a hero mission", "Documented as a dedicated moment"]);
  var expressions = {
    serve: ["Signature serve", "A named drink, tasting or serving ritual becomes the product's authored expression.", ["Named serve", "Limited tasting", "Dedicated ritual", "Mission-unlocked option"]],
    object: ["Limited object", "A physical object carries the product into collecting, customization or wearable participation.", ["Limited edition", "Personalization", "Collector object", "Physical mission reward"]],
    ritual: ["Product ritual", "A repeatable moment makes product use visible and memorable inside the event.", ["Clear sequence", "Staff-supported execution", "Hero visual moment", "Documented completion"]],
    creation: ["Product-powered creation", "Technology or material from the sponsor powers a live creative output.", ["Creation prompt", "Live visual or object", "Guest contribution", "Collectible output"]],
    edition: ["Event edition", "A Future Renaissance edition gives an existing product a time-bound cultural context.", ["Event-specific treatment", "Limited availability", "Collectible framing", "No generic merchandise"]],
    reward: ["Named reward", "The reward becomes part of the narrative and unlocks only through a verified action.", ["Distinct eligibility rule", "Named benefit", "Controlled redemption", "Reportable outcome"]],
  };
  Object.keys(expressions).forEach(function (id) {
    add("signature-" + id, "13 / EXPRESSION", expressions[id][0], expressions[id][1], expressions[id][2]);
  });

  add("time-before", "14 / BEFORE", "Build the world", "AXIS authors the function, mission, validation, reward and visual integration before doors open.", ["Activation design", "Mission UX", "Reward system", "Staff and production preparation"]);
  add("time-live", "14 / LIVE", "Operate the experience", "Guests act, staff validate, rewards unlock and media captures the system in motion.", ["On-site operation", "Product use", "Live measurement", "Photo, video and livestream"]);
  add("time-after", "14 / AFTER", "Turn activity into proof", "AXIS organizes verified participation and documentation into a sponsor-ready report.", ["Performance reporting", "Content delivery", "Cohort analysis", "No invented financial outcomes"]);
  add("time-continuation", "14 / +30 DAYS", "Presenting continuation", "Exclusive Presenting Product extends the relationship beyond Future Renaissance.", ["30-day continuation", "One additional smaller AXIS activation", "Extended product media", "Extended reporting"]);

  add("close-event-partner", "15 / OPTION 01", "Event Partner", "$2,500 USD funds a complete sponsor activation across Future Renaissance.", ["Defined function and required mission", "Reward and validation system", "Operations, media and integration", "Post-event report"]);
  add("close-presenting", "15 / OPTION 02", "Exclusive Presenting Product", "$3,500 USD gives one product a signature role inside and beyond the event.", ["Everything in Event Partner", "Category exclusivity and hero mission", "Signature Product Experience", "30-day continuation and extended reporting"]);
  add("budget-rewards", "15 / 40%", "Rewards", "This portion funds the benefits guests unlock after completing the selected behavior.", ["Physical or digital rewards", "Product or hospitality redemption", "Controlled quantity", "Reward fulfillment"]);
  add("budget-operations", "15 / 25%", "Operations", "This portion funds the people and systems that make the activation work on site.", ["Staff training and execution", "Guest guidance", "Validation", "Redemption management"]);
  add("budget-media", "15 / 20%", "Media capture", "This portion funds documentation of the activation in its cultural context.", ["Photography", "Video", "Product-use moments", "Delivery and documentation"]);
  add("budget-integration", "15 / 15%", "Integration", "This portion connects the sponsor function to the event's visual and technical systems.", ["Mission and reward interface", "Screen placement at point of use", "Livestream integration where relevant", "Reporting setup"]);

  var formatDefinitions = {
    "format-gallery": ["Art gallery", "Digital works are curated into the venue rather than treated as decoration.", ["Curated digital artists", "Screen and room placement", "Context inside the live program", "Post-event documentation"]],
    "format-djs": ["DJ sets", "Ritmos de la Noche gives the event an authored musical arc.", ["Saturna", "Isaac Olmos", "Lulú", "Malu Go"]],
    "format-mapping": ["Video mapping", "Projected imagery extends the Future Renaissance visual world through Owl Condesa.", ["Venue-specific treatment", "Brand integration where useful", "Live visual moments", "Capture-ready output"]],
    "format-led": ["12 m LED screen", "The LED environment carries mapping, onboarding, missions and reward states.", ["Program visuals", "Guest instructions", "Participation states", "Sponsor function"]],
    "format-stream": ["Livestream recording", "Selected live moments can be broadcast or recorded without replacing the in-room experience.", ["Live program capture", "Sponsor moments where relevant", "Recording archive", "Post-event excerpts"]],
    "format-photo": ["Photography", "Photography documents the room, artists, guests and product-use moments.", ["Event archive", "Activation coverage", "Guest interaction", "Sponsor-ready selects"]],
    "format-aftermovie": ["Aftermovie", "Edited recap material turns the night into a concise post-event narrative.", ["Event atmosphere", "Program highlights", "Sponsor function", "Delivery-ready edit"]],
    "format-testimonials": ["Testimonial capture", "Guest and artist observations are captured when available and appropriate.", ["Opt-in capture", "Cultural context", "Short excerpts", "No guaranteed quotation volume"]],
    "format-collectibles": ["Post-event collectibles", "Selected moments may become digital or physical collectible outputs.", ["Event-specific object", "Mission-linked claim", "Controlled edition", "When technically available"]],
    "format-passport": ["Mission passport", "A readable participation state connects access, missions, score and rewards.", ["Guest state", "Mission progress", "Validation history", "Reward eligibility"]],
    "format-nfc": ["AXIS NFC / QR", "A fast entry point opens the sponsor mission without forcing guests through unrelated steps.", ["Tap or scan", "Mobile landing state", "Mission entry", "Staff fallback"]],
    "format-onboarding": ["Onboarding screens", "Clear instructions explain the action, validation rule and benefit before participation begins.", ["What to do", "Where to do it", "How it is verified", "What it unlocks"]],
    "format-staff": ["Staff-guided flow", "AXIS staff support participation and handle validation or redemption exceptions on site.", ["Guest guidance", "Point-of-action support", "Validation", "Exception handling"]],
    "format-reward": ["Reward redemption", "The qualifying action and the reward claim remain separate, controlled states.", ["Eligibility check", "Controlled quantity", "Redemption record", "No duplicate claim"]],
    "format-guestlist": ["Selected guestlist", "The 120-person room combines the event's cultural audience with approved sponsor guests.", ["Curated attendance", "Partner invitations", "Role-aware access", "Attendance reporting"]],
    "format-action": ["Sponsor action", "One useful guest behavior is defined before the event and integrated into the program.", ["One clear trigger", "One visible action", "One validation rule", "One reportable result"]],
    "format-flow": ["Reward flow", "The sponsor system follows a readable register, act, validate, drink or reward, and report sequence.", ["Register", "Act", "Validate", "Unlock the validated drink or category-appropriate reward", "Report"]],
    "format-report": ["Post-event report", "The final report joins participation, reward, media and attendance records.", ["Qualified actions", "Mission completion", "Reward redemption", "Media and attendance"]],
  };
  Object.keys(formatDefinitions).forEach(function (id) {
    var item = formatDefinitions[id];
    add(id, "05 / EVENT FORMAT", item[0], item[1], item[2]);
  });

  var systemDefinitions = {
    "system-produce": ["Produce the format", "AXIS authors the full Future Renaissance operating format before sponsor integration begins."],
    "system-build": ["Build the reward layer", "The mission, validation rule, reward inventory and reporting fields are defined before doors."],
    "system-arrive": ["Guests arrive", "Access and role states are established as the guest enters Owl Condesa."],
    "system-enter": ["Tap NFC / QR", "The guest opens the relevant AXIS passport or sponsor mission."],
    "system-mission": ["Mission starts", "The interface explains the action, validation rule and potential benefit."],
    "system-action": ["Complete the action", "The guest performs the selected behavior inside the live event."],
    "system-validate": ["Validate", "Staff or the interaction system confirms the action actually happened."],
    "system-reward": ["Unlock the drink or reward", "A distinct redemption state opens only after validation; the benefit can be hospitality or another category-appropriate reward."],
    "system-score": ["Update score and tier", "The verified action changes the guest's live participation state."],
    "system-leaderboard": ["Reflect on the leaderboard", "Qualified participation becomes visible without exposing private identity data."],
    "system-capture": ["Capture the experience", "AXIS documents the activation, product use and room context."],
    "system-report": ["Deliver the report", "The brand receives verified participation, redemption and media outputs after the event."],
  };
  Object.keys(systemDefinitions).forEach(function (id) {
    var item = systemDefinitions[id];
    add(id, "06 / HOW IT WORKS", item[0], item[1], ["Designed before doors", "Operated on site", "Captured in context", "Included in the final record"]);
  });
  add("phase-produce", "06 / PHASE A", "Fund + produce", "The first phase creates the operating system before the audience arrives.", ["Format design", "Sponsor function", "Mission and reward logic", "Production preparation"]);
  add("phase-live", "06 / PHASE B", "On-site flow", "The second phase moves the guest through action, validation and reward.", ["Access", "Guidance", "Validation", "Redemption and advancement"]);
  add("phase-report", "06 / PHASE C", "Capture + report", "The final phase converts the live activation into evidence and deliverables.", ["Photography and video", "Participation records", "Reward records", "Post-event report"]);

  add("component-rewards", "07 / COMPONENT 01", "Rewards", "Rewards give the verified guest action an immediate and memorable consequence.", ["Defined inventory", "Eligibility rule", "Controlled redemption", "Redemption reporting"]);
  add("component-operations", "07 / COMPONENT 02", "Operations", "Operations make the sponsor system legible and reliable in the room.", ["Staff guidance", "Access support", "Validation", "Exception and redemption management"]);
  add("component-capture", "07 / COMPONENT 03", "Capture", "Media capture documents what the activation looked like and how guests used it.", ["Photography", "Video", "Placement and product use", "Testimonials when available"]);
  add("component-integration", "07 / COMPONENT 04", "Integration", "Integration connects the function to Future Renaissance screens, mapping and guest flow.", ["12 m LED", "Projection mapping", "Onboarding and mission UI", "Reward and livestream states"]);

  var deliveryTitles = {
    "deliverable-photography": "Photography", "deliverable-aftermovie": "Aftermovie", "deliverable-livestream": "Livestream recording", "deliverable-clips": "Short clips", "deliverable-placement": "Placement captures", "deliverable-led": "LED intervention", "deliverable-mapping": "Projection mapping", "deliverable-guest-testimonials": "Guest testimonials", "deliverable-artist-testimonials": "Artist testimonials", "deliverable-social": "Social content",
    "report-photo-folder": "Photo folder", "report-aftermovie": "Aftermovie material", "report-short-clips": "Short video clips", "report-placement": "Placement captures", "report-actions": "Qualified action count", "report-participation": "Mission participation count", "report-attendance": "Attendance estimate", "report-redemptions": "Reward redemption count", "report-social": "Social actions", "report-collectibles": "Minted collectibles", "report-testimonials": "Testimonial excerpts", "report-written": "Brief written report",
  };
  Object.keys(deliveryTitles).forEach(function (id) {
    var isReport = id.indexOf("report-") === 0;
    add(id, "10 / " + (isReport ? "POST-EVENT" : "MEDIA"), deliveryTitles[id], isReport ? "This item is organized in the post-event delivery package." : "This production item is included in the event capture scope.", isReport ? ["Collected after the event", "Organized for sponsor review", "Reported only when available or verified", "Delivery format agreed with the sponsor"] : ["Captured in the Future Renaissance environment", "Focused on authored event moments", "Sponsor use follows agreed rights", "Final selection follows production review"]);
  });

  var offerTitles = {
    "offer-mission-entry": "AXIS NFC / QR mission entry", "offer-rewards": "Reward inventory", "offer-mission-design": "Sponsor mission design", "offer-validation": "Staff and system validation", "offer-onboarding": "Onboarding screen presence", "offer-redemption": "Reward redemption control", "offer-led": "12 m LED visual integration", "offer-mapping": "Projection mapping placement", "offer-gallery": "Art gallery placement", "offer-livestream": "Livestream / recording placement", "offer-photography": "Photography", "offer-aftermovie": "Aftermovie inclusion", "offer-testimonials": "Testimonial capture", "offer-product": "Product-use documentation", "offer-participation": "Qualified action tracking", "offer-placement": "Placement captures", "offer-attendance": "Attendance report", "offer-performance": "Post-event performance report",
  };
  Object.keys(offerTitles).forEach(function (id) {
    add(id, "11 / INCLUDED", offerTitles[id], "This capability is included in the $2,500 Event Partner system.", ["Designed for the selected sponsor function", "Integrated into the live event where relevant", "Operated or captured by AXIS", "Reflected in post-event delivery"]);
  });

  window.FUTURE_RENAISSANCE_CONCEPTS = concepts;
})();
