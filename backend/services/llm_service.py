"""
LLM Risk Card Generator Service.

Generates highly detailed, production-grade XAI (Explainable AI) risk analyses
. It provides thorough
analysis, deductive reasoning steps, and handles all student/risk fields.

If an API key is provided, it can call an external LLM. Otherwise, it uses a
sophisticated deterministic generation engine that mimics a high-quality LLM response.
"""

import os
import json
from backend.models.schema import Student, RiskScore, Institute

# If you have Anthropic/OpenAI SDKs installed, you can import them here.
# For MVP, we'll use a sophisticated deterministic fallback if keys are missing.

REPAYMENT_STRESS_LABELS = {
    (0.0, 0.35): "LOW",
    (0.35, 0.50): "MODERATE",
    (0.50, 0.70): "HIGH",
    (0.70, 2.0):  "CRITICAL",
}


def get_stress_label(index: float) -> str:
    for (lo, hi), label in REPAYMENT_STRESS_LABELS.items():
        if lo <= index < hi:
            return label
    return "CRITICAL"


def _format_shap_drivers(shap_drivers: list) -> str:
    if not shap_drivers:
        return "No specific drivers identified."
    
    lines = []
    for d in shap_drivers:
        direction = "🔴 Increased Risk" if d["direction"] == "increases_risk" else "🟢 Decreased Risk"
        lines.append(f"- **{d['feature']}**: {direction} (Magnitude: {d['magnitude']:.3f}) - {d['display']}")
    return "\n".join(lines)


def _format_bias_flags(bias_flags: list) -> str:
    if not bias_flags:
        return "No systemic bias detected. The model relies purely on individual employability metrics."
    
    lines = []
    for f in bias_flags:
        lines.append(f"- **Protected Attribute**: {f['attribute'].title()} (DPD: {f['dpd']:.3f})\n  *Warning*: {f['warning']}")
    return "\n".join(lines)


def build_prompt(student: Student, risk_data: dict, institute_name: str = "Unknown Institute") -> str:
    """
    Builds a production-grade, highly detailed prompt to generate the XAI report.
    This prompt passes all raw data, CI bounds, SHAP values, and instructs the LLM on how to reason.
    """
    stress_label = get_stress_label(risk_data.get("repayment_stress_index", 1.0))
    shap_str = _format_shap_drivers(risk_data.get("shap_drivers", []))
    bias_str = _format_bias_flags(risk_data.get("bias_flags", []))
    
    prompt = f"""You are an expert AI Credit Risk Assessor and Educational Loan Analyst.
Please provide a comprehensive Explainable AI (XAI) risk analysis report for the following student profile.

## Raw Data Inputs

### 1. Student Profile
- ID: {student.student_id}
- Course: {student.course_type} ({student.course_family} family)
- Institute: {institute_name}
- Target Field: {student.target_field} (City Tier: {student.target_city_tier})
- Academic Performance: {student.cgpa} CGPA (10th: {student.tenth_board_score}, 12th: {student.twelfth_board_score})
- Internships: {student.internship_count} (Employer Tier: {student.internship_employer_tier})
- PPO Exists: {student.ppo_exists}
- Certifications: {student.cert_count}
- Graduation: {student.graduation_month}/{student.graduation_year} (Months since graduation: {student.months_since_graduation})
- Monthly EMI Expected: ₹{student.loan_emi_monthly}

### 2. Machine Learning Pipeline Outputs
- Overall Risk Score: {risk_data.get('risk_score', 0.5):.3f}
- Conformal Prediction Confidence Interval (80%): [{risk_data.get('ci_lower', 0):.3f}, {risk_data.get('ci_upper', 0):.3f}] (Width: {risk_data.get('ci_width', 0):.3f})
- Human Review Flag: {risk_data.get('needs_human_review', False)}
- Repayment Stress Index: {risk_data.get('repayment_stress_index', 0):.3f} ({stress_label})
- Survival Model Predictions (Placement Probability):
  - 3 months: {risk_data.get('p_3mo', 0):.1%}
  - 6 months: {risk_data.get('p_6mo', 0):.1%}
  - 12 months: {risk_data.get('p_12mo', 0):.1%}
- Predicted Salary Range: ₹{risk_data.get('predicted_salary_lower', 0):.2f}L - ₹{risk_data.get('predicted_salary_upper', 0):.2f}L
- Regulatory Note: {risk_data.get('regulatory_note', 'N/A')}

### 3. SHAP Feature Importance (Explainability)
{shap_str}

### 4. Fairness & Bias Monitor
{bias_str}

## Instructions

Analyze the above data and provide a highly detailed XAI risk report formatted in Markdown. 
Your report must include the following sections exactly:

1. **Executive Summary**: A 2-3 sentence high-level overview of the student's risk profile and immediate outlook.
2. **Explainable AI (XAI) Analysis**: A detailed breakdown of the SHAP drivers. Explain *why* the model assigned this risk score, translating mathematical magnitude into real-world employability impact.
3. **Deductive Reasoning Steps**: Step-by-step logical deduction linking the student's academic background, internship quality, target field demand, and predicted salary to their Repayment Stress Index.
4. **Uncertainty & Bias Assessment**: Analyze the Conformal Prediction CI width. If the CI is wide (>0.30), explain what factors make this profile unpredictable. Address any systemic bias flags and how they affect the raw score.
5. **Actionable Recommendations**: 2-3 specific, data-driven interventions (e.g., adjacent sector pivots, EMI restructuring, mock interviews) to mitigate the identified risks.
"""
    return prompt


