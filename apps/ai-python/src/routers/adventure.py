"""Adventure generation and evaluation endpoints."""

import logging
from datetime import datetime

from fastapi import APIRouter, HTTPException, Request
from opik.api_objects import trace

from src.config import settings
from src.models import (
    GenerateAdventureRequest,
    GenerateAdventureResponse,
    EvaluateChoiceRequest,
    EvaluateChoiceResponse,
)
from src.scenario_generator import ScenarioGenerator
from src.choice_evaluator import ChoiceEvaluator
from src.opik_tracer import is_opik_enabled

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/adventure", tags=["adventure"])

# Initialize generator and evaluator
scenario_generator = ScenarioGenerator()
choice_evaluator = ChoiceEvaluator()


@router.post("/generate", response_model=GenerateAdventureResponse)
async def generate_adventure(
    request: GenerateAdventureRequest,
    http_request: Request,
) -> GenerateAdventureResponse:
    """
    Generate a money adventure scenario with choices in Indonesian.
    
    This endpoint creates a contextual financial scenario based on the user's
    age, allowance, and goals. It uses an LLM to generate engaging educational
    content in child-friendly Indonesian and tracks the operation with Opik.
    
    **Requirements:** 8.1, 8.2, 8.3, 13.1, 13.2, 13.3
    
    **Story Requirements:**
    - Child-friendly Indonesian language
    - Maximum 60 words
    - Gentle guidance without lecturing
    - No PII requests (name, address, school)
    - No adult topics (loans, credit cards, complex investments)
    
    Args:
        request: Generation request with user context
        http_request: FastAPI request object for metadata
        
    Returns:
        Generated scenario with choices and trace ID
        
    Raises:
        HTTPException: If generation fails (422 for validation, 500 for server errors)
        
    Example:
        ```json
        {
          "user_age": 10,
          "allowance": 70000.0,
          "goal_context": "Menabung untuk sepeda baru"
        }
        ```
    """
    try:
        daily_allowance = request.allowance / 7
        logger.info(
            f"Generating Indonesian adventure for age {request.user_age}, "
            f"daily allowance Rp {daily_allowance:,.0f}"
        )
        
        # Create Opik trace with metadata (only if enabled)
        if is_opik_enabled():
            with trace.Trace(
                name="saverfox.money_adventure.generate",
                project_name=settings.opik_project_name,
                metadata={
                    "user_age": request.user_age,
                    "allowance_daily": daily_allowance,
                    "goal_context": request.goal_context or "",
                    "recent_activities": request.recent_activities or [],
                    "language": "indonesian",
                    "max_story_words": 60,
                },
                tags=["generation", "indonesian", f"age_{request.user_age}"],
            ) as opik_trace:
                # Generate scenario using LLM
                scenario, choices = await scenario_generator.generate(request)
                
                # Calculate word count and check constraint
                word_count = len(scenario.split())
                constraint_violation = word_count > 60
                
                # Log LLM input/output to trace
                opik_trace.log_output({
                    "scenario": scenario,
                    "choices": choices,
                    "word_count": word_count,
                    "constraint_violation": constraint_violation,
                })
                
                # Add tag if constraint violated
                if constraint_violation:
                    opik_trace.update(tags=opik_trace.tags + ["too_long"])
                
                # Get trace ID - must be valid or raise error
                trace_id = opik_trace.id
                if not trace_id:
                    logger.error("Opik trace ID is None - Opik integration issue")
                    raise HTTPException(
                        status_code=500,
                        detail="Opik tracing failed - trace ID not generated",
                    )
                
                logger.info(
                    f"Successfully generated adventure with trace_id: {trace_id}",
                    extra={
                        "user_age": request.user_age,
                        "allowance_daily": daily_allowance,
                        "goal_context": request.goal_context,
                        "num_choices": len(choices),
                        "word_count": word_count,
                        "constraint_violation": constraint_violation,
                    },
                )
                
                return GenerateAdventureResponse(
                    scenario=scenario,
                    choices=choices,
                    opik_trace_id=trace_id,
                )
        else:
            # Opik disabled - generate without tracing
            logger.warning("Opik disabled - generating without trace")
            scenario, choices = await scenario_generator.generate(request)
            
            return GenerateAdventureResponse(
                scenario=scenario,
                choices=choices,
                opik_trace_id="opik_disabled",
            )
    
    except ValueError as e:
        logger.error(f"Validation error during generation: {e}")
        raise HTTPException(
            status_code=422,
            detail=f"Failed to generate valid scenario: {str(e)}",
        )
    
    except Exception as e:
        logger.error(f"Unexpected error during generation: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error during scenario generation",
        )


