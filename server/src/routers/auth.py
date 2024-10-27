from uuid import uuid4
from fastapi import APIRouter, HTTPException, Request, Response, Depends
from src.database import schemas, get_db, crud
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


@router.post("/logout/")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logout successful"}


@router.get("/me/")
async def get_current_user(request: Request, user_id=Depends(auth.get_current_user_id)):
    user = await crud.get_user_by_id(user_id)
    return {"username": user.get("username", "Unknown user")}
