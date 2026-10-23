# Market data sources and APIs for a solo-developer stock tracking and prediction app

All prices and limits observed 2026-10-13 unless a different date is given. "Official" means read from the provider's own page in this session; "third-party" means a comparison/aggregator site and should be re-verified. Official pages for Finnhub (JS-rendered, returned no content) and Financial Modeling Prep (HTTP 403) could NOT be read directly; their figures below are third-party.

## 1. Per-provider free limits, paid prices, real-time/delayed/EOD coverage, historical depth, WebSocket

### Takeaway
Polygon.io is now Massive (massive.com); its individual stock tiers are $0 / $29 / $79 / $199 with real-time only at $199. For a prototype, the strongest free tiers are Alpaca Basic (real-time IEX, 200 historical calls/min, history to 2016), Tiingo Starter (30+ years EOD, 1,000 req/day) and Finnhub (about 60 calls/min); Alpha Vantage (25 req/day) and EODHD (20 req/day) free tiers are effectively demos.

### Cited Findings

**Massive (formerly Polygon.io)**
- Polygon.io rebranded to Massive.com in October 2025 (third-party, a competitor's guide); a September 2026 article reports polygon.io/pricing redirects to massive.com/pricing with the same API and keys — [QVeris](https://qveris.ai/guides/polygon-pricing-optimized/); [apicostcalc](https://apicostcalc.com/de/blog/polygon-massive-rebrand-api-pricing.html)
- Official individual stock tiers: Basic $0 (5 API calls/min, end-of-day, 2 years history); Starter $29/mo (unlimited calls, 15-min delayed, 5 years, WebSockets); Developer $79/mo (unlimited, 15-min delayed, 10 years, WebSockets); Advanced $199/mo (unlimited, real-time, 20+ years, WebSockets). All labeled "Individual use"; Advanced is non-professionals only — [Massive pricing](https://massive.com/pricing)
- Stocks Business plan: $2,499/mo billed monthly (annual saves 20%), unlimited calls, 20+ years, flat files, real-time "fair market value" and minute aggregates, "No Exchange Fees or Approvals". Add-on exchange feeds: IEX real-time $499/mo, Full Market Delayed (15-min) $499/mo, Nasdaq Basic real-time $1,999/mo, Full Market real-time $1,999/mo, Cboe EDGX $1,999/mo; "Additional exchange fees apply to these products". Financials & Ratios business add-on $699/mo. Qualifying startups get 25%+ off first year via sales@massive.com — [Massive business](https://massive.com/business)

**Alpaca Market Data**
- Basic (free, default for paper and live accounts): real-time IEX only for equities; WebSocket capped at 30 symbols; historical data back to 2016 but the most recent 15 minutes of SIP history is not available; 200 historical API calls/min — [Alpaca docs](https://docs.alpaca.markets/docs/about-market-data-api)
- Algo Trader Plus: $99/mo; all US exchanges (CTA + UTP SIP) plus OPRA options; unlimited WebSocket symbols; no 15-minute restriction; 10,000 historical calls/min — [Alpaca docs](https://docs.alpaca.markets/docs/about-market-data-api)
- Broker API data tiers (for apps that open brokerage accounts for end users): Standard 1,000 RPM included; StandardPlus3000 $500/mo; StandardPlus5000 $1,000/mo; StandardPlus10000 $2,000/mo; Standard plans provide real-time IEX or 15-min-delayed SIP — [Alpaca docs](https://docs.alpaca.markets/docs/about-market-data-api)

**Finnhub** (official page unreadable; third-party only)
- Free: about 60 calls/min, no credit card; real-time US quotes, company news, basic fundamentals, forex, crypto; for "personal, non-commercial projects" — [apicostcalc Finnhub, "last verified 2026-10-11"](https://apicostcalc.com/finnhub.html)
- Paid pricing conflicts across sources: one page says there is no self-serve middle tier and All-In-One is $3,500/mo billed annually (900 calls/min market data, 300/min fundamentals) — [apicostcalc](https://apicostcalc.com/finnhub.html); another lists All-in-One at $1,000/mo — [TrustRadius](https://tr-web.dev.trustradius.com/products/finnhub-stock-apis/pricing); others cite a ~$50/mo starter tier with per-dataset add-ons — [apilayer blog](https://blog.apilayer.com/analyzing-the-top-free-apis-for-stock-data/)

**Twelve Data**
- Official individual plans: Basic free, 8 API credits/min and 800/day, 8 trial WebSocket credits; Grow 55 credits/min; Pro 610 credits/min and 500 WebSocket credits; Ultra 2,584 credits/min and 2,500 WebSocket credits. The page shows inconsistent prices: comparison-table "from" prices of $29 / $99 / $329 per month versus plan-card monthly prices of $79 / $229 / $999 (discounted $66 / $191 / $832 on annual billing). Treat $79/$229/$999 as the month-to-month price until verified — [Twelve Data pricing](https://twelvedata.com/pricing)
- Fundamentals appear from the Grow plan upward; real-time US equities are listed on Basic and Grow — [Twelve Data pricing](https://twelvedata.com/pricing)
- Business plans: Venture $499/mo ($414/mo annual; the page's table also shows $149, an internal inconsistency), Enterprise $1,099/mo ($916/mo annual), Enterprise+ custom — [Twelve Data business pricing](https://twelvedata.com/pricing-business)

**Alpha Vantage**
- Free: 25 API requests/day. Premium is priced by requests/minute: 75 rpm $49.99, 150 rpm $99.99, 300 rpm $149.99, 600 rpm $199.99, 1,200 rpm $249.99 per month (a second price set of $499–$2,499 appears to be annual) — [Alpha Vantage premium](https://www.alphavantage.co/premium/)
- Real-time and 15-minute-delayed US market data require a separate data-entitlement process and are tied to "personal use" / the Alpha X Terminal display portal — [Alpha Vantage premium](https://www.alphavantage.co/premium/)

**Tiingo**
- Starter (free): 50 requests/hour, 1,000/day, 500 unique symbols/month, 1 GB/month; 30+ years of price history; 5 years of fundamentals history — [Tiingo pricing](https://www.tiingo.com/about/pricing)
- Power: $30/mo or $300/yr; 10,000 req/hour, 100,000/day, all 110,248 symbols, 40 GB/month; 15+ years fundamentals history — [Tiingo pricing](https://www.tiingo.com/about/pricing)
- Business (internal commercial use): $50/mo or $499/yr. Coverage: 49,530 US and Chinese stocks, 60,718 ETFs/mutual funds; EOD composite prices, IEX feed, crypto and news API listed; fundamentals are a separately sold add-on — [Tiingo pricing](https://www.tiingo.com/about/pricing)

**EODHD**
- Free: 20 API calls/day, 1 year of EOD, 15-min delayed live quotes, dividends/splits, news and sentiment; no intraday, WebSocket or fundamentals — [EODHD pricing](https://eodhd.com/pricing)
- Paid personal plans (monthly / annual-equivalent): EOD Historical All-World $19.99 / $16.58; EOD + Intraday All-World Extended $29.99 / $24.99 (adds intraday, real-time WebSocket for 50 tickers, technicals, screener); Fundamentals Data Feed $59.99 / $49.99 (no prices); All-In-One $99.99 / $83.33. All paid plans: 100,000 calls/day, 1,000/min, 30+ years of EOD; US 1-minute intraday from 2004; fundamentals back to 1985 for major US companies — [EODHD pricing](https://eodhd.com/pricing)

**Financial Modeling Prep (FMP)** (official pricing page returned 403; third-party and FMP localized pages)
- Free: 250 requests/day, end-of-day/sandbox data, 500 MB trailing 30-day bandwidth. Paid: Starter 300 calls/min, Premium 750 calls/min, Ultimate 3,000 calls/min. Prices conflict: $22 / $59 / $149 per month billed annually per a third-party comparison versus $19 / $49 / $99 on FMP's German pricing page — [multiples.vc](https://multiples.vc/compare/fmp-api-alternatives); [FMP pricing (DE)](https://site.financialmodelingprep.com/de/pricing-plans)
- Earnings-call transcripts are gated to the Ultimate tier; real-time access starts at the mid tier — [lambdafin](https://www.lambdafin.com/articles/financial-data-api-2026)

**yfinance / Yahoo Finance**
- Yahoo shut its official finance API in 2017; yfinance calls the unofficial JSON endpoints behind the website, with no published limits — [Scrapfly guide](https://scrapfly.io/blog/posts/guide-to-yahoo-finance-api)
- No price, no key, no stated rate limit; see section 3 for reliability and legal status.

### Inferences
- "Unlimited calls" on Massive's $29 Starter plus 5 years of history makes it the cheapest unthrottled bulk-history option, but it is 15-min delayed and personal-license only.
- For real-time full-market (SIP) data on a personal license, Alpaca Algo Trader Plus at $99/mo is half the price of Massive Advanced at $199/mo.
- Free real-time quotes realistically mean IEX-sourced data (Alpaca Basic, Tiingo's IEX feed), which reflects only one venue's trades and quotes, so last price and volume differ from the consolidated tape.

### Gaps
- Finnhub's official plan list, WebSocket symbol cap (commonly reported as 50 on free) and free-tier candle history could not be verified; the official page did not render and third-party sources conflict ($50/mo vs $1,000/mo vs $3,500/mo).
- FMP's current official prices and whether a self-serve commercial "Build" plan has a public price were not verifiable (403).
- Twelve Data's true monthly prices are ambiguous on its own page.
- Alpha Vantage's page does not say which data latency a premium key includes without the entitlement process.
- Massive Basic WebSocket availability was not listed; assume none.

## 2. Display / redistribution terms and exchange licensing fees for a public app

### Takeaway
Every low-cost plan surveyed is a personal or internal-use license; showing data to other users requires a business/commercial tier (roughly $50/mo for Tiingo internal-commercial, $499/mo Twelve Data Venture, $2,499/mo Massive Business, or a negotiated EODHD/FMP contract). Exchange fees stack on top for real-time: IEX is the cheapest real-time source ($500/mo for TOPS with no per-user or distribution fees), 15-minute-delayed SIP costs about $250/mo per plan, and end-of-day data carries no exchange fee.

### Cited Findings

**Provider terms**
- Massive: an individual plan is a personal license for one's own research, scripts and trading; showing data to anyone else in a web or mobile app requires a Business subscription, regardless of volume; the API does not technically enforce this — [Massive knowledge base](https://massive.com/knowledge-base/article/which-plan-do-i-need-to-show-massive-data-in-my-app)
- Alpaca: "you cannot redistribute Alpaca API data" (support article dated November 2022; may be outdated) — [Alpaca support](https://alpaca.markets/support/redistribute-alpaca-api)
- Twelve Data: individual plans are for "personal, internal, and non-commercial purposes"; Basic is "internal non-display usage". The Venture business plan ($499/mo) includes "external display data access"; Enterprise ($1,099/mo) includes "external distribution market data"; Enterprise+ offers custom exchange licenses and white-labeling — [Twelve Data pricing](https://twelvedata.com/pricing); [Twelve Data business](https://twelvedata.com/pricing-business)
- Tiingo: Starter, Power and Business are all "Internal Use Only"; redistribution pricing is per product and via sales — [Tiingo pricing](https://www.tiingo.com/about/pricing)
- EODHD: listed plans are labeled "Personal use"; commercial use requires a custom-priced Startups & Enterprise plan negotiated with EODHD (third-party summary) — [EODHD pricing](https://eodhd.com/pricing); [apis.io](https://apis.io/plans/eodhd/eodhd-plans-pricing/)
- FMP: all four personal tiers are labeled "Licence – Personal", restricted to personal, non-business, non-commercial purposes and barring integration into tools accessible by third parties; FMP's own article says API-key access and permission to show data to other people are separate matters and that multi-user display is addressed whether the app is free or paid — [multiples.vc](https://multiples.vc/compare/fmp-api-alternatives); [FMP article](https://site.financialmodelingprep.com/insights/platform/can-you-use-fmp-data-in-a-public-app-website-or-client-dashboard)
- Finnhub: free plan is personal use only; monetised or redistributing apps need a paid/enterprise plan (third-party) — [apicostcalc](https://apicostcalc.com/finnhub.html)
- Alpha Vantage: premium page is silent on commercial use and redistribution — [Alpha Vantage premium](https://www.alphavantage.co/premium/)

**Exchange fees**
- IEX (fee schedule effective June 1, 2026): real-time TOPS $500/mo, real-time DEEP $2,500/mo, DEEP+ $3,500/mo; delayed TOPS/DEEP are free; "real-time" means used or distributed less than 15 minutes after publication; 30-day free trial for first-time recipients — [IEX fee schedule](https://iex.io/resources/trading/fee-schedule)
- IEX filed to raise real-time TOPS from $500 to $1,000/mo, planned for October 1, 2026 and under SEC review; the filing says no separate external-distribution, non-display or per-user fees are proposed — [SEC notice 34-105989](https://www.sec.gov/files/rules/sro/iex/2026/34-105989.pdf)
- Nasdaq Basic (2026 filing): distributor fee $1,680/mo internal or $2,140/mo external; per-subscriber fees listed at $14.10 (Nasdaq-listed) and $7.20 (NYSE-listed) effective 1/1/26 (these appear to be professional rates); a $1,500/mo option allows distributing derived data to unlimited non-professional subscribers; $400/mo per hosted display solution — [SEC SR-NASDAQ-2026-076 Exhibit 5](https://www.sec.gov/files/rules/sro/nasdaq/2026/34-106336-ex5.pdf)
- Older Nasdaq Basic non-professional rates were $0.50 (Nasdaq) and $0.25 (NYSE) per subscriber per month, with a broker-dealer enterprise license at $100,000/mo (2014 filing; likely outdated) — [SEC 34-72620](https://www.sec.gov/file/34-72620)
- NYSE BQT: access fee $250/mo (schedule as of March 16, 2026), plus underlying NYSE BBO/Trades product fees; an undated factsheet lists a $1.00 non-professional fee and $50,000 enterprise fee — [NYSE fee schedule](https://www.nyse.com/publicdocs/nyse/data/NYSE_Market_Data_Fee_Schedule.pdf); [NYSE BQT factsheet](https://www.nyse.com/publicdocs/nyse/NYSE_BQT_Factsheet.pdf)
- UTP SIP (policy dated September 2023): external delayed redistributor $250/mo per firm plus $250/yr admin fee; external real-time redistributor $1,000/mo (includes the delayed fee); delayed controlled-subscriber usage and end-of-day usage are not fee liable — [UTP data policies](https://www.utpplan.com/DOC/datapolicies.pdf); [Cboe SIP fees](https://datashop.cboe.com/sip-fees)

### Inferences
- A public app showing end-of-day or 15-min-delayed prices is an order of magnitude cheaper to license than one showing real-time consolidated quotes; real-time SIP display also triggers per-user professional/non-professional classification and reporting.
- The lowest-friction licensed route for a small public product is a vendor business plan that bundles the display right and absorbs exchange paperwork (Twelve Data Venture explicitly includes external display; Massive Business claims no exchange fees for its derived "fair market value" and aggregates product).
- Displaying only derived outputs (model scores, signals, percent changes) rather than raw quotes may reduce licensing exposure, but each vendor's contract decides this; get it in writing.
- The Massive Business "IEX real-time $499" add-on closely mirrors IEX's own $500/mo TOPS fee, suggesting vendor add-ons largely pass through exchange costs.

### Gaps
- Could not read the actual terms-of-service text for Alpaca (current), Finnhub, Alpha Vantage, Tiingo or EODHD; statements above come from pricing pages, help articles or third parties.
- Whether IEX's TOPS increase to $1,000/mo took effect on October 1, 2026 is unconfirmed.
- Current CTA (NYSE-listed SIP) delayed/real-time redistribution fees for 2026 were not found; the CTA delayed policy located dates from 2016.
- Current Nasdaq Basic non-professional per-user rate was not confirmed; the Nasdaq price list and the 2026 filing did not reconcile.
- Tiingo redistribution/display prices and EODHD/FMP commercial quotes are not public.

## 3. Legal and reliability status of yfinance and scraping-based sources

### Takeaway
yfinance is fine for private prototyping but is neither licensed nor reliable for a public product: Yahoo's terms prohibit automated collection without permission and commercial exploitation, and users have reported persistent HTTP 429 rate-limit blocks through 2025–2026.

### Cited Findings
- yfinance's README states it is intended for research and educational purposes, that users should refer to Yahoo's terms, and that "the Yahoo! finance API is intended for personal use only"; the Apache 2.0 license covers the code, not the data — [yfinance GitHub](https://github.com/ranaroussi/yfinance)
- Yahoo's Terms of Service bar collecting data by automated means (scrapers, data-extraction tools) without express prior permission, and bar using data to build a database, feed or app that substitutes for its services; the software/API license is personal and revocable — [Yahoo Terms of Service](https://legal.yahoo.com/us/en/frontier/terms/otos/index.html)
- Users report `YFRateLimitError: Too Many Requests`, with at least one report of a block lasting more than 24 hours; mitigation is fewer requests and delays — [yfinance discussion #2431](https://github.com/ranaroussi/yfinance/discussions/2431)
- A Yahoo-side change in early 2025 caused sudden rate-limit errors for existing scripts — [QuantConnect forum](https://www.quantconnect.com/forum/discussion/18702)
- Yahoo publishes no request thresholds, and endpoints can change without notice — [Scrapfly guide](https://scrapfly.io/blog/posts/guide-to-yahoo-finance-api)
- Yahoo Finance lacks many delisted tickers, which biases backtests — [R-bloggers](https://r-bloggers.com/2021/08/when-yahoo-finance-doesnt-have-de-listed-tickers-needed)

### Inferences
- Use yfinance only as a convenience/fallback loader in local research code, behind an abstraction layer so it can be swapped out; never as the data source of a deployed app.
- The same reasoning applies to other scraped sources (Google Finance, Stooq-style scrapes): no license to display, no SLA.

### Gaps
- No evidence was found of Yahoo taking legal action against individual yfinance users; enforcement appears to be technical (blocking), but this is absence of evidence, not confirmation.
- 2026 reports of ongoing 429 problems came mostly from low-quality SEO sites; the GitHub and QuantConnect reports are the reliable ones.

## 4. Fundamentals, earnings, corporate actions, delisted tickers, point-in-time data, SEC EDGAR

### Takeaway
SEC EDGAR's free APIs give as-filed (therefore naturally point-in-time, by filing date) XBRL fundamentals with no key at up to 10 requests/second; EODHD is the cheapest verified commercial source with delisted tickers (60,191 US delisted symbols) and fundamentals, while Norgate is the standard low-cost survivorship-bias-free price database.

### Cited Findings
- SEC data.sec.gov offers four JSON APIs (submissions, companyconcept, companyfacts, frames), free with no authentication or API key; submissions update in under a second and XBRL in under a minute; nightly bulk files companyfacts.zip and submissions.zip republish about 3:00 a.m. ET; no CORS support (so it must be called from a backend) — [SEC EDGAR APIs](https://www.sec.gov/search-filings/edgar-application-programming-interfaces)
- SEC fair-access limit: 10 requests/second maximum; scripts must declare a User-Agent identifying the requester; undeclared bots may be throttled or blocked — [SEC Accessing EDGAR Data](https://www.sec.gov/os/accessing-edgar-data)
- EODHD: delisted symbols are available per exchange via a `delisted=1` flag; 60,191 on US exchanges as of September 2026; EOD, fundamentals, dividends, splits and intraday endpoints work the same for delisted tickers; ticker reuse is the main trap — [EODHD delisted data](https://eodhd.com/financial-apis/review-delisted-stock-companies-data)
- EODHD fundamentals (from 1985 for major US companies), insider transactions and corporate calendar are in the $59.99/mo Fundamentals plan or $99.99/mo All-In-One; dividends and splits are included even in the free and $19.99 plans — [EODHD pricing](https://eodhd.com/pricing)
- Tiingo: fundamentals for 29,980 stocks as an add-on; 5 years of history on free, 15+ years on Power — [Tiingo pricing](https://www.tiingo.com/about/pricing)
- Massive Business includes reference data and corporate actions; its Financials & Ratios business add-on is $699/mo — [Massive business](https://massive.com/business)
- FMP is positioned as strongest on fundamentals (deep statements, DCF tools), with transcripts on the top tier, and publishes a guide on handling delisted companies and historical symbols — [lambdafin](https://www.lambdafin.com/articles/financial-data-api-2026); [FMP how-to](https://site.financialmodelingprep.com/how-to/how-to-handle-delisted-companies-and-historical-symbols-with-a-free-api)
- Norgate Data: survivorship-bias-free EOD data for US stocks with point-in-time index membership; listed at $35/mo with a 21-day trial per one directory, versus $630/yr for the cheapest survivorship-bias-free tier per a forum post (conflict) — [NexusFi](https://nexusfi.com/d/data-providers/norgate-data/); [QuantConnect forum](https://www.quantconnect.com/forum/discussion/21226/would-you-pay-for-cheap-point-in-time-s-amp-p-500-data-survivorship-bias-free/)
- Financial Datasets claims 17,000+ active and delisted US tickers with 30+ years of prices and fundamentals — [Financial Datasets docs](https://docs.financialdatasets.ai/market-coverage.md)
- MarketParquet sells 26 years of US daily and intraday bars including delisted symbols as Parquet for a one-time $79 (prices only) — [MarketParquet](https://marketparquet.com/historical-market-data)
- A delisting universe (dates and tickers, no prices) can be built from SEC Form 25 and Form 15 filings back to 2002 — [Apify actor](https://apify.com/blackfalcondata/delisted-stocks-list)

### Inferences
- EDGAR companyfacts carries filing dates per fact, so a solo developer can build genuinely point-in-time fundamentals for free, at the cost of doing their own XBRL tag normalisation; vendor "fundamentals" endpoints are usually restated/latest values and leak look-ahead unless they expose filing or acceptance dates.
- A practical prototype stack for unbiased backtests is EDGAR (fundamentals + delisting list) plus one inexpensive delisted-inclusive price source (EODHD $19.99 or Norgate).
- Because EDGAR data is public-domain government data, it is the one fundamentals source with no display-licensing problem for a public app.

### Gaps
- Sharadar (Nasdaq Data Link) pricing and its point-in-time fundamentals coverage returned no results in this session; it is commonly cited for PIT fundamentals but was not verified.
- Whether Massive, Tiingo, Alpaca, Finnhub, Twelve Data and Alpha Vantage include delisted tickers in history was not verified here (from prior knowledge, Massive and Tiingo do retain delisted symbols; unconfirmed for 2026).
- Whether any vendor other than EDGAR-derived sources offers true point-in-time (as-originally-reported with timestamps) fundamentals at a hobbyist price was not established.
- Earnings-calendar and estimates coverage per provider was not compared in detail.

## 5. News and sentiment feeds: pricing and terms

### Takeaway
Cheap news comes bundled with data providers (EODHD includes news and sentiment on every plan including free; Finnhub's free key includes company news; Tiingo has a news API); standalone feeds are expensive (NewsAPI $449/mo, Benzinga quote-only) and social data is now pay-per-use (X about $0.005 per post read; Reddit commercial about $0.24 per 1,000 calls). GDELT is free including commercial use.

### Cited Findings
- EODHD: news and sentiment are included in every plan, including the free tier — [EODHD pricing](https://eodhd.com/pricing)
- Finnhub free key includes company news (third-party) — [apicostcalc](https://apicostcalc.com/finnhub.html)
- Tiingo news API: 3 months of queryable history plus everything going forward; commercial clients can request up to 15 years — [Tiingo pricing](https://www.tiingo.com/about/pricing)
- Benzinga does not publish pricing (quote-based) — [Datarade](https://datarade.ai/data-providers/benzinga/profile); Massive resells Benzinga news at $99/mo for individual use only, with separate Business products for partner datasets — [Massive Benzinga partner page](https://massive.com/partners/benzinga)
- NewsAPI.org: Developer plan $0 for development/testing only, 100 requests/day, 24-hour article delay, articles up to one month old; Business $449/mo (250,000 requests, $0.0018 per extra); Advanced $1,749/mo (2,000,000 requests) — [NewsAPI pricing](https://newsapi.org/pricing)
- X API: pay-per-use became the default on February 6, 2026 and the free tier closed to new developers; about $0.005 per post read (other accounts), $0.015 per post created; legacy Basic ($200/mo) moved to pay-per-use after June 1, 2026; Enterprise around $42,000/mo; monthly read caps reported as 2–3 million before Enterprise (third-party blogs, some disagreement) — [outstand.so](https://www.outstand.so/blog/x-api-pricing); [postproxy](https://postproxy.dev/blog/x-api-pricing-2026/)
- Reddit API: free tier is non-commercial only (100 queries/min with OAuth); commercial access reported at $0.24 per 1,000 calls with manual approval taking 2–4 weeks; Reddit does not publish commercial pricing officially — [techloy](https://www.techloy.com/reddit-api-pricing-in-2026-complete-guide-for-developers-and-businesses/); [xpoz](https://www.xpoz.ai/blog/guides/reddit-api-pricing-tiers-and-alternatives/)
- GDELT: datasets are stated to be available for unlimited academic, commercial or governmental use without fee, with citation (quoted via a third party) — [jwatte blog](https://jwatte.com/blog/gdelt-open-data-kalev-leetaru.md); the DOC API is rate limited to protect its clusters, with no official number published — [GDELT blog](https://blog.gdeltproject.org/?p=15416)
- SEC EDGAR submissions feed (8-K and other filings in under a second) is a free, licence-clean event source — [SEC EDGAR APIs](https://www.sec.gov/search-filings/edgar-application-programming-interfaces)

### Inferences
- At 0.5 cents per post read, pulling 100,000 X posts a month costs about $500, so X sentiment is not viable for a zero-budget prototype; Reddit's free tier works for personal research but not a monetised app.
- For a prediction prototype, the cost-effective text inputs are EDGAR filings, GDELT headlines, and one bundled vendor news endpoint (EODHD, Finnhub or Tiingo), with sentiment computed locally (for example with FinBERT or an LLM) rather than bought.
- News headlines have their own redistribution limits separate from price data; displaying links and self-computed sentiment scores is safer than republishing article text.

### Gaps
- Alpaca's news API (historically Benzinga-sourced and included free) was not verified in this session.
- GDELT's one-request-per-five-seconds DOC API figure is community-reported and unverified; GDELT's own terms page was not read directly.
- X and Reddit figures come from third-party blogs, not official pricing pages.
- Alpha Vantage's news-sentiment endpoint, FMP news and Massive's native news endpoint terms were not checked.
- StockTwits and other retail-sentiment sources were not researched.

## 6. Best-value combinations

### Takeaway
(a) A prototype can run at $0–$30/month on Alpaca Basic + Tiingo free/Power + SEC EDGAR + GDELT, with yfinance only as a local fallback. (b) A small public product should launch on end-of-day or 15-minute-delayed data under a vendor business licence (realistically from about $50 to $500/month), and add IEX real-time only when revenue justifies it.

### Cited Findings
- Alpaca Basic is free with real-time IEX, 200 calls/min and history to 2016 — [Alpaca docs](https://docs.alpaca.markets/docs/about-market-data-api)
- Tiingo free gives 30+ years of EOD history at 1,000 requests/day and 500 symbols/month; Power is $30/mo for all symbols — [Tiingo pricing](https://www.tiingo.com/about/pricing)
- SEC EDGAR APIs are free, keyless, 10 requests/second — [SEC EDGAR APIs](https://www.sec.gov/search-filings/edgar-application-programming-interfaces); [SEC Accessing EDGAR Data](https://www.sec.gov/os/accessing-edgar-data)
- EODHD $19.99/mo gives 100,000 calls/day, 30+ years EOD, splits/dividends, news and sentiment, and delisted tickers — [EODHD pricing](https://eodhd.com/pricing); [EODHD delisted data](https://eodhd.com/financial-apis/review-delisted-stock-companies-data)
- Massive Starter $29/mo gives unlimited calls, 5 years, 15-min delayed, WebSockets (personal licence) — [Massive pricing](https://massive.com/pricing)
- Public display requires: Massive Business $2,499/mo — [Massive business](https://massive.com/business); Twelve Data Venture $499/mo with external display — [Twelve Data business](https://twelvedata.com/pricing-business); Tiingo Business $50/mo is internal use only, redistribution via sales — [Tiingo pricing](https://www.tiingo.com/about/pricing)
- Exchange cost floor: EOD not fee liable; UTP delayed redistribution $250/mo + $250/yr; IEX real-time $500/mo (possibly $1,000 from October 2026) — [UTP data policies](https://www.utpplan.com/DOC/datapolicies.pdf); [IEX fee schedule](https://iex.io/resources/trading/fee-schedule); [SEC notice 34-105989](https://www.sec.gov/files/rules/sro/iex/2026/34-105989.pdf)

### Inferences
- (a) Personal/prototype, $0: Alpaca Basic (real-time IEX quotes, WebSocket for up to 30 symbols, minute bars since 2016) + Tiingo Starter (long adjusted EOD history) + SEC EDGAR (fundamentals, filings, delisting forms) + GDELT and Finnhub free (news) + yfinance as an ad-hoc local convenience. Near-zero upgrade path: Tiingo Power $30/mo or EODHD $19.99/mo (adds delisted tickers and bundled news/sentiment) or Massive Starter $29/mo (unlimited calls for bulk minute history). All of these remain personal licences.
- (b) Small public product: design the product around EOD/delayed prices and model outputs. Lowest verified published price with an explicit external-display right is Twelve Data Venture at $499/mo; cheaper outcomes are possible but require negotiation (Tiingo redistribution quote, EODHD Startups plan, FMP commercial plan, Massive startup discount of 25%+). Use SEC EDGAR for fundamentals to avoid a fundamentals display licence. Massive Business at $2,499/mo is out of range for a solo budget until there is revenue.
- If the product includes brokerage/trading through Alpaca's Broker API, market data display to account holders comes bundled (IEX real-time or 15-min-delayed SIP on the Standard tier), which can be the cheapest route to licensed real-time display, but it requires being a broker partner.
- Build a provider-abstraction layer from day one so the prototype sources (personal licences, yfinance) can be swapped for a licensed feed before public launch without rewriting the app.
- Ask every shortlisted vendor in writing: (1) may I display raw prices to unauthenticated/public users, (2) delayed vs real-time, (3) are exchange fees passed through, (4) may I display derived values (signals, predictions, percent change) without a display licence.

### Gaps
- No vendor was confirmed to offer a published sub-$100/month plan that explicitly permits public display of US equity prices; this is the key unknown and needs direct sales quotes (Tiingo, EODHD, FMP, Finnhub).
- Not researched: Databento, Intrinio, Marketstack, Nasdaq Data Link, Stooq, IBKR and Schwab APIs, which may be relevant alternatives.
- Data-quality comparisons (adjustment accuracy, bad ticks, outage history) were not found in reliable 2025–2026 sources; quality claims in comparison blogs are largely affiliate content and were excluded.
