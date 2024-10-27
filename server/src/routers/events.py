from fastapi import APIRouter, Depends, HTTPException
from src.database import crud, get_db, schemas
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
    user = await crud.get_user_by_id(user_id)
    event_data["date"] = event_data["date"].isoformat()
    event_data["owner"] = user_id
    event_data["attendees"] = [user["username"]]

    try:
        result = await db["events"].insert_one(event_data)
        return {"inserted_id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while inserting the event: {str(e)}"
        )


@router.post("/attend/{event_id}")
async def attend_event(event_id: str, attend_data: schemas.AttendEventRequest, user_id: str = Depends(get_current_user_id)):
    event = await db["events"].find_one({"_id": ObjectId(event_id)})
    if not event:
        raise HTTPException(status_code=404)

    user = await crud.get_user_by_id(user_id)
    username = user["username"]

    if any(attendee[0] == username for attendee in event.get("attendees", [])):
        raise HTTPException(status_code=400,
                            detail="User already attending this event.")

    if attend_data.service:
        if attend_data.service not in event.get("services", {}):
            raise HTTPException(
                status_code=400, detail="Invalid service selection.")

        event["attendees"].append((username, attend_data.service))
        event["services"][attend_data.service] -= 1
        if event["services"][attend_data.service] <= 0:
            del event["services"][attend_data.service]

    elif attend_data.wish_list_item:
        item_name, quantity = attend_data.wish_list_item
        if item_name not in event.get("wish_list", {}) or event["wish_list"][item_name] < quantity:
            raise HTTPException(status_code=400,
                                detail="Invalid wish list item or quantity.")
        event["attendees"].append((username, f"{item_name} x{quantity}"))
        event["wish_list"][item_name] -= quantity
        if event["wish_list"][item_name] <= 0:
            del event["wish_list"][item_name]

    elif attend_data.fee_payment:
        if "fee" not in event or event["fee"] <= 0:
            raise HTTPException(status_code=400,
                                detail="This event does not require a fee.")
        event["attendees"].append((username, "fee"))

    else:
        raise HTTPException(status_code=400,
                            detail="Attendance method not specified.")

    await db["events"].update_one({"_id": ObjectId(event_id)}, {"$set": event})

    return {"message": "Successfully attended the event", "event_id": event_id, "attendee": (username, attend_data.dict(exclude_none=True))}
