# RWA Passport

**A market cap tells you what a token is worth. Its passport explains what the claim means.**

RWA Passport joins CoinMarketCap market observations to source-backed research about issuers, reference assets, declared custody and geographic context. Built for **Build with CMC: API Hackathon**, in the **Data and Visualisation** track.

- [Working app](https://rwa-passport-cmc.kalmon4ever.chatgpt.site)
- [Video walkthrough](https://rwa-passport-cmc.kalmon4ever.chatgpt.site/demo.html)
- [API code and response](https://rwa-passport-cmc.kalmon4ever.chatgpt.site/api-proof.html)
- [Sanitized, uncached provider receipt](public/evidence/cmc-live.json)

## Try it

1. Open PAXG and inspect its declared London custody region and issuer sources.
2. Switch to Origin & production. The globe now shows USGS gold production, explicitly separated from the origin of token reserves.
3. Open Structure and select relationship nodes to inspect their meaning and source.
4. Open History, play the 2023–2025 production series, choose a year manually or open the numeric table.
5. Change Top 3 to Top 10. The current CMC category determines the ranking; new, unresearched assets retain explicit unknowns. Search NVDAx to compare tokenized equity with gold.

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

The local server is http://127.0.0.1:4317. `pnpm build` packages static assets in `dist/client` and a bundled production Worker in `dist/server/index.js`. Supply `CMC_API_KEY` as a secret runtime binding on the hosting platform. The Worker caches snapshots using the platform Cache API; this cache is best-effort and region-local, so long-term market history is not guaranteed. The local Node adapter stores observations in ignored `.cache/` files.

Tests cover ranking completeness and freshness, missing values, duplicate IDs, geography semantics, historical units, rate-limit cooldowns, secret isolation, Worker API routing, cross-instance cache restoration, and stale-data behavior. `pnpm proof` makes real provider calls and is intentionally separate from deterministic tests.

## Evidence and limits

Initial researched passports: **PAXG, XAUt, NVDAx**. Other category members show “Not researched.” Issuer claims are attributed, not independently audited. Location precision stays at the disclosed country/region/city level. Country production does not prove reserve provenance. Company headquarters do not locate token custody. Exchange listings do not reveal buyers' countries.

Gold production: [USGS 2025](https://pubs.usgs.gov/periodicals/mcs2025/mcs2025-gold.pdf) for 2023, and [USGS 2026](https://pubs.usgs.gov/periodicals/mcs2026/mcs2026-gold.pdf) for revised 2024 and estimated 2025. Units, vintage, estimate flags and the rounded world denominator are preserved. The historical custody disclosure for XAUt remains dated 2020, not presented as a current vault audit.

The research concept preceded this hackathon. The new CMC category integration, synchronized explorer, validation suite and production API were developed during the September 2026 event window. This repo preserves that distinction. The app is an independent research prototype, with no CoinMarketCap affiliation and no trading or wallet execution.

## API feedback

CMC's stable IDs, category membership and quote timestamps made an explainable market universe possible. The main integration work was paginating the category, handling two response shapes, enforcing freshness and separating missing cap from zero. Category membership cannot establish backing or legal rights, so the UI attaches issuer documents separately. A category snapshot/version identifier would make pagination consistency easier to verify, and machine-readable distinctions between protocol tokens, security wrappers and underlying assets would reduce ambiguity. A production key and explicit cooldown/cache behavior are essential when shared keyless access is rate-limited.

## Attribution

Code: MIT, see LICENSE. Country boundaries: Natural Earth, public domain; see THIRD_PARTY_NOTICES.md. The globe uses generated geometry and a solid ocean material, not satellite imagery. Inter font license is included with its bundled files. The gold ingot is an AI-generated illustration and is never evidence of reserves. No third-party logos are used.
