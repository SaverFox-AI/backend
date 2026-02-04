"""Middleware for request validation and processing."""

import logging
from typing import Callable

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class ValidationMiddleware(BaseHTTPMiddleware):
    """
    Middleware for request validation and logging.
    
    Note: FastAPI automatically validates requests using Pydantic models,
    so this middleware primarily handles logging and additional processing.
    """
    
    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Response],
    ) -> Response:
        """
        Process the request and handle validation.
        
        Args:
            request: The incoming request
            call_next: The next middleware or route handler
            
        Returns:
            The response from the route handler
        """
        # Log incoming request
        logger.debug(
            f"Incoming request: {request.method} {request.url.path}",
            extra={
                "method": request.method,
                "path": request.url.path,
                "client": request.client.host if request.client else None,
            },
        )
        
        try:
            # Process request
            response = await call_next(request)
            
            # Log response
            logger.debug(
                f"Response: {response.status_code}",
                extra={
                    "status_code": response.status_code,
                    "path": request.url.path,
                },
            )
            
            return response
        
        except Exception as e:
            # Log unexpected errors
            logger.error(
                f"Unexpected error in middleware: {e}",
                extra={
                    "path": request.url.path,
                    "error": str(e),
                },
                exc_info=True,
            )
            raise
