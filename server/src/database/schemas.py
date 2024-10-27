from datetime import date, datetime
from typing import List, Optional, Dict, Tuple
from uuid import UUID
from pydantic import BaseModel, Field, EmailStr


class UserBase(BaseModel):
    username: str = Field(title="The username.",
                          pattern="^\w+$", examples=["john_doe123"])
    email: EmailStr

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    username_or_email: str = Field(title="The username or email.")
    password: str = Field(
        title="The password.",
        max_length=255,
        min_length=8,
    )


class UserCreate(UserBase):
    password: str = Field(
        title="The password.",
        max_length=255,
        min_length=8,
    )


class UserSession(BaseModel):
    access_token: str
    expires_at: datetime
    user_id: str


class EventCreate(BaseModel):
    title: str
    description: str
    date: datetime
    location: str
    fee: int
    wish_list: Dict[str, int] = {}
    services: Dict[str, int] = {}


class Event(EventCreate):
    owner: str
    attendees: List[Tuple[str, str]] = []


class AttendEventRequest(BaseModel):
    service: Optional[str] = None
    wish_list_item: Optional[Tuple[str, int]] = None
    fee_payment: Optional[int] = None
