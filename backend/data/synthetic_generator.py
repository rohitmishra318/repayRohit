import pandas as pd
import numpy as np
from faker import Faker
import uuid
import random
from typing import Tuple, List, Dict, Any
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.impute import SimpleImputer
from sklearn.metrics import roc_auc_score, confusion_matrix
from scipy.special import expit
import warnings

warnings.filterwarnings('ignore')

# Configuration and Seeding
CONFIG: Dict[str, Any] = {
    "seed": 42,
    "num_students": 2000,
    "num_institutes": 50,
    
    # Feature weights
    "weight_cgpa": 0.4,
    "weight_internship": 0.3,
    "weight_ppo": 0.4,
    "weight_interview": 1.5,
    "weight_network": 1.0,
    "weight_interaction": 1.2,
    
    # Noise and anomalies
    "anomaly_sigma": 1.5,
    "anomaly_multiplier": 0.2,
    
    # Label tracking noise (chosen to simulate realistic reporting errors: 2-10% range)
    "noise_clerical_rate": 0.02,
    "noise_fn_tier3_rate": 0.10,
    "noise_fp_rate": 0.03,
    
    # Missingness logic
    "missing_cgpa_t3_rate": 0.10,
    "missing_cgpa_t1_rate": 0.02
}

COURSE_MAPPINGS: Dict[str, str] = {
    "Engineering": "campus",
    "MBA": "campus",
    "CA": "campus",
    "Nursing": "regulatory",
    "Law": "regulatory",
    "Architecture": "regulatory",
    "Arts": "market",
    "Humanities": "market"
}

CITY_TIERS: List[int] = [1, 2, 3]
NAMESPACE = uuid.UUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')

def set_seeds(seed: int) -> Faker:
    """Sets global seeds across numpy, random, and faker for absolute reproducibility."""
    np.random.seed(seed)
    random.seed(seed)
    Faker.seed(seed)
    return Faker('en_IN')

def generate_institutes(num_institutes: int, fake: Faker) -> pd.DataFrame:
    """Generates the base institutes with assigned tiers and trust scores."""
    institutes = []
    for i in range(num_institutes):
        inst_id = str(uuid.uuid5(NAMESPACE, f"inst_{i}_{CONFIG['seed']}"))
        institutes.append({
            "institute_id": inst_id,
            "name": fake.company() + " Institute",
            "tier": np.random.choice(["1", "2", "3"], p=[0.1, 0.3, 0.6]),
            "data_trust_score": round(np.random.uniform(0.3, 0.95), 2)
        })
    return pd.DataFrame(institutes)

