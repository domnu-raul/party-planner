from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from src.database import get_db
from src.routers import auth, events

app = FastAPI()
origins = ["http://localhost:3000",]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router)
app.include_router(events.router)

db = get_db()


@app.get("/")
async def read_root():
    return {"message": "Welcome to the FastAPI MongoDB app"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", reload=True)