def generate_risk_card(student: Student, risk_data: dict, institute_name: str = "Unknown Institute") -> str:
    """
    Main entry point for risk card generation. 
    If an LLM API key is present, calls the actual LLM using `build_prompt`.
    Otherwise, uses the sophisticated deterministic generator that mimics an LLM response.
    """
    
    # Try actual API call if Gemini key exists
    gemini_key = os.environ.get("GEMINI_API_KEY")
    prompt = build_prompt(student, risk_data, institute_name)
    
    if gemini_key:
        try:
            from google import genai
            client = genai.Client(api_key=gemini_key)
            
            prompt_str = f"You are an expert AI Credit Risk Assessor.\n\n{prompt}"
            # Use gemini-2.5-flash for fast, high-quality reasoning
            # Add timeout/retry logic internally or just rely on SDK
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt_str,
            )
            if response.text:
                return response.text
        except Exception as e:
            print(f"Gemini API failed: {e}. Falling back to deterministic generation.")

    # ==========================================
    # DETERMINISTIC HIGH-FIDELITY FALLBACK
    # ==========================================
    
    stress_label = get_stress_label(risk_data.get("repayment_stress_index", 1.0))
    risk_score = risk_data.get("risk_score", 0.5)
    ci_width = risk_data.get("ci_width", 0.0)
    shap_drivers = risk_data.get("shap_drivers", [])
    bias_flags = risk_data.get("bias_flags", [])
    
    # Determine profile archetype
    if student.course_family == "regulatory":
        archetype = "Regulatory"
        summary = f"{student.name} presents a structurally delayed placement timeline typical of {student.course_type} regulatory requirements. The risk is temporal rather than fundamental."
    elif risk_score > 0.6:
        archetype = "High Risk"
        summary = f"{student.name} presents elevated repayment risk (Score: {risk_score:.3f}), primarily driven by limited market traction and high projected EMI stress ({stress_label})."
    elif risk_score < 0.4:
        archetype = "Low Risk"
        summary = f"{student.name} is a highly resilient profile indicating strong market alignment. The candidate demonstrates robust employability signals, projecting minimal repayment friction."
    else:
        archetype = "Moderate Risk"
        summary = f"{student.name} presents moderate, manageable risk. While foundational metrics are stable, specific market or experience gaps introduce placement uncertainty."

    # Build Deductive Reasoning
    reasoning_steps = []
    reasoning_steps.append(f"1. **Academic Baseline**: With a CGPA of {student.cgpa}, the candidate has established {'strong' if (student.cgpa or 0) > 8.0 else 'adequate'} academic credentials. However, grades alone are weak predictors in the current market.")
    
    if student.internship_count > 0:
        reasoning_steps.append(f"2. **Experience Validation**: {student.internship_count} internships at {student.internship_employer_tier} tier employers provide critical signal, validating their skills to prospective employers.")
    else:
        reasoning_steps.append(f"2. **Experience Deficit**: A lack of verified internships severely impacts immediate employability, shifting reliance onto purely academic signals which are heavily discounted by employers.")
        
    reasoning_steps.append(f"3. **Market Mechanics**: The target field ({student.target_field}) in a Tier {student.target_city_tier} city projects a salary of ₹{risk_data.get('predicted_salary_lower', 0):.2f}L - ₹{risk_data.get('predicted_salary_upper', 0):.2f}L.")
    reasoning_steps.append(f"4. **Financial Synthesis**: Against an EMI of ₹{student.loan_emi_monthly}, this projected salary yields a {stress_label} Repayment Stress Index of {risk_data.get('repayment_stress_index', 0):.2f}, forming the crux of the repayment risk calculation.")

    # Build XAI
    xai_str = "The LearnedEnsemble model highlights the following causal pathways:\n\n"
    if shap_drivers:
        for i, d in enumerate(shap_drivers[:3]):
            impact = "amplifies" if d["direction"] == "increases_risk" else "mitigates"
            feature_display = d['feature'].replace('_', ' ').title()
            xai_str += f"- **{feature_display}** {impact} risk significantly (Magnitude: {d['magnitude']:.3f}), as the model identifies this as the #{i+1} driver.\n"
    else:
        xai_str += "- No dominant distinct drivers isolated; risk is distributed across multiple interacting factors.\n"

    # Build Uncertainty & Bias
    uncertainty_str = f"The Conformal Prediction module outputs an 80% Confidence Interval width of {ci_width:.3f}. "
    if ci_width > 0.30:
        uncertainty_str += "**[FLAG: HIGH UNCERTAINTY]** The model exhibits significant uncertainty. This typically occurs for profiles lacking clear historical precedents or containing contradictory signals (e.g., high CGPA but zero internships)."
    else:
        uncertainty_str += "This narrow band indicates high model confidence derived from dense historical data parallels."

    if bias_flags:
        uncertainty_str += "\n\n**[FAIRNESS FLAG]**: Systemic bias detected. " + " ".join([f["warning"] for f in bias_flags])
    else:
        uncertainty_str += "\n\n**Fairness Monitor**: Passed. No systemic bias detected across protected attributes."

    # Build Recommendations
    recommendations = ""
    if archetype == "Regulatory":
        recommendations = "- **Milestone Tracking**: Institute automated check-ins aligned with board exam dates.\n- **Bridge Support**: Offer EMI grace periods tied strictly to verified exam attempts."
    elif archetype == "High Risk":
        if student.internship_count == 0:
            recommendations += "- **Immediate Skill Bridge**: Prioritize mock interviews and short-term internship placements.\n"
        recommendations += "- **Sector Pivot**: Initiate counseling for adjacent sectors to expand the viable job funnel.\n"
        recommendations += "- **Proactive Restructuring**: Flag for potential EMI restructuring if placement is not secured within 3 months."
    else:
        recommendations = "- **Standard Monitoring**: Continue standard automated tracking.\n- **Upsell Opportunity**: Candidate may be eligible for premium financial products post-placement."

    report = f"""## Executive Summary
{summary}

## Explainable AI (XAI) Analysis
{xai_str}

## Deductive Reasoning Steps
{chr(10).join(reasoning_steps)}

## Uncertainty & Bias Assessment
{uncertainty_str}

## Actionable Recommendations
{recommendations}
"""
    return report

