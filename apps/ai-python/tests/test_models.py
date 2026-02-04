"""Tests for Pydantic models."""

import pytest
from pydantic import ValidationError

from src.models import (
    GenerateAdventureRequest,
    GenerateAdventureResponse,
    EvaluateChoiceRequest,
    EvaluateChoiceResponse,
    Scores,
)


class TestGenerateAdventureRequest:
    """Tests for GenerateAdventureRequest model."""
    
    def test_valid_request(self):
        """Test creating a valid generation request."""
        request = GenerateAdventureRequest(
            user_age=10,
            allowance=10.0,
            goal_context="Saving for a bicycle",
        )
        assert request.user_age == 10
        assert request.allowance == 10.0
        assert request.goal_context == "Saving for a bicycle"
    
    def test_age_validation_too_young(self):
        """Test age validation rejects ages below 5."""
        with pytest.raises(ValidationError) as exc_info:
            GenerateAdventureRequest(
                user_age=4,
                allowance=10.0,
            )
        assert "user_age" in str(exc_info.value)
    
    def test_age_validation_too_old(self):
        """Test age validation rejects ages above 18."""
        with pytest.raises(ValidationError) as exc_info:
            GenerateAdventureRequest(
                user_age=19,
                allowance=10.0,
            )
        assert "user_age" in str(exc_info.value)
    
    def test_allowance_validation_zero(self):
        """Test allowance validation rejects zero."""
        with pytest.raises(ValidationError) as exc_info:
            GenerateAdventureRequest(
                user_age=10,
                allowance=0.0,
            )
        assert "allowance" in str(exc_info.value)
    
    def test_allowance_validation_negative(self):
        """Test allowance validation rejects negative values."""
        with pytest.raises(ValidationError) as exc_info:
            GenerateAdventureRequest(
                user_age=10,
                allowance=-5.0,
            )
        assert "allowance" in str(exc_info.value)


class TestGenerateAdventureResponse:
    """Tests for GenerateAdventureResponse model."""
    
    def test_valid_response(self):
        """Test creating a valid generation response."""
        response = GenerateAdventureResponse(
            scenario="Test scenario",
            choices=["Choice 1", "Choice 2"],
            opik_trace_id="trace_123",
        )
        assert response.scenario == "Test scenario"
        assert len(response.choices) == 2
        assert response.opik_trace_id == "trace_123"
    
    def test_choices_validation_too_few(self):
        """Test choices validation rejects less than 2 choices."""
        with pytest.raises(ValidationError) as exc_info:
            GenerateAdventureResponse(
                scenario="Test scenario",
                choices=["Only one choice"],
                opik_trace_id="trace_123",
            )
        assert "choices" in str(exc_info.value)


class TestEvaluateChoiceRequest:
    """Tests for EvaluateChoiceRequest model."""
    
    def test_valid_request(self):
        """Test creating a valid evaluation request."""
        request = EvaluateChoiceRequest(
            scenario="Test scenario",
            choice_index=0,
            choice_text="Save the money",
            user_age=10,
            amounts={"found": 5.0},
        )
        assert request.scenario == "Test scenario"
        assert request.choice_index == 0
        assert request.choice_text == "Save the money"
        assert request.user_age == 10
        assert request.amounts == {"found": 5.0}
    
    def test_choice_index_validation_negative(self):
        """Test choice index validation rejects negative values."""
        with pytest.raises(ValidationError) as exc_info:
            EvaluateChoiceRequest(
                scenario="Test scenario",
                choice_index=-1,
                choice_text="Save the money",
                user_age=10,
            )
        assert "choice_index" in str(exc_info.value)


class TestScores:
    """Tests for Scores model."""
    
    def test_valid_scores(self):
        """Test creating valid scores."""
        scores = Scores(
            financial_wisdom=0.9,
            long_term_thinking=0.85,
            responsibility=0.8,
        )
        assert scores.financial_wisdom == 0.9
        assert scores.long_term_thinking == 0.85
        assert scores.responsibility == 0.8
    
    def test_score_validation_too_high(self):
        """Test score validation rejects values above 1."""
        with pytest.raises(ValidationError) as exc_info:
            Scores(
                financial_wisdom=1.5,
                long_term_thinking=0.85,
                responsibility=0.8,
            )
        assert "financial_wisdom" in str(exc_info.value)
    
    def test_score_validation_negative(self):
        """Test score validation rejects negative values."""
        with pytest.raises(ValidationError) as exc_info:
            Scores(
                financial_wisdom=0.9,
                long_term_thinking=-0.1,
                responsibility=0.8,
            )
        assert "long_term_thinking" in str(exc_info.value)


class TestEvaluateChoiceResponse:
    """Tests for EvaluateChoiceResponse model."""
    
    def test_valid_response(self):
        """Test creating a valid evaluation response."""
        response = EvaluateChoiceResponse(
            feedback="Great choice!",
            scores=Scores(
                financial_wisdom=0.9,
                long_term_thinking=0.85,
                responsibility=0.8,
            ),
            opik_trace_id="trace_456",
        )
        assert response.feedback == "Great choice!"
        assert response.scores.financial_wisdom == 0.9
        assert response.opik_trace_id == "trace_456"
