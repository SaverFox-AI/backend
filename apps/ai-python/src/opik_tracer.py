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

# Global flag for Opik availability
OPIK_ENABLED = False


def init_opik() -> bool:
    """
    Initialize Opik configuration at startup.
    
    Returns:
        True if Opik is successfully configured, False otherwise
    """
    global OPIK_ENABLED
    
    if not settings.opik_api_key:
        logger.warning("OPIK_API_KEY not set, Opik tracing disabled")
        OPIK_ENABLED = False
        return False
    
    try:
        opik.configure(
            api_key=settings.opik_api_key,
            workspace=settings.opik_workspace,
        )
        OPIK_ENABLED = True
        logger.info(
            f"✓ Opik configured: workspace={settings.opik_workspace}, "
            f"project={settings.opik_project_name}"
        )
        return True
    except Exception as e:
        logger.error(f"✗ Failed to configure Opik: {e}")
        OPIK_ENABLED = False
        return False


def is_opik_enabled() -> bool:
    """Check if Opik tracing is enabled."""
    return OPIK_ENABLED


class OpikTracer:
    """Utility class for managing Opik tracing operations."""
    
    def __init__(self) -> None:
        """Initialize Opik client with configuration."""
        if not OPIK_ENABLED:
            logger.warning("Opik not configured, tracer will be disabled")
            self.client = None
            self.project_name = settings.opik_project_name
            return
            
        try:
            self.client = opik.Opik()
            self.project_name = settings.opik_project_name
            logger.info(f"Opik client initialized for project: {self.project_name}")
        except Exception as e:
            logger.error(f"Failed to initialize Opik client: {e}")
            self.client = None
    
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
        if not self.client:
            logger.warning("Opik client not available, skipping feedback logging")
            return
            
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


# Global tracer instance - will be initialized after init_opik() is called
opik_tracer: Optional[OpikTracer] = None


def get_opik_tracer() -> Optional[OpikTracer]:
    """Get the global Opik tracer instance."""
    global opik_tracer
    if opik_tracer is None and OPIK_ENABLED:
        opik_tracer = OpikTracer()
    return opik_tracer
