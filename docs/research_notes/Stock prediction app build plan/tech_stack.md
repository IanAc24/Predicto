# Application tech stack for a solo-built investment tracking web app (React + ML signals), as of October 2026

Research notes. All versions and prices observed 2026-10-13 unless stated. Method note: the web search tool was rate-limited for most queries, so findings rely mainly on direct fetches of official pricing pages, docs and GitHub release pages. Where a claim could not be sourced it is placed under Inferences (my judgement) or Gaps (unverified), not under Cited Findings. Several GitHub release pages show day and month without a year; those dates are reported as shown and are presumed to be 2026.

Recommended default stack in one line (reasoning per section below): Vite + React SPA with TanStack Router/Query, Tailwind + shadcn/ui, TradingView Lightweight Charts (plus Recharts or ECharts for non-financial charts), FastAPI backend sharing a Python codebase with the ML pipeline, OpenAPI-generated TypeScript client (Hey API), plain PostgreSQL (Neon or Postgres on the same host; TimescaleDB only if needed), scheduled jobs via platform cron or GitHub Actions calling plain Python entry points, Clerk or Supabase Auth, hosted on Railway (or one Hetzner VPS), in a single repo with pnpm for JS and uv for Python.

## Frontend: Next.js (App Router) vs Vite + React SPA vs TanStack Start / React Router framework mode; state/data fetching; UI kits; mobile/PWA later

### Takeaway
For an authenticated, data-heavy dashboard whose API lives in Python, a client-rendered Vite + React SPA (TanStack Router + TanStack Query) is the lowest-burden default; Next.js, TanStack Start and React Router framework mode are all current and viable but add a Node server tier whose main benefits (SSR/SEO, server functions) are of little value behind a login when the backend is FastAPI. All three frameworks are actively released in 2026, so the choice is about architecture fit, not maintenance risk.

