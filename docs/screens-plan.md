# Screens plan

Phase 1 of the build plan: every screen running on mock data, styled like the
Finance_App ("I AM POOR FOR NOW"). Reference code and screenshots are in
`docs/reference/finance-app/`.

## Design language to carry over

| Finance_App | Stock Predictor |
|---|---|
| Dark teal palette in CSS variables (`--bg #0b1114`, `--surface #121b20`, `--accent #2dd4bf`), light theme via `data-theme="light"` | Same tokens, mapped into Tailwind v4 `@theme` so utilities like `bg-surface` and `text-accent` work |
| `--income` mint / `--spending` coral for money direction | `--up` mint / `--down` coral for price and prediction direction |
| Sticky app bar: logo + name left, pill tabs centre, gear right; two rows on phones | Same, tabs: Watchlist, Add, Track record; gear opens Settings |
| Hero card with gradient glow ("Puedes gastar hoy") | Hero card on the stock detail: the current prediction |
| Category bars, rows with coloured dot + muted meta + coloured amount | Watchlist rows, prediction ledger rows |
| Bar chart of spending by day | Weekly hit/miss bars on Track record |
| Small uppercase muted labels, Poppins 600 for brand and titles, tabular numbers | Same |
| Two columns on desktop, one column on phones (max 480 px column) | Same |
| Spanish / English with a `t()` helper, English default | Same |

## Screens

1. **Watchlist** (`/`) - summary hero (stocks followed, active signals, live hit rate with sample size), then one row per stock: name, exchange, last close, day change, sparkline, state badge (Observing day N of M / Active 58% vs 52% base / No signal). Row opens the detail.
2. **Add** (`/add`) - search box, exchange-qualified results (NKE on NYSE; Adidas as XETRA ADS and as ADR ADDYY), add/remove with optimistic update, duplicate prevented.
3. **Stock detail** (`/stocks/$instrumentId`) - prediction hero card (three states), candlestick chart (TradingView Lightweight Charts) with range selector in the URL and markers for past predictions, recent predictions list.
4. **Track record** (`/track-record`) - live hit rate with confidence interval vs always-up baseline, weekly hit/miss bars, calibration chart, ledger list grouped by week; a separate section labelled "Hypothetical (backtest)".
5. **Settings** (`/settings`) - language, theme, observation length, benchmark, display currency, data status, methodology and disclaimer.

## Steps for agents

All agents run on Sonnet. Each must pass `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm typecheck` before finishing.

### Step 1 - Foundation (one agent, sequential)

Everything the screens share, so step 2 can run in parallel without touching the same files.

- Design tokens from `docs/reference/finance-app/index.css` into `apps/web/src/index.css` (dark + light, Tailwind `@theme`), Poppins 600 via `@fontsource/poppins`.
- i18n: `src/i18n/` with `en` and `es` dictionaries, `useT()` hook, one dictionary file per screen namespace so step 2 agents do not edit the same file.
- Settings context (language, theme) persisted in localStorage, guarded with try/catch.
- App shell: AppBar, TopNav, Logo (adapted), SkipLink, disclaimer footer, routes for all five screens with placeholders.
- Shared UI in `src/ui/`: Card, HeroCard, Pill/PillGroup, Badge (prediction state), Row, Label, EmptyState, StatusScreen (loading/error), Sparkline (SVG), ProgressBar.
- Formatters in `src/lib/format.ts`: currency (USD, EUR), percent, signed change, dates in an exchange's time zone; with tests.
- Domain types in `src/api/types.ts` and a mock API: fixtures in `src/api/mock/`, TanStack Query hooks in `src/api/hooks.ts`; scenarios selected with `?scenario=` (default, empty, observing, stale, error).

### Step 2 - Screens (four agents in parallel, separate worktrees)

| Agent | Owns | Must not touch |
|---|---|---|
| A Watchlist | `src/routes/index.tsx`, `src/features/watchlist/`, `src/i18n/*/watchlist.ts` | other features, `src/ui/`, `src/api/` |
| B Add stock | `src/routes/add.tsx`, `src/features/add/`, `src/i18n/*/add.ts` | same |
| C Stock detail | `src/routes/stocks.$instrumentId.tsx`, `src/features/detail/`, `src/i18n/*/detail.ts` | same |
| D Track record + Settings | `src/routes/track-record.tsx`, `src/routes/settings.tsx`, `src/features/track-record/`, `src/features/settings/`, their i18n files | same |

If an agent needs a shared component or hook changed, it adds a local one in its feature folder and reports it, instead of editing shared code.

### Step 3 - Integration (one agent)

Merge the four branches, regenerate `routeTree.gen.ts`, promote duplicated local components into `src/ui/`, add Playwright smoke tests (open watchlist, add a stock, open detail, switch scenario, open track record), check 375 px width and keyboard navigation, both themes and both languages.

## Rules for every screen

- No "buy" or "sell" wording. Probabilities always shown with base rate and sample size.
- Live results and hypothetical backtests never combined in one number.
- Up/down colours always paired with a sign or arrow, not colour alone.
