# SYNTHETIC simulation report

> **SYNTHETIC** — respondents drawn from the bank's own DEV PLACEHOLDER parameters. This validates the algorithm, not real-world validity.

- N = 40
- seed = 42
- model = `model-v0-dev` (dev-uncalibrated)
- fixed form = E01, ES01, A01, O01, C01, E02, C02, O02, A02, ES02

## Correlations (estimate vs true θ)

| Method | E | A | C | ES | O | Mean |
|---|---:|---:|---:|---:|---:|---:|
| adaptive | 0.660 | 0.722 | 0.573 | 0.719 | 0.733 | 0.681 |
| fixed-10 | 0.735 | 0.572 | 0.701 | 0.733 | 0.733 | 0.695 |
| naive-2/trait | 0.700 | 0.460 | 0.587 | 0.779 | 0.794 | 0.664 |

**Adaptive − fixed Δr (mean) = -0.0135**

## Bands (slider units) — fixed form

| Metric | Value |
|---|---:|
| Mean credible width | 0.880 |
| Mean retake width | 1.179 |
| Credible coverage (true θ) | 65.5% |
| Retake coverage (simulated retake) | 77.5% |
| Multiplier for ~68% retake coverage | 1.20 (config=1.41) |
| % traits unclear | 47.0% |
| % traits firm | 30.0% |

## Bands — adaptive

| Metric | Value |
|---|---:|
| Mean credible width | 0.902 |
| Mean retake width | 1.205 |
| Credible coverage | 72.0% |
| Retake coverage | 82.5% |
| % unclear | 53.5% |
| % firm | 27.5% |