def build_student_features(num_students: int, df_institutes: pd.DataFrame, fake: Faker) -> Tuple[pd.DataFrame, List[Dict[str, float]]]:
    """Generates visible student features and latent causal variables."""
    inst_tier_map = dict(zip(df_institutes.institute_id, df_institutes.tier))
    institutes_list = df_institutes.to_dict('records')
    
    # Stochastic macro drift using a random walk
    trend_walk = np.cumsum(np.random.normal(0, 0.3, size=4))
    year_drift = dict(zip([2021, 2022, 2023, 2024], trend_walk))
    
    students = []
    hidden_factors = []
    
    for i in range(num_students):
        student_id = str(uuid.uuid5(NAMESPACE, f"student_{i}_{CONFIG['seed']}"))
        inst = random.choice(institutes_list)
        inst_id = inst["institute_id"]
        inst_tier = inst["tier"]
        data_trust = inst["data_trust_score"]
        
        course_type = random.choice(list(COURSE_MAPPINGS.keys()))
        course_family = COURSE_MAPPINGS[course_type]
        
        grad_year = np.random.choice([2021, 2022, 2023, 2024])
        grad_month = random.randint(1, 12)
        target_field = fake.job()
        
        # Multimodal distributions for academic performance
        cgpa_shift = 0.4 if inst_tier == "1" else -0.2 if inst_tier == "3" else 0.0
        if random.random() < 0.3:
            cgpa = np.random.uniform(5.0, 9.5)
        else:
            cgpa = np.random.normal(7.5 + cgpa_shift, 1.2)
        cgpa = min(max(cgpa, 4.0), 10.0)
        
        base_intern_prob = 0.5 if inst_tier == "1" else 0.3
        if cgpa > 8.0: 
            base_intern_prob += 0.2
        
        has_internship = random.random() < base_intern_prob
        internship_count = np.random.poisson(1.5) if has_internship else 0
        
        # Feature contradiction: High CGPA but zero internships
        contradiction = False
        if random.random() < 0.05 and cgpa > 8.5:
            internship_count = 0  
            contradiction = True
            
        if random.random() < 0.1:
            internship_count = np.random.poisson(2.5) 
            
        internship_tier = "none"
        if internship_count > 0:
            tier_prob = [0.6, 0.4] if inst_tier == "1" else [0.2, 0.8]
            internship_tier = np.random.choice(["recognized", "unverified"], p=tier_prob)
            
        ppo_prob = 0.3 if (internship_tier == "recognized" and cgpa > 7.5) else 0.02
        ppo_prob += np.random.normal(0, 0.05) 
        ppo_exists = random.random() < ppo_prob
        
        cert_count = np.random.poisson(1.0 + (0.5 if cgpa > 8.0 else 0))
        
        # Latent variables: Weak correlation to visible traits, dominated by noise
        interview_skill = expit(np.random.normal(0, 1.5) + 0.2 * (cgpa / 10) + np.random.normal(0, 0.5))
        
        network_shift = 1.0 if inst_tier == "1" else 0.0
        network_strength = expit(np.random.normal(0, 1.5) + 0.3 * network_shift + np.random.normal(0, 0.5))
        
        base_market = np.random.normal(0.0, 1.0) + year_drift[grad_year]
        student_market_luck = expit(base_market + np.random.normal(0, 1.0))

        students.append({
            "student_id": student_id,
            "institute_id": inst_id,
            "course_type": course_type,
            "course_family": course_family,
            "cgpa": round(cgpa, 2),
            "internship_count": internship_count,
            "internship_employer_tier": internship_tier,
            "ppo_exists": ppo_exists,
            "cert_count": cert_count,
            "graduation_month": grad_month,
            "graduation_year": grad_year,
            "target_field": target_field,
            "target_city_tier": random.choice(CITY_TIERS),
            "loan_emi_monthly": round(np.random.uniform(5000, 25000), 2),
            "data_trust_score": data_trust,
            "has_profile_contradiction": contradiction
        })
        
        hidden_factors.append({
            "interview_skill": interview_skill,
            "network_strength": network_strength,
            "student_market_luck": student_market_luck,
            "inst_tier": inst_tier
        })
        
    return pd.DataFrame(students), hidden_factors

def inject_data_scars(df_students: pd.DataFrame) -> pd.DataFrame:
    """Injects operational data scars tied to operational trust scores, plus realistic messy features."""
    df = df_students.copy()
    
    # Errors driven by trust scores with chaotic variation
    prob_error = np.clip((1.0 - df["data_trust_score"]) * np.random.uniform(0.1, 0.3, len(df)), 0.01, 0.2)
    
    mask_lower = np.random.rand(len(df)) < prob_error
    df.loc[mask_lower, "target_field"] = df.loc[mask_lower, "target_field"].str.lower()
    
    mask_typo = np.random.rand(len(df)) < prob_error
    df.loc[mask_typo, "course_type"] = df.loc[mask_typo, "course_type"].astype(str) + " " 
    
    df["is_scarred"] = False
    df.loc[mask_lower | mask_typo, "is_scarred"] = True
    
    # Feature Engineering Scars: Historical academic proxies with non-linear, independent noise
    df["10th_board_score"] = (
        np.random.normal(70, 10, len(df)) +
        5 * (df["cgpa"] - 7.5) +
        np.random.normal(0, 5, len(df))
    ).clip(40, 100).round(1)

    df["12th_board_score"] = (
        df["10th_board_score"] +
        np.random.normal(0, 10, len(df)) +
        np.random.uniform(-5, 5, len(df))
    ).clip(40, 100).round(1)
    
    df = df.drop(columns=["data_trust_score"])
    return df

