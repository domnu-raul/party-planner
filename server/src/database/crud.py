from src.database import get_db, schemas
from bson.objectid import ObjectId


async def get_user(username_or_email: str):
    db = get_db()

    db_user = await db["users"].find_one({
        "$or": [
            {"username": username_or_email},
            {"email": username_or_email}
        ]
    })

    return db_user


async def get_user_by_id(user_id: str):
    db = get_db()

    db_user = await db["users"].find_one({"_id": ObjectId(user_id)})
    return db_user


async def register_user(user: schemas.UserCreate):
    db = get_db()

    result = await db["users"].insert_one(user.model_dump())
    return result


async def create_session(session: schemas.UserSession):
    db = get_db()

    result = await db["sessions"].insert_one(session.model_dump())
    return result
