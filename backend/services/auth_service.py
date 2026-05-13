from datetime import datetime, timedelta
from typing import Optional
import uuid

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from backend.config import settings
from backend.models.auth import User
from backend.services.validators import validate_email, validate_password

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ── Password helpers ──────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ── JWT helpers ───────────────────────────────────────────────────────────────

def create_token(user_id: str, role: str, student_id: Optional[str] = None) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "role": role,
        "exp": expire,
    }
    if student_id:
        payload["student_id"] = student_id
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ── DB operations ─────────────────────────────────────────────────────────────

def get_user_by_email(email: str, db: Session) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(user_id: str, db: Session) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def register_user(name: str, email: str, password: str, role: str,
                  student_id: Optional[str], db: Session) -> User:
    # Validate inputs
    if not name or len(name.strip()) < 2:
        raise HTTPException(status_code=400, detail="Name must be at least 2 characters")
    
    email = validate_email(email.strip().lower())
    password = validate_password(password)
    
    if get_user_by_email(email, db):
        raise HTTPException(status_code=400, detail="Email already registered")

    if role not in ("admin", "student"):
        raise HTTPException(status_code=400, detail="Role must be 'admin' or 'student'")

    # Students must link a valid student_id
    if role == "student":
        if not student_id:
            raise HTTPException(status_code=400, detail="Students must provide a student_id")
        from backend.models.student import Student
        exists = db.query(Student).filter(Student.student_id == student_id).first()
        if not exists:
            raise HTTPException(status_code=404, detail="student_id not found in system")

    user = User(
        id=uuid.uuid4(),
        name=name.strip(),
        email=email,
        hashed_password=hash_password(password),
        role=role,
        student_id=uuid.UUID(student_id) if student_id else None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def login_user(email: str, password: str, db: Session) -> User:
    user = get_user_by_email(email, db)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")
    return user


def format_user(user: User) -> dict:
    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "student_id": str(user.student_id) if user.student_id else None,
    }