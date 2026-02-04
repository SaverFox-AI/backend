"""Pydantic models for request and response validation."""

from typing import Optional
from pydantic import BaseModel, Field, field_validator


class GenerateAdventureRequest(BaseModel):
    """Request model for adventure generation."""
    
    user_age: int = Field(..., ge=5, le=18, description="User's age (5-18)")
    allowance: float = Field(..., gt=0, description="User's allowance amount")
    goal_context: Optional[str] = Field(None, description="User's current savings goal context")
    recent_activities: Optional[list[str]] = Field(
        None,
        description="List of recent user activities for context",
    )
    
    @field_validator("allowance")
    @classmethod
    def validate_allowance(cls, v: float) -> float:
        """Validate allowance is positive."""
        if v <= 0:
            raise ValueError("Allowance must be greater than 0")
        return v
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "user_age": 10,
                    "allowance": 10.0,
                    "goal_context": "Saving for a new bicycle",
                    "recent_activities": ["Logged expense: candy $2", "Fed tamagotchi"],
                }
            ]
        }
    }


class GenerateAdventureResponse(BaseModel):
    """Response model for adventure generation."""
    
    scenario: str = Field(..., description="The generated adventure scenario text")
    choices: list[str] = Field(..., description="List of choice options for the player")
    opik_trace_id: str = Field(..., description="Opik trace ID for observability")
    
    @field_validator("choices")
    @classmethod
    def validate_choices(cls, v: list[str]) -> list[str]:
        """Validate that there are at least 2 choices."""
        if len(v) < 2:
            raise ValueError("Must provide at least 2 choices")
        return v
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "scenario": "You found $5 on the ground! What do you do?",
                    "choices": [
                        "Save it for your bicycle goal",
                        "Spend it on candy right away",
                        "Give half to charity and save half",
                    ],
                    "opik_trace_id": "trace_abc123xyz",
                }
            ]
        }
    }


class EvaluateChoiceRequest(BaseModel):
    """Request model for choice evaluation."""
    
    scenario: str = Field(..., description="The adventure scenario text")
    choice_index: int = Field(..., ge=0, description="Index of the selected choice (0-based)")
    choice_text: str = Field(..., description="Text of the selected choice")
    user_age: int = Field(..., ge=5, le=18, description="User's age (5-18)")
    amounts: Optional[dict[str, float]] = Field(
        None,
        description="Relevant monetary amounts in the scenario",
    )
    
    @field_validator("choice_index")
    @classmethod
    def validate_choice_index(cls, v: int) -> int:
        """Validate choice index is non-negative."""
        if v < 0:
            raise ValueError("Choice index must be non-negative")
        return v
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "scenario": "You found $5 on the ground! What do you do?",
                    "choice_index": 0,
                    "choice_text": "Save it for your bicycle goal",
                    "user_age": 10,
                    "amounts": {"found_money": 5.0},
                }
            ]
        }
    }


class Scores(BaseModel):
    """Evaluation scores for a player's choice."""
    
    age_appropriateness: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Score for age appropriateness of the decision (0-1)",
    )
    goal_alignment: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Score for alignment with user's savings goals (0-1)",
    )
    financial_reasoning: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Score for quality of financial reasoning (0-1)",
    )
    
    @field_validator("age_appropriateness", "goal_alignment", "financial_reasoning")
    @classmethod
    def validate_score_range(cls, v: float) -> float:
        """Validate score is between 0 and 1."""
        if not 0.0 <= v <= 1.0:
            raise ValueError("Score must be between 0 and 1")
        return v
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "age_appropriateness": 0.9,
                    "goal_alignment": 0.85,
                    "financial_reasoning": 0.8,
                }
            ]
        }
    }


class EvaluateChoiceResponse(BaseModel):
    """Response model for choice evaluation."""
    
    feedback: str = Field(..., description="Feedback text for the player's choice")
    scores: Scores = Field(..., description="Evaluation scores")
    opik_trace_id: str = Field(..., description="Opik trace ID for observability")
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "feedback": "Pilihan yang bagus! Menabung untuk tujuanmu menunjukkan perencanaan yang baik.",
                    "scores": {
                        "age_appropriateness": 0.9,
                        "goal_alignment": 0.95,
                        "financial_reasoning": 0.85,
                    },
                    "opik_trace_id": "trace_def456uvw",
                }
            ]
        }
    }


class ErrorResponse(BaseModel):
    """Standard error response model."""
    
    status_code: int = Field(..., description="HTTP status code")
    message: str = Field(..., description="Error message")
    error: str = Field(..., description="Error type")
    timestamp: str = Field(..., description="ISO timestamp of the error")
    path: str = Field(..., description="Request path that caused the error")
    validation_errors: Optional[list[dict[str, str]]] = Field(
        None,
        description="Field-level validation errors",
    )
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "status_code": 400,
                    "message": "Validation error",
                    "error": "Bad Request",
                    "timestamp": "2024-01-15T10:30:00Z",
                    "path": "/v1/adventure/generate",
                    "validation_errors": [
                        {"field": "user_age", "message": "Must be between 5 and 18"}
                    ],
                }
            ]
        }
    }
