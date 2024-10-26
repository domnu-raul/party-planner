from motor.motor_asyncio import AsyncIOMotorClient
from os import getenv

MONGO_URI = getenv("MONGO_URI", "mongodb://root:example@localhost:27017")
client = AsyncIOMotorClient(MONGO_URI)
db = client["mongodb"]


def get_db():
    return db