def generate_targets(df_students: pd.DataFrame, hidden_factors: List[Dict[str, float]]) -> pd.DataFrame:
    """Calculates final probabilities, emergent anomalies, and applies asymmetric noise."""
    outcomes = []
    
    for idx, row in df_students.iterrows():
        hf = hidden_factors[idx]
        
        score = (
            (row["cgpa"] - 7.5) * CONFIG["weight_cgpa"] + 
            (row["internship_count"] - 1.0) * CONFIG["weight_internship"] +
            (CONFIG["weight_ppo"] if row["ppo_exists"] else -0.1) +
            (hf["interview_skill"] - 0.5) * CONFIG["weight_interview"] +
            (hf["network_strength"] - 0.5) * CONFIG["weight_network"] +
            ((row["cgpa"] - 7.5) * (hf["student_market_luck"] - 0.5)) * CONFIG["weight_interaction"]
        )
        
        anomaly_factor = np.random.lognormal(mean=0, sigma=CONFIG["anomaly_sigma"])
        score += np.random.normal(0, 1) * anomaly_factor * CONFIG["anomaly_multiplier"]
            
        skewed_noise = np.random.normal(0, 0.8) - np.random.exponential(0.2)
        prob = expit(score + skewed_noise)
        
        event_observed = random.random() < prob
        
        if event_observed:
            base_months = int(np.random.gamma(shape=2.0, scale=3.0))
            months_to_event = int(base_months * (1.5 - prob)) 
            months_to_event = max(1, min(months_to_event, 12))
        else:
            months_to_event = random.randint(4, 12)
            
        actual_salary = None
        placement_city_tier = None
        employer_type = None
        
        if event_observed:
            base_salary = 400000 
            if hf["inst_tier"] == "1": base_salary += np.random.uniform(50000, 150000)
            
            salary_multiplier = max(0.6, 0.8 + (hf["interview_skill"] * 0.3) + (hf["student_market_luck"] * 0.3))
            
            if anomaly_factor > 5.0 and score > 0:
                salary_multiplier *= min(1.0 + (anomaly_factor * 0.1), 3.0)
                
            actual_salary = base_salary * salary_multiplier
            
            # Soft cap via tanh to preserve tail shape without hard truncation
            soft_limit = base_salary * 4.0
            actual_salary = soft_limit * np.tanh(actual_salary / soft_limit)
            actual_salary = round(actual_salary, 2)
            
            placement_city_tier = np.random.choice([1, 2, 3], p=[0.6, 0.3, 0.1])
            
            if hf["inst_tier"] == "1" and actual_salary > 800000:
                employer_type = np.random.choice(["MNC", "High-Growth Startup"], p=[0.7, 0.3])
            elif actual_salary > 500000:
                employer_type = np.random.choice(["MNC", "Mid-size", "Startup"], p=[0.4, 0.4, 0.2])
            else:
                employer_type = np.random.choice(["Startup", "Mid-size", "Local/SME"], p=[0.5, 0.3, 0.2])
            
        outcome_id = str(uuid.uuid5(NAMESPACE, f"outcome_{idx}_{CONFIG['seed']}"))
        
        outcomes.append({
            "id": outcome_id, 
            "student_id": row["student_id"],
            "true_event_observed": event_observed,
            "months_to_event": months_to_event,
            "actual_salary": actual_salary,
            "placement_city_tier": placement_city_tier,
            "employer_type": employer_type
        })
        
    return pd.DataFrame(outcomes)

