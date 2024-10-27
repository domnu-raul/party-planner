from fastapi import Request, HTTPException
from src.database import get_db, crud, schemas
from datetime import datetime, timedelta
from passlib.context import CryptContext
from uuid import uuid4


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

TOKEN_EXPIRATION_DAYS = 2


def get_password_hash(password):
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


async def authenticate_user(user: schemas.UserLogin):
    db_user = await crud.get_user(user.username_or_email)

    if not user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect password")

    session = schemas.UserSession(
        access_token=str(uuid4()),
        expires_at=datetime.now() + timedelta(days=TOKEN_EXPIRATION_DAYS),
        user_id=str(db_user["_id"]),
    )

    await crud.create_session(session)

    return session


async def register_user(user: schemas.UserCreate):
    existing_user = await crud.get_user(user.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    user.password = get_password_hash(user.password)

    result = await crud.register_user(user)
    return result


async def get_current_user_id(request: Request):
    access_token = request.cookies.get("access_token")
    db = get_db()

    if access_token:
        session = await db["sessions"].find_one({"access_token": access_token})
        if session and session["expires_at"] > datetime.now():
            return session["user_id"]
        else:
            raise HTTPException(
                status_code=401, detail="Session expired or invalid")
    else:
        raise HTTPException(status_code=401, detail="Not authenticated")
