"""Tests for API endpoints."""

import pytest
from unittest.mock import patch, AsyncMock


class TestHealthEndpoints:
    """Tests for health check endpoints."""
    
    def test_root_endpoint(self, client):
        """Test root endpoint returns service info."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "service" in data
        assert "version" in data
        assert "status" in data
        assert data["status"] == "healthy"
    
    def test_health_endpoint(self, client):
        """Test health endpoint returns healthy status."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


class TestGenerateAdventureEndpoint:
    """Tests for adventure generation endpoint."""
    
    @patch("src.routers.adventure.scenario_generator.generate")
    async def test_generate_adventure_success(self, mock_generate, client):
        """Test successful adventure generation."""
        # Mock the generator
        mock_generate.return_value = (
            "You found $5 on the ground!",
            ["Save it", "Spend it", "Share it"],
        )
        
        # Make request
        response = client.post(
            "/v1/adventure/generate",
            json={
                "user_age": 10,
                "allowance": 10.0,
                "goal_context": "Saving for a bicycle",
            },
        )
        
        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert "scenario" in data
        assert "choices" in data
        assert "opik_trace_id" in data
        assert len(data["choices"]) >= 2
    
    def test_generate_adventure_invalid_age(self, client):
        """Test generation with invalid age returns 400."""
        response = client.post(
            "/v1/adventure/generate",
            json={
                "user_age": 3,  # Too young
                "allowance": 10.0,
            },
        )
        assert response.status_code == 400
        data = response.json()
        assert "validation_errors" in data or "detail" in data
    
    def test_generate_adventure_invalid_allowance(self, client):
        """Test generation with invalid allowance returns 400."""
        response = client.post(
            "/v1/adventure/generate",
            json={
                "user_age": 10,
                "allowance": -5.0,  # Negative
            },
        )
        assert response.status_code == 400
    
    def test_generate_adventure_missing_fields(self, client):
        """Test generation with missing required fields returns 400."""
        response = client.post(
            "/v1/adventure/generate",
            json={
                "user_age": 10,
                # Missing allowance
            },
        )
        assert response.status_code == 400


class TestEvaluateChoiceEndpoint:
    """Tests for choice evaluation endpoint."""
    
    @patch("src.routers.adventure.choice_evaluator.evaluate")
    async def test_evaluate_choice_success(self, mock_evaluate, client):
        """Test successful choice evaluation."""
        from src.models import Scores
        
        # Mock the evaluator
        mock_evaluate.return_value = (
            "Great choice!",
            Scores(
                financial_wisdom=0.9,
                long_term_thinking=0.85,
                responsibility=0.8,
            ),
        )
        
        # Make request
        response = client.post(
            "/v1/adventure/evaluate",
            json={
                "scenario": "You found $5 on the ground!",
                "choice_index": 0,
                "choice_text": "Save it for your goal",
                "user_age": 10,
                "amounts": {"found": 5.0},
            },
        )
        
        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert "feedback" in data
        assert "scores" in data
        assert "opik_trace_id" in data
        assert "financial_wisdom" in data["scores"]
        assert "long_term_thinking" in data["scores"]
        assert "responsibility" in data["scores"]
    
    def test_evaluate_choice_invalid_choice_index(self, client):
        """Test evaluation with invalid choice index returns 400."""
        response = client.post(
            "/v1/adventure/evaluate",
            json={
                "scenario": "Test scenario",
                "choice_index": -1,  # Negative
                "choice_text": "Save it",
                "user_age": 10,
            },
        )
        assert response.status_code == 400
    
    def test_evaluate_choice_missing_fields(self, client):
        """Test evaluation with missing required fields returns 400."""
        response = client.post(
            "/v1/adventure/evaluate",
            json={
                "scenario": "Test scenario",
                "choice_index": 0,
                # Missing choice_text and user_age
            },
        )
        assert response.status_code == 400


class TestErrorHandling:
    """Tests for error handling."""
    
    def test_404_not_found(self, client):
        """Test 404 error for non-existent endpoint."""
        response = client.get("/nonexistent")
        assert response.status_code == 404
    
    def test_405_method_not_allowed(self, client):
        """Test 405 error for wrong HTTP method."""
        response = client.get("/v1/adventure/generate")  # Should be POST
        assert response.status_code == 405
