import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import ResponseValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.features.auth.router import router as auth_router
from app.features.ai.router import router as ai_router
from app.features.dashboard.router import router as dashboard_router
from app.features.events.router import router as events_router
from app.features.registration.router import router as registration_router

app = FastAPI(title="Eventify API")

# Setup a basic logger
logger = logging.getLogger(__name__)

# Catch ResponseValidationError specifically
@app.exception_handler(ResponseValidationError)
async def response_validation_exception_handler(request: Request, exc: ResponseValidationError):
    # Log the exact details formatting it nicely for your server logs
    logger.error(f"Response validation error on {request.url}: {exc.errors()}")
    
    # Return the validation errors directly as JSON
    return JSONResponse(
        status_code=500,
        content=exc.errors()
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1", tags=["Authentication"])
app.include_router(ai_router, prefix="/api/v1/ai", tags=["AI"])
app.include_router(events_router, prefix="/api/v1/events", tags=["Events"])
app.include_router(registration_router, prefix="/api/v1/events", tags=["Registrations"])
app.include_router(dashboard_router, prefix="/api/v1", tags=["Admin"])
