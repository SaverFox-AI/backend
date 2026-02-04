@echo off
REM Run tests for SaverFox AI Service

echo Running SaverFox AI Service Tests...
echo ====================================

REM Set test environment variables
set OPENAI_API_KEY=test-key-123
set OPIK_API_KEY=test-opik-key-123

REM Run pytest with coverage
poetry run pytest tests/ -v --cov=src --cov-report=term-missing

echo.
echo Tests completed!
pause
