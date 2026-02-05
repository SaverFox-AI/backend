"""Main FastAPI application entry point."""

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi import APIRouter
from pydantic import ValidationError

from src.config import settings
from src.routers import adventure
from src.middleware import ValidationMiddleware
from src.exception_handlers import (
    validation_exception_handler,
    http_exception_handler,
    general_exception_handler,
)

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager for startup and shutdown events."""
    # Startup
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"LLM Provider: {settings.llm_provider}")
    if settings.llm_provider.lower() == "openai":
        logger.info(f"OpenAI Model: {settings.openai_model}")
    elif settings.llm_provider.lower() == "gemini":
        logger.info(f"Gemini Model: {settings.gemini_model}")
    
    # Initialize Opik
    from src.opik_tracer import init_opik
    opik_initialized = init_opik()
    if opik_initialized:
        logger.info(f"✓ Opik Project: {settings.opik_project_name}")
    else:
        logger.warning("⚠ Opik tracing disabled - traces will not be logged")
    
    yield
    
    # Shutdown
    logger.info(f"Shutting down {settings.app_name}")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="""AI service for generating money adventure scenarios and evaluating player choices.

This service provides:
- Indonesian language money adventure generation for children
- LLM-based evaluation of financial decisions
- Opik tracing for observability
- Support for OpenAI and Gemini LLM providers

**Story Requirements:**
- Child-friendly Indonesian language
- Maximum 60 words per story
- Gentle guidance without lecturing
- No PII requests (name, address, school)
- No adult topics (loans, credit cards, complex investments)

**Evaluation Metrics:**
- age_appropriateness (0.0-1.0): How suitable is the decision for the child's age?
- goal_alignment (0.0-1.0): How well does it align with their savings goals?
- financial_reasoning (0.0-1.0): Quality of financial reasoning shown
""",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
)

# Add middleware
app.add_middleware(ValidationMiddleware)

# Add exception handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(ValidationError, validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Create API router with prefix
api_router = APIRouter(prefix=settings.api_prefix)

# Include routers under API prefix
api_router.include_router(adventure.router)

# Mount API router
app.include_router(api_router)


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint for health check."""
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "status": "healthy",
    }


@app.get("/health")
async def health() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "src.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )
