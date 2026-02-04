"""Opik tracing utilities for observability."""

import logging
from typing import Any, Callable, Optional, TypeVar
from functools import wraps

import opik
from opik import track

from src.config import settings

logger = logging.getLogger(__name__)

# Type variable for generic function wrapping
F = TypeVar("F", bound=Callable[..., Any])


class OpikTracer:
    """Utility class for managing Opik tracing operations."""
    
    def __init__(self) -> None:
        """Initialize Opik client with configuration."""
        try:
            opik.configure(
                api_key=settings.opik_api_key,
                workspace=settings.opik_workspace,
            )
            self.client = opik.Opik()
            self.project_name = settings.opik_project_name
            logger.info(f"Opik client initialized for project: {self.project_name}")
        except Exception as e:
            logger.error(f"Failed to initialize Opik client: {e}")
            raise
    
    def trace_operation(
        self,
        name: str,
        metadata: Optional[dict[str, Any]] = None,
        tags: Optional[list[str]] = None,
    ) -> Callable[[F], F]:
        """
        Decorator to trace an operation with Opik.
        
        Args:
            name: Name of the operation to trace
            metadata: Additional metadata to attach to the trace
            tags: Tags to categorize the trace
            
        Returns:
            Decorated function that creates an Opik trace
        """
        def decorator(func: F) -> F:
            @wraps(func)
            async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
                """Wrapper for async functions."""
                # Use Opik's track decorator
                tracked_func = track(
                    name=name,
                    project_name=self.project_name,
                    metadata=metadata or {},
                    tags=tags or [],
                )(func)
                
                result = await tracked_func(*args, **kwargs)
                return result
            
            @wraps(func)
            def sync_wrapper(*args: Any, **kwargs: Any) -> Any:
                """Wrapper for sync functions."""
                tracked_func = track(
                    name=name,
                    project_name=self.project_name,
                    metadata=metadata or {},
                    tags=tags or [],
                )(func)
                
                result = tracked_func(*args, **kwargs)
                return result
            
            # Return appropriate wrapper based on function type
            import inspect
            if inspect.iscoroutinefunction(func):
                return async_wrapper  # type: ignore
            else:
                return sync_wrapper  # type: ignore
        
        return decorator
    
    def log_feedback(
        self,
        trace_id: str,
        scores: dict[str, float],
        metadata: Optional[dict[str, Any]] = None,
    ) -> None:
        """
        Log feedback scores to an existing trace.
        
        Args:
            trace_id: The Opik trace ID
            scores: Dictionary of score names to values
            metadata: Additional metadata to log
        """
        try:
            # Log scores as feedback
            for score_name, score_value in scores.items():
                self.client.log_traces_feedback_scores(
                    trace_id=trace_id,
                    scores=[{
                        "name": score_name,
                        "value": score_value,
                    }],
                )
            
            if metadata:
                logger.debug(f"Logged feedback for trace {trace_id}: {scores}")
        except Exception as e:
            logger.error(f"Failed to log feedback for trace {trace_id}: {e}")


# Global tracer instance
opik_tracer = OpikTracer()
