"""Pytest configuration and fixtures."""

import os
import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi.testclient import TestClient

# Set test environment variables before importing app
os.environ["OPENAI_API_KEY"] = "test-key-123"
os.environ["OPIK_API_KEY"] = "test-opik-key-123"

from src.main import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
def mock_openai_response():
    """Create a mock OpenAI response."""
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(
            message=MagicMock(
                content='{"scenario": "Test scenario", "choices": ["Choice 1", "Choice 2", "Choice 3"]}'
            )
        )
    ]
    return mock_response


@pytest.fixture
def mock_openai_evaluation_response():
    """Create a mock OpenAI evaluation response."""
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(
            message=MagicMock(
                content='{"feedback": "Great choice!", "scores": {"financial_wisdom": 0.9, "long_term_thinking": 0.85, "responsibility": 0.8}}'
            )
        )
    ]
    return mock_response
