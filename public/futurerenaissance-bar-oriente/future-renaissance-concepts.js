(function () {
  "use strict";

  var concepts = {};

  function add(id, code, title, summary, details) {
    concepts[id] = { code: code, title: title, summary: summary, details: details };
  }

  add("venue", "03 / VENUE", "Bar Oriente", "The venue is the physical operating layer where culture, hospitality, activities, media and AI interaction meet.", [
    "October 28, 2026 · Mexico City",
    "250 expected Future Renaissance guests",
    "Venue screens, live program and hospitality operate together",
    "Existing venue clientele can remain and participate where agreed",
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
  add("program-music", "05 / MUSIC", "Music", "Warm-up, live coding and closing sets give the night its musical arc.", ["Warm-up DJ", "Live Coding", "Closing DJ"]);
  add("program-live", "05 / LIVE SYSTEMS", "Live systems", "Venue screens, mapping and live data states let the room respond to participation.", ["Venue-provided screens", "Video mapping", "Mission and reward states", "Livestream-ready visual moments"]);
  add("program-hospitality", "05 / HOSPITALITY", "Hospitality", "Beer and canapés support the pace of the night and can enter a validated reward flow.", ["Guest care", "Timed service moments", "Potential sponsor-linked serve", "Staff-assisted redemption"]);
  add("program-brand", "05 / PARTNERS", "Defined partner function", "Each Tech Week partner performs one useful role instead of appearing as decorative logo inventory.", ["One activity", "One interaction", "One reward or consequence", "One measurable result"]);
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

  add("partner-investment", "11 / INVESTMENT", "Where AXIS invests", "AXIS funds and operates the night. The amount is private; the categories are not.", [
    "Drinks and hospitality, production and audiovisual",
    "Programming, Claude activation and digital art",
    "Tech Week activations, media and operations",
    "The venue receives the event system, not an invoice",
  ]);
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
  add("time-continuation", "14 / REQUIRED", "Venue screens required", "Venue-provided display infrastructure is a hard requirement, not an option. The screens carry the whole audiovisual system, not only Claude.", [
    "Future Renaissance digital art and real-time graphics",
    "Live-coded visuals and selected code states",
    "Claude onboarding, instructions and Claude Code output",
    "Tech Week activities, event information and media moments",
    "AXIS controls routing; different displays can show different states",
  ]);

  add("close-event-partner", "15 / THE NIGHT", "Future Renaissance", "One night, Bar Oriente, October 28, 2026, positioned as the first official Anthropic Claude AI community party.", [
    "250 expected Future Renaissance guests",
    "Warm-up DJ, Live Coding and Closing DJ",
    "Claude activity, digital art and Tech Week micro-activations",
    "Complimentary hospitality funded by AXIS",
  ]);
  add("close-hospitality", "15 / HOSPITALITY", "Complimentary hospitality", "AXIS funds a complimentary drink allocation as part of the event.", [
    "The allocation supports arrival, circulation and participation",
    "Venue clientele may access part of it while it is available",
    "Subject to venue service rules and final hospitality mechanics",
    "Not unlimited, and never required in order to participate",
  ]);
  add("budget-rewards", "15 / 40%", "Rewards", "This portion funds the benefits guests unlock after completing the selected behavior.", ["Physical or digital rewards", "Product or hospitality redemption", "Controlled quantity", "Reward fulfillment"]);
  add("budget-operations", "15 / 25%", "Operations", "This portion funds the people and systems that make the activation work on site.", ["Staff training and execution", "Guest guidance", "Validation", "Redemption management"]);
  add("budget-media", "15 / 20%", "Media capture", "This portion funds documentation of the activation in its cultural context.", ["Photography", "Video", "Product-use moments", "Delivery and documentation"]);
  add("budget-integration", "15 / 15%", "Integration", "This portion connects the sponsor function to the event's visual and technical systems.", ["Mission and reward interface", "Screen placement at point of use", "Livestream integration where relevant", "Reporting setup"]);

  var formatDefinitions = {
    "format-gallery": ["Art gallery", "Digital works are curated into the venue rather than treated as decoration.", ["Curated digital artists", "Screen and room placement", "Context inside the live program", "Post-event documentation"]],
    "format-djs": ["DJ sets", "Warm-up DJ, Live Coding and Closing DJ give the night an authored arc.", ["Warm-up DJ", "Live Coding", "Closing DJ"]],
    "format-mapping": ["Video mapping", "Projected imagery extends the Future Renaissance visual world through Bar Oriente.", ["Venue-specific treatment", "Brand integration where useful", "Live visual moments", "Capture-ready output"]],
    "format-led": ["Venue screens", "Venue screens carry mapping, onboarding, missions and reward states.", ["Program visuals", "Guest instructions", "Participation states", "Sponsor function"]],
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
    "format-guestlist": ["Selected guestlist", "The room combines the event's cultural audience with approved sponsor guests.", ["Curated attendance", "Partner invitations", "Role-aware access", "Attendance reporting"]],
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
    "system-arrive": ["Guests arrive", "Access and role states are established as the guest enters Bar Oriente."],
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
  add("component-integration", "07 / COMPONENT 04", "Integration", "Integration connects the function to Future Renaissance screens, mapping and guest flow.", ["Venue screens", "Projection mapping", "Onboarding and mission UI", "Reward and livestream states"]);

  var deliveryTitles = {
    "deliverable-photography": "Photography", "deliverable-aftermovie": "Aftermovie", "deliverable-livestream": "Live recording", "deliverable-clips": "Short clips", "deliverable-environment": "Venue environment", "deliverable-screens": "Screen moments", "deliverable-mapping": "Projection mapping", "deliverable-guest-testimonials": "Guest testimonials", "deliverable-artist-testimonials": "Artist testimonials", "deliverable-social": "Social content",
    "report-photo-folder": "Photo folder", "report-aftermovie": "Aftermovie material", "report-short-clips": "Short video clips", "report-attendance": "Attendance estimate", "report-participation": "Activity participation count", "report-claude": "Claude activation count", "report-live-coding": "Live coding interaction", "report-redemptions": "Reward redemption count", "report-hospitality": "Hospitality usage", "report-screens": "Screen interactions", "report-social": "Social actions", "report-written": "Brief written report",
  };
  Object.keys(deliveryTitles).forEach(function (id) {
    var isReport = id.indexOf("report-") === 0;
    add(id, "10 / " + (isReport ? "POST-EVENT" : "MEDIA"), deliveryTitles[id], isReport ? "This item is organized in the post-event delivery package." : "This production item is included in the event capture scope.", isReport ? ["Collected after the event", "Organized for post-event review", "Reported only when available or verified", "Delivery format agreed with the venue"] : ["Captured in the Future Renaissance environment", "Focused on authored event moments", "Use follows agreed rights", "Final selection follows production review"]);
  });

  var offerTitles = {
    "offer-concept": "Future Renaissance concept + creative direction", "offer-programming": "Event and music programming", "offer-live-coding": "Live Coding programming", "offer-claude": "Claude activity integration", "offer-claude-onboarding": "Claude onboarding flow", "offer-claude-code": "Claude Code creative workflow", "offer-interactive": "Interactive systems", "offer-digital-art": "Digital art + visual content", "offer-render": "Rendering workstation + routing", "offer-operators": "Technical operators", "offer-activations": "Tech Week micro-activity coordination", "offer-media": "Media direction", "offer-artists": "Artist coordination", "offer-documentation": "Event documentation", "offer-hospitality": "Complimentary drink allocation funding", "offer-production": "Production coordination", "offer-guest-logic": "Guest-experience logic", "offer-activity-mechanics": "Activity mechanics",
  };
  Object.keys(offerTitles).forEach(function (id) {
    add(id, "11 / AXIS OPERATES", offerTitles[id], "This capability is operated or funded by AXIS as part of the event system.", ["Authored before doors open", "Integrated into the live event where relevant", "Operated or captured by AXIS", "Reflected in post-event documentation"]);
  });


  add("program-warmup", "03 / PROGRAM 01", "Warm-up DJ", "Opens the night: arrival, initial energy and room activation moving gradually into the central program.", [
    "Sets the social environment as guests arrive",
    "Builds toward the live coding portion",
    "Artist not yet assigned",
  ]);
  add("program-liveCoding", "03 / PROGRAM 02", "Live Coding", "Music created, sequenced, modified or manipulated through code in real time, with the code visible as part of the performance.", [
    "The audience sees code actively affecting sound and structure",
    "Selected guests can participate through a controlled interface",
    "Participation affects patterns, parameters and visual states",
    "Artist and software not yet confirmed",
  ]);
  add("program-closing", "03 / PROGRAM 03", "Closing DJ", "Takes the night from the experimental live-coding portion into its final club state.", [
    "Completes the musical arc",
    "Raises the physical energy of the room",
    "Artist not yet assigned",
  ]);
  add("official-status", "12 / STATUS", "First official Anthropic Claude AI community party", "Future Renaissance hosts the first official Anthropic Claude AI community party, as a flagship powered by AXIS.", [
    "Mexico Tech Week 2026, Mexico City",
    "250 expected Future Renaissance guests",
    "Claude is a major activity layer, not a backdrop",
    "Other technology partners participate at a smaller scale",
  ]);
  add("claude-access", "12 / CLAUDE", "Complimentary Claude access", "Participating guests receive complimentary Claude access as part of the official activity.", [
    "Granted through the on-site onboarding flow",
    "Exact entitlement confirmed with Anthropic before the event",
  ]);
  add("claude-credits", "12 / CLAUDE", "Claude credits", "Participating guests receive Claude credits as part of the official activity.", [
    "Issued alongside Claude access",
    "Exact credit amount confirmed with Anthropic before the event",
  ]);
  add("claude-ai", "12 / CLAUDE", "Claude AI", "Guests interact with Claude live inside the event environment.", [
    "Discovery, activation and interaction happen on the floor",
    "Interaction is an actual activity, not a sponsor booth",
  ]);
  add("claude-code", "12 / CLAUDE", "Claude Code", "Guests explore Claude Code and contribute to coded creative output during the night.", [
    "Guests submit creative ideas and intent",
    "Claude assists the coding and creative process",
    "Selected results appear in the event environment",
  ]);
  add("claude-live-creation", "12 / CLAUDE", "Live creation", "Guest intent becomes code, and code becomes sound and image in the room.", [
    "Claude interprets intent and assists code generation",
    "The visual runtime renders the final output",
    "Output is constrained by Future Renaissance visual rules",
  ]);
  add("claude-community", "12 / CLAUDE", "Community interaction", "The Claude layer is designed around the community in the room.", [
    "Shared creation rather than individual demos",
    "Results are visible on the venue screens",
  ]);
  add("flow-guest", "08 / FLOW 01", "Guest", "A guest brings intent: an idea, a direction or a creative prompt.", ["Entry point of the live creation chain"]);
  add("flow-claude", "08 / FLOW 02", "Claude", "Claude interprets the guest's intent and assists the creative process.", ["Claude does not render the final image directly", "It interprets intent and helps produce code"]);
  add("flow-claude-code", "08 / FLOW 03", "Claude Code", "Claude Code generates or modifies the code that drives the visual system.", ["Controlled code generation", "Operates inside predefined interfaces"]);
  add("flow-code", "08 / FLOW 04", "Code", "The resulting code is validated before it is allowed to run.", ["Input validation and sandboxing", "Timeout and error handling"]);
  add("flow-rules", "08 / FLOW 05", "Future Renaissance visual rules", "The visual language constrains what live output can look like.", ["Guest prompts cannot destroy the visual identity", "Output still reads as Future Renaissance"]);
  add("flow-render", "08 / FLOW 06", "Render", "Controlled visual software renders the final graphic output.", ["The runtime renders, not the model", "Operator override available at all times"]);
  add("flow-screens", "08 / FLOW 07", "Venue screens", "The rendered output is routed to the venue display network.", ["AXIS controls routing", "Different displays can show different states"]);
  add("flow-fallback", "08 / FLOW 08", "Safe fallback", "A failed request or bad code state must never black out the venue displays.", ["Last-known-good scene", "Manual operator override and reset", "Fallback visual scene always available"]);
  add("budget-hospitality", "11 / INVESTS", "Drinks + hospitality", "Complimentary drink allocation and guest hospitality, funded by AXIS.", ["The amount is private", "The allocation is real and funded"]);
  add("budget-production", "11 / INVESTS", "Production", "Technical systems, staffing and event operation.", ["Operated by AXIS"]);
  add("budget-audiovisual", "11 / INVESTS", "Audiovisual", "Visual rendering, routing, display integration and event output.", ["Connects to venue-provided screens"]);
  add("budget-programming", "11 / INVESTS", "Programming", "Warm-up DJ, Live Coding and Closing DJ.", ["Artists confirmed closer to the event"]);
  add("budget-claude", "11 / INVESTS", "Claude activation", "Claude onboarding, Claude interaction and Claude Code activities.", ["The flagship activity layer"]);
  add("budget-digital-art", "11 / INVESTS", "Digital art", "Future Renaissance artworks, visual content and interactive states.", ["Authored for the venue"]);
  add("budget-activations", "11 / INVESTS", "Tech Week activations", "Small partner experiences integrated throughout the night.", ["Small, distributed and digital-first"]);
  add("zone-entry", "13 / ZONE", "Entry", "Arrival into the Future Renaissance environment.", ["Conceptual until venue layout is confirmed"]);
  add("zone-checkin", "13 / ZONE", "Check-in / discovery", "Guests establish their role and access state.", ["NFC / QR entry into the activity system"]);
  add("zone-social", "13 / ZONE", "Social / hospitality", "Bar, circulation and the complimentary drink allocation.", ["Shared with venue clientele where agreed"]);
  add("zone-digital-art", "13 / ZONE", "Digital art", "Future Renaissance works presented in the environment.", ["Shown on venue screens and surfaces"]);
  add("zone-warmup", "13 / ZONE", "Warm-up DJ", "Opening music programming.", ["Arrival energy"]);
  add("zone-claude", "13 / ZONE", "Claude activity", "The Claude interaction point on the floor.", ["Discovery, activation and interaction"]);
  add("zone-claude-access", "13 / ZONE", "Claude access + credits", "Onboarding into complimentary Claude access and credits.", ["Entitlement confirmed with Anthropic"]);
  add("zone-activations", "13 / ZONE", "Tech Week micro-activities", "Small partner experiences distributed across the room.", ["Never a booth farm"]);
  add("zone-visuals", "13 / ZONE", "Live visuals", "Real-time graphics across the venue display network.", ["Routed and operated by AXIS"]);
  add("zone-live-coding", "13 / ZONE", "Live coding", "The central live-coded performance moment.", ["Code visible as part of the performance"]);
  add("zone-closing", "13 / ZONE", "Closing DJ", "The final club state of the night.", ["Completes the arc"]);
  add("zone-media", "13 / ZONE", "Media", "Photography, video and documentation.", ["Directed by AXIS"]);
  add("zone-venue-clients", "13 / ZONE", "Venue client flow", "Existing venue clientele can remain and participate where agreed.", ["Not treated as outsiders", "Subject to capacity, security and venue operations"]);
  add("req-screens", "14 / VENUE PROVIDES", "Screens / displays", "Venue-provided display infrastructure is required.", ["Number, size, orientation and resolution to be confirmed", "Projectors, LED or projection surfaces all count"]);
  add("req-inputs", "14 / VENUE PROVIDES", "Screen inputs", "AXIS needs to connect an external workstation to the display system.", ["HDMI, DisplayPort or SDI where applicable", "Independent feeds preferred over mirrored output"]);
  add("req-internet", "14 / VENUE PROVIDES", "Internet", "Reliable internet is required because Claude interactions operate live.", ["Wired production connection preferred", "Fallback connection strategy agreed in advance"]);
  add("req-audio", "14 / VENUE PROVIDES", "Audio + DJ", "Audio and DJ infrastructure where available.", ["Confirmed during technical review"]);
  add("req-power", "14 / VENUE PROVIDES", "Power + access", "Technical access, load-in time and a venue technical contact.", ["Access before doors for setup and soundcheck"]);
  add("req-bar", "14 / VENUE PROVIDES", "Bar + security", "Bar operation, staffing, security and capacity management.", ["Venue continues operating its own service"]);
  add("format-screens", "05 / FORMAT", "Venue screens", "Venue-provided display infrastructure carries the visual system.", ["Required, not optional", "Used by the whole event, not only Claude"]);
  add("format-hospitality", "05 / FORMAT", "Complimentary hospitality", "AXIS funds a complimentary drink allocation for the night.", ["Amount private", "Subject to venue service rules"]);
  add("format-claude", "05 / FORMAT", "Claude activity", "Guests discover Claude, activate access and interact live.", ["An actual activity, not a logo"]);
  add("format-live-coding", "05 / FORMAT", "Live coding", "Code becomes sound and image in real time.", ["Guest participation through a controlled interface"]);
  add("format-activations", "05 / FORMAT", "Tech Week micro-activations", "Small partner experiences distributed through the night.", ["Small, distributed, interactive and integrated"]);

  window.FUTURE_RENAISSANCE_CONCEPTS = concepts;
})();
