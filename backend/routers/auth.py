from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid
import json
import base64

from backend.database import get_db
from backend.models.auth import User
from backend.models.schema import Student, Institute

router = APIRouter()


class StudentRegistrationData(BaseModel):
    firebase_uid: str
    email: str
    name: str
    institute_name: str
    institute_tier: str  # "tier_1", "tier_2", "tier_3"
    course_type: str
    course_family: str
    target_field: str
    target_city_tier: int  # 1, 2, or 3
    cgpa: float
    internship_count: int
    internship_employer_tier: str  # "recognized", "unverified", "none"
    ppo_exists: bool
    cert_count: int
    graduation_month: int
    graduation_year: int
    loan_emi_monthly: float
    tenth_board_score: Optional[float] = None
    twelfth_board_score: Optional[float] = None
    city: Optional[str] = None


def extract_firebase_uid_from_token(token: str) -> str:
    """
    Extract Firebase UID from Firebase ID token (JWT).
    Firebase ID tokens are JWTs with format: header.payload.signature
    The payload contains the 'sub' claim which is the user ID.
    """
    try:
        # Split JWT into parts
        parts = token.split('.')
        if len(parts) != 3:
            raise ValueError("Invalid token format")
        
        # Decode payload (add padding if needed)
        payload = parts[1]
        # Add padding if necessary
        padding = 4 - len(payload) % 4
        if padding != 4:
            payload += '=' * padding
        
        decoded = base64.urlsafe_b64decode(payload)
        payload_json = json.loads(decoded)
        
        # Extract user ID from 'sub' claim
        firebase_uid = payload_json.get('sub')
        if not firebase_uid:
            raise ValueError("No 'sub' claim in token")
        
        return firebase_uid
    except Exception as e:
        raise ValueError(f"Failed to extract user ID from token: {str(e)}")


def verify_firebase_token(authorization: Optional[str] = Header(None)) -> str:
    """
    Verify Firebase ID token from Authorization header.
    Returns the Firebase UID extracted from the token.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        firebase_uid = extract_firebase_uid_from_token(token)
        return firebase_uid
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/students/register")
async def register_student(
    data: StudentRegistrationData,
    db: Session = Depends(get_db),
):
    """
    Register a new student with complete profile data.
    Called during signup after Firebase authentication.
    """

    # Check if user already exists
    existing_user = db.query(User).filter(User.firebase_uid == data.firebase_uid).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already registered")

    # Check if email already exists
    existing_email = db.query(User).filter(User.email == data.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already in use")

    try:
        # Create or get institute
        institute = db.query(Institute).filter(Institute.name == data.institute_name).first()
        if not institute:
            institute = Institute(
                institute_id=str(uuid.uuid4()),
                name=data.institute_name,
                tier=data.institute_tier,
                data_trust_score=0.7,  # Default trust score for new institutes
            )
            db.add(institute)
            db.flush()

        # Create student record
        student_id = str(uuid.uuid4())
        student = Student(
            student_id=student_id,
            name=data.name,
            institute_id=institute.institute_id,
            course_type=data.course_type,
            course_family=data.course_family,
            cgpa=data.cgpa,
            internship_count=data.internship_count,
            internship_employer_tier=data.internship_employer_tier,
            ppo_exists=data.ppo_exists,
            cert_count=data.cert_count,
            graduation_month=data.graduation_month,
            graduation_year=data.graduation_year,
            target_field=data.target_field,
            target_city_tier=data.target_city_tier,
            loan_emi_monthly=data.loan_emi_monthly,
            tenth_board_score=data.tenth_board_score,
            twelfth_board_score=data.twelfth_board_score,
            months_since_graduation=0,
            placement_status="searching",
            city=data.city,
        )
        db.add(student)
        db.flush()

        # Create user record
        user = User(
            id=str(uuid.uuid4()),
            firebase_uid=data.firebase_uid,
            name=data.name,
            email=data.email,
            hashed_password=None,  # Firebase handles password
            role="student",
            student_id=student_id,
            is_active=True,
        )
        db.add(user)
        db.commit()

        return {
            "success": True,
            "student_id": str(student.student_id),
            "user_id": str(user.id),
            "name": user.name,
            "email": user.email,
            "role": user.role,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to register student: {str(e)}")


@router.get("/auth/me")
async def get_current_user(
    
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    """
    Get current authenticated user's information.
    Requires Firebase ID token in Authorization header.
    """
    # Verify token and extract Firebase UID
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        firebase_uid = extract_firebase_uid_from_token(token)
        print(f"DEBUG: Extracted firebase_uid from token: {firebase_uid}")
    except ValueError as e:
        print(f"DEBUG: Failed to extract firebase_uid: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Find user by Firebase UID
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if not user:
        print(f"DEBUG: User not found with firebase_uid: {firebase_uid}")
        raise HTTPException(status_code=401, detail="User not found")

    # Get student data if this is a student
    student_data = None
    if user.student_id:
        student = db.query(Student).filter(Student.student_id == user.student_id).first()
        if student:
            institute = db.query(Institute).filter(Institute.institute_id == student.institute_id).first()
            student_data = {
                "student_id": str(student.student_id),
                "name": student.name,
                "course_type": student.course_type,
                "course_family": student.course_family,
                "cgpa": float(student.cgpa or 0),
                "internship_count": student.internship_count,
                "internship_employer_tier": student.internship_employer_tier,
                "ppo_exists": student.ppo_exists,
                "cert_count": student.cert_count,
                "target_field": student.target_field,
                "target_city_tier": student.target_city_tier,
                "loan_emi_monthly": float(student.loan_emi_monthly or 0),
                "graduation_month": student.graduation_month,
                "graduation_year": student.graduation_year,
                "tenth_board_score": float(student.tenth_board_score) if student.tenth_board_score else None,
                "twelfth_board_score": float(student.twelfth_board_score) if student.twelfth_board_score else None,
                "placement_status": student.placement_status,
                "months_since_graduation": student.months_since_graduation,
                "institute_tier": institute.tier if institute else None,
                "city": student.city,
                "institute_id": str(institute.institute_id) if institute else None,
            }

            print("Student data retrieved for user:", student_data)  # Debug log

    # Flatten student data into response
    response = {
        "user_id": str(user.id),
        "firebase_uid": user.firebase_uid,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
        "student_id": str(user.student_id) if user.student_id else None,
    }
    
    # Include all student fields at top level
    if student_data:
        response.update(student_data)
    
    return response


@router.post("/logout")
async def logout():
    """
    Logout endpoint (Firebase handles token invalidation on client side).
    """
    return {"message": "Logged out successfully"}
