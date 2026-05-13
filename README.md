# RepaySignal MVP

**RepaySignal** is an AI-powered education loan repayment risk scoring engine. It functions as an early warning and intelligent intervention system for lenders and educational institutions — predicting the likelihood of on-time loan repayment before placement occurs, not after default.

Unlike traditional credit scoring systems that rely on historical financial behaviour (which recent graduates inherently lack), RepaySignal analyses **employability signals, institutional quality, live job market demand, and academic engagement** to construct a forward-looking risk profile for every student borrower.

---

## Table of Contents

- [Why RepaySignal](#why-repaysignal)
- [Architecture Overview](#architecture-overview)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [ML Pipeline](#ml-pipeline)
- [Explainable AI (XAI)](#explainable-ai-xai)
- [Data Ethics & Privacy](#data-ethics--privacy)

---

## Why RepaySignal

Education loan defaults typically follow a predictable early-warning pattern: the student struggles to find employment in their field, EMI payments begin slipping within 3–6 months of graduation, and by the time the lender acts, the borrower is already in financial distress.

RepaySignal intervenes at the **moment of loan disbursement**, continuously scoring and monitoring each student's employability trajectory so that relationship managers can act weeks before a payment is missed.

---

## Architecture Overview

RepaySignal is built on a **7-layer ML pipeline** that transforms raw student + institutional + market data into actionable repayment risk intelligence:

1. **Synthetic Data Engine** (`backend/data/`) — Generates 2,000 realistic student profiles with stochastic latent variables, Missing At Random (MAR) noise, multi-directional label errors, and operational text scars that simulate a real, messy production dataset.

2. **Feature Engineering Pipeline** (`backend/ml/features.py`) — Converts raw fields into cohort-relative signals: CGPA percentile within graduation cohort, internship access score normalised by institute tier, repayment stress index derived from cost-of-living-adjusted salary projections, and live field-demand percentiles from an 18-month macro trend time series.

3. **Graduated Gradient Boosting (XGBoost)** (`backend/ml/gbm_model.py`) — Binary risk classifier and salary regressor, both trained with **data trust weighting** that down-samples noisy records from low-trust institutes, preventing label noise propagation.

4. **Conformal Prediction via MAPIE** (`backend/ml/uncertainty.py`) — Wraps the XGBoost models in calibrated conformal predictors, producing honest 80% confidence intervals for every risk score and salary estimate rather than point predictions.

5. **Survival Analysis (Cox PH)** (`backend/ml/survival_model.py`) — Three Cox Proportional Hazards models trained per course family (`campus`, `market`, `regulatory`) that output time-to-placement survival curves: P(placed by 3 months), P(placed by 6 months), P(placed by 12 months).

6. **LearnedEnsemble Meta-Learner** (`backend/ml/ensemble.py`) — A temporal meta-learner (TimeSeriesSplit cross-validation) that dynamically weights survival model output, cohort risk scores, and demand-side signals to produce the final ensemble risk score.

7. **Explainable AI + LLM Narrative Layer** (`backend/services/llm_service.py`) — SHAP TreeExplainer values are surfaced and composed into a full human-readable risk card via Gemini 2.5 Flash (when an API key is provided) or a high-fidelity deterministic fallback. Each card includes an executive summary, ranked causal drivers, deductive reasoning steps, uncertainty assessment, and prioritised intervention recommendations.

---

## Key Features

| Feature | Description |
|---|---|
| **Early Warning Triggers** | Configurable rule-based triggers (T001–T007) auto-fire when students breach thresholds (e.g. 90 days unplaced, no internship + no PPO). Alerts are created and tracked through a state machine: `monitoring → triggered → actioned → resolved`. |
| **Bias Detection** | `bias_detector.py` checks each scored student for institute-tier bias (low CGPA from tier-1 → structural advantage) and flags profiles that may be systematically over- or under-scored. |
| **Cohort-Relative Scoring** | CGPA is never used as an absolute number. It is converted to a within-cohort percentile (same institute, same course, same graduation year) before being passed to the model. |
| **Conformal Confidence Intervals** | Every risk score ships with a calibrated `ci_lower` / `ci_upper`. Wide intervals trigger `needs_human_review = True`, routing the case to a relationship manager. |
| **Intervention Ranker** | `intervention_ranker.py` returns a ranked list of actionable interventions for each student, personalised by course family and risk driver. |
| **Data Trust Propagation** | Every institute carries a `data_trust_score`. This score is used as a sample weight during model training and attenuates noisy feature contributions during inference. |
| **Drift Monitor** | `drift_monitor.py` computes population stability indices to detect feature distribution drift between training cohorts and incoming inference data. |
| **Survival Probability** | Returns P(placement by 3, 6, 12 months) using family-stratified Cox PH models, with a rule-based fallback for regulatory professions (medicine, law, CA, nursing) that are gated by board exams. |

---

## Project Structure

```
repaysignal/
├── backend/
│   ├── data/
│   │   ├── synthetic_generator.py   # 2,000-student dataset generator
│   │   ├── seed_db.py               # Populates SQLite from CSVs
│   │   └── demand_index_mock.py     # 18-month job market time series
│   ├── ml/
│   │   ├── features.py              # Feature engineering pipeline
│   │   ├── gbm_model.py             # XGBoost risk + salary models
│   │   ├── survival_model.py        # Cox PH placement probability
│   │   ├── ensemble.py              # Meta-learner (temporal validation)
│   │   ├── uncertainty.py           # MAPIE conformal prediction
│   │   ├── shap_explainer.py        # SHAP TreeExplainer builder
│   │   ├── bias_detector.py         # Per-student fairness checks
│   │   ├── intervention_ranker.py   # Personalised intervention ranking
│   │   ├── drift_monitor.py         # Population stability index
│   │   └── course_router.py         # Placement season logic by course
│   ├── models/
│   │   └── schema.py                # SQLAlchemy ORM (SQLite)
│   ├── routers/
│   │   ├── students.py              # GET /students, GET /students/{id}
│   │   ├── risk.py                  # GET /risk/{id}, POST /risk/card
│   │   ├── alerts.py                # GET /alerts
│   │   ├── interventions.py         # GET /interventions/{id}
│   │   └── portfolio.py             # GET /portfolio, POST /stress-test
│   ├── services/
│   │   ├── risk_service.py          # Core scoring engine
│   │   ├── llm_service.py           # XAI risk card generator
│   │   └── portfolio_service.py     # Portfolio aggregation
│   ├── config.py
│   ├── database.py
│   └── main.py
├── scripts/
│   ├── setup_db.py                  # Creates all DB tables
│   ├── train_models.py              # Full 9-step training pipeline
│   ├── run_demo_seed.py             # Seeds 20 demo students with pre-fired alerts
│   ├── generate_xai_report.py       # Generates full XAI markdown report
│   └── test_backend.py              # End-to-end integration tests
├── frontend/                        # React frontend (Phase 5)
├── requirements.txt
└── .env.example
```

---

## Prerequisites

- **Python 3.11+**
- **Node.js 18+** (for frontend only)
- A POSIX shell or PowerShell (Windows fully supported)

> **Database**: SQLite is used by default — no database server installation is required. The database file (`repaysignal.db`) is auto-created by the setup script.

---

## Setup & Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd repaysignal
```

### 2. Create and activate a virtual environment

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and set at minimum:

```
DATABASE_URL=sqlite:///./repaysignal.db
# Optional: GEMINI_API_KEY=<your_key>   # Enables real Gemini 2.5 Flash XAI cards
```

> Without a `GEMINI_API_KEY`, the system uses a high-fidelity deterministic XAI fallback that produces structured, SHAP-grounded risk narratives automatically.

---

## Running the Application

### Step 1 — Initialise the database

```bash
python scripts/setup_db.py
```

This creates all tables in `repaysignal.db` using the SQLAlchemy schema.

### Step 2 — Generate and seed training data

```bash
python backend/data/synthetic_generator.py   # ~10 seconds
python backend/data/seed_db.py               # ~30 seconds
```

This generates 2,000 synthetic student records, 50 institutes, 2,000 placement outcomes, and an 18-month demand index time series.

### Step 3 — Train all models (~3 minutes)

```bash
python scripts/train_models.py
```

This executes the full 9-step training pipeline:
1. Build training DataFrame
2. Stratified train/holdout split
3. Train survival models per course family
4. Train XGBoost risk classifier (trust-weighted)
5. Train XGBoost salary regressor (trust-weighted)
6. Build SHAP TreeExplainer
7. Fit MAPIE conformal prediction wrappers
8. Train LearnedEnsemble meta-learner (temporal cross-validation)
9. Register model version in `model_registry`

All 9 artefacts are saved to `models_cache/`.

### Step 4 — Seed the 20 demo students

```bash
python scripts/run_demo_seed.py
```

This inserts 20 hand-crafted student profiles covering every system scenario (HIGH / MEDIUM / LOW risk, every course family, regulatory profiles, PPO holders, bias-flagged students). Each student is scored, triggers are fired, and a preview XAI card is printed.

### Step 5 — Start the backend API

```bash
uvicorn backend.main:app --reload --port 8000
```

The API is now running at `http://localhost:8000`.
Interactive documentation (Swagger UI) is available at `http://localhost:8000/docs`.

### Step 6 — (Optional) Generate full XAI report

```bash
python scripts/generate_xai_report.py
```

This generates `xai_analysis_report.md` with full Explainable AI risk cards for the 4 primary demo archetypes.

### Step 7 — (Optional) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend opens at `http://localhost:5173`.

### Step 8 — Run integration tests

```bash
python scripts/test_backend.py
```

Runs the full end-to-end test suite against the live database — no running server required.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/students` | List all students with risk tiers. Supports `course_family` and `risk_tier` filters. |
| `GET` | `/students/{id}` | Full profile for a single student. |
| `GET` | `/risk/{id}` | Live risk score: probability, CI bounds, survival curves, SHAP drivers, bias flags. |
| `POST` | `/risk/card` | Generate or retrieve a cached XAI risk card (LLM or deterministic). Body: `{"student_id": "..."}` |
| `GET` | `/alerts` | All active triggered alerts across the portfolio. |
| `GET` | `/interventions/{id}` | Ranked, personalised interventions for a specific student. |
| `GET` | `/portfolio` | Portfolio-level summary: count by risk tier, average EMI, stress distribution. |
| `POST` | `/stress-test` | Simulate a market demand shock and recompute portfolio risk distribution. Body: `{"field": "IT_software", "shock_pct": 20.0}` |

All responses are JSON. Full schema is documented at `/docs`.

---

## ML Pipeline

### Feature Engineering

All model features are **cohort-relative or externally derived** — raw institute-absolute values are never passed to the model.

| Feature | Description |
|---|---|
| `cgpa_percentile` | Student CGPA rank within same institute + course + graduation year cohort |
| `internship_access_score` | Actual internship quality ÷ expected quality given institute tier |
| `ppo_binary` | Pre-placement offer (strongest single positive signal) |
| `cert_count_norm` | Number of certifications, normalised to [0, 1] |
| `season_phase` | Placement season alignment by course type and calendar month |
| `field_demand_percentile` | Live job demand percentile for target field + city tier |
| `mom_demand_delta` | Month-over-month demand change (momentum signal) |
| `adjacent_opportunity` | Highest demand in adjacent sectors (pivot potential) |
| `months_since_graduation` | Time pressure proxy |

### Model Artefacts (`models_cache/`)

| File | Description |
|---|---|
| `xgb_risk.pkl` | XGBoost binary risk classifier |
| `xgb_salary.pkl` | XGBoost salary regressor |
| `mapie_risk.pkl` | Conformal classifier wrapper (80% CI) |
| `mapie_salary.pkl` | Conformal regressor wrapper (80% CI) |
| `shap_explainer.pkl` | SHAP TreeExplainer for risk model |
| `cph_campus.pkl` | Cox PH survival model — campus placements |
| `cph_market.pkl` | Cox PH survival model — market/freelance |
| `cph_regulatory.pkl` | Cox PH survival model — board-exam gated |
| `ensemble_weights.pkl` | Learned weights: S/C/D ensemble |

---

## Explainable AI (XAI)

Every risk score can be accompanied by a full natural-language risk card generated via `POST /risk/card`. The card structure is:

1. **Executive Summary** — Personalised one-paragraph assessment with risk tier and dominant narrative
2. **XAI Analysis** — Top 3 SHAP-ranked causal drivers with magnitude and direction (increases/mitigates risk)
3. **Deductive Reasoning Steps** — 4-step chain: Academic → Experience → Market → Financial synthesis
4. **Uncertainty & Bias Assessment** — Conformal interval interpretation + fairness flag if triggered
5. **Actionable Recommendations** — Course-family-specific intervention priorities for the relationship manager

If `GEMINI_API_KEY` is set in `.env`, cards are generated by **Gemini 2.5 Flash**. Without a key, the deterministic engine uses the same SHAP values to produce an equally structured, high-quality card.

---

## Data Ethics & Privacy

All student data in this system is **entirely synthetic**. No real students, borrowers, or institutions are referenced anywhere.

Data is generated using the [Faker](https://faker.readthedocs.io/) library (India locale) combined with a purpose-built probabilistic engine that simulates realistic non-linear correlations, data quality noise, and operational reporting errors.

The bias detection module (`backend/ml/bias_detector.py`) checks every scored student for systematic institute-tier advantages to ensure the model does not embed structural inequities into its predictions.
