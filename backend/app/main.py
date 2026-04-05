from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.features.events.router import router as events_router

app = FastAPI(title="Eventify API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(events_router, prefix="/api/v1/events", tags=["Events"])