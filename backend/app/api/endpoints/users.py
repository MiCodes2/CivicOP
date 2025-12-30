from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ...db.session import get_db
from ...models import User, Ward
from ...schemas.user import UserCreate, UserResponse, WardCreate, WardResponse
from ...core.security import get_password_hash, verify_password, create_access_token
from ...dependencies import get_current_user

router = APIRouter()

# Authentication endpoints
@router.post("/auth/login")
async def login(email: str, password: str, db: Session = Depends(get_db)):
    """Placeholder: User login"""
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/auth/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """Placeholder: User registration"""
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# User management
@router.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """Placeholder: Get current user"""
    return current_user

@router.get("/users/", response_model=list[UserResponse])
async def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Placeholder: List users"""
    users = db.query(User).offset(skip).limit(limit).all()
    return users

# Ward management
@router.post("/wards/", response_model=WardResponse)
async def create_ward(ward: WardCreate, db: Session = Depends(get_db)):
    """Placeholder: Create ward"""
    db_ward = Ward(**ward.dict())
    db.add(db_ward)
    db.commit()
    db.refresh(db_ward)
    return db_ward

@router.get("/wards/", response_model=list[WardResponse])
async def read_wards(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Placeholder: List wards"""
    wards = db.query(Ward).offset(skip).limit(limit).all()
    return wards