"""Global exception handlers for consistent error responses."""

import logging
from datetime import datetime
from typing import Union

from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from src.models import ErrorResponse

logger = logging.getLogger(__name__)


async def validation_exception_handler(
    request: Request,
    exc: Union[RequestValidationError, ValidationError],
) -> JSONResponse:
    """
    Handle Pydantic validation errors with detailed field-level messages.
    
    Args:
        request: The request that caused the error
        exc: The validation exception
        
    Returns:
        JSON response with validation error details
    """
    # Extract validation errors
    validation_errors = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"] if loc != "body")
        message = error["msg"]
        validation_errors.append({
            "field": field,
            "message": message,
        })
    
    # Log validation error
    logger.warning(
        f"Validation error on {request.url.path}: {len(validation_errors)} field(s)",
        extra={
            "path": request.url.path,
            "validation_errors": validation_errors,
        },
    )
    
    # Create error response
    error_response = ErrorResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        message="Validation error",
        error="Bad Request",
        timestamp=datetime.utcnow().isoformat() + "Z",
        path=str(request.url.path),
        validation_errors=validation_errors,
    )
    
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=error_response.model_dump(),
    )


async def http_exception_handler(
    request: Request,
    exc: Exception,
) -> JSONResponse:
    """
    Handle HTTP exceptions with consistent error format.
    
    Args:
        request: The request that caused the error
        exc: The HTTP exception
        
    Returns:
        JSON response with error details
    """
    from fastapi import HTTPException
    
    if isinstance(exc, HTTPException):
        status_code = exc.status_code
        message = exc.detail
        error = get_error_name(status_code)
    else:
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        message = "Internal server error"
        error = "Internal Server Error"
    
    # Log error
    logger.error(
        f"HTTP error on {request.url.path}: {status_code} - {message}",
        extra={
            "path": request.url.path,
            "status_code": status_code,
            "error": error,
        },
        exc_info=status_code >= 500,
    )
    
    # Create error response
    error_response = ErrorResponse(
        status_code=status_code,
        message=message,
        error=error,
        timestamp=datetime.utcnow().isoformat() + "Z",
        path=str(request.url.path),
    )
    
    return JSONResponse(
        status_code=status_code,
        content=error_response.model_dump(),
    )


async def general_exception_handler(
    request: Request,
    exc: Exception,
) -> JSONResponse:
    """
    Handle unexpected exceptions with consistent error format.
    
    Args:
        request: The request that caused the error
        exc: The exception
        
    Returns:
        JSON response with error details
    """
    # Log unexpected error
    logger.error(
        f"Unexpected error on {request.url.path}: {type(exc).__name__}",
        extra={
            "path": request.url.path,
            "exception_type": type(exc).__name__,
            "exception_message": str(exc),
        },
        exc_info=True,
    )
    
    # Create error response
    error_response = ErrorResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        message="Internal server error",
        error="Internal Server Error",
        timestamp=datetime.utcnow().isoformat() + "Z",
        path=str(request.url.path),
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response.model_dump(),
    )


def get_error_name(status_code: int) -> str:
    """
    Get the error name for a given status code.
    
    Args:
        status_code: HTTP status code
        
    Returns:
        Human-readable error name
    """
    error_names = {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        409: "Conflict",
        422: "Unprocessable Entity",
        500: "Internal Server Error",
        502: "Bad Gateway",
        503: "Service Unavailable",
    }
    return error_names.get(status_code, "Error")
