export const legalEntities = {
  primary: "AXIS CORP",
  primaryJurisdiction: "Delaware",
  showOperator: "AXIS SHOW LLC",
  showOperatorJurisdiction: "Florida",
} as const;

export const footerLegalLines = [
  "AXIS is operated by AXIS CORP, a Delaware corporation.",
  "AXIS SHOW LLC is a Florida limited liability company used for show operations, live events, venue coordination, and related local production.",
  "All experiences, memberships, collectibles, submissions, editorial materials, and digital features are provided for cultural, access, and informational purposes only. Nothing on this site is legal, financial, tax, investment, or securities advice.",
] as const;

export const legalDisclosureSections = [
  {
    title: "Entity Disclosure",
    body: [
      "AXIS is operated by AXIS CORP, a Delaware corporation.",
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
    title: "Digital Collectibles And Access",
    body: [
      "Digital collectibles, memberships, access passes, NFC flows, wallet features, and related on-chain or off-chain tools are experimental cultural access products.",
      "They are not offered as investments and do not represent equity, profit participation, voting rights, or ownership in AXIS CORP, AXIS SHOW LLC, or any affiliated project.",
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