@router.post("/evaluate", response_model=EvaluateChoiceResponse)
async def evaluate_choice(
    request: EvaluateChoiceRequest,
    http_request: Request,
) -> EvaluateChoiceResponse:
    """
    Evaluate a player's choice and provide feedback in Indonesian.
    
    This endpoint evaluates the player's decision in a money adventure scenario,
    providing constructive feedback in Indonesian and scores across multiple dimensions.
    It uses LLM-as-judge approach for evaluation and tracks with Opik.
    
    **Requirements:** 9.1, 9.2, 9.3, 13.1, 13.2, 13.3, 13.5
    
    **Evaluation Metrics:**
    - age_appropriateness (0.0-1.0): How suitable is the decision for the child's age?
    - goal_alignment (0.0-1.0): How well does it align with their savings goals?
    - financial_reasoning (0.0-1.0): Quality of financial reasoning shown
    
    Args:
        request: Evaluation request with scenario and choice
        http_request: FastAPI request object for metadata
        
    Returns:
        Feedback, scores, and trace ID
        
    Raises:
        HTTPException: If evaluation fails (422 for validation, 500 for server errors)
        
    Example:
        ```json
        {
          "scenario": "Kamu menemukan uang Rp 5.000 di jalan!",
          "choice_index": 0,
          "choice_text": "Menabung untuk tujuan sepeda",
          "user_age": 10,
          "amounts": {"found_money": 5000.0}
        }
        ```
    """
    try:
        logger.info(
            f"Evaluating Indonesian choice for age {request.user_age}: "
            f"choice_index={request.choice_index}"
        )
        
        # Extract amounts for metadata
        expense_amount = request.amounts.get("expense", 0.0) if request.amounts else 0.0
        saving_amount = request.amounts.get("saving", 0.0) if request.amounts else 0.0
        goal_name = request.amounts.get("goal_name", "") if request.amounts else ""
        
        # Create Opik trace with metadata (only if enabled)
        if is_opik_enabled():
            with trace.Trace(
                name="saverfox.money_adventure.evaluate",
                project_name=settings.opik_project_name,
                metadata={
                    "user_age": request.user_age,
                    "choice": request.choice_text,
                    "choice_index": request.choice_index,
                    "expense_amount": expense_amount,
                    "saving_amount": saving_amount,
                    "goal_name": goal_name,
                    "language": "indonesian",
                    "evaluation_method": "llm_as_judge",
                },
                tags=["evaluation", "indonesian", f"age_{request.user_age}"],
            ) as opik_trace:
                # Evaluate choice using LLM
                feedback, scores = await choice_evaluator.evaluate(request)
                
                # Log LLM input/output and scores to trace
                opik_trace.log_output({
                    "feedback": feedback,
                    "scores": {
                        "age_appropriateness": scores.age_appropriateness,
                        "goal_alignment": scores.goal_alignment,
                        "financial_reasoning": scores.financial_reasoning,
                    },
                })
                
                # Log scores as feedback scores for Opik analytics
                opik_trace.log_feedback_score(
                    name="age_appropriateness",
                    value=scores.age_appropriateness,
                )
                opik_trace.log_feedback_score(
                    name="goal_alignment",
                    value=scores.goal_alignment,
                )
                opik_trace.log_feedback_score(
                    name="financial_reasoning",
                    value=scores.financial_reasoning,
                )
                
                # Get trace ID - must be valid or raise error
                trace_id = opik_trace.id
                if not trace_id:
                    logger.error("Opik trace ID is None - Opik integration issue")
                    raise HTTPException(
                        status_code=500,
                        detail="Opik tracing failed - trace ID not generated",
                    )
                
                logger.info(
                    f"Successfully evaluated choice with trace_id: {trace_id}",
                    extra={
                        "user_age": request.user_age,
                        "choice_index": request.choice_index,
                        "choice_text": request.choice_text,
                        "age_appropriateness": scores.age_appropriateness,
                        "goal_alignment": scores.goal_alignment,
                        "financial_reasoning": scores.financial_reasoning,
                    },
                )
                
                return EvaluateChoiceResponse(
                    feedback=feedback,
                    scores=scores,
                    opik_trace_id=trace_id,
                )
        else:
            # Opik disabled - evaluate without tracing
            logger.warning("Opik disabled - evaluating without trace")
            feedback, scores = await choice_evaluator.evaluate(request)
            
            return EvaluateChoiceResponse(
                feedback=feedback,
                scores=scores,
                opik_trace_id="opik_disabled",
            )
    
    except ValueError as e:
        logger.error(f"Validation error during evaluation: {e}")
        raise HTTPException(
            status_code=422,
            detail=f"Failed to evaluate choice: {str(e)}",
        )
    
    except Exception as e:
        logger.error(f"Unexpected error during evaluation: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error during choice evaluation",
        )
