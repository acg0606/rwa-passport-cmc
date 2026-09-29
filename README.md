# RWA Passport

**A market cap tells you what a token is worth. Its passport explains what the claim means.**

RWA Passport joins CoinMarketCap market observations to source-backed research about issuers, reference assets, declared custody and geographic context. Built for **Build with CMC: API Hackathon**, in the **Data and Visualisation** track.

- [Working app](https://rwa-passport-cmc.kalmon4ever.chatgpt.site)
- [Video walkthrough](https://rwa-passport-cmc.kalmon4ever.chatgpt.site/demo.html)
- [API code and response](https://rwa-passport-cmc.kalmon4ever.chatgpt.site/api-proof.html)
- [Sanitized, uncached provider receipt](public/evidence/cmc-live.json)

## Illustrated atlas update — 29 September 2026

The explorer edition brings the project artwork into the working interface: an illustrated cover, paper surfaces, ink-framed controls, an evidence diagram and history charts in one shared palette. All map selections, source links, category rankings, unknown states and history controls remain real interactive components. The decorative landscape is AI-generated imaginary geography, separate from the Natural Earth basemap and attributed research.

The public app keeps the same URL. The refreshed 71-second walkthrough shows the illustrated explorer, sourced gold context and history, the expanded research library, source-linked graphs, the evidence matrix, partial USDon research, mobile layout and the real API response. It combines actual browser captures from this release session, with English captions. Values remain observations at the displayed timestamps.

## Try it

1. Select **Explore the atlas**, then open PAXG and inspect its declared London custody region and issuer sources.
2. Switch to Origin & production. The globe now shows USGS gold production, explicitly separated from the origin of token reserves.
3. Open Structure and select relationship nodes to inspect their meaning and source.
4. Open History, play the 2023–2025 production series, choose a year manually or open the numeric table.
5. Change Top 3 to Top 10. The current CMC category determines the ranking. Use the research-library selector to open any of the 11 dossiers, including those outside the ranking.
6. Open STRCX, CRCLB, MSTRX, CRCLon, SPCXB, MSTRB, USDon or CRCLX. In Structure, select a graph node or arrow to read its source, or switch to Evidence matrix. Download the comparison and full research ledger. USDon retains partial-evidence labels where public documentation does not establish its legal issuer, account-level custody or recovery rights.

## CMC integration

The production Worker and local Node server share [market-core.mjs](server/market-core.mjs). The browser requests only `/api/market?limit=3` or `10`.

| CMC endpoint | Purpose |
| --- | --- |
| `GET /v1/cryptocurrency/categories?limit=5000` | Resolve the exact Tokenized Assets category ID. |
| `GET /v1/cryptocurrency/category?id=…&start=…&limit=1000&convert=USD` | Paginate membership and obtain USD quotes. |

Authenticated origin: `https://pro-api.coinmarketcap.com`, with `X-CMC_PRO_API_KEY` attached only by server code. An optional keyless development path uses the official `/public-api` prefix. The hackathon proof records authenticated `KEYED` calls. No key is committed or delivered to the browser.

The service scans the category before claiming a complete ranking; excludes missing/non-positive caps, inactive IDs and stale quotes; deduplicates IDs; uses the full eligible denominator; and caps pagination. Refreshes share a 15-minute cache and concurrent callers share one collection. Rate-limit cooldowns prevent immediate retry loops. Cached observations become **STALE** after expiry when a refresh fails; no observation is **HOLD**. The provider receipt is an observation at its stated time, not a promise of continuous uptime.

The separate v5 RWA adapter is exploratory local code and is not used or claimed by this submission. This is a token-category visualization, not a ranking of physical assets worldwide.

## Run and verify

Node.js 22+ and pnpm 11.19.0:

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
# Set your own CMC_API_KEY in .env.local; never prefix it with VITE_.
pnpm dev
pnpm build
pnpm test
pnpm proof
```

The local server is http://127.0.0.1:4317. `pnpm build` generates the research CSV/JSON from the same data used by the interface, then packages static assets in `dist/client` and a bundled production Worker in `dist/server/index.js`. Supply `CMC_API_KEY` as a secret runtime binding on the hosting platform. The Worker caches snapshots using the platform Cache API; this cache is best-effort and region-local, so long-term market history is not guaranteed. The local Node adapter stores observations in ignored `.cache/` files.

Tests cover ranking completeness and freshness, missing values, duplicate IDs, geography semantics, historical units, rate-limit cooldowns, secret isolation, Worker API routing, cross-instance cache restoration, stale-data behavior, and research integrity. Research checks keep preferred/common shares and different issuers separate, resolve every graph relationship to a source, preserve partial legal claims and prevent company or custodian office addresses from becoming reserve-location pins. `pnpm proof` makes real provider calls and is intentionally separate from deterministic tests.

## Evidence and limits

The library has **11 dossiers**: the original **PAXG, XAUt and NVDAx**, plus **STRCX, CRCLB, MSTRX, CRCLon, SPCXB, MSTRB, USDon and CRCLX**, reviewed on 29 September 2026. The eight additions use **12 distinct primary sources**, with six source-linked research facets per asset: issuer/platform, instrument, reference, backing, custody and rights/conversion. Seven additions have product-specific final terms or prospectuses. **USDon is partially documented**: its published settlement mechanism is established, while a standalone legal-issuer document, account-level custodian and legal recovery rights were not established from the public materials reviewed. Do not extend equity-note terms to it by association.

The graph and matrix distinguish documented terms, published claims and partial evidence. The source inspector displays the original document date, section and review date. [The comparison CSV](public/research/matrix.csv) and [full JSON ledger](public/research/passports.json) are generated from the dossiers. The original three keep their existing source dates and are not silently re-dated by this expansion.

A separate counter reports coverage for the currently displayed CMC entries, including partial dossiers. A changed ranking can introduce assets without research; these show **Market data only**, available market values and a research checklist. Coverage is not independent verification of backing. Issuer claims are attributed, not audited. Current collateral quantities and allocations among named providers remain unverified. Location precision stays at the disclosed country/region/city level. Country production does not prove reserve provenance. Company and issuer addresses do not locate token custody. Exchange listings do not reveal buyers' countries. No reserve-location pins are inferred from the named financial custodians in the eight new dossiers.

Gold production: [USGS 2025](https://pubs.usgs.gov/periodicals/mcs2025/mcs2025-gold.pdf) for 2023, and [USGS 2026](https://pubs.usgs.gov/periodicals/mcs2026/mcs2026-gold.pdf) for revised 2024 and estimated 2025. Units, vintage, estimate flags and the rounded world denominator are preserved. The historical custody disclosure for XAUt remains dated 2020, not presented as a current vault audit.

The research concept preceded this hackathon. The new CMC category integration, synchronized explorer, validation suite and production API were developed during the September 2026 event window. This repo preserves that distinction. The app is an independent research prototype, with no CoinMarketCap affiliation and no trading or wallet execution.

## API feedback

CMC's stable IDs, category membership and quote timestamps made an explainable market universe possible. The main integration work was paginating the category, handling two response shapes, enforcing freshness and separating missing cap from zero. Category membership cannot establish backing or legal rights, so the UI attaches issuer documents separately. A category snapshot/version identifier would make pagination consistency easier to verify, and machine-readable distinctions between protocol tokens, security wrappers and underlying assets would reduce ambiguity. A production key and explicit cooldown/cache behavior are essential when shared keyless access is rate-limited.

## Attribution

Code: MIT, see LICENSE. Country boundaries: Natural Earth, public domain; see THIRD_PARTY_NOTICES.md. The globe uses generated geometry and a solid ocean material, not satellite imagery. Inter font license is included with its bundled files. The gold ingot is an AI-generated illustration and is never evidence of reserves. No third-party logos are used. The illustrated landscape and paper surfaces are AI-generated for this project; their prompt, source reference and limitations are documented alongside the assets. Georgia is a system serif font; all charts and numerical UI retain Inter for legibility.
