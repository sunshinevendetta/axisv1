export const legalEntities = {
  brand: "AXIS SHOW",
  operator: "AXIS CORP",
  operatorJurisdiction: "Delaware",
  showOperations: "AXIS SHOW LLC",
  showOperationsJurisdiction: "Florida",
} as const;

export const footerLegalLines = [
  "AXIS is AXIS SHOW, operated by AXIS CORP, a Delaware corporation.",
  "AXIS SHOW LLC is a Florida limited liability company used for show operations, live events, venue coordination, and related local production.",
  "All experiences, memberships, collectibles, submissions, editorial materials, and digital features are provided for cultural, access, and informational purposes only. Nothing on this site is legal, financial, tax, investment, securities, or professional advice.",
  "No investment or investor relationship is offered or implied. AXIS SHOW memberships, access passes, collectibles, NFC flows, and digital features are not equity, securities, profit rights, voting rights, dividends, debt instruments, or ownership interests in AXIS CORP, AXIS SHOW LLC, or any affiliated project.",
  "AXIS SHOW does not use advertising cookies, analytics trackers, tracking pixels, fingerprinting tools, or similar cross-site tracking technologies, and does not sell visitor data.",
] as const;

export const legalDisclosureSections = [
  {
    title: "Entity Disclosure",
    body: [
      "AXIS is AXIS SHOW, the public project and experience brand operated by AXIS CORP, a Delaware corporation.",
      "AXIS SHOW LLC is a Florida limited liability company used for show operations, live events, venue coordination, and related local production.",
    ],
  },
  {
    title: "General Disclaimer",
    body: [
      "All experiences, memberships, collectibles, submissions, editorial materials, and digital features are provided for cultural, access, and informational purposes only.",
      "Nothing published by AXIS CORP or AXIS SHOW LLC on this site is legal, financial, tax, investment, securities, or professional advice.",
      "Participation may be subject to eligibility, venue rules, third-party platform terms, availability, and applicable law.",
    ],
  },
  {
    title: "No Investor Or Securities Disclosure",
    body: [
      "No investment, investor relationship, capital raise, securities offering, crowdfunding campaign, broker relationship, advisory relationship, or fiduciary relationship is offered or implied by this site.",
      "Digital collectibles, memberships, access passes, NFC flows, wallet features, and related on-chain or off-chain tools are cultural access products and experimental digital artifacts.",
      "They are not offered as investments and do not represent equity, securities, profit participation, revenue share, voting rights, dividends, debt instruments, claims on assets, governance rights, or ownership in AXIS CORP, AXIS SHOW LLC, or any affiliated project.",
      "No statement on this site should be interpreted as a promise of future value, resale value, liquidity, yield, income, appreciation, marketplace support, or financial return.",
    ],
  },
  {
    title: "Data Privacy",
    body: [
      "AXIS SHOW does not use advertising cookies, analytics trackers, tracking pixels, fingerprinting tools, behavioral advertising tags, data resale systems, or similar cross-site tracking technologies.",
      "AXIS SHOW does not sell visitor data and does not build advertising profiles from site visits.",
      "The public site is designed not to persist passive visitor profile data on AXIS systems. Some browser-only state may exist on a visitor's own device for user-selected settings or interface continuity, such as language choice, media state, wallet connection state, or temporary session state.",
      "When a visitor chooses to use a feature that requires action, such as a wallet connection, RSVP, submission, partner flow, mint, claim, or admin workflow, that action may involve the visitor's wallet provider, blockchain network, venue, partner platform, email provider, payment processor, or other third-party service selected or required for that feature.",
      "Those user-initiated records are limited to operating the requested feature and are not used for advertising tracking or data resale.",
    ],
  },
  {
    title: "Third-Party Services",
    body: [
      "Some AXIS experiences may use third-party venues, wallets, blockchains, payment processors, social platforms, ticketing tools, analytics providers, or partner services.",
      "Those third parties may apply their own terms, privacy policies, eligibility rules, fees, availability limits, and operational requirements.",
    ],
  },
] as const;