### Cited Findings
- Next.js latest stable release shown on GitHub is v16.4.0, dated 07 October (year not shown on page; observed 2026-10-13) — [Next.js releases](https://github.com/vercel/next.js/releases/latest)
- React Router latest release is v8.4.0 (15 September); the v7 line is still patched in parallel (v7.18.4, same day) and v6 received v6.30.6 on 18 August, i.e. three major lines are maintained concurrently — [React Router releases](https://github.com/remix-run/react-router/releases)
- TanStack Start docs state "TanStack Start is stable" and link a migration guide from the release candidate; features listed are full-document SSR, streaming, server routes/API routes, server functions ("Type-safe RPCs between client and server"), middleware, and end-to-end type safety; React Server Components are described as experimental — [TanStack Start overview](https://tanstack.com/start/latest/docs/framework/react/overview)
- TanStack Start is built on TanStack Router plus Vite or Rsbuild; the same page says that if you do not need Start's server features you can use TanStack Router alone as an SPA router — [TanStack Start overview](https://tanstack.com/start/latest/docs/framework/react/overview)
- TanStack Query latest release is v5.104.2, published 2026-10-11 (core and `@tanstack/react-query` at the same version) — [TanStack Query releases](https://github.com/TanStack/query/releases/latest)
- FastAPI added `app.frontend(...)` in the 0.141.x line (late July) with a `check_dir="auto"` option for local development, i.e. FastAPI now has a first-party way to serve a built frontend from the API process — [FastAPI releases](https://github.com/fastapi/fastapi/releases)
- Vercel Hobby plan is $0 but its FAQ says it "is for personal, non-commercial use"; Pro is $20/month per developer seat with a $20 monthly usage credit — [Vercel pricing](https://vercel.com/pricing)
- Cloudflare: requests to static assets on Workers are free and unlimited (relevant to hosting an SPA bundle for $0) — [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- TradingView Lightweight Charts docs state the library is client-side and not intended for server-side environments such as Node.js (so chart components must be client components / client-only in any SSR framework) — [Lightweight Charts docs](https://tradingview.github.io/lightweight-charts/docs)

### Inferences
- Recommended default: Vite + React SPA, TanStack Router (file-based, type-safe search params are useful for dashboard state such as ticker, range, interval in the URL) and TanStack Query for all server state. Reasoning: (1) every page is behind auth and is personalised, so SSR/SEO gives little; (2) the charting library is client-only anyway; (3) the backend is Python, so Next.js server components/server actions would be a second backend-for-frontend to maintain; (4) a static bundle can be hosted free and deployed independently of the API, or served by FastAPI itself.
- Choose Next.js App Router instead if a public marketing/SEO surface (public ticker pages, blog) is central to the product, or if you want Vercel's deploy experience and the largest pool of examples for AI coding agents. Cost: RSC/caching complexity and a second server runtime; Vercel Hobby cannot be used commercially, so a monetised launch implies $20/month.
- TanStack Start is the natural upgrade path from a TanStack Router SPA if SSR or server functions are later wanted (same router), which makes the SPA-first choice low-regret. React Router framework mode is an equally reasonable alternative; note the fast major-version cadence (v7 and v8 both live) as a mild maintenance signal.
- State: TanStack Query for server state; URL search params for view state; a small client store (e.g. Zustand) only if genuinely needed. Avoid Redux-style global stores for a solo dashboard.
- UI kit: Tailwind CSS + shadcn/ui (copy-in components, no runtime dependency lock-in) is the de facto default and the best-represented in AI coding agents' training data. No primary-source version check was done for these (see Gaps).
- Mobile: start with a responsive web app and add PWA installability (manifest + service worker via a Vite PWA plugin) when wanted; this gives a home-screen icon and offline shell at near-zero cost. A React Native/Expo app is only justified later for native push notifications on signal changes, store presence or widgets; because the API is a typed OpenAPI contract, the generated client and TanStack Query hooks can be reused in Expo.

### Gaps
- No State of JS 2025 or comparable survey data was retrieved (search rate-limited), so there are no cited adoption/satisfaction figures for Next.js vs TanStack Start vs React Router.
- Current versions of Vite, React, Tailwind CSS, shadcn/ui, TanStack Router and Expo were not verified from primary sources.
- What React Router v8 changed relative to v7 (RSC, middleware status) was not confirmed; the releases page lists versions only.
- Whether TanStack Start has a first-class "SPA mode" was not confirmed from the overview page.
- iOS PWA limitations (push, storage eviction) in 2026 were not researched.

## Charting: TradingView Lightweight Charts vs Recharts vs ECharts vs Highcharts Stock vs visx

### Takeaway
Use TradingView Lightweight Charts (v5.2.1, Apache 2.0 with a mandatory TradingView attribution) for price/candlestick charts and a general-purpose library (Recharts for simple React-native charts, or ECharts if you want one library that also does candlesticks, heatmaps and treemaps) for portfolio allocation and performance visuals. Highcharts Stock is the most feature-complete but is paid per seat, which is hard to justify for a solo project.

### Cited Findings
- Lightweight Charts latest library release is v5.2.1 (12 August); v5.2.0 (24 April) added series hit testing and `hoveredSeriesOnTop`; v5.1.0 (16 December) added opt-in data conflation (`enableConflation`) that merges points when zoomed out, aimed at charts with tens of thousands of points or more — [lightweight-charts releases](https://github.com/tradingview/lightweight-charts/releases)
- v5.2.1 also added an "Agent Skill" in the repository to help AI coding assistants use the library, plus an accessibility plugin; a separate "Plugin packages: 2026-09-16" release exists — [lightweight-charts releases](https://github.com/tradingview/lightweight-charts/releases)
- Supported series types: Area, Bar, Baseline, Candlestick, Histogram, Line, created via `chart.addSeries()` — [Lightweight Charts docs](https://tradingview.github.io/lightweight-charts/docs)
- Licensing: the docs state "The Lightweight Charts license requires specifying TradingView as the product creator"; you must include the attribution notice from the NOTICE file and a link to tradingview.com on a public page — [Lightweight Charts docs](https://tradingview.github.io/lightweight-charts/docs)
- The library is Apache 2.0 licensed, and the `attributionLogo` chart option (TradingView logo/link on the chart) satisfies the link requirement — [lightweight-charts on Yarn/npm readme](https://classic.yarnpkg.com/en/package/lightweight-charts) (secondary rendering of the README; confirm against the repo's LICENSE and NOTICE)
- Apache ECharts latest release is 6.1.0 (19 May); it has a built-in candlestick series, and 6.1.0 added candlestick overflow handling (`containShape`/`clip`), a `cursor` option for candlestick series, grab cursors for inside `dataZoom`, and fixed a potential tooltip XSS issue — [ECharts releases](https://github.com/apache/echarts/releases)
- Recharts latest stable is v3.10.1 (25 July), with v3.11.0 canaries published as recently as 13 October; release notes do not mention candlestick support — [Recharts releases](https://github.com/recharts/recharts/releases)
- Highcharts pricing: Highcharts Core is listed at 366 USD per seat and Stock is an add-on at "+ 366 USD per seat"; Internal and SaaS licences are sold on the webshop (up to six seats), OEM requires a sales quote; Annual (subscription) and Perpetual options exist; startup discounts on annual plans are mentioned without an amount — [Highcharts shop](https://shop.highcharts.com/)

### Inferences
- Recommended default: Lightweight Charts for the price chart, with signal markers (up/down arrows) drawn via series markers, a histogram series for volume, and a second pane or line series for model probability. It is canvas-based, purpose-built for OHLC time axes (trading-day gaps, crosshair, price scales) and the attribution requirement is trivial to meet by leaving the logo on.
- Lightweight Charts is not a general chart library (no pie, treemap, scatter); pair it with Recharts (SVG, React-idiomatic, also what shadcn/ui's chart components wrap) for allocation donuts, P&L bars and sparklines. If you prefer one dependency, ECharts covers both financial and general charts under Apache 2.0 with no attribution requirement, at the cost of a large imperative options object and a wrapper for React.
- Recharts is a poor choice for candlesticks: no native candlestick series (must be hand-built from custom shapes) and SVG rendering degrades with thousands of points.
- Highcharts Stock (navigator, range selector, built-in technical indicators, annotations) would cost roughly 732 USD for one seat with Core + Stock on the listed prices; whether that is per year or one-off depends on the Annual vs Perpetual choice, which the page did not price separately. Only worth it if built-in indicators and drawing tools are a product requirement.
- visx is a set of low-level D3-based React primitives: maximum control, maximum effort; not right-sized for a solo developer who wants candlesticks quickly.
- For daily bars (about 250 points per year per ticker, a few thousand for multi-year history), every option is fast enough; performance only differentiates the libraries for intraday data.

### Gaps
- No bundle-size figures were verified for any library.
- visx version, licence and maintenance status were not checked from a primary source (search rate-limited); the assessment above is from general knowledge.
- Highcharts non-commercial/personal free terms were not shown on the shop page; a hobby prototype may qualify but this is unverified.
- TradingView's separate "Advanced Charts" (free-on-application, closed-source) product was not researched.
- No independent benchmark comparing rendering performance was retrieved.

## Backend: Python FastAPI vs Node/TypeScript (Hono, NestJS, tRPC) vs hybrid; sharing types between a Python API and a TypeScript frontend

### Takeaway
Use a single Python FastAPI service so that the API, ingestion and ML code share one language, one dependency lockfile and one set of data models; recover end-to-end type safety by generating a TypeScript client from FastAPI's OpenAPI 3.1 schema with Hey API (`@hey-api/openapi-ts`), which is the tool FastAPI's own docs recommend. A hybrid (TypeScript API + Python workers) doubles the surface area for a solo developer without a clear payoff.

### Cited Findings
- FastAPI latest release is 0.143.0 (08 October); 0.142.0 (29 September) added native OpenTelemetry support and 0.143.0 made automatic exporter setup opt-in (breaking); Starlette was bumped to 1.7.0 in 0.142.3 — [FastAPI releases](https://github.com/fastapi/fastapi/releases)
- FastAPI is still on 0.x version numbers and ships breaking changes in minor releases (e.g. 0.143.0), so versions should be pinned — [FastAPI releases](https://github.com/fastapi/fastapi/releases)
- FastAPI's "Generate Clients" docs recommend Hey API for TypeScript clients and mention OpenAPI Generator as the multi-language alternative; FastAPI emits OpenAPI 3.1, so the generator must support 3.1 — [FastAPI: Generate Clients](https://fastapi.tiangolo.com/advanced/generate-clients/)
- The documented workflow is `npx @hey-api/openapi-ts -i http://localhost:8000/openapi.json -o src/client`, producing typed SDK methods and payload types derived from the Pydantic models — [FastAPI: Generate Clients](https://fastapi.tiangolo.com/advanced/generate-clients/)
- `@hey-api/openapi-ts` runs via CLI, Node script or Vite plugin, requires Node.js 22+, advertises 20+ plugins, and is in "initial development": the docs advise pinning an exact version and expecting breaking changes (migration notes are published) — [Hey API get started](https://heyapi.dev/openapi-ts/get-started)
- TanStack Start offers type-safe server functions (RPC) natively, which is the TypeScript-only alternative to an OpenAPI contract — [TanStack Start overview](https://tanstack.com/start/latest/docs/framework/react/overview)

### Inferences
- Recommended default: FastAPI + Pydantic v2 models + SQLAlchemy 2 (or SQLModel) + Alembic migrations, served by Uvicorn. The decisive argument is that the ML pipeline (pandas/polars, scikit-learn, etc.) is Python regardless; a Python API can import the same feature/label definitions, DB models and config, and can serve stored predictions without a cross-language boundary.
- The API for this app is thin: it mostly reads precomputed prices, positions and signals from Postgres. Do not run model inference in the request path; batch jobs write signals to a table and the API reads them. This keeps the web process small (512 MB to 1 GB RAM) and cheap.
- Type sharing workflow: FastAPI generates `openapi.json` -> a `pnpm generate:api` script runs Hey API -> generated types/SDK (optionally TanStack Query option helpers) are committed or generated in CI; add a CI check that the generated client is up to date. Give each route an explicit `operation_id` (or a custom `generate_unique_id_function`) so generated function names are stable and readable. A lighter alternative is `openapi-typescript` + `openapi-fetch` (types only, no SDK codegen).
- Node/TypeScript options: Hono (small, runs on Node/Bun/Workers) or tRPC give the tightest type sharing with a React client and would be the right choice if there were no Python in the system; NestJS is heavier and enterprise-oriented and is over-sized for a solo project. Since Python is unavoidable here, a TS API creates a hybrid by definition.
- A hybrid is defensible only in the form "Next.js/TanStack Start server functions for auth and CRUD, Python only as batch jobs writing to the same Postgres". That works, but then the database schema becomes the cross-language contract and must be maintained in two ORMs (e.g. Drizzle and SQLAlchemy); for a solo developer the single FastAPI service is simpler.

### Gaps
- Hey API's current version number and whether its TanStack Query and Zod plugins are stable were not confirmed from the page fetched.
- FastAPI's current minimum Python version and Pydantic v1 removal status were not confirmed (PyPI page failed to load).
- Current versions and maintenance status of Hono, NestJS and tRPC were not checked from primary sources.
- No benchmark data on FastAPI vs Node throughput was gathered; it is not expected to matter at this scale.

## Database: plain PostgreSQL vs TimescaleDB (TigerData) vs ClickHouse vs DuckDB/Parquet; managed options and pricing

### Takeaway
Plain PostgreSQL is sufficient for daily (and even minute-level) bars at solo scale and should be the single system of record for users, portfolios, prices and signals; add Parquet files read with DuckDB/Polars for ML training datasets rather than introducing a second database server. TimescaleDB is a low-risk later upgrade if you self-host Postgres, but its managed service (Tiger Cloud, from $30/month, no permanent free tier) is expensive relative to Neon (free, then usage-based) or Supabase (free, then $25/month).

### Cited Findings
- Neon Free: $0, no card, 100 CU-hours per project per month, autoscaling up to 2 CU (8 GB RAM), 1 GB storage per project (20 GB across the account), 5 GB egress, scale-to-zero after 5 minutes that cannot be disabled, 6-hour history window; hitting the CU-hour limit suspends compute until the next period and exceeding storage blocks writes (no data deleted) — [Neon pricing](https://neon.com/pricing)
- Neon Launch: pay-as-you-go with no monthly minimum, $0.106 per CU-hour, $0.35 per GB-month storage, 500 GB egress included, scale-to-zero can be disabled; Scale plan is $0.222 per CU-hour; invoices under $0.50 are not collected — [Neon pricing](https://neon.com/pricing)
- Neon billing example from the page: 0.25 CU for 4 hours = 1 CU-hour; suspended compute accrues nothing — [Neon pricing](https://neon.com/pricing)
- Neon also bundles auth (up to 60k MAU on Free) and object storage (5 GB per project on Free) — [Neon pricing](https://neon.com/pricing)
- Supabase Free: $0, 500 MB database per project, 50,000 MAU, 5 GB egress, 2 active projects, projects pause after 1 week of inactivity — [Supabase pricing](https://supabase.com/pricing)
- Supabase Pro: from $25/month, includes $10 compute credit (covers one Micro instance), 8 GB disk per project then $0.125/GB, 100,000 MAU then $0.00325/MAU, 250 GB egress then $0.09/GB, no inactivity pausing; compute add-ons Micro $10, Small $15, Medium $60, Large $110 per month — [Supabase pricing](https://supabase.com/pricing)
- Tiger Cloud (formerly Timescale Cloud): Performance plan from $30/month (up to 4 services, 3-day PITR), Scale from $36/month, Enterprise custom; the pricing page describes no permanent free tier, only a 30-day free trial of Performance with no credit card; compute is metered hourly and per-unit rates are not listed on the page — [Tiger Data pricing](https://www.tigerdata.com/pricing)
- TimescaleDB latest release is 2.30.2 (2026-09-29); release 2.29.0 supports PostgreSQL 16, 17 and 18 and dropped PostgreSQL 15 — [TimescaleDB releases](https://github.com/timescale/timescaledb/releases)
- TimescaleDB is dual-licensed: code outside the `tsl/` directory is Apache 2.0, code inside `tsl/` is under the Timescale License; build artifacts with `-tsl` in the name are TSL-licensed — [TimescaleDB LICENSE](https://github.com/timescale/timescaledb/blob/main/LICENSE)
- Render free Postgres is limited to 1 GB, one per workspace, and expires 30 days after creation (14-day grace, then deleted), so it is unsuitable for anything persistent — [Render free tier docs](https://render.com/docs/free)
- Fly.io Managed Postgres starts at $38/month (Basic) plus $0.28/GB-month storage — [Fly.io pricing](https://docs.fly.io/about/pricing)
- Railway bills databases as ordinary usage: about $10 per GB-month of RAM, about $20 per vCPU-month, about $0.15 per GB-month of volume — [Railway pricing](https://railway.com/pricing)

### Inferences
- Sizing: 5,000 tickers x 20 years x about 252 trading days is roughly 25 million daily OHLCV rows; at a rough 60 to 100 bytes per row plus index that is a low-single-digit number of GB. A watchlist-scale app (a few hundred tickers) is tens of MB. A `(symbol, date)` primary key with a B-tree index answers "one symbol, date range" chart queries in milliseconds on plain Postgres. This is my own arithmetic, not a sourced benchmark.
- Recommended default: plain PostgreSQL with a `prices_daily(symbol, date, open, high, low, close, adj_close, volume)` table, plus `signals(symbol, date, model_version, prob_up, label)` and normal relational tables for users/portfolios/transactions. One database means one backup, one migration tool and transactional consistency between user data and market data.
- TimescaleDB adds hypertables (automatic time partitioning), columnar compression and continuous aggregates. These matter for intraday/tick data or hundreds of millions of rows. Compression and continuous aggregates are in the TSL-licensed part, which is why hosted Postgres providers other than Tiger Cloud typically offer either no TimescaleDB or only the Apache-licensed subset; this should be verified per provider (see Gaps). If self-hosting Postgres in Docker on a VPS, using the `timescale/timescaledb` image keeps the option open at zero cost.
- ClickHouse is an OLAP column store aimed at billions of rows and high-concurrency analytics; it is a second system to operate, has weak support for transactional user data, and is over-sized here.
- DuckDB + Parquet is excellent for the research/training side (fast local analytical scans, files easily versioned or stored in object storage) but is an embedded, single-writer engine and not a multi-user application database. Recommended pattern: Postgres is the serving store; training jobs export or directly maintain Parquet snapshots and query them with DuckDB/Polars.
- Managed choice: Neon Free is the best prototype fit (no card, 1 GB limit per project but it suspends rather than deletes; the 5-minute scale-to-zero means a cold-start delay on the first request). 100 CU-hours at the minimum 0.25 CU would be about 400 hours of active compute per month, on the page's own formula. For a public launch, Neon Launch at 0.25 CU always-on would be about 0.25 x 730 x $0.106, roughly $19/month plus storage, and less if scale-to-zero is kept; Supabase Pro is a flat $25/month and includes auth. Running Postgres as a Railway service or in Docker on a VPS is cheapest (a few dollars per month of RAM) but makes backups your responsibility.
- Supabase Free's 500 MB cap and 1-week inactivity pause are real constraints for a price-history database; a daily ingestion job would keep the project active, but the 500 MB limit would be reached with a broad universe of tickers.

### Gaps
- Tiger Cloud per-unit compute/storage rates and the smallest instance size behind "from $30/month" were not shown on the page.
- Whether Neon or Supabase currently offer the TimescaleDB extension (and which licence edition) was not verified; Supabase was reported in the past to be deprecating it on newer Postgres versions, but I could not confirm the 2026 status.
- The Timescale License text itself (restrictions on offering TimescaleDB as a service) was not retrieved; only the LICENSE pointer file was read.
- Render paid Postgres prices could not be retrieved (pricing page rendered without numbers).
- ClickHouse Cloud and MotherDuck pricing were not researched.
- No sourced benchmark of plain Postgres vs TimescaleDB at the 10 to 100 million row scale was gathered.

## Background jobs and scheduling: cron, APScheduler, Celery, Dagster, Prefect, Temporal, GitHub Actions scheduled workflows

### Takeaway
For one daily ingest -> features -> model -> write-signals pipeline, the right size is a plain, idempotent Python CLI entry point triggered by an external scheduler: the hosting platform's cron job feature or a GitHub Actions scheduled workflow. Orchestrators (Dagster, Prefect) become worthwhile only when you need backfills, asset lineage and a run UI across many interdependent steps; Celery and Temporal are over-sized for this workload.

### Cited Findings
- GitHub Actions `schedule`: minimum interval once every 5 minutes; runs can be delayed during high load (especially at the start of each hour) and under enough load some queued jobs may be dropped; in public repositories scheduled workflows are automatically disabled after 60 days without repository activity; schedules run only on the default branch — [GitHub Actions: events that trigger workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)
- Render cron jobs: $1 monthly minimum per cron job service, billed per second of active run time, any compute plan can be used, runs are stopped after 12 hours — [Render cron jobs docs](https://render.com/docs/cronjobs)
- Railway bills per second and stopped services incur no compute charges (relevant to run-to-completion scheduled services) — [Railway pricing](https://railway.com/pricing)
- APScheduler latest stable is 3.11.3 (28 June); 4.0 is still alpha (4.0.0a6, 27 April) with no beta or stable release — [APScheduler releases](https://github.com/agronholm/apscheduler/releases)
- Prefect Cloud Hobby tier is free: 2 users, 1 workspace, up to 5 deployments, 500 minutes of Prefect Serverless compute, 7-day run retention; Starter is $100/month (20 deployments, 75 hours serverless, bring-your-own-compute) — [Prefect pricing](https://www.prefect.io/pricing)
- Dagster+ Solo is $10/month plus $0.040 per credit, serverless compute $0.010 per minute; Starter is $100/month plus $0.035 per credit, up to 3 users — [Dagster pricing](https://dagster.io/pricing)

### Inferences
- Recommended default: write each stage as a Typer/argparse command in the Python package (`ingest-prices`, `build-features`, `score`, optionally `retrain`), make each idempotent (upsert on `(symbol, date)`; safe to re-run for any date), log structured output, exit non-zero on failure, and record each run in a `job_runs` table that the UI can show ("data as of ..."). Trigger with whatever cron the host provides (Railway cron schedule on a service, Render cron job, Fly scheduled machine, or system cron/systemd timer on a VPS) after US market close plus a buffer for the data vendor to publish.
- GitHub Actions scheduled workflows are a good zero-infrastructure option for the prototype: the runner checks out the repo, `uv sync`, runs the pipeline, and writes to the managed Postgres. Caveats from the docs above: timing is best-effort (avoid minute 0 of the hour), runs can be dropped under load, and public-repo schedules auto-disable after 60 days of inactivity. It also suits weekly retraining because runners have more CPU/RAM than a small web instance. Add a dead-man's-switch ping (e.g. a heartbeat monitoring service) so a silently skipped run is noticed.
- APScheduler (in-process, stable 3.x line) is acceptable for a single always-on VPS process, but it couples job execution to the web process lifecycle, runs duplicate jobs if you scale to more than one instance, and its 4.0 rewrite has been alpha for a long time; prefer external cron.
- Celery (or lighter task queues) needs a broker (Redis/RabbitMQ) and worker processes; justified only when the app needs user-triggered asynchronous work (e.g. on-demand backtests, CSV imports). If that arises, a Postgres-backed queue avoids adding Redis.
- Prefect is the lightest "real" orchestrator: decorators on existing Python functions, retries, run history; the free Hobby tier (5 deployments) fits a solo pipeline, but the step up to paid is $100/month. Dagster's asset model (prices -> features -> predictions as software-defined assets with partitions and backfills) fits ML data pipelines conceptually and is open source to self-host, but the webserver + daemon are extra always-on processes and there is a steeper learning curve. Consider either once the pipeline has many steps, multiple data vendors, or frequent backfills.
- Temporal targets durable, long-running, multi-service workflows and requires a server cluster or paid cloud; not right-sized.

### Gaps
- Dagster open-source licence and self-hosting resource footprint were not confirmed on the pricing page; Dagster+ included-credit allowances were not listed.
- Railway cron feature specifics (minimum interval, behaviour if previous run still active) were not verified from docs.
- Celery, Temporal and Postgres-backed queue libraries (e.g. Procrastinate, pgqueuer) were not researched from primary sources; statements about them are general knowledge.
- GitHub Actions free minutes for private repositories in 2026 were not verified.

## Auth (Clerk, Auth.js, Supabase Auth, Better Auth) and hosting (Vercel, Railway, Fly.io, Render, Cloudflare, single VPS) with approximate monthly costs

### Takeaway
With a Python API, pick an auth provider that issues standard JWTs the FastAPI service can verify against a JWKS endpoint: Clerk (free up to 50,000 monthly retained users, best prebuilt React UI) or Supabase Auth (free to 50,000 MAU, natural if Supabase is the database); Better Auth and Auth.js are TypeScript-server libraries and fit poorly unless there is a Node backend. For hosting, a realistic budget is about $0 to $10/month for a prototype and about $15 to $50/month for a small public launch, with Railway (single platform for API, cron and Postgres) or one Hetzner VPS as the lowest-burden/lowest-cost defaults.

### Cited Findings
Auth
- Clerk Hobby (free) includes 50,000 Monthly Retained Users per app (Clerk bills on MRU, not MAU); Pro is $25/month ($20/month billed annually); overage is $0.02 per MRU from 50,001 to 100,000, falling at higher tiers — [Clerk pricing](https://clerk.com/pricing); note that some third-party 2026 comparison articles still quote a 10,000 MAU free tier, which conflicts with Clerk's own page — [TurboStarter comparison](https://www.turbostarter.dev/blog/better-auth-vs-clerk-vs-nextauth-vs-supabase-auth)
- Supabase Auth: 50,000 MAU included on Free, 100,000 on Pro ($25/month), then $0.00325 per MAU — [Supabase pricing](https://supabase.com/pricing)
- Neon bundles an auth offering with up to 60k MAU on its Free plan and up to 1M on paid plans — [Neon pricing](https://neon.com/pricing)
- Better Auth describes itself as a "framework-agnostic, universal authentication and authorization framework for TypeScript" with 2FA, passkeys, multi-tenancy, multi-session and SSO via plugins; it is a library you run in your own TypeScript server, with no per-user fee — [Better Auth introduction](https://www.better-auth.com/docs/introduction); [supastarter comparison](https://supastarter.dev/blog/better-auth-vs-nextauth-vs-clerk)

Hosting
- Railway: Free plan $0 with $1/month of usage credit (1 vCPU / 0.5 GB per service); Hobby $5/month including $5 usage; Pro $20/month per workspace including $20 usage; usage rates about $20 per vCPU-month, $10 per GB-RAM-month, $0.15 per GB-month volume, $0.05/GB egress; free trial is a one-time $5 credit for 30 days — [Railway pricing](https://railway.com/pricing)
- Fly.io: shared-cpu-1x machines cost $2.19 (256 MB), $3.69 (512 MB), $6.70 (1 GB) per month running continuously in `iad`/`ewr`; volumes $0.15/GB-month; egress $0.02/GB in North America/Europe; Managed Postgres from $38/month; no free tier for new organisations (trial of 2 machine-hours or 7 days) — [Fly.io pricing](https://docs.fly.io/about/pricing)
- Render: free web services spin down after 15 minutes without traffic and take about one minute to restart; 750 free instance hours per workspace per month; free Postgres is 1 GB and expires after 30 days — [Render free tier docs](https://render.com/docs/free); cron jobs have a $1/month minimum — [Render cron jobs docs](https://render.com/docs/cronjobs)
- Vercel: Hobby $0 but "for personal, non-commercial use" (100 GB fast data transfer, 1M function invocations); Pro $20/month per seat with $20 included usage credit — [Vercel pricing](https://vercel.com/pricing)
- Cloudflare Workers: Free plan 100,000 requests/day with 10 ms CPU per invocation; Paid is $5/month minimum including 10 million requests; static asset requests are free and unlimited; Pages Functions are billed as Workers — [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- Hetzner Cloud (Germany/Finland, excl. VAT): CX23 2 vCPU / 4 GB / 40 GB / 20 TB traffic at EUR 5.49/month (EUR 5.99 with IPv4); CAX11 (ARM) 2 vCPU / 4 GB at EUR 5.99 (EUR 6.49 with IPv4); CPX22 2 vCPU / 4 GB / 80 GB at EUR 19.49; the source says prices rose 30 to 40% for CX/CAX on 15 June 2026 — [costgoat Hetzner pricing tracker](https://costgoat.com/pricing/hetzner) (third-party aggregator dated Sept/Oct 2026; Hetzner's own page did not render prices, so verify)

### Inferences
- Auth recommendation: Clerk for fastest path (drop-in React components, social login, MFA, user management dashboard; FastAPI verifies the session JWT via Clerk's JWKS). Use Supabase Auth instead if Supabase is chosen for Postgres (one vendor, and overage pricing is roughly six times cheaper per user than Clerk's on the listed rates). Both are effectively free at prototype and small-launch scale. Clerk's free-tier figure is from Clerk's own page and should be preferred over the conflicting third-party articles, but re-check before launch since it evidently changed recently.
- Better Auth and Auth.js run inside a TypeScript server and store sessions in your database. With a FastAPI backend they would require standing up a Node service just for auth and then validating its sessions/JWTs from Python; that only makes sense if the frontend is already Next.js or TanStack Start. Rolling your own auth in FastAPI (password hashing, reset emails, OAuth) is possible but is security-sensitive work a solo developer should avoid.
- Because this is a finance-adjacent app, enable MFA and keep auth with a managed provider; do not store brokerage credentials (out of scope here).
- Prototype cost scenarios (my arithmetic from the cited rates):
  - Railway Hobby: the $5/month included usage only partially covers a 0.5 GB API service plus a small Postgres (0.5 GB of RAM alone is about $5 at $10/GB-month); expect roughly $5 to $12/month for API + Postgres, or $5 if the database is Neon Free. Static frontend on Cloudflare (free). Auth free. Total about $5 to $12/month.
  - Near-zero: Cloudflare static assets ($0) + Neon Free ($0) + GitHub Actions for the daily pipeline + Fly.io 512 MB machine for the API (about $3.69) or Render free web service ($0, with one-minute cold starts). Total about $0 to $4/month.
  - Single VPS: Hetzner CX23 at about EUR 6/month running Docker Compose (Caddy, FastAPI, Postgres/TimescaleDB, cron). Cheapest fixed cost with the most RAM (4 GB, enough to run model scoring in-box), but you own OS patching, backups and TLS. A PaaS layer such as Coolify or Dokploy on the VPS reduces that burden.
- Small public launch scenarios: Railway Pro $20/month (includes $20 usage, likely enough for API + Postgres + cron at low traffic) + Clerk free + Cloudflare static = about $20 to $30/month. Or Vercel Pro $20 + Neon Launch about $5 to $20 + Railway/Fly API about $5 to $10 = about $30 to $50/month. Or Supabase Pro $25 (DB + auth) + Fly/Railway API $5 to $10 = about $30 to $35/month. Or VPS about EUR 6 to 20 plus an off-site backup target.
- Hosting recommendation: Railway as the default for low operational burden (API, cron job and Postgres in one project, usage-based, deploys from a Dockerfile or the repo), with the SPA either served by FastAPI or on Cloudflare. Choose the Hetzner VPS if minimising cost or needing more RAM for model runs matters more than convenience. Vercel is only compelling if Next.js is chosen. Cloudflare Workers are a poor fit for the Python/ML backend but ideal for static frontend hosting.
- Market data licensing and vendor API cost will likely exceed infrastructure cost at public launch; that is outside this note's scope but should be budgeted.

### Gaps
- Render paid web service and Postgres prices could not be retrieved (page rendered without figures).
- Auth.js current status/version and its relationship to Better Auth were not verified from primary sources; a third-party source implied consolidation but I could not confirm it.
- Better Auth licence and any paid hosted/infrastructure offering were not confirmed.
- Hetzner prices come from a third-party tracker with two different "updated" dates; US-region prices and current availability of the cheapest (cost-optimised) plans were not confirmed. Hetzner's own page noted one cost-optimised listing as "Currently not available".
- Railway managed-Postgres backup features and Cloudflare Pages vs Workers static hosting limits (file count, build minutes) were not checked.
- No uptime/reliability comparison between Railway, Fly.io and Render was gathered.

## Monorepo layout and tooling for Windows and AI coding agents (pnpm workspaces, uv, Docker Compose, Vitest/Playwright/pytest)

### Takeaway
Use one Git repository with a pnpm workspace for the TypeScript side and a uv workspace (single `uv.lock`) for the Python side, Docker Compose only for backing services (Postgres) in local development, and a small set of root-level scripts that work identically in PowerShell and CI. Heavy monorepo tooling (Nx, Turborepo, Bazel) is unnecessary for one web app plus one Python project.

### Cited Findings
- uv latest release is 0.13.0, released 2026-10-09 (still 0.x) — [uv releases](https://github.com/astral-sh/uv/releases/latest)
- uv workspaces: defined by `[tool.uv.workspace]` with `members` globs in a root `pyproject.toml`; all members share one `uv.lock`; `uv run --package <name>` and `uv sync --package <name>` target a member from anywhere; inter-member dependencies use `tool.uv.sources` with `workspace = true` and are installed editable — [uv workspaces docs](https://docs.astral.sh/uv/concepts/projects/workspaces/)
- uv workspaces enforce a single `requires-python` (intersection of members) and one resolved dependency set; the docs recommend path dependencies instead when members have conflicting requirements or need separate virtual environments — [uv workspaces docs](https://docs.astral.sh/uv/concepts/projects/workspaces/)
- Hey API's generator can run as a CLI, Node script or Vite plugin and requires Node.js 22+, which sets the minimum Node version for the repo — [Hey API get started](https://heyapi.dev/openapi-ts/get-started)
- FastAPI's documented client-generation flow reads `openapi.json` from the running dev server, so type generation can be a single repo script — [FastAPI: Generate Clients](https://fastapi.tiangolo.com/advanced/generate-clients/)
- Lightweight Charts ships an Agent Skill in its repository for AI coding assistants (v5.2.1), an example of libraries now providing agent-oriented guidance — [lightweight-charts releases](https://github.com/tradingview/lightweight-charts/releases)
- FastAPI 0.142 added native OpenTelemetry support, which gives tracing without extra instrumentation packages — [FastAPI releases](https://github.com/fastapi/fastapi/releases)

### Inferences
- Suggested layout:
  - `apps/web/` Vite + React + TypeScript SPA (Vitest + Testing Library for units, Playwright for end-to-end)
  - `apps/api/` FastAPI service (routers, auth dependency, Alembic migrations)
  - `packages/core/` Python library shared by API and jobs: SQLAlchemy models, Pydantic schemas, settings, data-vendor clients
  - `packages/pipeline/` Python ingestion, features, training and scoring commands (heavy ML dependencies live here so the API image stays small)
  - `packages/api-client/` generated TypeScript client (output of Hey API), consumed by `apps/web` via the pnpm workspace
  - `infra/` `docker-compose.yml` (Postgres, optional pgAdmin), Dockerfiles, deployment config
  - root: `pnpm-workspace.yaml`, `package.json` scripts, root `pyproject.toml` with `[tool.uv.workspace]`, `uv.lock`, `.github/workflows/`, `AGENTS.md`/`CLAUDE.md`
- Because uv enforces one dependency resolution per workspace, API and pipeline will share versions of pandas/numpy etc. That is desirable here (identical feature code in both), but if the ML stack ever conflicts with the API's requirements, split them with path dependencies as the uv docs suggest. Use dependency groups/extras so the API Docker image does not install training-only packages.
- Windows 11 specifics: uv and pnpm both install as native Windows binaries and avoid most historic Windows pain (uv manages Python versions itself; pnpm's content-addressed store avoids deep `node_modules` path issues). Run Postgres via Docker Desktop (WSL2 backend) but run the API and Vite dev server natively for fast reload, or put the whole repo inside the WSL2 filesystem if file-watching or path problems appear; do not keep the repo on the Windows filesystem while running tools from WSL (slow cross-filesystem I/O). Avoid Bash-only scripts and `make`; prefer `package.json` scripts, `uv run` commands or a cross-platform task runner (e.g. `just` or Taskfile) so the same commands work in PowerShell, CI (Linux) and for agents. Add `.gitattributes` with `* text=auto eol=lf` to avoid CRLF noise. Playwright and Vitest run natively on Windows; note that Python packages such as `uvloop` are not available on Windows (Uvicorn falls back to asyncio).
- AI coding agent friendliness: keep one repo so an agent sees API schema, generated client and UI together; provide an `AGENTS.md`/`CLAUDE.md` listing the exact commands (`pnpm dev`, `pnpm test`, `uv run pytest`, `pnpm generate:api`, `uv run alembic upgrade head`), conventions and "do not edit generated files" rules; make checks fast and deterministic (Ruff for lint/format, a type checker such as pyright/mypy, `tsc --noEmit`, ESLint or Biome); choose mainstream, well-documented libraries (FastAPI, SQLAlchemy, TanStack Query, shadcn/ui, Tailwind) since agents perform best on them; pin exact versions for 0.x tools (FastAPI, uv, Hey API) because the release notes above show breaking changes in minor releases.
- Testing split: pytest (+ httpx test client, a disposable Postgres via Docker Compose or Testcontainers) for API and pipeline, including time-series-specific tests (no look-ahead in features, idempotent re-runs); Vitest for React components and data-formatting utilities; a handful of Playwright smoke tests (login, portfolio view, chart renders, signal badge shown). CI on GitHub Actions with two jobs (Node, Python) plus a "generated client is up to date" check.
- Turborepo/Nx add caching and task graphs that pay off with many JS packages; with one web app and one generated client package, plain pnpm workspace scripts are enough and are one less tool for the developer and agents to learn.

### Gaps
- Current pnpm, Vitest, Playwright, pytest, Ruff and Docker Desktop versions were not verified from primary sources.
- The uv workspaces page contains no Windows-specific guidance; Windows compatibility statements above are from general experience rather than a cited source.
- Docker Desktop licensing terms for commercial use (free for individuals/small businesses under certain thresholds) were not verified for 2026; Podman Desktop or Rancher Desktop are alternatives if needed.
- No sourced evidence was gathered on which stacks AI coding agents handle best; that claim is an inference from library popularity.
