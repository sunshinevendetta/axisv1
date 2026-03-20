import type { PillNavItem } from "@/components/PillNav";
import { EPISODE_CONFIG, arappCollectTokens } from "@/src/lib/arapp-collect";
import { STORE_EPISODE_CONFIG, arappDrops } from "@/src/lib/arapp-catalog";

// ─── Dynamic builders ─────────────────────────────────────────────────────────

function buildStoreChildren(): PillNavItem[] {
  const items: PillNavItem[] = [{ label: "All Products", href: "/arapp" }];
  for (const ep of STORE_EPISODE_CONFIG) {
    items.push({ label: ep.label, href: `/arapp/products/${ep.slug}` });
    const drops = arappDrops.filter((d) => d.episode === ep.number);
    for (const drop of drops) {
      items.push({ label: drop.title, href: `/arapp/products/${drop.id}` });
    }
  }
  return items;
}

function buildCollectChildren(): PillNavItem[] {
  const items: PillNavItem[] = [{ label: "All Episodes", href: "/arapp/collect" }];
  for (const ep of EPISODE_CONFIG) {
    items.push({ label: ep.label, href: `/arapp/collect/${ep.slug}` });
    const tokens = arappCollectTokens.filter((t) => ep.tokenIds.includes(t.tokenId));
    for (const token of tokens) {
      items.push({
        label: token.metadata.name,
        href: `/arapp/collect/${ep.slug}/${token.tokenId}`,
      });
    }
  }
  return items;
}

// ─── Nav items ────────────────────────────────────────────────────────────────

const adminDashboardNavItem: PillNavItem = {
  label: "Admin Dashboard",
  href: "/owner/episodes",
  children: [
    { label: "Episodes HQ", href: "/owner/episodes" },
    { label: "Contracts HQ", href: "/owner/contracts" },
    { label: "Session Secret HQ", href: "/tools/session-secret" },
  ],
};

const membersAreaNavItem: PillNavItem = {
  label: "members area",
  href: "/magazine/markets",
  children: [
    { label: "Inside Magazine", href: "/magazine/markets" },
    { label: "Standalone", href: "/record-prism" },
  ],
};

export const publicNavItems: PillNavItem[] = [
  { label: "home", href: "/#home" },
  { label: "about", href: "/#about" },
  { label: "join", href: "/#join" },
  { label: "episodes", href: "/#episodes" },
  {
    label: "magazine",
    href: "/magazine",
    children: [
      { label: "Journal", href: "/magazine" },
      { label: "Mixtapes", href: "/magazine/mixtapes" },
    ],
  },
  membersAreaNavItem,
  { label: "submit", href: "/#submit" },
  {
    label: "store",
    href: "/arapp",
    children: buildStoreChildren(),
  },
  {
    label: "collect",
    href: "/arapp/collect",
    children: buildCollectChildren(),
  },
  // Hidden for public upload:
  // {
  //   label: "docs",
  //   href: "/docs",
  //   children: [
  //     { label: "Documents", href: "/docs" },
  //     { label: "Diagrams", href: "/docs/diagrams" },
  //     { label: "Episode Schema", href: "/docs/episode-description-schema" },
  //   ],
  // },
  // adminDashboardNavItem,
];

export const homeNavItems = publicNavItems;
export const magazineNavItems = publicNavItems;
export const docsNavItems = publicNavItems;

export const ownerNavItems: PillNavItem[] = [
  { label: "home", href: "/#home" },
  adminDashboardNavItem,
];

export const arappNavItems = publicNavItems;

export const primaryNavItems = publicNavItems;
