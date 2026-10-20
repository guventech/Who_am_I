# SYNTHETIC simulation report

> **SYNTHETIC** — respondents drawn from the bank's own DEV PLACEHOLDER parameters. This validates the algorithm, not real-world validity.

- N = 20
- seed = 42
- model = `model-v0-dev` (dev-uncalibrated)
- fixed form = E01, ES01, A01, O01, C01, E02, C02, O02, A02, ES02

## Correlations (estimate vs true θ)

| Method | E | A | C | ES | O | Mean |
|---|---:|---:|---:|---:|---:|---:|
| adaptive | 0.657 | 0.635 | 0.783 | 0.747 | 0.755 | 0.715 |
| fixed-10 | 0.767 | 0.663 | 0.645 | 0.822 | 0.704 | 0.720 |
| naive-2/trait | 0.863 | 0.491 | 0.463 | 0.862 | 0.692 | 0.674 |

**Adaptive − fixed Δr (mean) = -0.0050**

## Bands (slider units) — fixed form

| Metric | Value |
|---|---:|
| Mean credible width | 0.871 |
| Mean retake width | 1.168 |
| Credible coverage (true θ) | 65.0% |
| Retake coverage (simulated retake) | 73.0% |
| Multiplier for ~68% retake coverage | 1.25 (config=1.41) |
| % traits unclear | 48.0% |
| % traits firm | 32.0% |

## Bands — adaptive

| Metric | Value |
|---|---:|
| Mean credible width | 0.890 |
| Mean retake width | 1.193 |
| Credible coverage | 73.0% |
| Retake coverage | 81.0% |
| % unclear | 50.0% |
| % firm | 30.0% |

## Go deeper (SYNTHETIC)

- N_deeper = 8
- model = `model-v0-dev-deeper` (grid nodes/dim = 7)
- SD target = 0.65
- budget max = 20
- % reaching SD target within budget | 100.0%
- mean deeper items asked | 11.25
- core scores unchanged when deeper skipped | 8/8
