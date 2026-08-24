(function () {
  "use strict";

  var concepts = {};
  var CONCEPT_I18N = { es: {}, zh: {} };

  function add(id, code, title, summary, details) {
    concepts[id] = { code: code, title: title, summary: summary, details: details };
  }

  function addI18n(id, lang, title, summary, details) {
    CONCEPT_I18N[lang][id] = { title: title, summary: summary, details: details };
  }

  add("venue", "03 / VENUE", "Bar Oriente", "The venue is the physical operating layer where culture, hospitality, activities, media and AI interaction meet.", [
    "October 28, 2026 · Mexico City",
    "250 expected Future Renaissance guests",
    "Venue screens, live program and hospitality operate together",
    "Existing venue clientele can remain and participate where agreed",
    "AXIS staff connect participation, validation and documentation on site",
  ]);

  var roles = {
    artist: [
      "Artists, musicians and performers from the cultural and creative scene.",
      "Showcase original work through exhibitions, performances and live interventions.",
      "Connect with audiences, creators and the wider creative community.",
    ],
    creator: [
      "Digital creators, livestreamers and social media personalities in tech, music, art and culture.",
      "Creators producing live, social and editorial content around emerging culture and technology.",
      "Audiences and creators interested in participating in the event and its cultural program.",
    ],
    agent: [
      "AI agents integrated into the event as public interfaces for interaction, missions and rewards.",
      "Attendees interact with AI agents through physical and digital touchpoints across the event.",
      "AI-powered missions connect participation with access, content and rewards.",
    ],
    partner: [
      "AI, blockchain, SaaS, fintech, venture and technology companies attending Tech Week.",
      "Founders, executives, product teams and representatives from technology companies.",
      "Companies looking to connect with talent, users, investors and the wider Tech Week community.",
    ],
    builder: [
      "Developers, founders, researchers, engineers, product builders and technology operators.",
      "People building products, companies and new applications across emerging technologies.",
      "Technical and entrepreneurial audiences connected to the wider Tech Week community.",
    ],
    guest: [
      "General attendees interested in art, music, technology, culture and nightlife.",
      "People coming to experience the program, meet others and participate in the night.",
      "Open to both Tech Week audiences and the wider public.",
    ],
    collector: [
      "Art collectors, curators, galleries and buyers from the contemporary art scene.",
      "Audiences interested in physical art, digital art, editions and new forms of collecting.",
      "Collectors engaging with artists, works and the wider creative community.",
    ],
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
    "format-collectibles": ["Post-event collectibles", "Digital collectibles are how the reward system becomes tangible: each one is issued as proof that a guest actually took part in a specific activity.", ["Earned by completing a verified activity, not by purchase", "Each collectible ties back to the specific moment or activity it proves", "Functions as the guest's record of participation in the event", "Selected collectibles may unlock further rewards after the event"]],
    "format-passport": ["Mission passport", "Each attendee has a digital passport that records what they do throughout the event and determines what they can unlock.", ["Guest profile", "Completed activities", "Verified participation", "Score and rewards"]],
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
  ]);
  add("program-closing", "03 / PROGRAM 03", "Closing DJ", "Takes the night from the experimental live-coding portion into its final club state.", [
    "The set will be recorded for AXIS Radio Show on Hong Kong Community Radio, to be broadcast in their next episode",
    "Genres: UK Garage, UK Bass, House",
  ]);
  add("program-cuarto-rosa", "03 / PROGRAM 04", "Cuarto Rosa", "A second room runs its own activity in parallel with the main room, presented through Generative Music On Site.", [
    "Music is generated in real time by the people inside the room.",
    "Guests actively shape what is created, turning the room into a live generative music space.",
    "The activity runs throughout the night alongside the main room.",
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
  add("format-hospitality", "05 / FORMAT", "Complimentary hospitality", "AXIS funds a complimentary drink allocation for the night.", ["Amount set according to brand budget", "Subject to venue service rules"]);
  add("format-claude", "05 / FORMAT", "Claude activity", "Guests discover Claude, activate access and interact live.", ["Every attendee gets to connect with like-minded individuals", "The Claude community has a place to connect with old and new members"]);
  add("format-live-coding", "05 / FORMAT", "Live coding", "Code becomes sound and image in real time.", ["Guest participation through a controlled interface", "Every participation in the interaction generates points for the guest"]);
  add("format-activations", "05 / FORMAT", "Tech Week micro-activations", "Small partner experiences distributed through the night.", ["Small, distributed, interactive and integrated"]);

  (function () {
    addI18n("venue", "es", "Bar Oriente", "El venue es la capa operativa física donde convergen la cultura, la hospitalidad, las actividades, los medios y la interacción con IA.", [
      "28 de octubre de 2026 · Ciudad de México",
      "250 invitados esperados para Future Renaissance",
      "Las pantallas del venue, el programa en vivo y la hospitalidad operan en conjunto",
      "La clientela habitual del venue puede permanecer y participar donde se acuerde",
      "El personal de AXIS conecta la participación, la validación y la documentación en el sitio",
    ]);

    addI18n("role-artist", "es", "ARTISTA", "Artistas, músicos e intérpretes de la escena cultural y creativa.", [
      "Presentan trabajo original a través de exhibiciones, presentaciones e intervenciones en vivo",
      "Se conectan con audiencias, creadores y la comunidad creativa en general",
    ]);
    addI18n("role-creator", "es", "CREADOR", "Creadores digitales, streamers y personalidades de redes sociales en tecnología, música, arte y cultura.", [
      "Producen contenido en vivo, social y editorial en torno a la cultura y la tecnología emergentes",
      "Audiencias y creadores interesados en participar en el evento y su programa cultural",
    ]);
    addI18n("role-agent", "es", "AGENTE", "Agentes de IA integrados en el evento como interfaces públicas para la interacción, las actividades y las recompensas.", [
      "Los asistentes interactúan con agentes de IA a través de puntos de contacto físicos y digitales en todo el evento",
      "Las actividades impulsadas por IA conectan la participación con el acceso, el contenido y las recompensas",
    ]);
    addI18n("role-partner", "es", "SOCIO", "Empresas de IA, blockchain, SaaS, fintech, venture y tecnología que asisten a Tech Week.", [
      "Fundadores, ejecutivos, equipos de producto y representantes de empresas tecnológicas",
      "Empresas que buscan conectar con talento, usuarios, inversionistas y la comunidad más amplia de Tech Week",
    ]);
    addI18n("role-builder", "es", "CONSTRUCTOR", "Desarrolladores, fundadores, investigadores, ingenieros, constructores de producto y operadores tecnológicos.", [
      "Personas que construyen productos, empresas y nuevas aplicaciones en tecnologías emergentes",
      "Audiencias técnicas y emprendedoras conectadas con la comunidad más amplia de Tech Week",
    ]);
    addI18n("role-guest", "es", "INVITADO", "Asistentes en general interesados en arte, música, tecnología, cultura y vida nocturna.", [
      "Personas que vienen a vivir el programa, conocer gente y participar en la noche",
      "Abierto tanto a las audiencias de Tech Week como al público en general",
    ]);
    addI18n("role-collector", "es", "COLECCIONISTA", "Coleccionistas de arte, curadores, galerías y compradores de la escena de arte contemporáneo.", [
      "Audiencias interesadas en arte físico, arte digital, ediciones y nuevas formas de coleccionar",
      "Coleccionistas que interactúan con artistas, obras y la comunidad creativa en general",
    ]);

    addI18n("program-system", "es", "Un entorno de autoría propia", "El programa es un sistema interconectado, no una secuencia de atracciones sin relación entre sí.", [
      "El arte establece la premisa",
      "La música controla la energía",
      "Los sistemas en vivo hacen visible la participación",
      "La hospitalidad, las actividades, la función de los patrocinadores y los medios se refuerzan mutuamente",
    ]);
    addI18n("program-art", "es", "Arte", "Las obras digitales y los momentos de galería establecen el lenguaje visual de la noche.", [
      "Artistas digitales curados",
      "Obras integradas en las pantallas del venue",
      "Contexto cultural para cada interacción",
    ]);
    addI18n("program-music", "es", "Música", "Los sets de calentamiento, Live Coding y cierre dan a la noche su arco musical.", [
      "DJ de calentamiento",
      "Live Coding",
      "DJ de cierre",
    ]);
    addI18n("program-live", "es", "Sistemas en vivo", "Las pantallas del venue, el mapping y los estados de datos en vivo permiten que el espacio responda a la participación.", [
      "Pantallas proporcionadas por el venue",
      "Video mapping",
      "Estados de actividades y recompensas",
      "Momentos visuales listos para transmisión en vivo",
    ]);
    addI18n("program-hospitality", "es", "Hospitalidad", "La cerveza y los canapés sostienen el ritmo de la noche y pueden integrarse a un flujo de recompensas validado.", [
      "Atención al invitado",
      "Momentos de servicio programados",
      "Posible servicio vinculado a un patrocinador",
      "Canje asistido por el personal",
    ]);
    addI18n("program-brand", "es", "Función definida del socio", "Cada socio de Tech Week cumple un rol útil en lugar de aparecer como un logotipo decorativo más.", [
      "Una actividad",
      "Una interacción",
      "Una recompensa o consecuencia",
      "Un resultado medible",
    ]);
    addI18n("program-missions", "es", "Sistema de actividades", "Las actividades convierten la asistencia en participación dirigida sin interrumpir el programa cultural.", [
      "Disparador claro",
      "Acción simple",
      "Consecuencia visible",
      "Recompensa y comprobante",
    ]);
    addI18n("program-stream", "es", "Transmisión en vivo y medios", "Momentos seleccionados se extienden más allá del espacio, mientras el evento sigue siendo la experiencia principal.", [
      "Integración de transmisión en vivo donde sea pertinente",
      "Fotografía",
      "Video",
      "Documentación posterior al evento",
    ]);

    addI18n("dynamic-register", "es", "Registrarse", "El invitado ingresa mediante un QR de AXIS, NFC o un check-in asistido por el personal, y recibe un estado legible.", [
      "Estado de consentimiento e identidad",
      "Asignación de rol o acceso",
      "Se abre el pasaporte de actividades",
      "No hay puntaje sin una acción",
    ]);
    addI18n("dynamic-act", "es", "Actuar", "El invitado completa una acción visible vinculada al programa o a la función de un patrocinador.", [
      "Asistir",
      "Crear",
      "Votar",
      "Usar, probar, coleccionar o compartir",
    ]);
    addI18n("dynamic-verify", "es", "Validar", "El personal de AXIS o el sistema de interacción confirma que la acción realmente ocurrió.", [
      "Validación por el personal",
      "Escaneo o toque",
      "Estado de finalización digital",
      "La entrega de recompensas permanece separada",
    ]);
    addI18n("dynamic-advance", "es", "Avanzar", "Las acciones validadas se acumulan en puntaje, nivel de participación y posición en el tablero en vivo.", [
      "Actualización de puntaje",
      "Cambios de nivel",
      "Elegibilidad para recompensas",
      "Registro posterior al evento",
    ]);

    addI18n("tier-observer", "es", "Observador", "Estado inicial para un invitado que ha llegado pero aún no ha completado una participación significativa.", [
      "0–1 actividades validadas",
      "Puede explorar y descubrir",
      "Sin recompensa automática",
      "Invitación a comenzar",
    ]);
    addI18n("tier-participant", "es", "Participante", "Un invitado que ha pasado de estar presente a involucrarse activamente.", [
      "2–3 actividades validadas",
      "Aparece en la participación en vivo",
      "Elegible para un beneficio inicial",
      "El progreso permanece visible",
    ]);
    addI18n("tier-contributor", "es", "Colaborador", "Un invitado cuyas acciones repetidas afectan de manera concreta el espacio y el programa.", [
      "4–5 actividades validadas",
      "Mayor peso en el puntaje",
      "Acceso ampliado a recompensas",
      "Fuerte señal de documentación",
    ]);
    addI18n("tier-catalyst", "es", "Catalizador", "El estado más alto, reservado para los invitados que completan el recorrido más exigente.", [
      "6+ actividades validadas",
      "Visibilidad destacada en el tablero en vivo",
      "Elegibilidad para la recompensa final",
      "Estado de finalización con estrella dorada",
    ]);

    addI18n("venue", "zh", "Bar Oriente", "场地是文化、款待、活动、媒体和 AI 互动交汇的物理运营层。", [
      "2026年10月28日 · 墨西哥城",
      "预计250位 Future Renaissance 宾客",
      "场地屏幕、现场节目和款待协同运作",
      "在约定范围内，场地现有客群可以留下并参与",
      "AXIS 工作人员在现场连接参与、验证和记录工作",
    ]);

    addI18n("role-artist", "zh", "艺术家", "来自文化与创意领域的艺术家、音乐人与表演者。", [
      "通过展览、演出与现场介入展示原创作品",
      "与观众、创作者及更广泛的创意社区建立联系",
    ]);
    addI18n("role-creator", "zh", "创作者", "在科技、音乐、艺术与文化领域的数字创作者、主播与社交媒体达人。", [
      "围绕新兴文化与科技创作现场、社交与编辑类内容",
      "对参与本次活动及其文化项目感兴趣的观众与创作者",
    ]);
    addI18n("role-agent", "zh", "AI 代理", "作为活动公共交互界面的 AI 代理，服务于互动、活动与奖励环节。", [
      "参与者通过活动现场的实体与数字触点与 AI 代理互动",
      "AI 驱动的活动将参与和访问权限、内容与奖励连接起来",
    ]);
    addI18n("role-partner", "zh", "合作伙伴", "参加科技周的 AI、区块链、SaaS、金融科技、风投与科技类公司。", [
      "科技公司的创始人、高管、产品团队与代表",
      "希望与人才、用户、投资人及更广泛科技周社区建立联系的公司",
    ]);
    addI18n("role-builder", "zh", "建设者", "开发者、创始人、研究人员、工程师、产品建设者与技术运营人员。", [
      "在新兴技术领域构建产品、公司与新应用的人群",
      "与更广泛科技周社区相连的技术与创业型观众",
    ]);
    addI18n("role-guest", "zh", "宾客", "对艺术、音乐、科技、文化与夜生活感兴趣的普通参与者。", [
      "前来体验节目、结识他人并参与当晚活动的人群",
      "对科技周观众及广大公众开放",
    ]);
    addI18n("role-collector", "zh", "收藏家", "来自当代艺术领域的艺术收藏家、策展人、画廊与买家。", [
      "对实体艺术、数字艺术、限量版及新型收藏方式感兴趣的观众",
      "与艺术家、作品及更广泛创意社区互动的收藏家",
    ]);

    addI18n("program-system", "zh", "一个统一构思的环境", "该项目是一个相互关联的系统，而非一系列彼此无关的表演。", [
      "艺术奠定基调",
      "音乐掌控能量",
      "现场系统让参与可见",
      "款待、活动、赞助商职能与媒体相互强化",
    ]);
    addI18n("program-art", "zh", "艺术", "数字作品与展览时刻共同确立当晚的视觉语言。", [
      "精心策划的数字艺术家",
      "作品融入场地屏幕",
      "为每一次互动提供文化背景",
    ]);
    addI18n("program-music", "zh", "音乐", "暖场、Live Coding 和收场演出共同构成了当晚的音乐弧线。", [
      "暖场 DJ",
      "Live Coding",
      "收场 DJ",
    ]);
    addI18n("program-live", "zh", "现场系统", "场地屏幕、投影映射和实时数据状态让全场对参与作出响应。", [
      "场地提供的屏幕",
      "视频投影映射",
      "活动与奖励状态",
      "可供直播的视觉时刻",
    ]);
    addI18n("program-hospitality", "zh", "款待", "啤酒与开胃小食维持当晚的节奏，并可纳入经验证的奖励流程。", [
      "宾客关怀",
      "定时服务时刻",
      "可能与赞助商关联的服务",
      "工作人员协助兑换",
    ]);
    addI18n("program-brand", "zh", "明确的合作伙伴职能", "每个 Tech Week 合作伙伴都承担一项实际职能，而不只是作为装饰性的标志出现。", [
      "一项活动",
      "一次互动",
      "一项奖励或结果",
      "一个可衡量的成果",
    ]);
    addI18n("program-missions", "zh", "活动系统", "活动将出席转化为有方向的参与，同时不打断文化节目的进行。", [
      "明确的触发条件",
      "简单的操作",
      "可见的结果",
      "奖励与凭证",
    ]);
    addI18n("program-stream", "zh", "直播与媒体", "精选时刻延伸至现场之外，而活动本身始终是核心体验。", [
      "在相关场合接入直播",
      "摄影",
      "视频",
      "活动后的记录整理",
    ]);

    addI18n("dynamic-register", "zh", "登记", "宾客通过 AXIS QR、NFC 或工作人员协助完成登记，并获得一个可读取的状态。", [
      "同意与身份状态",
      "角色或访问权限分配",
      "开启活动护照",
      "没有行动就没有积分",
    ]);
    addI18n("dynamic-act", "zh", "行动", "宾客完成一项与节目或赞助商职能相关的可见行动。", [
      "出席",
      "创作",
      "投票",
      "使用、品尝、收藏或分享",
    ]);
    addI18n("dynamic-verify", "zh", "验证", "AXIS 工作人员或互动系统确认该行动确实已经发生。", [
      "工作人员验证",
      "扫描或触碰",
      "数字完成状态",
      "奖励发放环节单独进行",
    ]);
    addI18n("dynamic-advance", "zh", "晋级", "经验证的行动会累积为积分、参与等级和排行榜状态。", [
      "积分更新",
      "等级变化",
      "奖励资格",
      "活动后记录",
    ]);

    addI18n("tier-observer", "zh", "观察者", "宾客已到场但尚未完成有意义参与时的初始状态。", [
      "0–1 项已验证活动",
      "可浏览与探索",
      "无自动奖励",
      "邀请开始参与",
    ]);
    addI18n("tier-participant", "zh", "参与者", "从在场转变为积极参与的宾客。", [
      "2–3 项已验证活动",
      "出现在实时参与中",
      "有资格获得初始福利",
      "进度持续可见",
    ]);
    addI18n("tier-contributor", "zh", "贡献者", "反复行动对现场与节目产生实质影响的宾客。", [
      "4–5 项已验证活动",
      "更高的积分权重",
      "扩展的奖励访问权限",
      "强烈的记录信号",
    ]);
    addI18n("tier-catalyst", "zh", "催化者", "最高状态，专属于完成最具挑战路径的宾客。", [
      "6+ 项已验证活动",
      "排行榜顶部曝光",
      "最终奖励资格",
      "金星完成状态",
    ]);
  })();

  (function () {
    addI18n("mission-connect", "es", "CONECTAR", "Comienza el pasaporte estableciendo una conexión verificada.", ["Toca el NFC de AXIS o escanea el QR", "Abre el estado de la actividad", "Confirma la conexión", "Recibe la primera señal de progreso"]);
    addI18n("mission-check-in", "es", "CHECK-IN", "Convierte la llegada en un estado de evento verificado.", ["Presenta la credencial de acceso", "El staff confirma el ingreso", "Se cargan el rol y los permisos", "El check-in se vuelve reportable"]);
    addI18n("mission-create", "es", "CREAR", "Responde a un prompt elaborado con una contribución visible.", ["Elige un prompt", "Crea con una instalación, artista o producto", "Captura el resultado", "Aprueba o recolecta el resultado"]);
    addI18n("mission-intervene", "es", "INTERVENIR", "Cambia un elemento en vivo de la sala mediante una acción intencional.", ["Recibe un disparador físico o digital", "Completa la intervención", "El sistema o el staff lo confirma", "La sala muestra la consecuencia"]);
    addI18n("mission-vote", "es", "VOTAR", "Registra una elección que puede afectar un resultado en vivo delimitado.", ["Abre la elección", "Envía una sola vez", "Muestra el estado agregado", "Registra la participación, no la opinión personal"]);
    addI18n("mission-collect", "es", "RECOLECTAR", "Reclama una obra, edición o recompensa después de cumplir su condición.", ["Completa el requisito previo", "Valida la elegibilidad", "Desbloquea el reclamo", "Registra el canje por separado"]);
    addI18n("mission-stream", "es", "STREAM", "Únete a un momento en vivo o de redes sociales mediante opt-in explícito.", ["Elige la acción de medios", "Completa o aprueba la captura", "Atribúyelo correctamente", "Cuenta solo la acción verificada"]);
    addI18n("mission-complete", "es", "COMPLETAR", "Cierra el pasaporte y resuelve el estado final de participación.", ["Revisa las actividades completadas", "Verifica el puntaje final", "Desbloquea la recompensa elegible", "Escribe el resultado en el reporte del evento"]);
    addI18n("sponsor-register", "es", "REGISTRAR", "Crea una cuenta verificada, un RSVP o un estado de producto.", ["Define un comportamiento útil del invitado", "Elige una regla de validación simple", "Separa la acción de la recompensa", "Reporta el resultado verificado"]);
    addI18n("sponsor-taste", "es", "PROBAR", "Completa una acción y luego desbloquea un trago o una muestra.", ["Regístrate o completa la acción acordada", "El staff valida la finalización", "Se desbloquea la recompensa de bebida o producto", "El canje se rastrea por separado"]);
    addI18n("sponsor-create", "es", "CREAR", "Usa el producto o el prompt para generar un resultado en vivo.", ["Define un comportamiento útil del invitado", "Elige una regla de validación simple", "Separa la acción de la recompensa", "Reporta el resultado verificado"]);
    addI18n("sponsor-vote", "es", "VOTAR", "Registra una elección que afecta un resultado delimitado.", ["Define un comportamiento útil del invitado", "Elige una regla de validación simple", "Separa la acción de la recompensa", "Reporta el resultado verificado"]);
    addI18n("sponsor-claim", "es", "RECLAMAR", "Valida la elegibilidad y luego canjea un beneficio limitado.", ["Define un comportamiento útil del invitado", "Elige una regla de validación simple", "Separa la acción de la recompensa", "Reporta el resultado verificado"]);
    addI18n("sponsor-share", "es", "COMPARTIR", "Participa voluntariamente en una acción social o de medios documentada.", ["Define un comportamiento útil del invitado", "Elige una regla de validación simple", "Separa la acción de la recompensa", "Reporta el resultado verificado"]);
    addI18n("measurement-proof", "es", "Prueba verificada del evento", "AXIS convierte las acciones completadas en un registro reportable sin presentar resultados sintéticos como pronósticos.", ["Registro de validación en vivo", "Registro de actividades completadas", "Registro de canje de recompensas", "Reporte de cohorte posterior al evento"]);
    addI18n("metric-actions", "es", "Acciones calificadas", "Solo se cuentan las acciones que cumplen con la regla de validación acordada.", ["Regla definida antes de abrir puertas", "Validación en el punto de la acción", "Duplicados y estados incompletos excluidos", "Reportado por actividad y etapa"]);
    addI18n("metric-coverage", "es", "Cobertura de actividades", "La cobertura confirma que el recorrido completo del invitado ha sido diseñado antes del lanzamiento.", ["Entrada", "Acción", "Validación", "Recompensa y reporte"]);
    addI18n("metric-report", "es", "Reporte de cohorte", "El patrocinador recibe una vista posterior al evento de cómo funcionó la activación como sistema.", ["Asistencia y participación", "Actividades completadas", "Acciones calificadas del patrocinador", "Canje de recompensas y resultados de medios"]);
    addI18n("metric-output", "es", "Recompensas y contenido", "Los canjes y el contenido documentado muestran lo que produjo la activación más allá de la exposición.", ["Reclamos de recompensa", "Momentos de foto y video", "Evidencia de uso del producto", "Recursos de reporte aprobados"]);
    addI18n("partner-investment", "es", "Dónde invierte AXIS", "AXIS financia y opera la noche. El monto es privado; las categorías no.", ["Bebidas y hospitalidad, producción y audiovisual", "Programación, activación de Claude y arte digital", "Activaciones de Tech Week, medios y operaciones", "El recinto recibe el sistema del evento, no una factura"]);
    addI18n("partner-cohort", "es", "Función a nivel de todo el evento", "Una función de patrocinador definida está disponible en toda la sala de Future Renaissance.", ["Diseñada antes del evento", "Integrada donde ocurre el uso del producto", "Instrucción clara de cara al invitado", "Sin muro de logos"]);
    addI18n("partner-mission", "es", "Diseño de actividad y recompensa", "AXIS convierte el comportamiento seleccionado del patrocinador en una actividad clara con una puerta de recompensa distinta.", ["Disparador", "Acción", "Validación", "Recompensa"]);
    addI18n("partner-validation", "es", "Ejecución del staff", "El staff en sitio guía la interacción y valida la finalización sin confundir la acción con la recompensa.", ["Guía al invitado", "Validación en el punto de uso", "Manejo de excepciones", "Control de canje"]);
    addI18n("partner-systems", "es", "Integración con el evento", "La función del patrocinador aparece en pantallas y sistemas en vivo exactamente donde ayuda al recorrido del invitado.", ["Pantalla de actividad", "Estado de la recompensa", "Livestream cuando sea relevante", "Momento de uso del producto"]);
    addI18n("partner-media", "es", "Captura de medios", "La fotografía y el video documentan la activación como una experiencia, no como una colección de impresiones de logo.", ["Momentos dedicados de activación", "Interacción con el producto", "Contexto de la sala", "Documentación lista para entrega"]);
    addI18n("partner-report", "es", "Medición y reporte", "El seguimiento en vivo se convierte en un reporte de desempeño posterior al evento, vinculado a la mecánica de activación acordada.", ["Acciones calificadas", "Conversión de actividades", "Canje de recompensas", "Resultados de contenido"]);
    addI18n("presenting-system", "es", "Un rol distintivo", "El producto presentador es un rol cultural cualitativamente distinto, no simplemente más posicionamiento.", ["Exclusividad de categoría", "Actividad insignia", "Experiencia de Producto Distintiva", "Integración prioritaria y medios dedicados"]);
    addI18n("presenting-exclusive", "es", "Una sola posición", "Solo un producto recibe la designación de presentador y la exclusividad de categoría.", ["Posición única de presentador", "Jerarquía clara debajo de AXIS", "Sin patrocinador de categoría competidor", "Integración visual y de actividades prioritaria"]);
    addI18n("presenting-continuation", "es", "Más allá del evento", "La relación de presentador continúa durante 30 días e incluye una activación adicional más pequeña de AXIS.", ["Continuación de 30 días", "Una activación más pequeña", "Medios dedicados del producto", "Reporte extendido"]);

    addI18n("mission-connect", "zh", "连接", "通过建立一次经过验证的连接开启护照。", ["轻触 AXIS NFC 或扫描 QR", "打开活动状态", "确认连接", "接收第一个进度信号"]);
    addI18n("mission-check-in", "zh", "签到", "将到场转化为经过验证的活动状态。", ["出示访问凭证", "工作人员确认入场", "加载角色与权限", "签到成为可报告的记录"]);
    addI18n("mission-create", "zh", "创作", "以可见的贡献回应一个编写好的提示。", ["选择一个提示", "与装置、艺术家或产品共同创作", "记录产出", "认可或收藏最终成果"]);
    addI18n("mission-intervene", "zh", "介入", "通过有意的行动改变现场的一个实时元素。", ["接收物理或数字触发信号", "完成介入", "系统或工作人员确认", "现场展示其结果"]);
    addI18n("mission-vote", "zh", "投票", "登记一项可能影响有限现场结果的选择。", ["开启选择", "仅提交一次", "显示汇总状态", "记录参与情况，而非个人意见"]);
    addI18n("mission-collect", "zh", "领取", "在满足条件后领取作品、版次或奖励。", ["完成前置条件", "验证资格", "解锁领取", "单独记录兑换"]);
    addI18n("mission-stream", "zh", "直播", "通过明确选择加入直播或社交媒体时刻。", ["选择媒体行动", "完成或批准拍摄/录制", "正确署名", "仅计入已验证的行动"]);
    addI18n("mission-complete", "zh", "完成", "关闭护照并确定最终参与状态。", ["查看已完成的活动", "核实最终得分", "解锁符合条件的奖励", "将结果写入活动报告"]);
    addI18n("sponsor-register", "zh", "注册", "创建经过验证的账户、RSVP 或产品状态。", ["定义一个有用的宾客行为", "选择一个简单的验证规则", "将行动与奖励分开", "报告已验证的结果"]);
    addI18n("sponsor-taste", "zh", "品鉴", "完成一项行动，然后解锁一份酒水或试用。", ["注册或完成约定的行动", "工作人员验证完成情况", "解锁饮品或产品奖励", "兑换单独追踪记录"]);
    addI18n("sponsor-create", "zh", "创作", "使用产品或提示制作一个实时产出。", ["定义一个有用的宾客行为", "选择一个简单的验证规则", "将行动与奖励分开", "报告已验证的结果"]);
    addI18n("sponsor-vote", "zh", "投票", "登记一项影响有限结果的选择。", ["定义一个有用的宾客行为", "选择一个简单的验证规则", "将行动与奖励分开", "报告已验证的结果"]);
    addI18n("sponsor-claim", "zh", "认领", "验证资格，然后兑换一项限量权益。", ["定义一个有用的宾客行为", "选择一个简单的验证规则", "将行动与奖励分开", "报告已验证的结果"]);
    addI18n("sponsor-share", "zh", "分享", "自愿参与一项有记录的社交或媒体行动。", ["定义一个有用的宾客行为", "选择一个简单的验证规则", "将行动与奖励分开", "报告已验证的结果"]);
    addI18n("measurement-proof", "zh", "经过验证的活动证明", "AXIS 将已完成的行动转化为可报告的记录，而不会把模拟结果当作预测呈现。", ["实时验证日志", "活动完成记录", "奖励兑换记录", "活动后群组报告"]);
    addI18n("metric-actions", "zh", "合格行动", "只计入符合约定验证规则的行动。", ["规则在开场前已确定", "在行动发生点进行验证", "排除重复和不完整状态", "按活动和阶段报告"]);
    addI18n("metric-coverage", "zh", "活动覆盖率", "覆盖率确认完整的宾客旅程已在启动前设计完成。", ["入场", "行动", "验证", "奖励与报告"]);
    addI18n("metric-report", "zh", "群组报告", "赞助商会收到一份活动后的报告，展示该激活作为一个系统的整体表现。", ["出席与参与情况", "活动完成情况", "赞助商合格行动", "奖励兑换与媒体产出"]);
    addI18n("metric-output", "zh", "奖励与内容", "兑换记录和已归档的内容展示了该激活在曝光之外所产生的成果。", ["奖励领取", "照片与视频时刻", "产品使用证据", "已批准的报告素材"]);
    addI18n("partner-investment", "zh", "AXIS 的投入方向", "AXIS 出资并运营整晚活动。金额保密，但投入类别公开。", ["酒水与接待、制作与视听设备", "节目编排、Claude 激活与数字艺术", "Tech Week 激活、媒体与运营", "场地方获得的是整套活动系统，而非一张账单"]);
    addI18n("partner-cohort", "zh", "全场覆盖功能", "一项明确定义的赞助商功能将覆盖整个 Future Renaissance 现场。", ["活动前已设计完成", "整合在产品实际使用的场景中", "面向宾客的清晰说明", "没有品牌墙"]);
    addI18n("partner-mission", "zh", "活动与奖励设计", "AXIS 将选定的赞助商行为转化为一个明确的活动，并设有独立的奖励关卡。", ["触发", "行动", "验证", "奖励"]);
    addI18n("partner-validation", "zh", "现场执行", "现场工作人员引导互动并验证完成情况，不将行动与奖励混淆。", ["宾客引导", "使用点验证", "异常处理", "兑换管控"]);
    addI18n("partner-systems", "zh", "活动整合", "赞助商功能会准确出现在屏幕和实时系统中，恰好是能帮助宾客旅程的地方。", ["活动屏幕", "奖励状态", "相关时段的直播", "产品使用时刻"]);
    addI18n("partner-media", "zh", "媒体拍摄", "摄影与视频记录的是这次激活作为一场体验，而不是一堆品牌曝光的集合。", ["专属激活时刻", "产品互动", "现场氛围", "可直接交付的素材"]);
    addI18n("partner-report", "zh", "测量与报告", "实时追踪数据会转化为一份与约定激活机制相对应的活动后表现报告。", ["合格行动", "活动转化率", "奖励兑换", "内容产出"]);
    addI18n("presenting-system", "zh", "标志性角色", "呈现赞助产品是一种在性质上截然不同的文化角色，而不仅仅是更多的曝光位置。", ["品类独家权", "核心活动", "标志性产品体验", "优先整合与专属媒体"]);
    addI18n("presenting-exclusive", "zh", "唯一席位", "只有一个产品能获得呈现赞助资格和品类独家权。", ["唯一的呈现赞助席位", "在 AXIS 之下的清晰层级", "没有同品类竞争赞助商", "优先的视觉与活动整合"]);
    addI18n("presenting-continuation", "zh", "活动之后", "呈现赞助关系将持续 30 天，并包含一次额外的小型 AXIS 激活。", ["30 天延续期", "一次小型激活", "专属产品媒体", "延伸报告"]);
  })();

  (function () {
    addI18n("signature-system", "es", "Experiencia de producto de autor", "AXIS diseña una expresión específica del evento que los invitados usan, consumen, visten, coleccionan, activan, desbloquean o con la que crean.", ["Diseñada para la categoría del patrocinador", "Integrada en el mundo de Future Renaissance", "Conectada a una misión principal", "Documentada como un momento dedicado"]);
    addI18n("signature-serve", "es", "Trago de autor", "Un trago con nombre propio, una cata o un ritual de servicio se convierte en la expresión de autor del producto.", ["Trago con nombre propio", "Cata limitada", "Ritual dedicado", "Opción desbloqueada por misión"]);
    addI18n("signature-object", "es", "Objeto limitado", "Un objeto físico extiende el producto hacia el coleccionismo, la personalización o la participación en forma de accesorio para vestir.", ["Edición limitada", "Personalización", "Objeto coleccionable", "Recompensa física de misión"]);
    addI18n("signature-ritual", "es", "Ritual de producto", "Un momento repetible hace visible y memorable el uso del producto dentro del evento.", ["Secuencia clara", "Ejecución con apoyo del personal", "Momento visual principal", "Finalización documentada"]);
    addI18n("signature-creation", "es", "Creación impulsada por el producto", "La tecnología o el material del patrocinador impulsa una producción creativa en vivo.", ["Estímulo de creación", "Visual u objeto en vivo", "Contribución del invitado", "Resultado coleccionable"]);
    addI18n("signature-edition", "es", "Edición del evento", "Una edición de Future Renaissance otorga a un producto existente un contexto cultural acotado en el tiempo.", ["Tratamiento específico del evento", "Disponibilidad limitada", "Presentación coleccionable", "Sin merchandising genérico"]);
    addI18n("signature-reward", "es", "Recompensa nombrada", "La recompensa se convierte en parte de la narrativa y se desbloquea únicamente mediante una acción verificada.", ["Regla de elegibilidad específica", "Beneficio con nombre propio", "Canje controlado", "Resultado reportable"]);
    addI18n("time-before", "es", "Construir el mundo", "AXIS diseña la función, la misión, la validación, la recompensa y la integración visual antes de abrir puertas.", ["Diseño de la activación", "UX de la misión", "Sistema de recompensas", "Preparación de personal y producción"]);
    addI18n("time-live", "es", "Operar la experiencia", "Los invitados actúan, el personal valida, las recompensas se desbloquean y los medios capturan el sistema en movimiento.", ["Operación en sitio", "Uso del producto", "Medición en vivo", "Foto, video y transmisión en vivo"]);
    addI18n("time-after", "es", "Convertir la actividad en evidencia", "AXIS organiza la participación verificada y la documentación en un informe listo para el patrocinador.", ["Reporte de desempeño", "Entrega de contenido", "Análisis de cohortes", "Sin resultados financieros inventados"]);
    addI18n("time-continuation", "es", "Se requieren pantallas del venue", "La infraestructura de pantallas provista por el venue es un requisito indispensable, no una opción. Las pantallas sostienen todo el sistema audiovisual, no solo a Claude.", [
      "Arte digital de Future Renaissance y gráficos en tiempo real",
      "Visuales generados con Live Coding y estados de código seleccionados",
      "Onboarding de Claude, instrucciones y resultados de Claude Code",
      "Actividades de Tech Week, información del evento y momentos para medios",
      "AXIS controla el ruteo; diferentes pantallas pueden mostrar diferentes estados",
    ]);
    addI18n("close-event-partner", "es", "Future Renaissance", "Una noche, Bar Oriente, 28 de octubre de 2026, posicionada como la primera fiesta oficial de la comunidad Anthropic Claude AI.", [
      "250 invitados esperados de Future Renaissance",
      "DJ de apertura, Live Coding y DJ de cierre",
      "Actividad de Claude, arte digital y micro-activaciones de Tech Week",
      "Hospitalidad de cortesía financiada por AXIS",
    ]);
    addI18n("close-hospitality", "es", "Hospitalidad de cortesía", "AXIS financia una asignación de bebidas de cortesía como parte del evento.", [
      "La asignación apoya la llegada, la circulación y la participación",
      "La clientela habitual del venue puede acceder a una parte mientras esté disponible",
      "Sujeta a las reglas de servicio del venue y a la mecánica final de hospitalidad",
      "No es ilimitada, y nunca es requisito para participar",
    ]);
    addI18n("budget-rewards", "es", "Recompensas", "Esta parte financia los beneficios que los invitados desbloquean al completar la acción seleccionada.", ["Recompensas físicas o digitales", "Canje de producto o de hospitalidad", "Cantidad controlada", "Entrega de recompensas"]);
    addI18n("budget-operations", "es", "Operaciones", "Esta parte financia a las personas y los sistemas que hacen que la activación funcione en sitio.", ["Capacitación y ejecución del personal", "Orientación a invitados", "Validación", "Gestión de canje"]);
    addI18n("budget-media", "es", "Captura de medios", "Esta parte financia la documentación de la activación en su contexto cultural.", ["Fotografía", "Video", "Momentos de uso del producto", "Entrega y documentación"]);
    addI18n("budget-integration", "es", "Integración", "Esta parte conecta la función del patrocinador con los sistemas visuales y técnicos del evento.", ["Interfaz de misión y recompensa", "Ubicación de pantallas en el punto de uso", "Integración de transmisión en vivo cuando sea relevante", "Configuración de reportes"]);

    addI18n("signature-system", "zh", "招牌产品体验", "AXIS 打造一种专属于本次活动的表达形式，供宾客使用、消费、穿戴、收藏、启动、解锁或参与创作。", ["为赞助品类量身设计", "融入 Future Renaissance 的世界观", "与核心任务相连", "作为专属时刻被记录"]);
    addI18n("signature-serve", "zh", "招牌特调", "一款有名字的特调、一场品鉴或一套服务仪式，成为产品原创表达的载体。", ["命名特调", "限量品鉴", "专属仪式", "任务解锁选项"]);
    addI18n("signature-object", "zh", "限量实物", "一件实物将产品延伸至收藏、定制或可穿戴的参与形式。", ["限量版", "个性化定制", "收藏品", "实物任务奖励"]);
    addI18n("signature-ritual", "zh", "产品仪式", "一个可重复的时刻，让产品的使用在活动中变得可见且令人难忘。", ["清晰的流程", "工作人员协助执行", "核心视觉时刻", "完成情况被记录"]);
    addI18n("signature-creation", "zh", "产品驱动的创作", "赞助方提供的技术或素材，驱动一次现场创作产出。", ["创作引导", "现场视觉或实物", "宾客贡献", "可收藏的产出"]);
    addI18n("signature-edition", "zh", "活动限定版", "Future Renaissance 限定版为现有产品赋予具有时限性的文化语境。", ["专属于本次活动的呈现方式", "供应有限", "以收藏品的方式呈现", "并非普通周边商品"]);
    addI18n("signature-reward", "zh", "命名奖励", "该奖励成为叙事的一部分，只有通过验证的行为才能解锁。", ["明确的资格规则", "具名权益", "受控兑换", "可报告的结果"]);
    addI18n("time-before", "zh", "构建世界", "在活动开场前，AXIS 就设计好功能、任务、验证、奖励与视觉整合。", ["活动设计", "任务 UX", "奖励系统", "工作人员与制作筹备"]);
    addI18n("time-live", "zh", "运营体验", "宾客行动，工作人员验证，奖励解锁，媒体记录整个系统的运转。", ["现场运营", "产品使用", "实时测量", "照片、视频与直播"]);
    addI18n("time-after", "zh", "将参与转化为证明", "AXIS 将经过验证的参与数据与相关记录整理成可直接交付赞助方的报告。", ["效果报告", "内容交付", "群组分析", "不虚构财务成果"]);
    addI18n("time-continuation", "zh", "场地屏幕是硬性要求", "场地提供的显示设备基础设施是硬性要求，而非可选项。这些屏幕承载的是整套视听系统，而不仅仅是 Claude。", [
      "Future Renaissance 数字艺术与实时图形",
      "Live Coding 生成的视觉画面与精选代码状态",
      "Claude 引导流程、操作说明与 Claude Code 的输出内容",
      "科技周相关活动、活动信息与媒体时刻",
      "AXIS 负责信号路由；不同屏幕可以呈现不同状态",
    ]);
    addI18n("close-event-partner", "zh", "Future Renaissance", "2026 年 10 月 28 日，Bar Oriente 的这一夜，被定位为首个官方 Anthropic Claude AI 社区派对。", [
      "预计 250 名 Future Renaissance 宾客",
      "暖场 DJ、Live Coding 与收场 DJ",
      "Claude 互动活动、数字艺术与科技周微互动",
      "由 AXIS 提供的免费款待",
    ]);
    addI18n("close-hospitality", "zh", "免费款待", "作为活动的一部分，AXIS 出资提供免费饮品配额。", [
      "该配额用于支持入场、流动与参与环节",
      "在配额可用期间，场地常客也可以使用其中一部分",
      "须遵循场地服务规则及最终的款待机制",
      "配额并非无限，且从不作为参与的前提条件",
    ]);
    addI18n("budget-rewards", "zh", "奖励", "这部分预算用于资助宾客完成指定行为后解锁的权益。", ["实物或数字奖励", "产品或款待兑换", "数量受控", "奖励发放"]);
    addI18n("budget-operations", "zh", "运营", "这部分预算用于资助让现场活动得以运转的人员与系统。", ["人员培训与执行", "宾客引导", "验证", "兑换管理"]);
    addI18n("budget-media", "zh", "媒体记录", "这部分预算用于在其文化语境中记录本次活动。", ["摄影", "视频", "产品使用时刻", "交付与记录"]);
    addI18n("budget-integration", "zh", "系统整合", "这部分预算将赞助方功能与活动的视觉及技术系统相连接。", ["任务与奖励界面", "在使用节点部署屏幕", "在相关场景中整合直播", "报告体系搭建"]);
  })();

  (function () {
    addI18n("program-warmup", "es", "DJ de Apertura", "Abre la noche: llegada, energía inicial y activación del espacio, avanzando gradualmente hacia el programa central.", ["Establece el ambiente social a medida que llegan los invitados", "Prepara el terreno para el segmento de live coding", "Artista aún no asignado"]);
    addI18n("program-liveCoding", "es", "Live Coding", "Música creada, secuenciada, modificada o manipulada mediante código en tiempo real, con el código visible como parte de la performance.", ["El público ve el código afectando activamente el sonido y la estructura", "Invitados seleccionados pueden participar a través de una interfaz controlada", "La participación afecta patrones, parámetros y estados visuales"]);
    addI18n("program-closing", "es", "DJ de Cierre", "Lleva la noche desde el segmento experimental de live coding hacia su estado final de club.", ["El set será grabado para el programa de AXIS Radio en Hong Kong Community Radio, para transmitirse en su próximo episodio", "Géneros: UK Garage, UK Bass, House"]);
    addI18n("program-cuarto-rosa", "es", "Cuarto Rosa", "Una segunda sala desarrolla su propia actividad en paralelo a la sala principal, presentada a través de Generative Music On Site.", ["La música se genera en tiempo real por las personas dentro de la sala.", "Los invitados dan forma activamente a lo que se crea, convirtiendo la sala en un espacio de música generativa en vivo.", "La actividad se desarrolla durante toda la noche junto a la sala principal."]);

    addI18n("official-status", "es", "Primera fiesta oficial de la comunidad Anthropic Claude AI", "Future Renaissance presenta la primera fiesta oficial de la comunidad Anthropic Claude AI, como evento insignia impulsado por AXIS.", ["Mexico Tech Week 2026, Ciudad de México", "250 invitados esperados en Future Renaissance", "Claude es una capa de actividad principal, no un simple telón de fondo", "Otros socios tecnológicos participan a menor escala"]);
    addI18n("claude-access", "es", "Acceso gratuito a Claude", "Los invitados participantes reciben acceso gratuito a Claude como parte de la actividad oficial.", ["Otorgado a través del flujo de onboarding en el sitio", "Beneficio exacto confirmado con Anthropic antes del evento"]);
    addI18n("claude-credits", "es", "Créditos de Claude", "Los invitados participantes reciben créditos de Claude como parte de la actividad oficial.", ["Emitidos junto con el acceso a Claude", "Monto exacto de créditos confirmado con Anthropic antes del evento"]);
    addI18n("claude-ai", "es", "Claude AI", "Los invitados interactúan con Claude en vivo dentro del entorno del evento.", ["El descubrimiento, la activación y la interacción ocurren en la pista", "La interacción es una actividad real, no un stand de patrocinador"]);
    addI18n("claude-code", "es", "Claude Code", "Los invitados exploran Claude Code y contribuyen a la producción creativa codificada durante la noche.", ["Los invitados envían ideas e intenciones creativas", "Claude asiste en el proceso de codificación y creación", "Los resultados seleccionados aparecen en el entorno del evento"]);
    addI18n("claude-live-creation", "es", "Creación en vivo", "La intención del invitado se convierte en código, y el código se convierte en sonido e imagen en la sala.", ["Claude interpreta la intención y asiste en la generación de código", "El runtime visual renderiza el resultado final", "El resultado está limitado por las reglas visuales de Future Renaissance"]);
    addI18n("claude-community", "es", "Interacción comunitaria", "La capa de Claude está diseñada en torno a la comunidad presente en la sala.", ["Creación compartida en lugar de demostraciones individuales", "Los resultados son visibles en las pantallas del venue"]);

    addI18n("flow-guest", "es", "Invitado", "Un invitado aporta una intención: una idea, una dirección o un prompt creativo.", ["Punto de entrada de la cadena de creación en vivo"]);
    addI18n("flow-claude", "es", "Claude", "Claude interpreta la intención del invitado y asiste en el proceso creativo.", ["Claude no renderiza directamente la imagen final", "Interpreta la intención y ayuda a producir código"]);
    addI18n("flow-claude-code", "es", "Claude Code", "Claude Code genera o modifica el código que impulsa el sistema visual.", ["Generación de código controlada", "Opera dentro de interfaces predefinidas"]);
    addI18n("flow-code", "es", "Código", "El código resultante se valida antes de que se le permita ejecutarse.", ["Validación de entrada y sandboxing", "Tiempo de espera y manejo de errores"]);
    addI18n("flow-rules", "es", "Reglas visuales de Future Renaissance", "El lenguaje visual limita el aspecto que puede tener el resultado en vivo.", ["Los prompts de los invitados no pueden destruir la identidad visual", "El resultado sigue leyéndose como Future Renaissance"]);
    addI18n("flow-render", "es", "Renderizado", "Un software visual controlado renderiza el resultado gráfico final.", ["El runtime renderiza, no el modelo", "Anulación del operador disponible en todo momento"]);
    addI18n("flow-screens", "es", "Pantallas del venue", "El resultado renderizado se enruta hacia la red de pantallas del venue.", ["AXIS controla el ruteo", "Distintas pantallas pueden mostrar distintos estados"]);
    addI18n("flow-fallback", "es", "Alternativa segura", "Una solicitud fallida o un estado de código defectuoso nunca debe dejar en negro las pantallas del venue.", ["Última escena válida conocida", "Anulación y reinicio manual por parte del operador", "Escena visual de respaldo siempre disponible"]);

    addI18n("budget-hospitality", "es", "Bebidas + hospitalidad", "Asignación de bebidas de cortesía y hospitalidad para los invitados, financiada por AXIS.", ["El monto es privado", "La asignación es real y está financiada"]);
    addI18n("budget-production", "es", "Producción", "Sistemas técnicos, personal y operación del evento.", ["Operado por AXIS"]);
    addI18n("budget-audiovisual", "es", "Audiovisual", "Renderizado visual, ruteo, integración de pantallas y salida del evento.", ["Se conecta a las pantallas provistas por el venue"]);
    addI18n("budget-programming", "es", "Programación", "DJ de Apertura, Live Coding y DJ de Cierre.", ["Artistas confirmados más cerca del evento"]);
    addI18n("budget-claude", "es", "Activación de Claude", "Onboarding de Claude, interacción con Claude y actividades de Claude Code.", ["La capa de actividad insignia"]);
    addI18n("budget-digital-art", "es", "Arte digital", "Obras de Future Renaissance, contenido visual y estados interactivos.", ["Creado específicamente para el venue"]);
    addI18n("budget-activations", "es", "Activaciones de Tech Week", "Pequeñas experiencias de socios integradas a lo largo de la noche.", ["Pequeñas, distribuidas y con enfoque digital"]);

    addI18n("zone-entry", "es", "Entrada", "Llegada al entorno de Future Renaissance.", ["Conceptual hasta que se confirme el layout del venue"]);
    addI18n("zone-checkin", "es", "Check-in / descubrimiento", "Los invitados establecen su rol y su estado de acceso.", ["Entrada por NFC / QR al sistema de actividades"]);
    addI18n("zone-social", "es", "Social / hospitalidad", "Bar, circulación y la asignación de bebidas de cortesía.", ["Compartido con la clientela del venue donde se acuerde"]);
    addI18n("zone-digital-art", "es", "Arte digital", "Obras de Future Renaissance presentadas en el entorno.", ["Mostradas en las pantallas y superficies del venue"]);
    addI18n("zone-warmup", "es", "DJ de Apertura", "Programación musical de apertura.", ["Energía de llegada"]);
    addI18n("zone-claude", "es", "Actividad Claude", "El punto de interacción con Claude en la pista.", ["Descubrimiento, activación e interacción"]);
    addI18n("zone-claude-access", "es", "Acceso + créditos de Claude", "Onboarding hacia el acceso y los créditos gratuitos de Claude.", ["Beneficio confirmado con Anthropic"]);
    addI18n("zone-activations", "es", "Micro-actividades de Tech Week", "Pequeñas experiencias de socios distribuidas por la sala.", ["Nunca una granja de stands"]);
    addI18n("zone-visuals", "es", "Visuales en vivo", "Gráficos en tiempo real a través de la red de pantallas del venue.", ["Ruteados y operados por AXIS"]);
    addI18n("zone-live-coding", "es", "Live coding", "El momento central de la performance de live coding.", ["Código visible como parte de la performance"]);
    addI18n("zone-closing", "es", "DJ de Cierre", "El estado final de club de la noche.", ["Completa el arco"]);
    addI18n("zone-media", "es", "Media", "Fotografía, video y documentación.", ["Dirigido por AXIS"]);
    addI18n("zone-venue-clients", "es", "Flujo de clientes del venue", "La clientela existente del venue puede permanecer y participar donde se acuerde.", ["No tratados como forasteros", "Sujeto a capacidad, seguridad y operaciones del venue"]);

    addI18n("req-screens", "es", "Pantallas / displays", "Se requiere infraestructura de pantallas provista por el venue.", ["Número, tamaño, orientación y resolución por confirmar", "Proyectores, LED o superficies de proyección cuentan por igual"]);
    addI18n("req-inputs", "es", "Entradas de pantalla", "AXIS necesita conectar una estación de trabajo externa al sistema de pantallas.", ["HDMI, DisplayPort o SDI según corresponda", "Se prefieren señales independientes sobre una salida espejada"]);
    addI18n("req-internet", "es", "Internet", "Se requiere internet confiable porque las interacciones con Claude operan en vivo.", ["Se prefiere una conexión de producción cableada", "Estrategia de conexión de respaldo acordada de antemano"]);
    addI18n("req-audio", "es", "Audio + DJ", "Infraestructura de audio y DJ donde esté disponible.", ["Confirmado durante la revisión técnica"]);
    addI18n("req-power", "es", "Energía + acceso", "Acceso técnico, tiempo de montaje y un contacto técnico del venue.", ["Acceso antes de la apertura de puertas para montaje y prueba de sonido"]);
    addI18n("req-bar", "es", "Bar + seguridad", "Operación del bar, personal, seguridad y gestión de aforo.", ["El venue continúa operando su propio servicio"]);

    addI18n("format-screens", "es", "Pantallas del venue", "La infraestructura de pantallas provista por el venue sostiene el sistema visual.", ["Requerida, no opcional", "Utilizada por todo el evento, no solo por Claude"]);
    addI18n("format-hospitality", "es", "Hospitalidad de cortesía", "AXIS financia una asignación de bebidas de cortesía para la noche.", ["Monto definido según el presupuesto de la marca", "Sujeto a las normas de servicio del venue"]);
    addI18n("format-claude", "es", "Actividad Claude", "Los invitados descubren Claude, activan su acceso e interactúan en vivo.", ["Cada asistente puede conectar con personas afines", "La comunidad de Claude tiene un espacio para conectar a miembros antiguos y nuevos"]);
    addI18n("format-live-coding", "es", "Live coding", "El código se convierte en sonido e imagen en tiempo real.", ["Participación de los invitados a través de una interfaz controlada", "Cada participación en la interacción genera puntos para el invitado"]);
    addI18n("format-activations", "es", "Micro-activaciones de Tech Week", "Pequeñas experiencias de socios distribuidas a lo largo de la noche.", ["Pequeñas, distribuidas, interactivas e integradas"]);

    addI18n("program-warmup", "zh", "暖场 DJ", "开启当晚：宾客入场、初始气氛与场地氛围逐渐带动，过渡到核心节目环节。", ["随着宾客陆续抵达，营造社交氛围", "为后续的 Live Coding 环节做铺垫", "艺人尚未确定"]);
    addI18n("program-liveCoding", "zh", "Live Coding", "通过代码实时创作、编排、修改或操控音乐，代码作为表演的一部分实时可见。", ["观众可以看到代码实时影响声音与结构", "部分受邀宾客可通过受控界面参与", "参与会影响模式、参数与视觉状态"]);
    addI18n("program-closing", "zh", "闭场 DJ", "将当晚从实验性的 Live Coding 环节带入最终的俱乐部状态。", ["该场次将为 AXIS Radio 节目录制，在香港社区电台（Hong Kong Community Radio）的下一期节目中播出", "曲风：UK Garage、UK Bass、House"]);
    addI18n("program-cuarto-rosa", "zh", "Cuarto Rosa", "第二个房间与主厅同步进行独立活动，通过 Generative Music On Site 呈现。", ["音乐由房间内的人们实时生成。", "宾客主动塑造创作内容，让这个房间成为一个实时生成音乐的空间。", "该活动将持续整晚，与主厅同步进行。"]);

    addI18n("official-status", "zh", "首个官方 Anthropic Claude AI 社区派对", "Future Renaissance 举办首个官方 Anthropic Claude AI 社区派对，作为由 AXIS 打造的旗舰活动。", ["2026 年墨西哥科技周，墨西哥城", "预计 250 位 Future Renaissance 宾客", "Claude 是主要的活动层面，而非陪衬", "其他科技合作伙伴以较小规模参与"]);
    addI18n("claude-access", "zh", "免费 Claude 访问权限", "参与的宾客将作为官方活动的一部分，获得免费的 Claude 访问权限。", ["通过现场引导流程发放", "具体权益将在活动前与 Anthropic 确认"]);
    addI18n("claude-credits", "zh", "Claude 额度", "参与的宾客将作为官方活动的一部分，获得 Claude 额度。", ["与 Claude 访问权限一并发放", "具体额度数量将在活动前与 Anthropic 确认"]);
    addI18n("claude-ai", "zh", "Claude AI", "宾客可在活动现场与 Claude 实时互动。", ["发现、开通与互动都在现场进行", "这是一项真实的互动活动，而非赞助商展位"]);
    addI18n("claude-code", "zh", "Claude Code", "宾客将在当晚探索 Claude Code，并参与创作代码化的创意成果。", ["宾客提交创意想法与意图", "Claude 协助编码与创作过程", "精选成果将呈现在活动现场"]);
    addI18n("claude-live-creation", "zh", "实时创作", "宾客的意图转化为代码，代码再转化为现场的声音与影像。", ["Claude 解读意图并协助生成代码", "视觉运行系统渲染最终输出", "输出受 Future Renaissance 视觉规则的约束"]);
    addI18n("claude-community", "zh", "社区互动", "Claude 这一层体验围绕现场社区而设计。", ["共同创作，而非个人演示", "成果会呈现在场地屏幕上"]);

    addI18n("flow-guest", "zh", "宾客", "宾客带来意图：一个想法、一个方向或一个创意提示。", ["实时创作链条的起点"]);
    addI18n("flow-claude", "zh", "Claude", "Claude 解读宾客的意图，并协助创作过程。", ["Claude 并不直接渲染最终画面", "它负责解读意图并协助生成代码"]);
    addI18n("flow-claude-code", "zh", "Claude Code", "Claude Code 生成或修改驱动视觉系统的代码。", ["受控的代码生成", "在预设界面内运行"]);
    addI18n("flow-code", "zh", "代码", "生成的代码在被允许运行前会经过验证。", ["输入验证与沙箱机制", "超时与错误处理"]);
    addI18n("flow-rules", "zh", "Future Renaissance 视觉规则", "视觉语言限定了实时输出可能呈现的样式。", ["宾客的提示无法破坏整体视觉识别", "输出始终保持 Future Renaissance 的风格"]);
    addI18n("flow-render", "zh", "渲染", "受控的视觉软件渲染出最终的图形输出。", ["由运行系统负责渲染，而非模型本身", "操作员可随时进行人工干预"]);
    addI18n("flow-screens", "zh", "场地屏幕", "渲染后的输出会被路由到场地的显示网络。", ["由 AXIS 控制路由", "不同屏幕可以显示不同的状态"]);
    addI18n("flow-fallback", "zh", "安全备用方案", "请求失败或代码状态异常时，绝不能导致场地屏幕黑屏。", ["回退至最后一个正常画面", "操作员可手动干预与重置", "始终备有备用视觉画面"]);

    addI18n("budget-hospitality", "zh", "饮品 + 款待", "由 AXIS 出资提供的免费饮品配额与宾客款待。", ["具体金额保密", "配额真实且资金已到位"]);
    addI18n("budget-production", "zh", "制作", "技术系统、人员配置与活动运营。", ["由 AXIS 负责运营"]);
    addI18n("budget-audiovisual", "zh", "视听", "视觉渲染、路由、屏幕整合与活动输出。", ["接入场地提供的屏幕"]);
    addI18n("budget-programming", "zh", "节目编排", "暖场 DJ、Live Coding 与闭场 DJ。", ["艺人将在活动临近时确认"]);
    addI18n("budget-claude", "zh", "Claude 激活", "Claude 引导、Claude 互动与 Claude Code 相关活动。", ["旗舰级的活动层面"]);
    addI18n("budget-digital-art", "zh", "数字艺术", "Future Renaissance 的艺术作品、视觉内容与互动状态。", ["专为该场地创作"]);
    addI18n("budget-activations", "zh", "科技周激活活动", "贯穿整晚的小型合作伙伴体验。", ["小规模、分散且以数字为先"]);

    addI18n("zone-entry", "zh", "入口", "进入 Future Renaissance 环境的入场区域。", ["在场地布局确认前仅为概念方案"]);
    addI18n("zone-checkin", "zh", "签到 / 发现", "宾客在此确立自己的角色与访问状态。", ["通过 NFC / QR 进入活动系统"]);
    addI18n("zone-social", "zh", "社交 / 款待", "酒吧、动线以及免费饮品配额。", ["在双方同意的范围内与场地原有客群共享"]);
    addI18n("zone-digital-art", "zh", "数字艺术", "在现场展示的 Future Renaissance 作品。", ["呈现在场地的屏幕与其他展示面上"]);
    addI18n("zone-warmup", "zh", "暖场 DJ", "开场音乐编排。", ["入场氛围能量"]);
    addI18n("zone-claude", "zh", "Claude 活动区", "现场的 Claude 互动点。", ["发现、开通与互动"]);
    addI18n("zone-claude-access", "zh", "Claude 访问权限 + 额度", "引导宾客开通免费的 Claude 访问权限与额度。", ["权益已与 Anthropic 确认"]);
    addI18n("zone-activations", "zh", "科技周微互动", "分布在场地各处的小型合作伙伴体验。", ["绝非展位集市"]);
    addI18n("zone-visuals", "zh", "实时视觉", "遍布场地显示网络的实时图形。", ["由 AXIS 负责路由与运营"]);
    addI18n("zone-live-coding", "zh", "Live coding", "整晚的核心 Live Coding 表演时刻。", ["代码作为表演的一部分实时可见"]);
    addI18n("zone-closing", "zh", "闭场 DJ", "当晚最终的俱乐部状态。", ["完成整晚的脉络"]);
    addI18n("zone-media", "zh", "媒体", "摄影、视频与记录。", ["由 AXIS 统筹指导"]);
    addI18n("zone-venue-clients", "zh", "场地客群动线", "在双方同意的范围内，场地原有客群可以留下并参与其中。", ["不会被视为外人", "仍需遵守场地的容量、安保与运营安排"]);

    addI18n("req-screens", "zh", "屏幕 / 显示设备", "需要由场地提供显示设备基础设施。", ["数量、尺寸、朝向与分辨率待确认", "投影仪、LED 或投影幕均可"]);
    addI18n("req-inputs", "zh", "屏幕输入接口", "AXIS 需要将外部工作站连接到显示系统。", ["视情况使用 HDMI、DisplayPort 或 SDI", "相较于镜像输出，更倾向使用独立信号源"]);
    addI18n("req-internet", "zh", "网络", "由于 Claude 互动为实时运行，需要稳定可靠的网络。", ["优先使用有线的制作专用网络", "提前商定备用连接方案"]);
    addI18n("req-audio", "zh", "音响 + DJ", "视情况提供音响与 DJ 相关基础设施。", ["将在技术勘察阶段确认"]);
    addI18n("req-power", "zh", "电力 + 场地准入", "技术准入、进场搭建时间以及一位场地技术联络人。", ["开门迎宾前需可进场进行搭建与音响调试"]);
    addI18n("req-bar", "zh", "酒吧 + 安保", "酒吧运营、人员配置、安保与容量管理。", ["场地将继续运营其自有服务"]);

    addI18n("format-screens", "zh", "场地屏幕", "由场地提供的显示设备基础设施承载整个视觉系统。", ["为必需项，而非可选项", "供整场活动使用，而不仅限于 Claude"]);
    addI18n("format-hospitality", "zh", "免费款待", "AXIS 为当晚提供免费饮品配额。", ["金额根据品牌预算确定", "须遵守场地的服务规定"]);
    addI18n("format-claude", "zh", "Claude 活动", "宾客发现 Claude、开通访问权限并进行实时互动。", ["每位参与者都能与志同道合的人建立联系", "Claude 社区在这里为新老成员提供交流的空间"]);
    addI18n("format-live-coding", "zh", "Live coding", "代码实时转化为声音与影像。", ["宾客通过受控界面参与", "每一次互动参与都会为宾客累积积分"]);
    addI18n("format-activations", "zh", "科技周微激活活动", "贯穿整晚、分布各处的小型合作伙伴体验。", ["小规模、分散、互动且融入整体"]);
  })();

  (function () {
    addI18n("format-gallery", "es", "Galería de arte", "Las obras digitales se curan e integran al venue, en lugar de tratarse como decoración.", ["Artistas digitales curados", "Ubicación en pantallas y salas", "Contexto dentro del programa en vivo", "Documentación post-evento"]);
    addI18n("format-djs", "es", "Sets de DJ", "El DJ de apertura, Live Coding y el DJ de cierre le dan a la noche un arco narrativo definido.", ["DJ de apertura", "Live Coding", "DJ de cierre"]);
    addI18n("format-mapping", "es", "Video mapping", "Las imágenes proyectadas extienden el universo visual de Future Renaissance a través de Bar Oriente.", ["Tratamiento específico para el venue", "Integración de marca cuando resulte útil", "Momentos visuales en vivo", "Resultado listo para captura"]);
    addI18n("format-led", "es", "Pantallas del venue", "Las pantallas del venue muestran el mapping, la incorporación de invitados, las actividades y los estados de recompensa.", ["Visuales del programa", "Instrucciones para invitados", "Estados de participación", "Función de patrocinio"]);
    addI18n("format-stream", "es", "Grabación de livestream", "Momentos selectos en vivo pueden transmitirse o grabarse sin reemplazar la experiencia dentro del venue.", ["Captura del programa en vivo", "Momentos de patrocinio cuando corresponda", "Archivo de grabación", "Extractos post-evento"]);
    addI18n("format-photo", "es", "Fotografía", "La fotografía documenta el espacio, los artistas, los invitados y los momentos de uso del producto.", ["Archivo del evento", "Cobertura de la activación", "Interacción con invitados", "Selección lista para patrocinadores"]);
    addI18n("format-aftermovie", "es", "Aftermovie", "El material de recapitulación editado convierte la noche en una narrativa concisa post-evento.", ["Atmósfera del evento", "Momentos destacados del programa", "Función de patrocinio", "Edición lista para entrega"]);
    addI18n("format-testimonials", "es", "Captura de testimonios", "Las observaciones de invitados y artistas se capturan cuando estén disponibles y sea apropiado.", ["Captura opcional", "Contexto cultural", "Extractos breves", "No se garantiza un volumen de citas"]);
    addI18n("format-collectibles", "es", "Coleccionables post-evento", "Los coleccionables digitales son la forma en que el sistema de recompensas se vuelve tangible: cada uno se emite como prueba de que un invitado participó realmente en una actividad específica.", ["Se obtienen al completar una actividad validada, no mediante compra", "Cada coleccionable queda vinculado al momento o actividad específica que certifica", "Funciona como el registro de participación del invitado en el evento", "Algunos coleccionables seleccionados pueden desbloquear recompensas adicionales después del evento"]);
    addI18n("format-passport", "es", "Pasaporte de actividades", "Cada asistente cuenta con un pasaporte digital que registra lo que hace durante el evento y determina lo que puede desbloquear.", ["Perfil del invitado", "Actividades completadas", "Participación verificada", "Puntaje y recompensas"]);
    addI18n("format-nfc", "es", "AXIS NFC / QR", "Un punto de entrada rápido abre la actividad del patrocinador sin obligar a los invitados a pasar por pasos ajenos a ella.", ["Toque o escaneo", "Estado de aterrizaje móvil", "Entrada a la actividad", "Respaldo del staff"]);
    addI18n("format-onboarding", "es", "Pantallas de incorporación", "Instrucciones claras explican la acción, la regla de validación y el beneficio antes de que comience la participación.", ["Qué hacer", "Dónde hacerlo", "Cómo se verifica", "Qué desbloquea"]);
    addI18n("format-staff", "es", "Flujo guiado por staff", "El staff de AXIS apoya la participación y resuelve en sitio las excepciones de validación o canje.", ["Orientación a invitados", "Apoyo en el punto de acción", "Validación", "Manejo de excepciones"]);
    addI18n("format-reward", "es", "Canje de recompensas", "La acción que califica y el reclamo de la recompensa se mantienen como estados separados y controlados.", ["Verificación de elegibilidad", "Cantidad controlada", "Registro de canje", "Sin reclamos duplicados"]);
    addI18n("format-guestlist", "es", "Lista de invitados seleccionada", "El espacio combina a la audiencia cultural del evento con los invitados aprobados por el patrocinador.", ["Asistencia curada", "Invitaciones de partners", "Acceso según el rol", "Reporte de asistencia"]);
    addI18n("format-action", "es", "Acción del patrocinador", "Se define un único comportamiento útil del invitado antes del evento y se integra al programa.", ["Un disparador claro", "Una acción visible", "Una regla de validación", "Un resultado reportable"]);
    addI18n("format-flow", "es", "Flujo de recompensa", "El sistema del patrocinador sigue una secuencia legible de registro, acción, validación, bebida o recompensa, y reporte.", ["Registro", "Acción", "Validación", "Desbloquear la bebida validada o la recompensa correspondiente a la categoría", "Reporte"]);
    addI18n("format-report", "es", "Reporte post-evento", "El reporte final integra los registros de participación, recompensas, medios y asistencia.", ["Acciones calificadas", "Cumplimiento de actividades", "Canje de recompensas", "Medios y asistencia"]);

    addI18n("format-gallery", "zh", "艺术画廊", "数字作品经过策划融入场地，而非仅作装饰。", ["精选数字艺术家", "屏幕与空间布局", "融入现场节目的语境", "活动后的记录归档"]);
    addI18n("format-djs", "zh", "DJ 表演", "暖场 DJ、Live Coding 与压轴 DJ 为整晚赋予一条精心设计的叙事弧线。", ["暖场 DJ", "Live Coding", "压轴 DJ"]);
    addI18n("format-mapping", "zh", "光雕投影", "投影影像将 Future Renaissance 的视觉世界延伸至整个 Bar Oriente。", ["针对场地定制的处理方式", "在适当时机融入品牌元素", "现场视觉时刻", "可直接用于拍摄记录的成片"]);
    addI18n("format-led", "zh", "场地屏幕", "场地屏幕承载投影内容、宾客引导、活动与奖励状态的展示。", ["节目视觉内容", "宾客指引", "参与状态", "赞助功能"]);
    addI18n("format-stream", "zh", "直播录制", "精选的现场时刻可被直播或录制，但不会取代现场体验本身。", ["现场节目录制", "相关的赞助时刻", "录制存档", "活动后精选片段"]);
    addI18n("format-photo", "zh", "摄影", "摄影记录现场空间、艺术家、宾客与产品使用的瞬间。", ["活动存档", "活动执行记录", "宾客互动", "可供赞助商使用的精选图片"]);
    addI18n("format-aftermovie", "zh", "活动回顾片", "剪辑而成的回顾影片将当晚浓缩为一段简洁的活动后叙事。", ["活动氛围", "节目精彩片段", "赞助功能", "可直接交付使用的剪辑成片"]);
    addI18n("format-testimonials", "zh", "证言采集", "在条件允许且合适的情况下，收集宾客与艺术家的评价。", ["自愿采集", "文化语境", "简短摘录", "不保证获取的评价数量"]);
    addI18n("format-collectibles", "zh", "活动后收藏品", "数字收藏品是奖励系统变得具体可见的方式：每一件都作为宾客确实参与了某项特定活动的证明而发放。", ["通过完成经验证的活动获得，而非购买", "每件收藏品都对应其所证明的具体时刻或活动", "作为宾客在活动中参与记录的凭证", "部分精选收藏品在活动结束后可解锁额外奖励"]);
    addI18n("format-passport", "zh", "活动护照", "每位参与者都拥有一本数字护照，记录他们在活动期间的各项行为，并决定他们能解锁什么。", ["宾客档案", "已完成的活动", "经验证的参与情况", "积分与奖励"]);
    addI18n("format-nfc", "zh", "AXIS NFC / QR", "快速入口可直接开启赞助活动，无需宾客经过无关的步骤。", ["轻触或扫描", "移动端落地状态", "活动入口", "工作人员现场支持"]);
    addI18n("format-onboarding", "zh", "引导屏幕", "在参与开始前，清晰的说明解释具体行动、验证规则与可获得的收益。", ["该做什么", "在哪里做", "如何验证", "可解锁什么"]);
    addI18n("format-staff", "zh", "工作人员引导流程", "AXIS 工作人员在现场协助宾客参与，并处理验证或兑换过程中的例外情况。", ["宾客引导", "行动现场支持", "验证", "例外情况处理"]);
    addI18n("format-reward", "zh", "奖励兑换", "达标行动与奖励领取被保持为两个独立且受控的状态。", ["资格核验", "数量控制", "兑换记录", "不可重复领取"]);
    addI18n("format-guestlist", "zh", "精选宾客名单", "现场将活动的文化观众与经批准的赞助商宾客汇聚于同一空间。", ["精心策划的出席名单", "合作伙伴邀请", "按角色区分的准入权限", "出席情况报告"]);
    addI18n("format-action", "zh", "赞助商行动", "活动前会为宾客定义一项有价值的行为，并将其整合进节目流程中。", ["一个明确的触发点", "一个可见的行动", "一条验证规则", "一个可报告的结果"]);
    addI18n("format-flow", "zh", "奖励流程", "赞助商体系遵循一套清晰可读的流程：注册、行动、验证、解锁饮品或奖励，以及报告。", ["注册", "行动", "验证", "解锁经验证的饮品或对应类别的奖励", "报告"]);
    addI18n("format-report", "zh", "活动后报告", "最终报告汇总参与、奖励、媒体与出席方面的记录。", ["达标行动", "活动完成情况", "奖励兑换", "媒体与出席记录"]);
  })();

  (function () {
    var systemDetailsEs = ["Diseñado antes de abrir puertas", "Operado en el lugar", "Capturado en contexto", "Incluido en el registro final"];
    var systemDetailsZh = ["开场前设计完成", "现场执行", "在情境中记录", "纳入最终记录"];

    addI18n("system-produce", "es", "Producir el formato", "AXIS crea el formato operativo completo de Future Renaissance antes de que comience la integración de patrocinadores.", systemDetailsEs);
    addI18n("system-build", "es", "Construir la capa de recompensas", "La actividad, la regla de validación, el inventario de recompensas y los campos de reporte se definen antes de la apertura de puertas.", systemDetailsEs);
    addI18n("system-arrive", "es", "Los invitados llegan", "Los estados de acceso y rol se establecen cuando el invitado ingresa a Bar Oriente.", systemDetailsEs);
    addI18n("system-enter", "es", "Toca NFC / QR", "El invitado abre el pasaporte AXIS correspondiente o la actividad del patrocinador.", systemDetailsEs);
    addI18n("system-mission", "es", "Comienza la actividad", "La interfaz explica la acción, la regla de validación y el beneficio potencial.", systemDetailsEs);
    addI18n("system-action", "es", "Completa la acción", "El invitado realiza el comportamiento seleccionado dentro del evento en vivo.", systemDetailsEs);
    addI18n("system-validate", "es", "Validar", "El personal o el sistema de interacción confirma que la acción realmente ocurrió.", systemDetailsEs);
    addI18n("system-reward", "es", "Desbloquea la bebida o recompensa", "Un estado de canje distinto se abre solo después de la validación; el beneficio puede ser hospitalidad u otra recompensa adecuada a la categoría.", systemDetailsEs);
    addI18n("system-score", "es", "Actualizar puntaje y nivel", "La acción verificada cambia el estado de participación en vivo del invitado.", systemDetailsEs);
    addI18n("system-leaderboard", "es", "Reflejarse en la tabla de posiciones", "La participación calificada se vuelve visible sin exponer datos de identidad privados.", systemDetailsEs);
    addI18n("system-capture", "es", "Capturar la experiencia", "AXIS documenta la activación, el uso del producto y el contexto del espacio.", systemDetailsEs);
    addI18n("system-report", "es", "Entregar el informe", "La marca recibe la participación verificada, los canjes y los productos de medios después del evento.", systemDetailsEs);

    addI18n("system-produce", "zh", "打造活动形式", "在赞助商整合开始前，AXIS 制定 Future Renaissance 的完整运营形式。", systemDetailsZh);
    addI18n("system-build", "zh", "构建奖励体系", "开场前，活动、验证规则、奖励库存和报告字段均已确定。", systemDetailsZh);
    addI18n("system-arrive", "zh", "宾客抵达", "宾客进入 Bar Oriente 时，系统建立访问权限和角色状态。", systemDetailsZh);
    addI18n("system-enter", "zh", "刷 NFC / 扫 QR", "宾客打开相应的 AXIS 通行证或赞助商活动。", systemDetailsZh);
    addI18n("system-mission", "zh", "活动开始", "界面说明操作方式、验证规则和潜在收益。", systemDetailsZh);
    addI18n("system-action", "zh", "完成操作", "宾客在现场活动中执行所选行为。", systemDetailsZh);
    addI18n("system-validate", "zh", "验证", "工作人员或互动系统确认该操作确实发生。", systemDetailsZh);
    addI18n("system-reward", "zh", "解锁饮品或奖励", "只有验证通过后才会开启独立的兑换状态；奖励可以是餐饮款待，也可以是其他符合类别的奖励。", systemDetailsZh);
    addI18n("system-score", "zh", "更新积分和等级", "验证过的操作会改变宾客的实时参与状态。", systemDetailsZh);
    addI18n("system-leaderboard", "zh", "呈现在排行榜上", "符合条件的参与会被公开显示，但不会暴露私人身份数据。", systemDetailsZh);
    addI18n("system-capture", "zh", "记录体验", "AXIS 记录激活环节、产品使用情况和现场氛围。", systemDetailsZh);
    addI18n("system-report", "zh", "提交报告", "活动结束后，品牌方会收到经过验证的参与、兑换和媒体成果数据。", systemDetailsZh);

    addI18n("phase-produce", "es", "Financiar + producir", "La primera fase crea el sistema operativo antes de que llegue el público.", ["Diseño del formato", "Función del patrocinador", "Lógica de actividades y recompensas", "Preparación de producción"]);
    addI18n("phase-live", "es", "Flujo en el lugar", "La segunda fase guía al invitado a través de la acción, la validación y la recompensa.", ["Acceso", "Orientación", "Validación", "Canje y avance"]);
    addI18n("phase-report", "es", "Captura + informe", "La fase final convierte la activación en vivo en evidencia y entregables.", ["Fotografía y video", "Registros de participación", "Registros de recompensas", "Informe posterior al evento"]);

    addI18n("phase-produce", "zh", "资助 + 制作", "第一阶段在观众到场前建立整个运营体系。", ["形式设计", "赞助商功能", "活动与奖励逻辑", "制作筹备"]);
    addI18n("phase-live", "zh", "现场流程", "第二阶段引导宾客完成操作、验证和获取奖励的过程。", ["入场", "引导", "验证", "兑换与升级"]);
    addI18n("phase-report", "zh", "记录 + 报告", "最后阶段将现场激活转化为凭证和交付成果。", ["照片与视频", "参与记录", "奖励记录", "活动后报告"]);

    addI18n("component-rewards", "es", "Recompensas", "Las recompensas dan a la acción verificada del invitado una consecuencia inmediata y memorable.", ["Inventario definido", "Regla de elegibilidad", "Canje controlado", "Reporte de canjes"]);
    addI18n("component-operations", "es", "Operaciones", "Las operaciones hacen que el sistema del patrocinador sea claro y confiable en el lugar.", ["Orientación del personal", "Soporte de acceso", "Validación", "Gestión de excepciones y canjes"]);
    addI18n("component-capture", "es", "Captura", "La captura de medios documenta cómo se vio la activación y cómo la usaron los invitados.", ["Fotografía", "Video", "Colocación y uso del producto", "Testimonios cuando estén disponibles"]);
    addI18n("component-integration", "es", "Integración", "La integración conecta la función con las pantallas, el video mapping y el flujo de invitados de Future Renaissance.", ["Pantallas del recinto", "Video mapping", "UI de onboarding y actividades", "Estados de recompensa y transmisión en vivo"]);

    addI18n("component-rewards", "zh", "奖励", "奖励为经过验证的宾客行为带来即时且令人难忘的回报。", ["明确的奖励库存", "资格规则", "受控兑换", "兑换报告"]);
    addI18n("component-operations", "zh", "运营", "运营让赞助商体系在现场清晰易懂、可靠运行。", ["工作人员引导", "入场支持", "验证", "异常与兑换管理"]);
    addI18n("component-capture", "zh", "记录", "媒体记录呈现激活环节的实际效果以及宾客的使用方式。", ["摄影", "视频", "植入与产品使用", "如有则包含证言"]);
    addI18n("component-integration", "zh", "整合", "整合将该功能与 Future Renaissance 的屏幕、投影映射和宾客流程连接起来。", ["场地屏幕", "投影映射", "引导与活动界面", "奖励与直播状态"]);

    var deliverableSummaryEs = "Este elemento de producción está incluido en el alcance de captura del evento.";
    var deliverableDetailsEs = ["Capturado en el entorno de Future Renaissance", "Enfocado en los momentos diseñados del evento", "El uso sigue los derechos acordados", "La selección final sigue una revisión de producción"];
    var deliverableSummaryZh = "该制作项目属于活动记录范围之内。";
    var deliverableDetailsZh = ["在 Future Renaissance 现场环境中拍摄记录", "聚焦于精心设计的活动时刻", "使用遵循约定的权利范围", "最终筛选需经过制作方审核"];

    addI18n("deliverable-photography", "es", "Fotografía", deliverableSummaryEs, deliverableDetailsEs);
    addI18n("deliverable-aftermovie", "es", "Aftermovie", deliverableSummaryEs, deliverableDetailsEs);
    addI18n("deliverable-livestream", "es", "Grabación en vivo", deliverableSummaryEs, deliverableDetailsEs);
    addI18n("deliverable-clips", "es", "Clips cortos", deliverableSummaryEs, deliverableDetailsEs);
    addI18n("deliverable-environment", "es", "Ambiente del recinto", deliverableSummaryEs, deliverableDetailsEs);
    addI18n("deliverable-screens", "es", "Momentos en pantalla", deliverableSummaryEs, deliverableDetailsEs);
    addI18n("deliverable-mapping", "es", "Video mapping", deliverableSummaryEs, deliverableDetailsEs);
    addI18n("deliverable-guest-testimonials", "es", "Testimonios de invitados", deliverableSummaryEs, deliverableDetailsEs);
    addI18n("deliverable-artist-testimonials", "es", "Testimonios de artistas", deliverableSummaryEs, deliverableDetailsEs);
    addI18n("deliverable-social", "es", "Contenido para redes sociales", deliverableSummaryEs, deliverableDetailsEs);

    addI18n("deliverable-photography", "zh", "摄影", deliverableSummaryZh, deliverableDetailsZh);
    addI18n("deliverable-aftermovie", "zh", "活动回顾视频", deliverableSummaryZh, deliverableDetailsZh);
    addI18n("deliverable-livestream", "zh", "现场录制", deliverableSummaryZh, deliverableDetailsZh);
    addI18n("deliverable-clips", "zh", "短视频剪辑", deliverableSummaryZh, deliverableDetailsZh);
    addI18n("deliverable-environment", "zh", "场地氛围", deliverableSummaryZh, deliverableDetailsZh);
    addI18n("deliverable-screens", "zh", "屏幕画面", deliverableSummaryZh, deliverableDetailsZh);
    addI18n("deliverable-mapping", "zh", "投影映射", deliverableSummaryZh, deliverableDetailsZh);
    addI18n("deliverable-guest-testimonials", "zh", "宾客证言", deliverableSummaryZh, deliverableDetailsZh);
    addI18n("deliverable-artist-testimonials", "zh", "艺人证言", deliverableSummaryZh, deliverableDetailsZh);
    addI18n("deliverable-social", "zh", "社交媒体内容", deliverableSummaryZh, deliverableDetailsZh);

    var reportSummaryEs = "Este elemento se organiza en el paquete de entrega posterior al evento.";
    var reportDetailsEs = ["Recopilado después del evento", "Organizado para la revisión posterior al evento", "Se reporta solo cuando está disponible o verificado", "Formato de entrega acordado con el recinto"];
    var reportSummaryZh = "该项目会汇总在活动结束后的交付资料包中。";
    var reportDetailsZh = ["活动结束后收集", "整理用于活动后审阅", "仅在可获取或已核实时才纳入报告", "交付格式与场地方协商确定"];

    addI18n("report-photo-folder", "es", "Carpeta de fotos", reportSummaryEs, reportDetailsEs);
    addI18n("report-aftermovie", "es", "Material del aftermovie", reportSummaryEs, reportDetailsEs);
    addI18n("report-short-clips", "es", "Clips de video cortos", reportSummaryEs, reportDetailsEs);
    addI18n("report-attendance", "es", "Estimado de asistencia", reportSummaryEs, reportDetailsEs);
    addI18n("report-participation", "es", "Conteo de participación en actividades", reportSummaryEs, reportDetailsEs);
    addI18n("report-claude", "es", "Conteo de activaciones de Claude", reportSummaryEs, reportDetailsEs);
    addI18n("report-live-coding", "es", "Interacción de Live Coding", reportSummaryEs, reportDetailsEs);
    addI18n("report-redemptions", "es", "Conteo de canjes de recompensas", reportSummaryEs, reportDetailsEs);
    addI18n("report-hospitality", "es", "Uso de hospitalidad", reportSummaryEs, reportDetailsEs);
    addI18n("report-screens", "es", "Interacciones en pantalla", reportSummaryEs, reportDetailsEs);
    addI18n("report-social", "es", "Acciones en redes sociales", reportSummaryEs, reportDetailsEs);
    addI18n("report-written", "es", "Informe escrito breve", reportSummaryEs, reportDetailsEs);

    addI18n("report-photo-folder", "zh", "照片文件夹", reportSummaryZh, reportDetailsZh);
    addI18n("report-aftermovie", "zh", "活动回顾视频素材", reportSummaryZh, reportDetailsZh);
    addI18n("report-short-clips", "zh", "短视频剪辑", reportSummaryZh, reportDetailsZh);
    addI18n("report-attendance", "zh", "到场人数估算", reportSummaryZh, reportDetailsZh);
    addI18n("report-participation", "zh", "活动参与次数统计", reportSummaryZh, reportDetailsZh);
    addI18n("report-claude", "zh", "Claude 激活次数统计", reportSummaryZh, reportDetailsZh);
    addI18n("report-live-coding", "zh", "Live Coding 互动情况", reportSummaryZh, reportDetailsZh);
    addI18n("report-redemptions", "zh", "奖励兑换次数统计", reportSummaryZh, reportDetailsZh);
    addI18n("report-hospitality", "zh", "餐饮款待使用情况", reportSummaryZh, reportDetailsZh);
    addI18n("report-screens", "zh", "屏幕互动情况", reportSummaryZh, reportDetailsZh);
    addI18n("report-social", "zh", "社交媒体互动", reportSummaryZh, reportDetailsZh);
    addI18n("report-written", "zh", "简明书面报告", reportSummaryZh, reportDetailsZh);

    var offerSummaryEs = "Esta capacidad es operada o financiada por AXIS como parte del sistema del evento.";
    var offerDetailsEs = ["Diseñada antes de la apertura de puertas", "Integrada en el evento en vivo cuando corresponde", "Operada o capturada por AXIS", "Reflejada en la documentación posterior al evento"];
    var offerSummaryZh = "该能力由 AXIS 作为活动体系的一部分负责运营或提供资金。";
    var offerDetailsZh = ["在开场前完成设计", "在相关情况下融入现场活动", "由 AXIS 负责执行或记录", "体现在活动后的文档中"];

    addI18n("offer-concept", "es", "Concepto de Future Renaissance + dirección creativa", offerSummaryEs, offerDetailsEs);
    addI18n("offer-programming", "es", "Programación de evento y música", offerSummaryEs, offerDetailsEs);
    addI18n("offer-live-coding", "es", "Programación de Live Coding", offerSummaryEs, offerDetailsEs);
    addI18n("offer-claude", "es", "Integración de actividad de Claude", offerSummaryEs, offerDetailsEs);
    addI18n("offer-claude-onboarding", "es", "Flujo de onboarding de Claude", offerSummaryEs, offerDetailsEs);
    addI18n("offer-claude-code", "es", "Flujo de trabajo creativo de Claude Code", offerSummaryEs, offerDetailsEs);
    addI18n("offer-interactive", "es", "Sistemas interactivos", offerSummaryEs, offerDetailsEs);
    addI18n("offer-digital-art", "es", "Arte digital + contenido visual", offerSummaryEs, offerDetailsEs);
    addI18n("offer-render", "es", "Estación de renderizado + enrutamiento", offerSummaryEs, offerDetailsEs);
    addI18n("offer-operators", "es", "Operadores técnicos", offerSummaryEs, offerDetailsEs);
    addI18n("offer-activations", "es", "Coordinación de microactividades de Tech Week", offerSummaryEs, offerDetailsEs);
    addI18n("offer-media", "es", "Dirección de medios", offerSummaryEs, offerDetailsEs);
    addI18n("offer-artists", "es", "Coordinación de artistas", offerSummaryEs, offerDetailsEs);
    addI18n("offer-documentation", "es", "Documentación del evento", offerSummaryEs, offerDetailsEs);
    addI18n("offer-hospitality", "es", "Financiamiento de asignación de bebidas de cortesía", offerSummaryEs, offerDetailsEs);
    addI18n("offer-production", "es", "Coordinación de producción", offerSummaryEs, offerDetailsEs);
    addI18n("offer-guest-logic", "es", "Lógica de experiencia del invitado", offerSummaryEs, offerDetailsEs);
    addI18n("offer-activity-mechanics", "es", "Mecánicas de actividades", offerSummaryEs, offerDetailsEs);

    addI18n("offer-concept", "zh", "Future Renaissance 概念 + 创意指导", offerSummaryZh, offerDetailsZh);
    addI18n("offer-programming", "zh", "活动与音乐编排", offerSummaryZh, offerDetailsZh);
    addI18n("offer-live-coding", "zh", "Live Coding 编排", offerSummaryZh, offerDetailsZh);
    addI18n("offer-claude", "zh", "Claude 活动整合", offerSummaryZh, offerDetailsZh);
    addI18n("offer-claude-onboarding", "zh", "Claude 引导流程", offerSummaryZh, offerDetailsZh);
    addI18n("offer-claude-code", "zh", "Claude Code 创意工作流", offerSummaryZh, offerDetailsZh);
    addI18n("offer-interactive", "zh", "互动系统", offerSummaryZh, offerDetailsZh);
    addI18n("offer-digital-art", "zh", "数字艺术 + 视觉内容", offerSummaryZh, offerDetailsZh);
    addI18n("offer-render", "zh", "渲染工作站 + 信号路由", offerSummaryZh, offerDetailsZh);
    addI18n("offer-operators", "zh", "技术操作人员", offerSummaryZh, offerDetailsZh);
    addI18n("offer-activations", "zh", "Tech Week 微活动协调", offerSummaryZh, offerDetailsZh);
    addI18n("offer-media", "zh", "媒体指导", offerSummaryZh, offerDetailsZh);
    addI18n("offer-artists", "zh", "艺人协调", offerSummaryZh, offerDetailsZh);
    addI18n("offer-documentation", "zh", "活动记录", offerSummaryZh, offerDetailsZh);
    addI18n("offer-hospitality", "zh", "免费饮品配额资金支持", offerSummaryZh, offerDetailsZh);
    addI18n("offer-production", "zh", "制作协调", offerSummaryZh, offerDetailsZh);
    addI18n("offer-guest-logic", "zh", "宾客体验逻辑", offerSummaryZh, offerDetailsZh);
    addI18n("offer-activity-mechanics", "zh", "活动机制", offerSummaryZh, offerDetailsZh);
  })();

  // Each concept modal shows a glyph instead of its raw section number —
  // this maps every concept id to one of the icons already defined in
  // future-renaissance-content.js's GLYPHS set.
  window.FUTURE_RENAISSANCE_CONCEPT_ICONS = {
    "venue": "door",
    "role-artist": "author", "role-creator": "camera", "role-agent": "broadcast", "role-partner": "shield",
    "role-builder": "code", "role-guest": "guests", "role-collector": "cube",
    "program-system": "layers", "program-art": "gallery", "program-music": "sound", "program-live": "broadcast",
    "program-hospitality": "drink", "program-brand": "shield", "program-missions": "target", "program-stream": "film",
    "dynamic-register": "passport", "dynamic-act": "spark", "dynamic-verify": "check", "dynamic-advance": "chart",
    "tier-observer": "target", "tier-participant": "spark", "tier-contributor": "chart", "tier-catalyst": "star",
    "mission-connect": "nfc", "mission-check-in": "passport", "mission-create": "spark", "mission-intervene": "power",
    "mission-vote": "check", "mission-collect": "cube", "mission-stream": "broadcast", "mission-complete": "star",
    "sponsor-register": "passport", "sponsor-taste": "drink", "sponsor-create": "spark", "sponsor-vote": "check",
    "sponsor-claim": "star", "sponsor-share": "broadcast",
    "measurement-proof": "check", "metric-actions": "target", "metric-coverage": "list", "metric-report": "file", "metric-output": "chart",
    "partner-investment": "chart", "partner-cohort": "globe", "partner-mission": "target", "partner-validation": "shield",
    "partner-systems": "grid", "partner-media": "camera", "partner-report": "file",
    "presenting-system": "star", "presenting-exclusive": "lock", "presenting-continuation": "arrive",
    "signature-system": "star", "signature-serve": "drink", "signature-object": "cube", "signature-ritual": "spark",
    "signature-creation": "code", "signature-edition": "layers", "signature-reward": "star",
    "time-before": "arrive", "time-live": "broadcast", "time-after": "chart", "time-continuation": "screen",
    "close-event-partner": "star", "close-hospitality": "drink",
    "budget-rewards": "chart", "budget-operations": "staff", "budget-media": "camera", "budget-integration": "grid",
    "format-gallery": "gallery", "format-djs": "disc", "format-mapping": "projector", "format-led": "screen",
    "format-stream": "broadcast", "format-photo": "camera", "format-aftermovie": "film", "format-testimonials": "quote",
    "format-collectibles": "cube", "format-passport": "passport", "format-nfc": "nfc", "format-onboarding": "phone",
    "format-staff": "staff", "format-reward": "star", "format-guestlist": "guests", "format-action": "spark",
    "format-flow": "layers", "format-report": "file",
    "system-produce": "layers", "system-build": "cube", "system-arrive": "arrive", "system-enter": "nfc",
    "system-mission": "target", "system-action": "spark", "system-validate": "check", "system-reward": "star",
    "system-score": "chart", "system-leaderboard": "chart", "system-capture": "camera", "system-report": "file",
    "phase-produce": "layers", "phase-live": "broadcast", "phase-report": "file",
    "component-rewards": "star", "component-operations": "staff", "component-capture": "camera", "component-integration": "screen",
    "deliverable-photography": "camera", "deliverable-aftermovie": "film", "deliverable-livestream": "broadcast",
    "deliverable-clips": "film", "deliverable-environment": "screen", "deliverable-screens": "screen",
    "deliverable-mapping": "projector", "deliverable-guest-testimonials": "quote", "deliverable-artist-testimonials": "quote",
    "deliverable-social": "broadcast",
    "report-photo-folder": "camera", "report-aftermovie": "film", "report-short-clips": "film", "report-attendance": "chart",
    "report-participation": "chart", "report-claude": "spark", "report-live-coding": "code", "report-redemptions": "star",
    "report-hospitality": "drink", "report-screens": "screen", "report-social": "broadcast", "report-written": "file",
    "offer-concept": "spark", "offer-programming": "disc", "offer-live-coding": "code", "offer-claude": "spark",
    "offer-claude-onboarding": "phone", "offer-claude-code": "code", "offer-interactive": "target", "offer-digital-art": "gallery",
    "offer-render": "screen", "offer-operators": "staff", "offer-activations": "grid", "offer-media": "camera",
    "offer-artists": "guests", "offer-documentation": "file", "offer-hospitality": "drink", "offer-production": "staff",
    "offer-guest-logic": "guests", "offer-activity-mechanics": "layers",
    "program-warmup": "disc", "program-liveCoding": "code", "program-closing": "disc", "program-cuarto-rosa": "wave",
    "official-status": "star",
    "claude-access": "phone", "claude-credits": "star", "claude-ai": "spark", "claude-code": "code",
    "claude-live-creation": "broadcast", "claude-community": "guests",
    "flow-guest": "guests", "flow-claude": "spark", "flow-claude-code": "code", "flow-code": "check",
    "flow-rules": "shield", "flow-render": "broadcast", "flow-screens": "screen", "flow-fallback": "lock",
    "budget-hospitality": "drink", "budget-production": "staff", "budget-audiovisual": "screen", "budget-programming": "disc",
    "budget-claude": "spark", "budget-digital-art": "gallery", "budget-activations": "grid",
    "zone-entry": "door", "zone-checkin": "nfc", "zone-social": "drink", "zone-digital-art": "gallery",
    "zone-warmup": "disc", "zone-claude": "spark", "zone-claude-access": "phone", "zone-activations": "grid",
    "zone-visuals": "broadcast", "zone-live-coding": "code", "zone-closing": "disc", "zone-media": "camera",
    "zone-venue-clients": "guests",
    "req-screens": "screen", "req-inputs": "grid", "req-internet": "globe", "req-audio": "sound",
    "req-power": "power", "req-bar": "drink",
    "format-screens": "screen", "format-hospitality": "drink", "format-claude": "spark", "format-live-coding": "code",
    "format-activations": "grid",
  };

  window.FUTURE_RENAISSANCE_CONCEPTS = concepts;
  window.FUTURE_RENAISSANCE_CONCEPT_I18N = CONCEPT_I18N;
})();
