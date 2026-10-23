# Feasibility and achievable accuracy of predicting individual stock direction (state of evidence, Oct 2026)

Researcher note on method: the search tool was rate-limited during this session and several primary PDFs (notably Gu-Kelly-Xiu) could not be parsed. Where a number comes from a secondary summary, or could not be verified against the primary paper, it is labelled. Items I recall but could not source in this session are in the Gaps sections, explicitly marked "unverified recollection", and should not be cited as fact without a check.

## 1. What out-of-sample directional accuracy is realistically achievable (daily, weekly, monthly)?

### Takeaway
Credible out-of-sample evidence puts next-day direction accuracy for individual stocks and indices at roughly 50-55%, frequently statistically indistinguishable from a coin flip or an "always up" baseline; claims far above that almost always trace to a different target (e.g. same-day open-to-close), selection of the best of many trials, tiny samples, or leakage. The serious academic literature mostly does not report hit rates at all; it reports monthly out-of-sample R-squared well below 1% and judges value through ranked long-short portfolios.

### Cited Findings
- A deep-LSTM study on the S&P 500 reported a mean directional accuracy of about 51%, and the Pesaran-Timmermann test did not confirm statistically significant directional predictability (arXiv preprint, 2019). — [arXiv 1902.03125](https://arxiv.org/pdf/1902.03125)
- A 2025 arXiv study of S&P 500 direction (hybrid quantum-classical ensemble) reported individual models ranging from 44.06% to 57.04% accuracy; the 57% figure is the best of 35 trials, the selection step kept only models above 52%, and the average across all models was 50.43%. This illustrates how best-of-N reporting inflates headline accuracy. — [arXiv 2512.15738](https://arxiv.org/pdf/2512.15738)
- A study of Dow constituents reported hit ratios of 51-52% and found simple forecasting methods outperformed more complex machine learning (non-peer-reviewed university project page). — [WUSTL DJIA predictions](https://sites.wustl.edu/djiapredictions/?p=207)
- An S&P 500 study combining technical, fundamental and text data explicitly recommends benchmarking against a hypothetical model that always predicts an increase, because of upward drift (arXiv preprint, 2021). — [arXiv 2108.10826](https://arxiv.org/pdf/2108.10826)
- A vendor blog summarising an MDPI paper on Indonesian LQ45 stocks (2016-2025) reports directional accuracy of 49-54% with out-of-sample R-squared near zero or negative. Blog/vendor source, non-US market; treat as a pointer only. — [LambdaFin blog](https://www.lambdafin.com/articles/ai-stock-prediction-accuracy)
- A 2026 arXiv preprint on SPY reports 71.09% accuracy for logistic regression, but the setup uses the day's opening price, i.e. it predicts same-day open-to-close moves, not next-day direction; its XGBoost result is 58.45% (CI lower bound near 55%), and 72.7% is reached only on a subset of 154 large-predicted-move observations. Not peer-reviewed; an example of a high number that is not comparable to next-day prediction. — [arXiv 2608.26106 via IDEAS](https://ideas.repec.org/p/arx/papers/2608.26106.html)
- Fischer & Krauss (working paper May 2017; published EJOR 2018) applied LSTMs to out-of-sample directional prediction for S&P 500 constituents 1992-2015 and reported daily returns of 0.46% and a Sharpe ratio of 5.8, both BEFORE transaction costs. — [FAU working paper 11-2017](https://iwf.rw.fau.de/files/2015/12/11-2017.pdf)
- Ghosh, Neufeld & Sahoo (arXiv 2020) re-ran the Fischer-Krauss single-feature setup on an extended sample and got daily returns of 0.41% (LSTM) and 0.39% (random forest), again before costs, in an intraday (open-to-close) framing. — [arXiv 2004.10178](https://arxiv.org/pdf/2004.10178)
- At the monthly horizon, Gu, Kelly & Xiu (RFS 2020) describe their out-of-sample return-prediction R-squared as "unprecedented"; a secondary summary puts it at roughly 0.33-0.40% per month for tree and neural-net models at the stock level, about 0.26% for penalised linear models, and negative for unpenalised OLS on 900+ predictors. The R-squared figures are from a secondary summary and were not verified against the paper's tables. — [NBER w25398](https://www.nber.org/papers/w25398.pdf); [Mirova summary](https://www.research-center.mirova.com/en/research-library/Empirical-Asset-Pricing-via-Machine-Learning)

### Inferences
- My own arithmetic, not from a source: the standard error of a hit rate near 50% is about 0.5/sqrt(N). With about 250 test days that is roughly 3.2 percentage points, so 53% on one year of daily calls for one stock is noise. Separating 52% from 50% at two standard errors needs on the order of 2,500 independent predictions. A per-stock accuracy badge in an app will therefore be statistically meaningless unless pooled across many stocks and years, and pooled same-day predictions are cross-correlated, so the effective N is smaller than the raw count.
- A monthly R-squared of about 0.4% that is called "unprecedented" in a top journal implies the per-stock, per-period signal is tiny; the economic value comes from applying it across thousands of stocks and holding the extremes, not from calling any single stock. This is the central mismatch with a retail "this stock will go up" product.
- Reasonable planning ranges for a solo developer (my synthesis, not a single-source figure): daily 50-53% pooled, weekly and monthly a few points above the base rate at best, with the caveat that at longer horizons the unconditional "up" base rate itself exceeds 50%, so raw accuracy flatters a no-skill model. Skill should be reported as lift over the always-up baseline.
- Any vendor or paper claiming 60-90% next-day accuracy on liquid US stocks should be presumed to have a target mismatch, leakage, or selection bias until shown otherwise.

### Gaps
- No peer-reviewed meta-analysis giving a pooled distribution of out-of-sample directional accuracies by horizon was located in this session.
- Unverified recollection: Fischer & Krauss (2018) report roughly 54% directional accuracy and that excess returns faded to near zero after about 2010 once costs are considered. Searches did not confirm either figure; check the published EJOR version before citing.
- Weekly-horizon evidence specifically is thin in what I retrieved; most credible studies are daily or monthly.
- Could not retrieve the Macrosynergy write-up on directional predictability of daily equity returns (HTTP 403).

## 2. What does the evidence say about each approach?

### Takeaway
No approach delivers reliable single-stock direction calls; the approaches with the best-documented (small, cross-sectional) edge are momentum/factor-style characteristics combined by tree ensembles or shallow neural nets at monthly horizons, and news-based signals around events, while simple technical rules, off-the-shelf time-series foundation models and price-only deep learning have weak or non-robust evidence. Even the "working" approaches concentrate their profits in small, hard-to-trade stocks and decay after publication and adoption.

### Cited Findings

Technical indicators / trading rules
- Sullivan, Timmermann & White (Journal of Finance 1999) applied White's Reality Check bootstrap to an expanded universe of technical rules on 100 years of daily DJIA data to quantify data-snooping bias. — [LSE Research Online](https://researchonline.lse.ac.uk/id/eprint/119144)
- Bajgrowicz & Scaillet (Journal of Financial Economics 2012), using a false-discovery-rate approach on daily DJIA data 1897-2011, conclude an investor would never have been able to select the future best-performing rules ex ante, and that even in-sample performance is completely offset by low transaction costs; they say results "seriously call into question" the economic value of technical rules. — [IDEAS/JFE](https://ideas.repec.org:443/a/eee/jfinec/v106y2012i3p473-491.html); [CFA Digest summary](https://rpc.cfainstitute.org/research/cfa-digest/2013/02/technical-trading-revisited-false-discoveries-persistence-tests-and-transaction-costs-digest)

Momentum / factor signals
- Gu, Kelly & Xiu (2020) find all ML methods agree on the same small set of dominant predictive signals: variations on momentum, liquidity and volatility. — [AQR paper page](https://www.aqr.com/Insights/Research/Journal-Article/Empirical-Asset-Pricing-via-Machine-Learning)
- McLean & Pontiff (Journal of Finance 2016), 97 predictors: long-short portfolio returns are 26% lower out-of-sample and 58% lower post-publication. — [McLean & Pontiff 2016 PDF](https://Www.Gwern.net/doc/economics/2016-mclean.pdf)
- Jensen, Kelly & Pedersen (Journal of Finance 2023) argue the majority of factors replicate, cluster into 13 themes, and work out-of-sample across 93 countries. — [NBER w28432](https://www.nber.org/papers/w28432)

Gradient boosting / trees and neural nets on characteristics
- Gu, Kelly & Xiu identify trees and neural networks as the best performers and attribute the gain to nonlinear predictor interactions missed by linear methods; a value-weighted long-short decile strategy on neural-net forecasts earns an out-of-sample annualized Sharpe of 1.35, and neural-net S&P 500 market timing earns 0.77 versus 0.51 for buy-and-hold. The 2018 working draft cited Sharpe ratios "in excess of 2.0"; use the published figures. — [AQR-hosted paper PDF](https://www.aqr.com:443/-/media/AQR/Documents/Journal-Articles/Empirical-Asset-Pricing-in-Machine-Learning.pdf?sc_lang=en); [NBER w25398](https://www.nber.org/papers/w25398.pdf)
- Avramov, Cheng & Metzker (Management Science 2023): deep-learning signal profits come from difficult-to-arbitrage stocks and high limits-to-arbitrage periods; excluding microcaps, distressed stocks or high-volatility episodes substantially reduces profitability, and realistic transaction costs reduce it further because of high turnover and extreme positions. — [SSRN 3450322](https://papers.ssrn.com/abstract=3450322)
- A CUHK summary of that paper quantifies the drop: payoff fell 62% excluding microcaps, 68% excluding non-rated firms, 80% excluding firms around credit-rating downgrades; a co-author states an average investor would struggle to earn alpha after costs. University press summary of a peer-reviewed paper. — [CUHK Business School](https://cbk.bschool.cuhk.edu.hk/the-limitations-of-using-ai-to-pick-stocks/)
- The same paper's more favourable findings: ML signals remain profitable in long positions and in recent years, and identify mispriced stocks consistent with most known anomalies. — [Hebrew University CRIS record](https://cris.huji.ac.il/en/publications/machine-learning-vs-economic-restrictions-evidence-from-stock-ret/)

LSTMs / price-only deep learning
- Fischer & Krauss: LSTM beat random forest, a deep net and logistic regression on S&P 500 constituents 1992-2015, but headline figures (0.46%/day, Sharpe 5.8) are before transaction costs. — [FAU working paper](https://iwf.rw.fau.de/files/2015/12/11-2017.pdf)
- Deep LSTM on the S&P 500 index: about 51% directional accuracy, not statistically significant on the Pesaran-Timmermann test. — [arXiv 1902.03125](https://arxiv.org/pdf/1902.03125)

Transformers and time-series foundation models (TSFMs)
- Rahimikia, Ni & Wang (arXiv, Nov 2025), daily excess returns across 94 countries over 34 years: "off-the-shelf pre-trained TSFMs perform poorly in zero-shot and fine-tuning settings"; models pretrained from scratch on financial data showed substantial gains in forecast accuracy and economic value. Preprint. — [arXiv 2511.18578](https://arxiv.org/abs/2511.18578)
- Noguer & Franklin (arXiv, June 2026) benchmarked TimeGPT, TimesFM-2.5, Moirai-2.0, Chronos and Chronos-2 against NBEATS, NHITS, PatchTST, iTransformer and KAN on five liquid US equities at a 20-business-day horizon: gains over the random walk were "small and sparse"; a Diebold-Mariano test rejected in favour of the model in only 2 of 10 tasks (Chronos on AMZN, Moirai-2.0 on GOOG). Authors conclude TSFMs are useful low-data priors but not reliable sources of statistically significant alpha. Preprint, tiny universe. — [arXiv 2606.27100](https://arxiv.org/abs/2606.27100)
- Laniewski & Slepaczuk (ISD 2025 conference paper), Nasdaq-100 and S&P 500 indices 1995-early 2025: zero-shot Chronos was statistically comparable to the best traditional methods on forecast accuracy, but its derived trading performance lagged top benchmarks, and the fine-tuned variant underperformed zero-shot. — [ISD 2025 paper](https://isd2025.fon.bg.ac.rs/wp-content/uploads/ISD_2025_camera_ready_265.pdf)
- Kronos (arXiv, Aug 2025) is a foundation model pretrained specifically on financial market (candlestick) data; I did not verify its claimed results. — [arXiv 2508.02739](https://arxiv.org/pdf/2508.02739)

News / LLM sentiment
- Lopez-Lira & Tang, "Can ChatGPT Forecast Stock Price Movements?" (arXiv v1 April 2023, v6 Oct 2025): using headlines dated after the models' knowledge cutoff, GPT-4 captures the initial market reaction with roughly a 90% portfolio-day hit rate, which the authors state is NOT tradable; scores also significantly predict subsequent drift, strongest for small stocks and negative news; ability rises with model size; and strategy returns decline as LLM adoption rises. — [arXiv 2304.07619](https://arxiv.org/abs/2304.07619)
- Glasserman & Lin (arXiv 2023): LLM sentiment backtests inside the training window suffer look-ahead bias and a "distraction" effect; anonymising company names improved in-sample performance, and out-of-sample (post-cutoff) look-ahead bias is not a concern. — [arXiv 2309.17322](https://arxiv.org/pdf/2309.17322)
- "A Test of Lookahead Bias in LLM Forecasts" (arXiv Dec 2025) defines a Lookahead Propensity statistic; replicating the Lopez-Lira/Tang setup with Llama-3.3, a one-standard-deviation rise in LAP increases the signal's marginal effect by about 37% in-sample, and the interaction loses significance on post-cutoff data, i.e. memorisation inflates in-window LLM backtests. — [arXiv 2512.23847](https://arxiv.org/html/2512.23847v1)
- "The Memorization Problem" (arXiv 2025) reports clear evidence that GPT-4o memorised individual security prices, more so for prominent stocks and recent periods. — [arXiv 2504.14765](https://arxiv.org/html/2504.14765v2)

### Inferences
- Rank order of evidential support for a solo developer (my synthesis): (1) cross-sectional characteristics such as momentum, liquidity, volatility, combined with gradient boosting at monthly horizons, has the strongest peer-reviewed support, but the edge is small, concentrated in small caps, and shrinks under costs; (2) news/LLM signals have real but decaying evidence, mostly in small stocks and negative news, and require strictly post-cutoff evaluation; (3) price-only LSTM/transformer models and zero-shot TSFMs have little credible evidence of beating a random walk on liquid US stocks; (4) classic technical rules have the weakest evidence once data snooping and costs are handled.
- Model class matters less than inputs and evaluation: in Gu-Kelly-Xiu the different ML methods converge on the same predictors, and the move from linear to nonlinear adds tenths of a percent of monthly R-squared.
- The retail-relevant universe (large, liquid, well-covered US names) is exactly where both ML-factor and LLM-news edges are weakest.
- The 90% "hit rate" in Lopez-Lira & Tang is a portfolio-day statistic on the contemporaneous, untradable reaction; it must not be read as 90% stock-direction accuracy.

### Gaps
- Fundamentals and earnings signals: I retrieved no primary source in this session on post-earnings-announcement drift, analyst revisions, or fundamental ML models. Unverified recollection: PEAD (Bernard & Thomas 1989) is one of the most replicated anomalies but has weakened in large, liquid US stocks in recent decades; Chen & Zimmermann-style datasets include many accounting-based predictors that reproduce in-sample. Needs sourcing.
- Social-media sentiment (Twitter/X, Reddit, StockTwits): no credible source retrieved; I found no reliable evidence either way in this session.
- Gradient boosting specifically (XGBoost/LightGBM) versus neural nets on US equities: Gu-Kelly-Xiu cover boosted trees and random forests generically; I could not extract model-by-model R-squared from the primary PDF.
- Sample details for Gu-Kelly-Xiu were not verified. Unverified recollection: nearly 30,000 US stocks, 1957-2016, 94 characteristics plus macro predictors and industry dummies; best monthly stock-level R-squared about 0.40% (NN3); equal-weighted long-short Sharpe well above the 1.35 value-weighted figure.
- Net-of-cost performance of LLM news strategies and precise decay figures by year were not available from the abstract.

## 3. Which landmark papers matter and what are their headline numbers?

### Takeaway
The canon splits into three groups: papers showing a small but real ML edge in the cross-section (Gu-Kelly-Xiu), papers showing that much published predictability is fragile, decays, or lives in untradable stocks (Harvey-Liu-Zhu, Hou-Xue-Zhang, McLean-Pontiff, Avramov et al.), and methodological work on backtest overfitting (Bailey, Borwein, Lopez de Prado, Zhu). The replication debate is unresolved: estimates of how much replicates range from about 35% to 82-98% depending on definition.

### Cited Findings
- Gu, Kelly & Xiu, "Empirical Asset Pricing via Machine Learning", Review of Financial Studies 33 (2020), 2223-2273 (NBER WP 25398, Dec 2018, revised Sept 2019). Headline: value-weighted long-short decile Sharpe 1.35 from neural-net forecasts; market-timing Sharpe 0.77 vs 0.51 buy-and-hold; trees and neural nets best; dominant signals are momentum, liquidity, volatility. — [NBER w25398](https://www.nber.org/papers/w25398.pdf); [AQR page](https://www.aqr.com/Insights/Research/Journal-Article/Empirical-Asset-Pricing-via-Machine-Learning)
- Hou, Xue & Zhang, "Replicating Anomalies" (NBER working paper version): of 447 anomalies, 286 (64%) are insignificant at the 5% level; applying the t > 3 hurdle of Harvey, Liu & Zhu (2016) raises this to 380 (85%). — [NBER w23394](https://www.nber.org/papers/w23394.pdf)
- Published-version figures as reported in commentary: 452 anomalies, 65% fail at t = 1.96, 82% fail at a multiple-testing-adjusted t = 2.78. Secondary source. — [Evidence Investor](https://evidenceinvestor.com/post/is-there-a-replication-crisis)
- Harvey, Liu & Zhu (2016) proposed a t-statistic cutoff of about 3.0 for new factors to account for multiple testing, as cited in Hou-Xue-Zhang. — [NBER w23394](https://www.nber.org/papers/w23394.pdf)
- McLean & Pontiff, "Does Academic Research Destroy Stock Return Predictability?", Journal of Finance 2016: 97 variables; returns 26% lower out-of-sample, 58% lower post-publication. — [McLean & Pontiff PDF](https://Www.Gwern.net/doc/economics/2016-mclean.pdf)
- Chen & Zimmermann, "Open Source Cross-Sectional Asset Pricing", Critical Finance Review 11(2), 2022: 319 characteristics; for the 161 clearly significant in the original papers, 98% of reproduced long-short portfolios have t > 1.96; regression of reproduced on original t-stats has slope 0.88 and R-squared 82% (published version). — [Federal Reserve FEDS](https://www.federalreserve.gov/econres/feds/open-source-cross-sectional-asset-pricing.htm); [Critical Finance Review](https://nowpublishers.com/article/Details/CFR-0112)
- Jensen, Kelly & Pedersen, "Is There a Replication Crisis in Finance?", Journal of Finance 78(5), 2023: majority of factors replicate, 13 themes, hold out-of-sample in 93 countries. The widely quoted "82% replicable" figure comes from Pedersen's presentation of the paper. — [NBER w28432](https://www.nber.org/papers/w28432); [Inquire Europe](https://www.inquire-europe.org/news/in-case-you-missed-it-lasse-h-pedersen-copenhagen-business-school-nyu-principal-at-aqr/)
- Avramov, Cheng & Metzker, "Machine Learning vs. Economic Restrictions", Management Science 2023 (DOI 10.1287/mnsc.2022.4449): ML profits concentrated in microcaps, distressed and hard-to-arbitrage stocks; attenuated by costs. — [SSRN 3450322](https://papers.ssrn.com/abstract=3450322)
- Bailey, Borwein, Lopez de Prado & Zhu, "The Probability of Backtest Overfitting": proposes combinatorially symmetric cross-validation (CSCV) to estimate the probability a backtest is overfit, and argues hold-out is unreliable for investment backtests. — [SSRN 2326253](https://papers.ssrn.com/abstract=2326253)
- Bailey & Lopez de Prado, "The Deflated Sharpe Ratio" (Journal of Portfolio Management, 2014): adjusts the Sharpe ratio for the number of trials, variance of trial Sharpes, and skewness/kurtosis of returns. Described via a secondary practitioner summary. — [TradingStrategy.ai methodology notes](https://tradingstrategy.ai/docs/learn/backtesting.html)
- Lopez de Prado, purged cross-validation (2017, in Advances in Financial Machine Learning): purging removes training observations overlapping the test set; an embargo widens the gap after the test set. — [Wikipedia: Purged cross-validation](https://en.wikipedia.org/wiki/Purged_cross-validation)
- Lopez-Lira & Tang (2023-2025), Glasserman & Lin (2023), and the Lookahead Propensity paper (2025) are the key LLM references; see section 2. — [arXiv 2304.07619](https://arxiv.org/abs/2304.07619); [arXiv 2309.17322](https://arxiv.org/pdf/2309.17322); [arXiv 2512.23847](https://arxiv.org/html/2512.23847v1)
- Sullivan-Timmermann-White (1999) and Bajgrowicz-Scaillet (2012) are the key data-snooping references for technical rules; see section 2. — [LSE](https://researchonline.lse.ac.uk/id/eprint/119144); [IDEAS](https://ideas.repec.org:443/a/eee/jfinec/v106y2012i3p473-491.html)

### Inferences
- The "replication crisis" numbers are not actually contradictory: Chen-Zimmermann show original results can be reproduced with the original methods; Hou-Xue-Zhang show many vanish when microcaps are down-weighted; McLean-Pontiff show returns shrink by more than half after publication. For an app builder the combined reading is: published signals are mostly real in-sample, smaller out-of-sample, smaller again in tradable stocks.
- Version discipline matters: several headline figures differ between working-paper and published versions (Gu-Kelly-Xiu Sharpe 2.0+ vs 1.35; Hou-Xue-Zhang 64%/85% vs 65%/82%; McLean-Pontiff 35%/56%/58%). Cite published versions.

### Gaps
- Could not verify primary-source details for Harvey, Liu & Zhu (2016, "...and the Cross-Section of Expected Returns", RFS), such as the count of factors surveyed (unverified recollection: 300+).
- Did not retrieve Lopez de Prado's "Advances in Financial Machine Learning" (2018) or "The 10 Reasons Most Machine Learning Funds Fail" directly; triple-barrier labelling, meta-labelling, fractional differentiation and combinatorial purged CV are unverified recollections of that book's contents.
- No AQR, Two Sigma or Man Group practitioner write-ups were retrieved beyond AQR's hosting of Gu-Kelly-Xiu. Unverified recollection: AQR's Israel, Kelly & Moskowitz, "Can Machines 'Learn' Finance?" (2020) argues finance ML is constrained by low signal-to-noise and small data.
- Other likely-relevant papers not checked this session: Kelly, Malamud & Zhou "The Virtue of Complexity in Return Prediction" and its critiques; Chen, Pelger & Zhu "Deep Learning in Asset Pricing"; Jiang, Kelly & Xiu "(Re-)Imag(in)ing Price Trends".

## 4. Main backtesting pitfalls and standard mitigations

### Takeaway
Most impressive stock-prediction results fail for a short list of reasons: information from the future leaks into features, labels or (for LLMs) model weights; the best of many trials is reported; the universe omits untradable or dead stocks; and costs are ignored. Standard mitigations are chronological walk-forward evaluation, purged/embargoed cross-validation, multiple-testing-aware statistics (deflated Sharpe, PBO, t > 3), realistic costs and liquidity filters, and post-cutoff testing for LLMs.

### Cited Findings
- Overfitting / multiple testing: Bailey et al. propose estimating the probability of backtest overfitting via CSCV and argue standard hold-out is unreliable for investment backtests. — [SSRN 2326253](https://papers.ssrn.com/abstract=2326253)
- Selection bias: the Deflated Sharpe Ratio conditions the significance of a chosen strategy on the number of trials, the variance of trial Sharpes and return non-normality (secondary summary). — [TradingStrategy.ai](https://tradingstrategy.ai/docs/learn/backtesting.html)
- Higher statistical hurdle: applying a t > 3 cutoff (Harvey, Liu & Zhu) instead of 1.96 raises the share of failing anomalies from 64% to 85% in Hou-Xue-Zhang's working paper. — [NBER w23394](https://www.nber.org/papers/w23394.pdf)
- Best-of-N reporting in practice: a headline 57% accuracy was the top of 35 trials whose overall mean was 50.43%. — [arXiv 2512.15738](https://arxiv.org/pdf/2512.15738)
- Label leakage from overlapping samples: purged cross-validation removes training observations whose label windows overlap the test set, and an embargo adds a gap after it, to prevent look-ahead in time-series CV. — [Wikipedia: Purged cross-validation](https://en.wikipedia.org/wiki/Purged_cross-validation)
- Target/feature leakage via timing: a 2026 preprint's 71% accuracy uses the same day's open as an input and predicts open-to-close, not next-day, direction. — [arXiv 2608.26106 via IDEAS](https://ideas.repec.org/p/arx/papers/2608.26106.html)
- Data snooping in rule search: Reality Check (Sullivan-Timmermann-White 1999) and FDR (Bajgrowicz-Scaillet 2012) correct for searching over many rules; under FDR the best rules could not be selected ex ante. — [LSE](https://researchonline.lse.ac.uk/id/eprint/119144); [IDEAS](https://ideas.repec.org:443/a/eee/jfinec/v106y2012i3p473-491.html)
- Transaction costs: technical-rule performance is "completely offset" by low transaction costs (Bajgrowicz-Scaillet); deep-learning signal profits deteriorate with reasonable costs due to high turnover and extreme positions (Avramov et al.); Fischer-Krauss's Sharpe 5.8 is pre-cost. — [IDEAS](https://ideas.repec.org:443/a/eee/jfinec/v106y2012i3p473-491.html); [SSRN 3450322](https://papers.ssrn.com/abstract=3450322); [FAU working paper](https://iwf.rw.fau.de/files/2015/12/11-2017.pdf)
- Universe / tradability bias: ML payoffs fall 62% when microcaps are excluded. — [CUHK](https://cbk.bschool.cuhk.edu.hk/the-limitations-of-using-ai-to-pick-stocks/)
- Regime change and alpha decay: predictor returns are 58% lower post-publication (McLean-Pontiff); LLM news-strategy returns decline as LLM adoption rises (Lopez-Lira & Tang); ML strategies do better in high-sentiment, high-volatility, low-liquidity periods (Avramov et al.). — [McLean & Pontiff PDF](https://Www.Gwern.net/doc/economics/2016-mclean.pdf); [arXiv 2304.07619](https://arxiv.org/abs/2304.07619); [SSRN 3450322](https://papers.ssrn.com/abstract=3450322)
- LLM-specific look-ahead: models memorise prices and outcomes inside their training window, inflating backtests; mitigations are testing only on post-cutoff data, anonymising entities, and the LAP diagnostic. — [arXiv 2309.17322](https://arxiv.org/pdf/2309.17322); [arXiv 2512.23847](https://arxiv.org/html/2512.23847v1); [arXiv 2504.14765](https://arxiv.org/html/2504.14765v2)
- Foundation-model evaluation: credible TSFM studies use rolling-origin protocols and random-walk benchmarks with Diebold-Mariano tests; under these, wins are sparse. — [arXiv 2606.27100](https://arxiv.org/abs/2606.27100)
- Accuracy metric versus trading value can disagree: zero-shot Chronos matched the best traditional methods on forecast accuracy but lagged on trading performance. — [ISD 2025 paper](https://isd2025.fon.bg.ac.rs/wp-content/uploads/ISD_2025_camera_ready_265.pdf)
- Baselines: compare against an always-up model because of drift. — [arXiv 2108.10826](https://arxiv.org/pdf/2108.10826)

### Inferences
- Practical checklist for the developer (synthesis): (a) chronological walk-forward splits only, never shuffled; (b) purge and embargo when labels span multiple days; (c) every feature timestamped as of when it was publicly available, including fundamentals at filing date, not period end, and restated data avoided; (d) universe defined point-in-time including delisted names; (e) keep a log of every model/feature variant tried and deflate results accordingly; (f) report against always-up, random-walk and simple momentum baselines with confidence intervals; (g) apply costs and a liquidity floor; (h) for any LLM component, evaluate strictly after the model's training cutoff; (i) keep a final untouched holdout and then track live, timestamped predictions, which is the only fully leak-proof test.
- A pretrained TSFM or LLM is itself a leakage vector: its pretraining corpus may include the test period, so backtests before the model's cutoff are not out-of-sample even if the developer's own pipeline is clean.
- Free retail data sources commonly lack delisted tickers and point-in-time fundamentals, so survivorship and restatement bias are the default condition for a solo developer rather than an edge case (inference; not sourced this session).

### Gaps
- Survivorship bias and point-in-time fundamentals data: no source quantifying their effect was retrieved; the statements above are standard practice knowledge, not cited findings.
- Could not source combinatorial purged cross-validation mechanics or the exact deflated Sharpe formula from the primary papers.
- An unverified blog claim that the best of 1,000 zero-edge strategies shows a Sharpe near 3.7 by chance was encountered and deliberately not relied on.

## 5. What framing is more honest and useful for a retail app than "will go up/down"?

### Takeaway
The evidence supports presenting relative, probabilistic and risk-oriented information rather than binary direction calls: the documented edge is cross-sectional (ranking many stocks), tiny per stock, horizon-dependent and decaying, while single-stock hit rates are statistically indistinguishable from baselines. This section is mostly inference from sections 1-4; I retrieved no dedicated literature on retail signal presentation or calibration.

### Cited Findings
- The strongest ML evidence is expressed as decile-sorted long-short portfolios, i.e. ranking stocks relative to each other, not as per-stock direction calls. — [NBER w25398](https://www.nber.org/papers/w25398.pdf)
- Volatility and liquidity are among the dominant signals all ML methods agree on, alongside momentum. — [AQR page](https://www.aqr.com/Insights/Research/Journal-Article/Empirical-Asset-Pricing-via-Machine-Learning)
- Researchers evaluating foundation models conclude they are useful practical priors but "not reliable sources of statistically significant alpha". — [arXiv 2606.27100](https://arxiv.org/abs/2606.27100)
- A co-author of the Management Science study states an average investor would struggle to earn alpha from ML signals after costs. — [CUHK](https://cbk.bschool.cuhk.edu.hk/the-limitations-of-using-ai-to-pick-stocks/)
- Aggregate accuracy can hide asymmetry: in one (student-project) CatBoost example, "up" calls were right 62.3% of the time and "down" calls 44.7%, for about 51% overall. Low-quality source, illustrative only. — [GitHub: Stock-Direction-Predictor](https://github.com/RandomCatUser/Stock-Direction-Predictor)
- High-confidence subsets are small: 72.7% accuracy on large predicted moves rested on 154 observations. — [arXiv 2608.26106 via IDEAS](https://ideas.repec.org/p/arx/papers/2608.26106.html)

### Inferences
- Show probabilities, not verdicts: e.g. "54% estimated chance of outperforming the market over the next month (base rate 50%)", with a reliability diagram or Brier score computed on live, timestamped predictions. Honest probabilities will cluster in a narrow band around the base rate, roughly 45-55%; a product showing 80-90% confidence is miscalibrated by construction given the evidence in section 1.
- Prefer relative ranking (percentile or decile within a universe or sector) and predict excess return versus the index rather than raw direction; this removes market drift from the target and matches how the academic evidence is structured.
- Lead with risk signals, where predictability is better supported than for direction: expected volatility range, drawdown risk, earnings-date proximity, liquidity. Unverified recollection: volatility is far more forecastable than returns (GARCH/realised-volatility literature); not sourced this session.
- Publish a transparent, immutable track record: every signal timestamped before the outcome, hit rate with confidence intervals, comparison to always-up and buy-and-hold baselines, and explicit statement of sample size. This is both the honest framing and the only leakage-proof evaluation.
- Expose "no signal" as the default state; abstain when the model is near the base rate, and state sample sizes when showing high-confidence subsets.
- State horizon explicitly and avoid daily calls: daily direction has the weakest evidence and highest implied turnover/cost for a user who acts on it.
- Regulatory framing is outside this scope, but binary "buy/sell"-style signals to retail users raise investment-advice questions the developer should check separately.

### Gaps
- No peer-reviewed or regulatory sources on how retail investors interpret probabilistic versus binary signals, or on calibration of financial forecasts, were retrieved in this session. Everything in Inferences here is the researcher's synthesis.
- No evidence gathered on the track records of existing retail "AI stock signal" apps or vendors; I found no reliable sources on their audited out-of-sample accuracy.
- Did not research the literature showing volatility is more predictable than returns; flagged above as unverified.