def apply_label_noise(df_outcomes: pd.DataFrame, df_students: pd.DataFrame, inst_tier_map: dict) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Applies tracked multi-directional label noise and MAR missingness."""
    df_out = df_outcomes.copy()
    df_stu = df_students.copy()
    
    df_out["event_observed"] = df_out["true_event_observed"]
    df_out["is_noisy_label"] = False
    df_out["noise_type"] = "none"
    
    clerical_flip = np.random.rand(len(df_out)) < CONFIG["noise_clerical_rate"]
    df_out.loc[clerical_flip, "event_observed"] = ~df_out.loc[clerical_flip, "event_observed"]
    df_out.loc[clerical_flip, "is_noisy_label"] = True
    df_out.loc[clerical_flip, "noise_type"] = "clerical"
    
    mask_tier3 = df_stu["institute_id"].map(inst_tier_map) == "3"
    fn_mask = mask_tier3 & df_out["true_event_observed"] & (np.random.rand(len(df_out)) < CONFIG["noise_fn_tier3_rate"])
    df_out.loc[fn_mask, "event_observed"] = False
    df_out.loc[fn_mask, "is_noisy_label"] = True
    df_out.loc[fn_mask, "noise_type"] = "false_negative_tier3"
    
    fp_mask = (~df_out["true_event_observed"]) & (np.random.rand(len(df_out)) < CONFIG["noise_fp_rate"])
    df_out.loc[fp_mask, "event_observed"] = True
    df_out.loc[fp_mask, "is_noisy_label"] = True
    df_out.loc[fp_mask, "noise_type"] = "false_positive"

    df_out["placement_status"] = df_out["event_observed"].map({True: "placed", False: "searching"})
    df_out.loc[~df_out["event_observed"], "actual_salary"] = np.nan
    df_out.loc[~df_out["event_observed"], "placement_city_tier"] = np.nan
    df_out.loc[~df_out["event_observed"], "employer_type"] = np.nan

    mask_missing_cgpa_t3 = mask_tier3 & (np.random.rand(len(df_stu)) < CONFIG["missing_cgpa_t3_rate"])
    mask_missing_cgpa_t1 = (df_stu["institute_id"].map(inst_tier_map) == "1") & (np.random.rand(len(df_stu)) < CONFIG["missing_cgpa_t1_rate"])
    df_stu.loc[mask_missing_cgpa_t3 | mask_missing_cgpa_t1, "cgpa"] = np.nan

    return df_out, df_stu

def generate_pipeline() -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Orchestrates the data generation pipeline."""
    fake = set_seeds(CONFIG["seed"])
    
    df_institutes = generate_institutes(CONFIG["num_institutes"], fake)
    
    df_students, hidden_factors = build_student_features(CONFIG["num_students"], df_institutes, fake)
    df_students = inject_data_scars(df_students)
    
    df_outcomes = generate_targets(df_students, hidden_factors)
    
    inst_tier_map = dict(zip(df_institutes.institute_id, df_institutes.tier))
    df_outcomes, df_students = apply_label_noise(df_outcomes, df_students, inst_tier_map)
    
    # NOTE: hidden_factors are strictly a generative construct.
    # They are NEVER merged into df_students or exposed to the model pipeline.
    # This explicit firewall prevents any latent variable leakage into training.
    assert not any(col in df_students.columns for col in ["interview_skill", "network_strength"])
    
    df_institutes.to_csv("synthetic_institutes.csv", index=False)
    df_students.to_csv("synthetic_students.csv", index=False)
    df_outcomes.to_csv("synthetic_outcomes.csv", index=False)
    
    return df_institutes, df_students, df_outcomes

def validate_baseline(df_students: pd.DataFrame, df_outcomes: pd.DataFrame):
    """Trains a baseline model to check accuracy, AUC, and feature importances."""
    print("\n--- BASELINE MODEL VALIDATION ---")
    
    df = pd.merge(df_students, df_outcomes, on="student_id")
    
    features = ["cgpa", "internship_count", "cert_count", "course_family", "ppo_exists", "graduation_year", "10th_board_score", "12th_board_score"]
    X = df[features].copy()
    y = df["event_observed"].astype(int)
    
    for col in X.select_dtypes(include=['object']).columns:
        X[col] = X[col].astype(str)
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col])
        
    X["ppo_exists"] = X["ppo_exists"].astype(int)
    
    imputer = SimpleImputer(strategy="median")
    X_imputed = pd.DataFrame(imputer.fit_transform(X), columns=X.columns)
    
    X_train, X_test, y_train, y_test = train_test_split(X_imputed, y, test_size=0.2, random_state=CONFIG["seed"])
    
    model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=CONFIG["seed"])
    model.fit(X_train, y_train)
    
    acc = model.score(X_test, y_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    
    try:
        auc = roc_auc_score(y_test, y_pred_proba)
    except ValueError:
        auc = 0.5 
        
    print(f"Baseline Accuracy: {acc:.2%} | AUC: {auc:.3f}")
    
    if acc > 0.85:
        print("WARNING: Accuracy >85%. Still too easy/predictable. Check for hidden leakage.")
    elif acc < 0.60:
        print("WARNING: Accuracy <60%. Model is basically guessing. Signal is too weak.")
    else:
        print("SUCCESS: Accuracy is in the Elite Sweet Spot (60% - 85%).")
        
    print(f"\nConfusion Matrix:\n{confusion_matrix(y_test, model.predict(X_test))}")
        
    print("\nFeature Importances:")
    importances = sorted(zip(X.columns, model.feature_importances_), key=lambda x: x[1], reverse=True)
    for feat, imp in importances:
        print(f"  - {feat}: {imp:.4f}")

if __name__ == "__main__":
    df_institutes, df_students, df_outcomes = generate_pipeline()
    print("Successfully generated Fully Parameterized, Production-Grade ELITE dataset.")
    validate_baseline(df_students, df_outcomes)
