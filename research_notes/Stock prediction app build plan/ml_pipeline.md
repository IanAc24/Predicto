# ML signal pipeline for daily US-stock direction predictions (solo developer, as of Oct 2026)

Research notes. Method note: web search was heavily rate-limited during this session, so library status was verified directly against the PyPI JSON API and GitHub/official doc pages on 2026-10-13. Version/date/license facts below are from those primary pages. Design recommendations that I could not tie to a fetched page are placed under "Inferences" and are practitioner judgment, not sourced fact. "Last release" = upload date of the latest version on PyPI.

## 1. What is a sound baseline pipeline design (universe, daily bars, corporate-action adjustment, storage, point-in-time correctness)?

### Takeaway
A solo developer does not need a feature-store product: Parquet files (or one DuckDB file) queried with Polars/DuckDB, plus a small Postgres/SQLite table for served predictions, is sufficient, and all the core libraries are actively released and install on Windows. The parts that actually decide correctness are (a) storing raw prices plus adjustment factors rather than only adjusted prices, (b) a point-in-time universe and fundamentals, and (c) an exchange calendar.

### Cited Findings
- Polars latest is 2.0.0 (released 2026-10-06, MIT, Python >=3.10) — [PyPI polars](https://pypi.org/project/polars/)
- DuckDB latest is 1.5.6 (2026-09-28, MIT, ships win_amd64 wheels) — [PyPI duckdb](https://pypi.org/project/duckdb/)
- Calendar libraries are both current: exchange_calendars 4.13.2 (2026-03-10, Apache-2.0) and pandas_market_calendars 5.5.0 (2026-10-05, MIT) — [PyPI exchange_calendars](https://pypi.org/project/exchange_calendars/); [PyPI pandas_market_calendars](https://pypi.org/project/pandas-market-calendars/)
- yfinance is still released (1.7.0, 2026-08-26, Apache-2.0) — [PyPI yfinance](https://pypi.org/project/yfinance/)
- Broker/data SDKs still maintained: alpaca-py 0.44.0 (2026-08-11, Apache-2.0); ib_async 2.1.0 (2025-12-08, BSD) — [PyPI alpaca-py](https://pypi.org/project/alpaca-py/); [PyPI ib_async](https://pypi.org/project/ib_async/)
- SEC filings access: edgartools 5.62.0 (2026-10-11, MIT) is very actively released — [PyPI edgartools](https://pypi.org/project/edgartools/)
- Qlib's documented convention for adjustment: prices are stored adjusted, with a `$factor` field so the original price is recoverable as `$close / $factor`; the docs warn that adjusted prices differ across data sources because each source adjusts differently; suspended stocks have OHLCV and factor set to NaN — [Qlib data docs](https://qlib.readthedocs.io/en/latest/component/data.html)
- Qlib ships a data health checker (`scripts/check_data_health.py`) that checks for missing data, large step changes in OHLCV, and missing required columns/factor — a useful checklist for a home-grown ingest validator — [Qlib data docs](https://qlib.readthedocs.io/en/latest/component/data.html)
- Qlib US data: `python scripts/get_data.py qlib_data --target_dir ~/.qlib/qlib_data/us_data --region us`, then `qlib.init(provider_uri=..., region=REG_US)`; the Yahoo collector (`scripts/data_collector/yahoo`) is the documented route for crawling/daily updates — [Qlib data docs](https://qlib.readthedocs.io/en/latest/component/data.html)
- The Qlib README currently says "The official dataset is disabled temporarily" and points to a community source that is China-market — [microsoft/qlib README](https://github.com/microsoft/qlib)
- Qlib lists a point-in-time database feature (released Mar 10 2022, PR #343) — [microsoft/qlib README](https://github.com/microsoft/qlib)
- Feast (open-source feature store) is still actively released: 0.66.0 (2026-08-21, Apache-2.0) — [PyPI feast](https://pypi.org/project/feast/)
- Orchestrators are current: Dagster 1.13.26 (2026-10-09, Apache-2.0), Prefect 3.8.8 (2026-10-06, Apache-2.0) — [PyPI dagster](https://pypi.org/project/dagster/); [PyPI prefect](https://pypi.org/project/prefect/)

### Inferences
(Practitioner judgment; not individually sourced.)
- Recommended baseline layout:
  - `raw/bars/date=YYYY-MM-DD/*.parquet` — unadjusted OHLCV as delivered, append-only, never rewritten.
  - `raw/corp_actions.parquet` — splits and dividends with ex-date; `ref/adj_factor.parquet` — cumulative factor per (ticker, date). Adjusted series are derived at read time. Reason: back-adjusted prices change every time a new split/dividend occurs, so stored adjusted prices silently invalidate cached features; storing raw + factor avoids that and mirrors Qlib's `$factor` convention.
  - `ref/universe.parquet` — (date, ticker, in_universe) membership table built point-in-time (e.g., top-N by trailing 20-day median dollar volume, price > $5, common shares only), including delisted names. Using "today's S&P 500 constituents" for history is survivorship bias.
  - `features/` — one wide Parquet dataset keyed (date, ticker), partitioned by year; `labels/` separately so labels can be redefined without recomputing features.
  - `predictions` — a Postgres (or SQLite/DuckDB) table: (asof_date, ticker, model_version, p_up, rank, features_hash, created_at).
- Point-in-time rules: every row carries `knowledge_time` (when the datum became available) distinct from `event_time`; fundamentals join on filing/acceptance timestamp + 1 trading day, not fiscal period end; features for decision date T use only data with knowledge_time <= T close (or <= T+1 open if you trade the open); use `join_asof` (Polars) or `ASOF JOIN` (DuckDB) for these joins.
- A feature-store product (Feast) is overkill at daily frequency with one consumer; its main value (online/offline consistency for low-latency serving) does not apply to nightly batch scoring.
- Scheduling: Windows Task Scheduler or cron on a small VM running one idempotent `run_daily.py` is enough to start; move to Dagster/Prefect only when you need backfills, retries and lineage UI.
- Free Yahoo data via yfinance is adequate for prototyping but is unofficial, has no delisted names and retroactively adjusted prices; a paid survivorship-bias-free daily vendor is the first thing worth paying for once the pipeline works.
- Universe sizing for one machine: 500-3,000 tickers x ~20 years of daily bars is roughly 2.5M-15M rows; this fits in RAM in Polars and trains in minutes with LightGBM on CPU.

### Gaps
- Data vendor comparison/pricing (Polygon, Tiingo, EODHD, Sharadar, Norgate, Alpaca) was not researched here (assumed covered by another researcher).
- Could not confirm whether Qlib's prebuilt US dataset download currently works, given the README's "official dataset is disabled temporarily" note; the README and the docs page are in tension on this.
- Did not verify details of Qlib's point-in-time database for US fundamentals (the data docs page fetched contained no PIT notes).

## 2. Which features are standard and which libraries compute them?

### Takeaway
The standard set is price/volume-derived (multi-window returns, volatility, volume/liquidity, a modest set of technical indicators) transformed into cross-sectional ranks/z-scores per date, optionally extended with point-in-time fundamentals and news sentiment. For computing them in 2026: Polars expressions for returns/rolling/cross-sectional transforms, TA-Lib (now with Windows wheels) for indicators; the original pandas-ta is a supply-chain risk and should be replaced by pandas-ta-classic.

### Cited Findings
- TA-Lib Python wrapper: 0.8.2 released 2026-10-12, Python >=3.9, and the release includes win_amd64 wheels (the historic "must compile the C library on Windows" problem no longer applies) — [PyPI TA-Lib](https://pypi.org/project/TA-Lib/)
- pandas-ta (original, twopirllc): PyPI now lists only two releases, both betas — 0.4.67b0 (2025-09-03) and 0.4.71b0 (2025-09-14); requires Python >=3.12; classified "4 - Beta" and described as possibly "not stable for production use"; claims 150+ indicators/utilities plus 60 TA-Lib candlestick patterns; depends on numba/numpy/pandas — [PyPI pandas-ta](https://pypi.org/project/pandas-ta/)
- The pandas-ta GitHub repository URL listed on PyPI returned HTTP 404 on 2026-10-13, and the project homepage domain (www.pandas-ta.dev) failed DNS resolution; the license is not stated on PyPI (it links to the dead site). Treat as unmaintained/unavailable — [github.com/twopirllc/pandas-ta](https://github.com/twopirllc/pandas-ta) (404 at time of check); [PyPI pandas-ta](https://pypi.org/project/pandas-ta/)
- pandas-ta-classic (community fork): 0.8.32 released 2026-09-14, MIT, Python >=3.10 — actively released — [PyPI pandas-ta-classic](https://pypi.org/project/pandas-ta-classic/)
- `ta` (bukosabino): last release 0.11.0 on 2023-11-02 — stale — [PyPI ta](https://pypi.org/project/ta/)
- tsfresh: 0.21.2 released 2026-05-31, MIT — still maintained — [PyPI tsfresh](https://pypi.org/project/tsfresh/)
- Qlib provides two off-the-shelf feature sets, Alpha158 and Alpha360, available for both US and China markets; definitions are in `qlib/contrib/data/handler.py` — [microsoft/qlib README](https://github.com/microsoft/qlib)
- Qlib's standard processors for panel features/labels are cross-sectional: `CSRankNorm` (cross-sectional rank normalization), `CSZScoreNorm`, `RobustZScoreNorm`, `DropnaLabel` — [Qlib data docs](https://qlib.readthedocs.io/en/latest/component/data.html)
- Kronos authors note that raw model signals "would need portfolio optimization and risk-factor neutralization to isolate alpha" — i.e., neutralization vs. market/sector is treated as a standard post-processing step — [shiyu-coder/Kronos README](https://github.com/shiyu-coder/Kronos)
- Factor evaluation tooling: alphalens-reloaded 0.4.6 (2025-06-02, Apache-2.0) — maintained but slow cadence — [PyPI alphalens-reloaded](https://pypi.org/project/alphalens-reloaded/)
- SHAP for feature attribution: 0.53.0 (2026-10-09, MIT, Python >=3.12, Windows wheels) — [PyPI shap](https://pypi.org/project/shap/)

### Inferences
(Practitioner judgment; feature list is standard-practice knowledge, not from a fetched page.)
- Starter feature list (all computed from adjusted daily bars, per ticker, then cross-sectionally ranked per date):
  - Returns/momentum: 1, 2, 5, 10, 21, 63, 126, 252-day returns; 12-1 momentum (252d return skipping last 21d); 5-day reversal; distance from 20/50/200-day moving average; distance from 52-week high.
  - Volatility/range: 5/21/63-day realized vol of log returns; ATR(14)/close; Parkinson or Garman-Klass range vol; vol-of-vol; downside semivolatility.
  - Volume/liquidity: volume / 20-day avg volume; dollar volume (log, 20d median); Amihud illiquidity (|ret| / dollar volume); turnover if shares outstanding available.
  - Technicals (keep to ~10-20; most are redundant transforms of the above): RSI(14), MACD histogram, Bollinger %B, stochastic %K, ADX, OBV slope.
  - Market/sector context: market return and vol (SPY), VIX level/change, sector ETF return, stock beta (rolling 63/252d), residual return vs. market/sector.
  - Calendar/event: day-of-week, days to/since earnings, month-end flag.
  - Fundamentals (point-in-time, lagged to filing date): valuation (E/P, B/P, S/P), quality (ROE, gross margin, accruals), growth, size (log market cap).
  - Sentiment: daily news count, mean sentiment, sentiment change, abnormal news volume (see section 7).
- Cross-sectional transforms matter more than indicator variety: rank-to-[0,1] or z-score each feature within each date (optionally within sector) so the model learns relative strength and is robust to regime-level shifts in scale. This is exactly what Qlib's CSRankNorm/CSZScoreNorm do.
- Library choice:
  - Polars: `over("ticker")` for rolling windows and `over("date")` for ranks; fastest and simplest for panel data on one machine.
  - TA-Lib: for canonical indicator definitions; call per ticker via `group_by().map_groups` or on NumPy arrays.
  - pandas-ta-classic: if you prefer pure-Python/pandas API; avoid pinning the original `pandas-ta`.
  - tsfresh: generates hundreds of generic time-series statistics; slow and mostly noise for daily returns; use only as an exploratory screen, with strict walk-forward feature selection.
  - Qlib Alpha158: a reasonable reference recipe to port (its 158 features are price/volume rolling statistics) even if you do not adopt Qlib itself.
- Leakage checklist: rolling windows must be right-aligned and exclude the label window; cross-sectional normalization must use only same-date data; any fitted scaler/selector must be fitted inside each training fold; winsorize with train-fold quantiles only.

### Gaps
- Exact contents of Alpha158/Alpha360 were not on the fetched pages (only the pointer to `handler.py`).
- Could not determine the current license of original pandas-ta (license page host unreachable). Reports that it moved to a non-open/paid model could not be verified; the only verified facts are the 404 repo, dead domain, and beta-only PyPI history.
- No sourced quantitative evidence gathered here on which feature groups carry the most predictive power at daily horizon (feasibility is out of scope).

## 3. How should labels be defined and what are the trade-offs?

### Takeaway
"Next-day sign" is the product-facing label but the noisiest training target; the pragmatic approach is to train on a cleaner target (N-day forward return, cross-sectional rank/excess return, or volatility-scaled triple-barrier) and map the output to a calibrated up/down probability. Any horizon > 1 day creates overlapping labels, which forces purging/embargo in validation.

### Cited Findings
- Fixed-horizon labeling is criticized (following Lopez de Prado, AFML) for ignoring volatility: every observation is judged against the same threshold regardless of the asset's/period's risk — [mlfinpy labelling docs](https://mlfinpy.readthedocs.io/en/stable/_sources/Labelling.rst.txt)
- Triple-barrier: each observation gets an upper (profit-take) barrier, a lower (stop-loss) barrier, both scaled by that observation's volatility, and a vertical time barrier; the label is which barrier is touched first — [mlfinpy labelling docs](https://mlfinpy.readthedocs.io/en/stable/_sources/Labelling.rst.txt); [LuxAlgo: label definition & prediction horizon](https://www.luxalgo.com/library/concept/label-definition-and-prediction-horizon/)
- Triple-barrier trade-off: it is path-dependent, so a position stopped out early is labeled a loss even if price later recovers; whether that matches the intended use must be decided explicitly — [LuxAlgo](https://www.luxalgo.com/library/concept/label-definition-and-prediction-horizon/)
- Meta-labeling: a secondary model whose label is whether a primary signal's trade would have been profitable; it learns when to act / how much to size, not direction; its quality is bounded by the primary model — [LuxAlgo](https://www.luxalgo.com/library/concept/label-definition-and-prediction-horizon/)
- Labels computed on every bar over an N-bar horizon overlap and are heavily correlated; naive validation splits leak; purging and embargo are the standard fix — [LuxAlgo](https://www.luxalgo.com/library/concept/label-definition-and-prediction-horizon/)
- Qlib's Alpha158 default label is `Ref($close, -2)/Ref($close, -1) - 1` — the return from T+1 to T+2, not T to T+1 — chosen so that the label is a return you could actually trade after observing day-T features (the stated rationale is China settlement, but the "skip one bar for tradability" principle generalizes) — [Qlib data docs](https://qlib.readthedocs.io/en/latest/component/data.html)
- Open implementations of AFML labeling: mlfinlab is not installable from PyPI (project page returns 404); mlfinpy 0.1.2 (MIT) last released 2024-10-09 (stale); RiskLabAI 3.2.0 (BSD-3-Clause, Python >=3.12) released 2026-10-02 (active) — [PyPI mlfinlab](https://pypi.org/project/mlfinlab/) (404 at time of check); [PyPI mlfinpy](https://pypi.org/project/mlfinpy/); [PyPI RiskLabAI](https://pypi.org/project/RiskLabAI/)
- vectorbt (open-source edition) lists "ML label generation" among its features — [polakowo/vectorbt README](https://github.com/polakowo/vectorbt)

### Inferences
(Practitioner judgment.)
- Trade-off table:
  - Next-day sign (close-to-close): simplest, matches "daily up/down" UI; ~50/50 base rate; extremely low signal-to-noise; treats +0.01% and +5% identically. Add a dead-zone (drop or down-weight |ret| < k x daily vol) to reduce label noise.
  - Next-day sign, open-to-close or open-to-open: required if signals are generated after the close and traded at next open; close-to-close labels are not tradable from end-of-day data unless you trade the closing auction with pre-close features.
  - N-day forward return (5/10/21d), regression or sign: higher signal-to-noise per label; overlapping labels (effective sample size ~ N/horizon); needs purge = horizon.
  - Cross-sectional rank / excess return vs. market or sector: removes the market factor, which dominates raw direction; best for ranking/long-short; but "stock beats the median" is not the same statement as "stock goes up" — the app must word predictions accordingly, or combine with a separate market-direction model.
  - Triple-barrier: volatility-aware and aligned with stop/target trading; adds 3 hyperparameters (pt, sl, max holding) that are easy to overfit; produces variable-length label spans, so purging must use per-sample (t0, t1) intervals; class imbalance depends on barrier asymmetry.
- Recommended default for this product: train a LightGBM regressor or classifier on 5-day forward market-excess return (or its cross-sectional rank) AND a next-day-sign classifier; compare both on next-day directional hit-rate and rank-IC in walk-forward; serve calibrated P(up next day). Keep the label definition in a separate versioned module so it can change without touching features.
- Use sample weights: down-weight overlapping labels (AFML "uniqueness") or simply subsample every N-th day per ticker when horizon is N; weight recent data modestly higher (time decay).
- Implementing triple-barrier yourself is about 30 lines with Polars/NumPy; prefer that over depending on a stale library (mlfinpy) — or use RiskLabAI if a maintained package is wanted.

### Gaps
- Did not fetch Lopez de Prado's primary text (book is paywalled); AFML claims are via secondary docs (mlfinpy docs, LuxAlgo concept library — the latter is a vendor educational page, moderate reliability).
- Did not verify RiskLabAI's API coverage (triple-barrier, meta-labeling, sample weights) beyond its PyPI metadata.
- No sourced empirical comparison of label definitions on US daily data was found in this session.

## 4. Which models are pragmatic starting points, when are deep/foundation models worth it, and what tooling exists?

### Takeaway
Start with regularized logistic regression as a sanity baseline and LightGBM as the workhorse (XGBoost/CatBoost as ensemble diversity); all are actively released with Windows wheels and train on CPU. Deep sequence models and time-series foundation models (Chronos-2, TimesFM 2.5, Kronos) are optional later experiments — tooling is healthy, but they are price-history forecasters, not tabular cross-sectional classifiers, and are best used as additional features or ensemble members.

### Cited Findings
- scikit-learn 1.9.1 (2026-09-10, BSD-3-Clause, Python >=3.11, Windows wheels) — [PyPI scikit-learn](https://pypi.org/project/scikit-learn/)
- LightGBM 4.7.0 (2026-07-18, Python >=3.10, Windows wheels) — [PyPI lightgbm](https://pypi.org/project/lightgbm/)
- XGBoost 3.4.1 (2026-08-15, Apache-2.0, Python >=3.12, Windows wheels) — [PyPI xgboost](https://pypi.org/project/xgboost/)
- CatBoost 1.2.10 (2026-02-18, Apache-2.0, Windows wheels) — [PyPI catboost](https://pypi.org/project/catboost/)
- Optuna 5.0.0 (2026-09-07, MIT) for hyperparameter search — [PyPI optuna](https://pypi.org/project/optuna/)
- Deep-forecasting libraries, all active: Darts 0.47.0 (2026-09-04, Apache-2.0); NeuralForecast 3.3.0 (2026-10-07, Apache-2.0); PyTorch Forecasting 1.8.0 (2026-06-24, MIT); MLForecast 1.1.0 (2026-07-10, Apache-2.0); StatsForecast 2.1.1 (2026-07-16, Apache-2.0); AutoGluon 1.6.3 (2026-09-18, Apache-2.0, Python <3.14) — [PyPI darts](https://pypi.org/project/darts/); [PyPI neuralforecast](https://pypi.org/project/neuralforecast/); [PyPI pytorch-forecasting](https://pypi.org/project/pytorch-forecasting/); [PyPI mlforecast](https://pypi.org/project/mlforecast/); [PyPI statsforecast](https://pypi.org/project/statsforecast/); [PyPI autogluon](https://pypi.org/project/autogluon/)
- TabPFN (tabular foundation model) is actively released: 9.2.0 (2026-10-12, Apache-2.0 per PyPI metadata) — [PyPI tabpfn](https://pypi.org/project/tabpfn/)
- Microsoft Qlib: MIT license; README lists Python 3.8-3.12 support and Linux/Windows/macOS; 49.3k GitHub stars; model zoo of 23 models — GBDT (XGBoost, LightGBM, CatBoost), MLP, LSTM, GRU, ALSTM, GATs, SFM, TFT, TabNet, Transformer, Localformer, TCN, KRNN, Sandwich, DoubleEnsemble, TCTS, TRA, ADARNN, ADD, IGMTF, HIST; also "Rolling Retraining" and DDG-DA for market dynamics — [microsoft/qlib README](https://github.com/microsoft/qlib)
- Qlib release status: PyPI latest is pyqlib 0.9.7 (2025-08-15, Windows wheels); the GitHub releases page shows v0.9.8 dated "08 Oct" as latest (year not shown on the page). The newest model additions listed in the README date from May 2023. The README's run-all-models benchmark script is Linux-only. — [PyPI pyqlib](https://pypi.org/project/pyqlib/); [qlib releases](https://github.com/microsoft/qlib/releases); [microsoft/qlib README](https://github.com/microsoft/qlib)
- Qlib security-relevant change: source builds now restrict loading of saved recorder artifacts by default; `trusted=True` is required after verifying the artifact author (pickle-loading risk) — [microsoft/qlib README](https://github.com/microsoft/qlib)
- Qlib is now paired with RD-Agent (LLM-driven automated factor mining / model optimization; paper arXiv 2505.15155; "LLM-driven Auto Quant Factory" released Aug 8 2024) — [microsoft/qlib README](https://github.com/microsoft/qlib)
- Kronos (financial K-line foundation model): MIT license; pre-trained on over 12 billion K-line records from 45 exchanges; paper arXiv 2508.02739 (Aug 2025), accepted at AAAI 2026; model sizes — mini 4.1M params (context 2048), small 24.7M (context 512), base 102.3M (context 512) are open on Hugging Face; large 499.2M is not released; 40.6k GitHub stars, 76 commits, no tagged releases — [shiyu-coder/Kronos README](https://github.com/shiyu-coder/Kronos); [Kronos paper](https://arxiv.org/html/2508.02739v1)
- Kronos caveats from its own README: the fine-tuning pipeline is "a simplified demonstration, not a production system"; it is built on Qlib daily data; the example top-K backtest lacks realistic costs/slippage/impact; some `finetune/` comments are AI-generated and may be inaccurate; the paper's "93% RankIC" improvement over other TSFMs is the authors' own benchmark — [shiyu-coder/Kronos README](https://github.com/shiyu-coder/Kronos); [Kronos paper](https://arxiv.org/html/2508.02739v1)
- Chronos-2 (Amazon): 120M-parameter encoder-only time-series foundation model; zero-shot; supports univariate, multivariate and covariate-informed forecasting; installed via `chronos-forecasting` (2.3.2, 2026-09-08, Apache-2.0); paper arXiv 2510.15821 (Oct 2025) — [amazon/chronos-2 model card](https://huggingface.co/amazon/chronos-2); [PyPI chronos-forecasting](https://pypi.org/project/chronos-forecasting/)
- TimesFM 2.5 (Google): 200M parameters (down from 500M in 2.0), context up to 16k (up from 2048), announced Sept 2025; `timesfm` package 3.0.2 (2026-09-09, Apache-2.0). One secondary source gives a March 2026 date, which conflicts with Google's own announcement — [PyPI timesfm](https://pypi.org/project/timesfm/); [dev.to TimesFM 2.5 review](https://dev.to/andrew-ooo/timesfm-25-review-googles-time-series-foundation-model-14kp)
- Kaggle evidence on model choice: Jane Street's own description of its 2024-25 "Real-Time Market Data Forecasting" competition stresses fat tails, non-stationarity and sudden regime shifts, and says a lagged responder was provided specifically so participants could try online learning — [Jane Street ML page](https://janestreet.com/machine-learning)
- Non-winning public Jane Street solutions surfaced in search use GBDT ensembles (LightGBM + CatBoost) and XGBoost + PyTorch NN ensembles — [peerlist project write-up](https://peerlist.io/debasish2021/project/jane-street-realtime-market-data-analysis); [onepagecode substack](https://onepagecode.substack.com/p/algorithmic-trading-with-python-a)

### Inferences
(Practitioner judgment.)
- Recommended ladder:
  1. Naive baselines: always-up (base rate), yesterday's sign, 5-day reversal. Any model must beat these out of sample.
  2. Logistic regression (L2/elastic-net) on cross-sectionally standardized features — tests the pipeline end-to-end, is well calibrated by construction, trains in seconds.
  3. LightGBM (binary logloss, or regression/lambdarank on cross-sectional rank). Suggested conservative defaults for low-signal financial data: `num_leaves` 15-63, `max_depth` 4-7, `learning_rate` 0.01-0.05, `n_estimators` 300-2000 with early stopping on a purged validation block, `min_child_samples` 200-2000, `feature_fraction` 0.3-0.7, `bagging_fraction` 0.5-0.8 with `bagging_freq` 1, `lambda_l2` 1-100. Strong regularization and large leaf sizes are the norm because signal-to-noise is tiny.
  4. Seed/model averaging: average 3-10 LightGBM seeds, then blend with XGBoost/CatBoost and the linear model. Averaging typically adds more than tuning.
  5. Only then: sequence models (GRU/LSTM/TCN/PatchTST/TFT via NeuralForecast or Darts, or Qlib's zoo) on a 20-60 day lookback of features, or a small MLP on tabular features. On a single machine these are feasible on a consumer GPU or even CPU at daily frequency, but they add tuning, seed variance and reproducibility burden; expect at best a marginal gain as an ensemble member.
  6. Foundation models: use zero-shot Chronos-2 / TimesFM / Kronos forecasts (predicted return, predicted quantile spread = uncertainty) as extra features to the GBDT rather than as the primary predictor. Kronos-small/base (24.7M/102.3M params) are small enough for CPU or a modest GPU for a few hundred tickers nightly. Treat any published backtest for these models as unverified until reproduced in your own walk-forward with costs.
- Darts / NeuralForecast / PyTorch Forecasting are designed for forecasting values of series; for a cross-sectional direction classifier the natural framing is tabular (one row per ticker-date), where sklearn + LightGBM (or MLForecast for lag-feature plumbing) is simpler. Choose NeuralForecast if you go deep (fastest release cadence, includes PatchTST/TFT/NHITS); PyTorch Forecasting is alive but slower-moving.
- Qlib: valuable as a reference architecture and benchmark zoo (data handler -> dataset -> model -> strategy -> backtest -> recorder), but it is China-market-first, releases are infrequent, its US data path is uncertain, and it imposes its own binary data format. For a solo developer building a US product, borrow ideas (Alpha158, CS normalization, rolling retraining, T+1->T+2 label) rather than building on it — unless the goal is to rapidly benchmark many architectures on Linux/WSL.
- GPU is not required for the recommended baseline; a 16-32 GB RAM machine handles a 3,000-ticker x 20-year panel with ~100-200 features.

### Gaps
- Could not retrieve the top-3 Jane Street 2024-25 solution write-ups (Kaggle pages are JS-rendered; search was rate-limited). The commonly reported pattern (GBDT + NN/GRU ensembles with online updates) is therefore NOT sourced here and should be verified on Kaggle's Discussion/Write-ups tab. Optiver and Two Sigma write-ups were likewise not retrieved.
- No independent (non-author) benchmark of Kronos, Chronos-2 or TimesFM on US daily equity direction was found.
- LightGBM's license field is blank in PyPI metadata (historically MIT); not re-verified.
- Conflict noted: Qlib latest version is 0.9.7 on PyPI vs v0.9.8 on GitHub releases (year of the "08 Oct" tag not shown).

## 5. How to implement walk-forward and purged/embargoed CV and realistic backtests; which backtesting frameworks are current, and their licenses?

### Takeaway
Use walk-forward (rolling or expanding) splits by date with a purge gap >= label horizon and an embargo, implemented with scikit-learn's `TimeSeriesSplit(gap=...)` on a date index, skfolio's `WalkForward`/`CombinatorialPurgedCV`, or ~40 lines of custom code. For backtesting, a simple vectorized top-K/long-short portfolio simulation in Polars or vectorbt is enough for a daily cross-sectional signal; note the licenses — vectorbt is Apache-2.0 + Commons Clause, backtesting.py is AGPL-3.0, Backtrader is GPLv3 and stale, NautilusTrader is LGPL-3.0, Zipline-reloaded and bt are permissive.

### Cited Findings
Validation tooling:
- scikit-learn `TimeSeriesSplit(n_splits=5, *, max_train_size=None, test_size=None, gap=0)`: `gap` removes samples from the end of each train set before the test set; `max_train_size` gives a rolling instead of expanding window; samples must be equally spaced in time (the class does not check) — [sklearn TimeSeriesSplit](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html)
- skfolio `WalkForward(test_size, train_size, freq=None, freq_offset=None, previous=False, expand_train=False, reduce_test=False, purged_size=0)`: supports calendar frequencies (e.g., "MS"), expanding windows, and `purged_size` observations removed before each test set; docs recommend `purged_size >= 1` when execution lags (e.g., daily-priced assets) — [skfolio WalkForward](https://skfolio.org/generated/skfolio.model_selection.WalkForward.html)
- skfolio `CombinatorialPurgedCV(n_folds=10, n_test_folds=8, purged_size=0, embargo_size=0)`: trains on k-p folds, recombines multiple backtest paths; embargo removes training observations immediately following a test block because of serial correlation; skfolio is BSD-3-Clause, built on scikit-learn, latest 1.8.5 (2026-10-12) — [skfolio CombinatorialPurgedCV](https://skfolio.org/generated/skfolio.model_selection.CombinatorialPurgedCV.html); [PyPI skfolio](https://pypi.org/project/skfolio/)
- `purgedcv` (MIT, 0.1.10 released 2026-10-01): sklearn-compatible `PurgedKFold`, `PurgedGroupKFold`, walk-forward, `CombinatorialPurgedCV`, `reconstruct_paths`, plus deflated and probabilistic Sharpe ratios; young project (0.1.x) — [PyPI purgedcv](https://pypi.org/project/purgedcv/); [eslazarev/purged-cross-validation](https://github.com/eslazarev/purged-cross-validation)
- Abandoned/unavailable AFML CV packages: `timeseriescv` last released 2018-09-07; `mlfinlab` not on PyPI (404); `mlfinpy` last released 2024-10-09 — [PyPI timeseriescv](https://pypi.org/project/timeseriescv/); [PyPI mlfinlab](https://pypi.org/project/mlfinlab/) (404); [PyPI mlfinpy](https://pypi.org/project/mlfinpy/)
- RiskLabAI 3.2.0 (2026-10-02, BSD-3-Clause, Python >=3.12) is an actively released AFML-methods library — [PyPI RiskLabAI](https://pypi.org/project/RiskLabAI/)
- Other small libraries offering purged/embargoed splits exist (temporalcv, wraquant, mizarlabs — the last requires explicit prediction and evaluation times per sample) — [temporalcv docs](https://temporalcv.readthedocs.io/en/latest/api/cv_financial.html); [mizarlabs source](https://mizarlabs.readthedocs.io/en/latest/_modules/mizarlabs/model/model_selection.html)

Backtesting frameworks (status as of 2026-10-13):

| Framework | Latest (PyPI date) | License | Status / notes | Source |
|---|---|---|---|---|
| vectorbt (OSS) | 1.1.2 (2026-10-09), Py >=3.11 | "fair-code": Apache 2.0 with Commons Clause (free to use; may not sell products/services that are primarily the software) | Active again; vectorized on pandas/NumPy/Numba, optional Rust engine, multi-asset broadcasting, parameter sweeps, walk-forward optimization, label generation; community edition of paid VectorBT PRO | [README](https://github.com/polakowo/vectorbt); [PyPI](https://pypi.org/project/vectorbt/) |
| backtesting.py | 0.6.6 (2026-07-22) | AGPL-3.0 | Maintained; built-in SAMBO-based optimizer; oriented to a single OHLCV instrument (page does not mention portfolio-level backtests) | [README](https://github.com/kernc/backtesting.py); [PyPI](https://pypi.org/project/backtesting/) |
| Backtrader | 1.9.78.123 (2023-04-19) | GPLv3+ | Stale — no PyPI release since April 2023 | [PyPI](https://pypi.org/project/backtrader/) |
| Zipline-reloaded | 3.1.1 (2025-07-19), Py >=3.10, Windows wheels | Apache-2.0 | Maintained, slow cadence (~15 months since last release) | [PyPI](https://pypi.org/project/zipline-reloaded/) |
| NautilusTrader | 1.231.0 (2026-08-02), Py >=3.12, Windows wheels | LGPL-3.0-or-later | Very active; event-driven, production-grade | [PyPI](https://pypi.org/project/nautilus_trader/) |
| Qlib | pyqlib 0.9.7 (2025-08-15) on PyPI; v0.9.8 on GitHub | MIT | Integrated research + backtest (top-K strategies); infrequent releases | [PyPI](https://pypi.org/project/pyqlib/); [GitHub](https://github.com/microsoft/qlib) |
| bt | 1.4.1 (2026-10-10), Windows wheels | MIT | Active; portfolio/allocation-level backtests | [PyPI](https://pypi.org/project/bt/) |
| QuantConnect LEAN CLI | 1.0.229 (2026-08-28) | Apache-2.0 | Active; engine runs via Docker | [PyPI](https://pypi.org/project/lean/) |

- Performance reporting: quantstats 0.0.86 (2026-09-27, Apache-2.0) is active; pyfolio-reloaded 0.9.9 (2025-06-02, Apache-2.0) is maintained at slow cadence — [PyPI quantstats](https://pypi.org/project/quantstats/); [PyPI pyfolio-reloaded](https://pypi.org/project/pyfolio-reloaded/)
- Kronos README states that a credible backtest must model transaction costs, slippage and market impact and that a basic top-K strategy is only a demonstration — [shiyu-coder/Kronos README](https://github.com/shiyu-coder/Kronos)

### Inferences
(Practitioner judgment.)
- Implementation recipe for panel data (many tickers per date): split on unique dates, not rows. Build the array of unique trading dates, apply `TimeSeriesSplit(n_splits, test_size=63 or 126, gap=h + embargo, max_train_size=...)` to that date array, then map date folds back to rows. `gap` here is the purge: set it to at least the label horizon in trading days (h) plus the longest feature lookback overlap you care about; for next-day labels, gap 1-2 is enough; for 5-day labels use >= 5; for triple-barrier use the max holding period.
- Outer loop = walk-forward out-of-sample simulation mirroring production: e.g., train on trailing 5-10 years (or expanding), validate on the next 6 months (for early stopping/calibration), predict the following 1-3 months, roll forward. Concatenate the out-of-sample predictions into one series — that is the only series to backtest and report.
- Inner loop for hyperparameters: purged K-fold or CPCV inside each training window only if compute allows; otherwise fix hyperparameters conservatively and tune rarely. Count every configuration tried; report deflated Sharpe (purgedcv provides it) or at minimum hold back a final untouched 12-24 month period.
- Realistic daily backtest checklist: signal at close T -> trade at open or close T+1 (never the same close used in features); costs 5-10 bps per side for liquid large caps plus half-spread for small caps (make cost a parameter and show sensitivity); cap position at a % of ADV; include delisted names with delisting returns; borrow cost and availability for shorts; no look-ahead in universe membership; dividends via total-return adjustment; report turnover, hit rate, rank-IC, Sharpe after costs, max drawdown, and performance by year and by market regime.
- Framework selection for this product:
  - Signal research: no framework needed — a Polars/pandas function that turns (date, ticker, score) into top-K or decile portfolios with a one-day lag and a cost model is ~50 lines and fully transparent. vectorbt's `Portfolio.from_signals/from_orders` is a good vectorized alternative.
  - If the app ever becomes a commercial product, check licenses first: AGPL (backtesting.py) obliges source disclosure for network-served derivative works; GPLv3 (Backtrader) is copyleft; vectorbt's Commons Clause forbids selling a product whose value derives substantially from vectorbt; LGPL (NautilusTrader) is fine for linking; Apache/MIT/BSD (Zipline-reloaded, bt, Qlib, skfolio, LEAN) are the safe choices. Using any of them purely for internal offline research generally does not trigger distribution obligations, but this is not legal advice.
  - Event-driven realism (order types, intraday fills, live trading parity): NautilusTrader is the current, actively developed option; overkill for a daily prediction app that does not execute trades.
  - Backtrader: do not start new work on it.

### Gaps
- Did not verify vectorbt's release history between 2024 and the 1.x line, or exactly what changed in 1.x (only the README and latest PyPI metadata were checked).
- PyBroker (ML-oriented backtester) could not be verified: `pybroker` returns 404 on PyPI (it is published under a different distribution name that was not checked).
- backtesting.py multi-asset support: the README does not state it either way; treated as single-instrument based on absence of evidence.
- No sourced benchmark of realistic transaction-cost levels for US equities was gathered; the bps figures above are rules of thumb.

## 6. How to serve and operate the model cheaply (batch vs online, registry/tracking, calibration, monitoring, retraining cadence)?

### Takeaway
For daily-bar signals, nightly batch scoring written to a database table is the right architecture — online inference adds cost and complexity with no benefit because inputs change once per day. MLflow (self-hosted, SQLite backend) covers tracking + registry for free; calibrate probabilities on a disjoint, most-recent validation block with sigmoid or isotonic; monitor live hit-rate/Brier/IC and feature drift with Evidently or plain SQL; retrain on a fixed monthly/quarterly walk-forward schedule.

### Cited Findings
- MLflow 3.17.1 was released 2026-10-13 (Apache-2.0, Python >=3.10) — extremely active — [PyPI mlflow](https://pypi.org/project/mlflow/)
- Weights & Biases client 0.30.0 (2026-09-09, MIT client; hosted service) — [PyPI wandb](https://pypi.org/project/wandb/)
- Evidently 0.7.23 (2026-09-11, Apache-2.0) for drift/data-quality reports — [PyPI evidently](https://pypi.org/project/evidently/)
- NannyML 0.13.1 last released 2025-07-12 and capped at Python <3.13 — slowing; verify before adopting — [PyPI nannyml](https://pypi.org/project/nannyml/)
- MAPIE 1.5.0 (2026-08-05, BSD-3-Clause) for conformal prediction / uncertainty sets — [PyPI mapie](https://pypi.org/project/mapie/)
- scikit-learn calibration: `CalibratedClassifierCV` supports `method="sigmoid"` (Platt), `"isotonic"`, and `"temperature"`; isotonic is recommended only with enough calibration data (more than ~1000 samples) because it overfits small sets; sigmoid is strictly monotonic so preserves ranking/AUC, whereas isotonic creates ties and can change AUC — [sklearn calibration guide](https://scikit-learn.org/stable/modules/calibration.html)
- Calibration data must be disjoint from the data used to fit the classifier; for an already-fitted model wrap it with `FrozenEstimator` (the replacement for `cv="prefit"`): `CalibratedClassifierCV(estimator=FrozenEstimator(clf), method="sigmoid").fit(X_cal, y_cal)` — [sklearn calibration guide](https://scikit-learn.org/stable/modules/calibration.html)
- `LogisticRegression` is well calibrated by default (when well specified and C is tuned); random forests tend to be under-confident; Brier score and log loss mix calibration with discrimination, so a lower Brier score does not by itself prove better calibration — use reliability diagrams (`CalibrationDisplay`) — [sklearn calibration guide](https://scikit-learn.org/stable/modules/calibration.html)
- Qlib's default mode is offline; its "online mode" is a shared data service (Qlib-Server), and it lists "Rolling Retraining" and DDG-DA as its approaches for adapting to market dynamics (concept drift) — [microsoft/qlib README](https://github.com/microsoft/qlib)
- Jane Street explicitly frames financial data as non-stationary with sudden regime shifts and designed its competition to allow online learning from lagged outcomes — supporting frequent refresh/updating — [Jane Street ML page](https://janestreet.com/machine-learning)
- Loading pickled model artifacts is a recognized risk: Qlib now requires `trusted=True` to load recorder artifacts — relevant when choosing a model serialization format — [microsoft/qlib README](https://github.com/microsoft/qlib)

### Inferences
(Practitioner judgment.)
- Nightly batch job (single script, idempotent, keyed by `asof_date`):
  1. After market close + vendor publication delay (e.g., 18:00-20:00 ET): ingest bars and corporate actions; run data-quality checks (row counts vs. universe, missing tickers, price jumps without a corporate action, zero volume, stale dates). Abort and alert on failure rather than scoring bad data.
  2. Recompute features for the latest date (and trailing window); append to the feature table.
  3. Load the "production" model version from the registry; score the universe; apply the calibrator; write `predictions` rows with model_version and features_hash.
  4. Backfill realized outcomes for previous predictions (join next-day returns) into a `prediction_outcomes` table.
  5. Compute monitoring metrics; send a summary/alert (email/Slack/Telegram).
  The app/API reads only from the `predictions` table. Whole job for a few thousand tickers runs in minutes on CPU.
- Hosting cost: the job can run on the developer's Windows machine via Task Scheduler, or on a 2-4 vCPU / 8-16 GB cloud VM or a scheduled container; serving is a small managed Postgres (or SQLite/DuckDB file behind a FastAPI app). Online model inference (FastAPI + loaded model) is only needed for user-specific "what-if" queries.
- Model artifacts: save LightGBM with its native text format (`booster.save_model`) rather than pickle; log to MLflow with params, the data snapshot identifier, feature list, label definition version, and walk-forward metrics. MLflow with `sqlite:///mlflow.db` + local artifact folder is zero-cost; W&B is a nicer hosted UI but a third-party dependency. For a solo developer, MLflow local is the default; aliases ("champion"/"challenger") in the registry handle promotion.
- Calibration specifics for this domain: raw GBDT scores on near-coin-flip targets cluster tightly around 0.5 (e.g., 0.47-0.54). Fit the calibrator on the most recent out-of-sample block (purged from training), prefer sigmoid for stability unless there are several thousand calibration rows (with a cross-section of hundreds of tickers per day there usually are, but rows within a day are highly correlated — effective sample size is closer to number of days). Re-fit the calibrator at each retrain. Display confidence buckets in the app and publish the realized hit-rate per bucket; be explicit that a "56% up" probability is a weak edge.
- Monitoring metrics (daily, with 20/60-day rolling windows): directional hit-rate overall and for top/bottom-decile confidence; Brier score and log loss vs. the base-rate baseline; daily rank-IC (Spearman of score vs. realized return) and its rolling mean/t-stat; calibration curve by bucket; long-short decile spread return after costs; feature drift via PSI or KS per feature (Evidently) and share of missing values; prediction distribution drift (mean, std of p_up); coverage (tickers scored / universe). Alert thresholds: rolling 60-day IC below zero, hit-rate below base rate for N weeks, or data-quality failures. Because realized daily performance is extremely noisy, avoid reacting to short windows — one bad week is not drift.
- Retraining cadence: scheduled rolling retrain monthly (or quarterly) on trailing N years, the same procedure used in the walk-forward backtest so that live behaviour matches what was tested; do not retrain reactively on short-term underperformance. Keep champion/challenger: the new model runs in shadow for a few weeks, promoted only if not worse. Re-run the full walk-forward when features or labels change.
- Conformal prediction (MAPIE) is an optional way to abstain: only publish a direction call when the conformal set is a singleton at the chosen confidence level.

### Gaps
- No sourced empirical evidence was gathered on optimal retraining frequency for daily equity models; the monthly/quarterly recommendation is convention.
- The sklearn calibration guide does not specifically discuss gradient boosting calibration; the statement that GBDT outputs need calibration in this setting is practitioner experience.
- Cloud hosting prices (VM, managed Postgres) were not researched.
- W&B free-tier terms in 2026 were not checked.

## 7. How can LLMs be used in the pipeline, and at what approximate cost per ticker per day?

### Takeaway
LLMs fit three places: (1) turning daily news/filings into structured sentiment/event features, (2) summarizing filings and earnings material, and (3) writing plain-language explanations of model signals from SHAP attributions. At late-2026 small-model prices this costs on the order of $0.0002-$0.001 per ticker per day for news sentiment (roughly $0.10-$0.50 per day for a 500-ticker universe), so cost is not the constraint — point-in-time correctness and look-ahead contamination in backtests are.

### Cited Findings
- Anthropic API list prices (per million tokens, input / output) as published on 2026-10-13: Claude Haiku 5.5 $0.10 / $0.50 for prompts up to 100,000 tokens ($0.50 / $2.50 above that); Claude Haiku 4.5 $1 / $5; Claude Sonnet 5.5 $2 / $10; Claude Opus 5.5 $4 / $20 — [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- The Batch API gives a 50% discount on both input and output tokens for asynchronous processing (e.g., Sonnet 5.5-class batch pricing is half of list) — a natural fit for a nightly job — [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- Prompt caching: cache hits are billed far below base input (e.g., $0.01/MTok for Haiku 5.5, $0.10/MTok for Sonnet 5.5), with 5-minute cache writes at 1.25x base input — useful when the same long instruction/schema prefix is reused for every ticker — [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- Microsoft's RD-Agent (paired with Qlib) uses LLMs for automated factor mining and model optimization (R&D-Agent-Quant, arXiv 2505.15155) — an example of LLMs used in the research loop rather than at inference — [microsoft/qlib README](https://github.com/microsoft/qlib)
- SEC filings can be pulled programmatically with edgartools (5.62.0, MIT, released 2026-10-11) — [PyPI edgartools](https://pypi.org/project/edgartools/)
- An older local-model route is poorly maintained on PyPI: `finbert-embedding` last released 2021-03-31 — [PyPI finbert-embedding](https://pypi.org/project/finbert-embedding/)

### Inferences
(Arithmetic from the cited prices; token volumes are assumptions.)
- News sentiment feature, assuming ~3,000 input tokens (instructions + ~10 headlines with snippets) and ~300 output tokens (JSON: sentiment score, event tags, confidence) per ticker per day:
  - Haiku 5.5: 3,000 x $0.10/M + 300 x $0.50/M = $0.00045 per ticker-day; with Batch API about $0.00023. 500 tickers: ~$0.23/day (~$57/year over 252 trading days), ~$0.11/day batched.
  - Haiku 4.5: $0.0045 per ticker-day; 500 tickers ~$2.25/day.
  - Sonnet 5.5: 3,000 x $2/M + 300 x $10/M = $0.009 per ticker-day; 500 tickers ~$4.50/day (~$2.25 batched).
  - Most tickers have no news on a given day, so real cost is lower; skip the call when there are no new items.
- Filing summarization, assuming an ~80,000-token 10-K/10-Q and ~1,000 output tokens: Haiku 5.5 ~ $0.0085 per filing (stays under the 100k-token price tier); Sonnet 5.5 ~ $0.17 per filing. With ~4 periodic filings per ticker per year plus 8-Ks, this is cents per ticker per year on the small model.
- Signal explanations, only for names shown to users (e.g., top 20 signals/day), ~1,500 input tokens (top SHAP features, recent stats, news summary) + ~250 output tokens: Sonnet 5.5 ~ $0.0055 each, ~$0.11/day; Haiku 5.5 ~ $0.0003 each.
- Overall budget: a 500-ticker universe with daily news sentiment on a small model, filing summaries, and top-20 explanations lands around $0.15-$0.50 per day (roughly $3-$10 per month); using mid-tier models throughout is ~$3-$5 per day.
- Design rules:
  - Force structured output (JSON schema: sentiment in [-1, 1], event type enum, materiality, novelty) so results become numeric features; aggregate per ticker-day (mean, max |sentiment|, count, novelty-weighted) and then cross-sectionally rank like any other feature.
  - Timestamp discipline: only feed items published before the decision cutoff; store the model name/version and prompt hash with each feature row; never regenerate historical features with a newer model without versioning.
  - Backtest contamination: an LLM whose training data extends past a historical date may "know" what happened next, so LLM-derived sentiment backtests on periods before the model's knowledge cutoff are optimistically biased. Treat only features generated live (or on post-cutoff data) as clean evidence; anonymizing tickers/dates in prompts mitigates but does not eliminate this.
  - Explanations must be grounded: pass the model the actual SHAP contributions and feature values and instruct it to explain only those; the LLM narrates the model's reasons, it does not produce the prediction. Add a fixed "not financial advice" framing.
  - Cheaper alternative for pure sentiment: a local FinBERT-class classifier from Hugging Face `transformers` runs on CPU for free, at lower quality on nuanced/long text; LLMs add event extraction and summarization the classifier cannot do.
  - News licensing (redistribution of headlines/summaries in an app) is a separate legal question from API cost.

### Gaps
- Only Anthropic prices were verified in this session; OpenAI and Google Gemini prices were not fetched, so no cross-vendor comparison is given. Prices change frequently — re-check before budgeting.
- News data source cost (often larger than the LLM cost) was not researched here.
- No sourced evidence was gathered on how much predictive value LLM sentiment features add at daily horizon (feasibility is out of scope), nor a primary source quantifying look-ahead contamination; the contamination warning is a methodological inference.
- Token counts per ticker are assumptions; actual volumes depend on the news vendor and how much article body is passed.
