import os
import joblib
import pandas as pd
from lifelines import CoxPHFitter

os.makedirs("models_cache", exist_ok=True)

CAMPUS_FEATURES = [
    "cgpa_percentile", "internship_access_score", "ppo_binary",
    "cert_count_norm", "season_phase", "field_demand_percentile",
    "mom_demand_delta", "graduation_cohort_size"
]

REGULATORY_FEATURES = [
    "cgpa_percentile", "cert_count_norm", "months_since_graduation"
]

MARKET_FEATURES = [
    "cgpa_percentile", "internship_access_score", "cert_count_norm",
    "field_demand_percentile", "adjacent_opportunity", "season_phase"
]

BOARD_EXAM_WAIT = {
    "medicine": {"months": 6},
    "law": {"months": 4},
    "ca": {"months": 5},
    "nursing": {"months": 3},
    "default": {"months": 4}
}

def train_survival_models(df: pd.DataFrame) -> dict:
    models = {}
    feature_mappings = {
        "campus": CAMPUS_FEATURES,
        "regulatory": REGULATORY_FEATURES,
        "market": MARKET_FEATURES
    }
    
    for key, f_list in feature_mappings.items():
        subset = df[df["course_family"] == key].copy() if "course_family" in df.columns else pd.DataFrame()
        
        if len(subset) < 30:
            models[key] = None
            continue
            
        cph = CoxPHFitter(penalizer=0.1)
        
        # Determine valid columns for fit
        cols_to_keep = [c for c in f_list if c in subset.columns] + ["months_to_event", "event_observed"]
        train_df = subset[cols_to_keep].dropna()
        
        # Ensure duration > 0
        if "months_to_event" in train_df.columns:
            train_df["months_to_event"] = train_df["months_to_event"].clip(lower=0.1)
            
        # Drop constant columns which cause convergence issues
        for col in f_list:
            if col in train_df.columns and train_df[col].std() == 0:
                train_df = train_df.drop(columns=[col])
        
        if len(train_df) < 20: # Failsafe
            models[key] = None
            continue
            
        try:
            cph.fit(train_df, duration_col='months_to_event', event_col='event_observed')
            models[key] = cph
            joblib.dump(cph, f"models_cache/cph_{key}.pkl")
        except Exception as e:
            print(f"  Warning: CPH fit failed for {key}: {e}")
            models[key] = None
        
    return models

def predict_regulatory(course_type: str, months_since_graduation: int, board_status: str = "unknown") -> dict:
    if board_status == "unknown":
        board_status = "awaiting" if months_since_graduation < 3 else "passed"
        
    if board_status in ["pre_exam", "awaiting"]:
        delay = BOARD_EXAM_WAIT.get(course_type.lower(), BOARD_EXAM_WAIT["default"])["months"]
        p_3mo = 0.05 if delay > 3 else 0.25
        p_6mo = 0.55 if delay <= 4 else 0.30
        p_12mo = 0.85
    elif board_status == "passed":
        p_3mo, p_6mo, p_12mo = 0.55, 0.80, 0.92
    else:  # failed
        p_3mo, p_6mo, p_12mo = 0.02, 0.15, 0.55
        
    return {
        "prob_3mo": p_3mo,
        "prob_6mo": p_6mo,
        "prob_12mo": p_12mo
    }

def predict_placement_probs(student_features: dict, models: dict) -> dict:
    family = student_features.get("course_family", "unknown").lower()
    
    if family == "regulatory":
        probs = predict_regulatory(
            course_type=student_features.get("course_type", "default"),
            months_since_graduation=student_features.get("months_since_graduation", 0),
            board_status=student_features.get("board_status", "unknown")
        )
        return {
            "p_3mo": round(probs["prob_3mo"], 3),
            "p_6mo": round(probs["prob_6mo"], 3),
            "p_12mo": round(probs["prob_12mo"], 3),
            "regulatory_note": "Rule-based prediction based on board exam status."
        }
    
    model = models.get(family)
    if model is None:
        # Fallback if model not trained
        return {"p_3mo": 0.2, "p_6mo": 0.5, "p_12mo": 0.8, "regulatory_note": None}
        
    # Build dataframe for pure CPH prediction
    f_list = CAMPUS_FEATURES if family == "campus" else MARKET_FEATURES
    df_infer = pd.DataFrame([{f: student_features.get(f, 0) for f in f_list}])
    
    surv_funcs = model.predict_survival_function(df_infer)
    surv = surv_funcs.iloc[:, 0]
    
    def get_prob(months: int) -> float:
        # Survival prob = 1 - observation of event(placement). Placement prob = 1 - S(t)
        # Find closest time <= months
        valid_times = [t for t in surv.index if t <= months]
        if not valid_times:
            return 0.0
        return 1.0 - surv.loc[max(valid_times)]

    return {
        "p_3mo": round(get_prob(3), 3),
        "p_6mo": round(get_prob(6), 3),
        "p_12mo": round(get_prob(12), 3),
        "regulatory_note": None
    }
