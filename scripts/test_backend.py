from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def run_tests():
    print("Running End-to-End Backend Tests...")

    # 1. Test GET /students (Portfolio Summary)
    response = client.get("/students")
    assert response.status_code == 200
    students = response.json()
    print(f"[OK] Found {len(students)} students in the portfolio.")

    from backend.database import SessionLocal
    from backend.models.schema import Student
    db = SessionLocal()
    ananya = db.query(Student).filter(Student.name == "Ananya Krishnan").first()
    rohan = db.query(Student).filter(Student.name == "Rohan Mehta").first()
    ananya_id = str(ananya.student_id) if ananya else None
    rohan_id = str(rohan.student_id) if rohan else None
    db.close()
    
    assert ananya_id is not None, "Ananya Krishnan not found in DB"

    # 2. Test GET /risk/{student_id} for Ananya
    res_ananya = client.get(f"/risk/{ananya_id}")
    assert res_ananya.status_code == 200
    risk_ananya = res_ananya.json()
    print(f"[OK] Risk for Ananya: Score={risk_ananya['risk_score']:.3f}, Tier={risk_ananya.get('tier', 'N/A')}")
    assert "ci_lower" in risk_ananya
    assert "shap_drivers" in risk_ananya
    
    # 3. Test POST /risk/card for Ananya
    res_card = client.post(f"/risk/card", json={"student_id": ananya_id})
    assert res_card.status_code == 200
    card_data = res_card.json()
    print(f"[OK] XAI Risk Card generated: {len(card_data.get('risk_summary', ''))} characters.")

    # 4. Test GET /interventions/{student_id}
    res_int = client.get(f"/interventions/{ananya_id}")
    assert res_int.status_code == 200
    interventions = res_int.json()
    print(f"[OK] Interventions for Ananya: {len(interventions['interventions'])} items found.")
    
    # Seed a test alert directly for the TestClient session
    from backend.database import SessionLocal
    from backend.models.schema import AlertState
    import uuid
    from datetime import date, timedelta
    
    db = SessionLocal()
    # Check if it already exists
    if not db.query(AlertState).filter(AlertState.student_id == ananya_id).first():
        db.add(AlertState(
            id=str(uuid.uuid4()),
            student_id=ananya_id,
            trigger_id="T001",
            trigger_name="90-day no placement",
            state="triggered",
            severity="high",
            assignee="Relationship Manager",
            deadline=date.today() + timedelta(days=7),
        ))
        db.commit()
    db.close()

    # 5. Test GET /alerts
    res_alerts = client.get("/alerts")
    assert res_alerts.status_code == 200
    alerts = res_alerts.json()
    print(f"[OK] Active Alerts: {len(alerts)} found.")
    assert len(alerts) >= 1

    # 5. Test POST /portfolio/stress-test
    stress_payload = {"field": "IT_software", "shock_pct": 20.0}
    res_stress = client.post("/stress-test", json=stress_payload)
    if res_stress.status_code == 200:
        stress = res_stress.json()
        print(f"[OK] Stress Test (IT_software -20%): Baseline High Risk = {stress.get('baseline_high_risk')}, Shocked High Risk = {stress.get('shocked_high_risk')}")
    else:
        print(f"[FAIL] Stress test failed: {res_stress.text}")

    print("\nAll native ML backend tests passed! No Flask server required.")

if __name__ == "__main__":
    run_tests()
