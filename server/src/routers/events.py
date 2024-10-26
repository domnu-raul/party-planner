from uuid import uuid4
from fastapi import APIRouter, Request, Depends, HTTPException
from src.database import get_db, schemas
from src.services.auth import get_current_user_id
from bson.objectid import ObjectId
from datetime import datetime

router = APIRouter(prefix="/events", tags=["events"])
db = get_db()


def serialize_event(event):
    """Convert MongoDB document to JSON-compatible dict."""
    event["_id"] = str(event["_id"])  # Convert ObjectId to string
    if "date" in event and isinstance(event["date"], datetime):
        event["date"] = event["date"].isoformat()
    if "created_at" in event and isinstance(event["created_at"], datetime):
        event["created_at"] = event["created_at"].isoformat()
    return event


@router.get("/all/")
async def get_all_events(user_id: str = Depends(get_current_user_id)):
    events = await db["events"].find().to_list(length=100)
    serialized_events = [serialize_event(event) for event in events]
    return serialized_events


@router.post("/")
async def create_event(event: schemas.EventCreate, user_id: str = Depends(get_current_user_id)):
    event_data = event.dict()
    # Convert date to ISO format
    event_data["date"] = event_data["date"].isoformat()
    event_data["owner"] = user_id
    event_data["attendees"] = [user_id]

    try:
        result = await db["events"].insert_one(event_data)
        # Return just the ID as a string
        return {"inserted_id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while inserting the event: {str(e)}"
        )
