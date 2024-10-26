from uuid import uuid4
from fastapi import APIRouter, HTTPException, Request, Response
from src.database import schemas, get_db
from src.services import auth
from datetime import datetime, timedelta

router = APIRouter(prefix="/auth", tags=["auth"])
db = get_db()


@router.post("/register/")
async def register(user: schemas.UserCreate):
    result = await auth.register_user(user)
    return {"user_id": str(result.inserted_id), "message": "User registered successfully"}


@router.post("/login/")
async def login(user: schemas.UserLogin, response: Response):
    session = await auth.authenticate_user(user)
    response.set_cookie(
        key="access_token",
        value=session.access_token,
        httponly=True,
        secure=False
    )

    return {"message": "Login successful", "session": session.dict()}
