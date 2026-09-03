# Product deck specs

Seven sales decks for the **same night** — October 28, 2026, Bar Oriente,
Mexico City, a Claude community event operated by AXIS — each written for one
product category, so a pitch never opens with content aimed at somebody else's
product.

| Deck | Route | The argument it makes |
|---|---|---|
| `wallet.json` | `/futurerenaissance-wallet` | The wallet is the door, the signature, the bar tab, and the only address still live tomorrow |
| `exchange.json` | `/futurerenaissance-exchange` | KYC at the desk, first funded balance, first order, and the drink it releases |
| `dex.json` | `/futurerenaissance-dex` | No account, no KYC: deposit and two swaps on event grounds, provable by tx hash |
| `marketplace.json` | `/futurerenaissance-marketplace` | The room generates one-of-one inventory for three hours; the marketplace runs it |
| `launchpad.json` | `/futurerenaissance-launchpad` | A live launch in front of 200 seated music-industry professionals |
| `defi.json` | `/futurerenaissance-defi` | A position opened at 18:00 and closed before the room empties |
| `payments.json` | `/futurerenaissance-payments` | The partner is not sponsoring the bar, it is the bar's payment rail |

## Where the content lives

Slides 01–07 and 10–14 are shared and come from
`public/futurerenaissance-product-base/`. They carry the real event facts
(200-seat workshop 18:00–21:00, doors again at 22:00 for 250 more guests,
warm-up DJ → live coding → closing DJ, Verse Works / Pixelord / The Public on
the line-up), plus what AXIS operates and funds, and the media and report
deliverables the partner receives afterwards.

Slides **08** (the product's function on the floor) and **09** (the reward flow
from product action → staff validation → drink → screen → report) are generated
per category from the spec files here.

## Rebuilding

```bash
node scripts/build-product-decks.mjs            # all seven
node scripts/build-product-decks.mjs wallet dex # just these
node scripts/check-product-decks.mjs            # smoke-test the output
```

The generator writes checked-in files. Editing a generated deck by hand is
fine — just know a rerun overwrites it, so put anything you want to keep back
into the spec.

If the shared slides change, edit `public/futurerenaissance-product-base/`
and rerun. `build-product-base-i18n.mjs` only needs rerunning if the base
translations themselves change.

## Swapping the placeholder for a real brand

Each spec has a `slot` (`"[WALLET BRAND]"`). It renders on the category
exclusive card. To pitch a named brand, copy the spec, change `slug`, `name`
and `slot`, and rerun the generator:

```bash
cp scripts/product-deck-specs/wallet.json scripts/product-deck-specs/acme.json
# edit slug -> "acme", slot -> "ACME", tighten the copy to the real product
node scripts/build-product-decks.mjs acme     # -> /futurerenaissance-acme
```

The category deck stays intact as the placeholder for the next conversation.

## House rules for the copy

- One night only. No "circuit", no "five houses", no "six nights" — the smoke
  test fails the build on that wording.
- Every mechanic is something a guest physically does at Bar Oriente, tied to a
  reward and a number AXIS can report. No abstract positioning language.
- No invented statistics, partner names or case studies. For DeFi, never state
  or imply a rate of return.
- Spanish and Chinese are shown to real partners — they are translations, not
  transliterations.
