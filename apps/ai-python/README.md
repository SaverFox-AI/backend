# SaverFox AI Service (AI Coach Agent)

Python FastAPI service for generating Indonesian money adventure scenarios and evaluating player choices using AI.

## Features

- **🇮🇩 Indonesian Language**: Child-friendly Indonesian language for all scenarios and feedback
- **🤖 Multi-LLM Support**: Supports both OpenAI and Google Gemini providers
- **📚 Adventure Generation**: Creates contextual financial scenarios (max 60 words)
- **⚖️ LLM-as-Judge Evaluation**: Evaluates decisions with educational feedback
- **📊 Opik Integration**: Full observability with trace IDs and metrics logging
- **✅ Validation**: Comprehensive request validation using Pydantic models
- **🛡️ Safety**: No PII requests, no adult topics, gentle guidance

## Story Requirements

All generated stories follow these strict requirements:
- ✅ Child-friendly Indonesian language
- ✅ Maximum 60 words per story
- ✅ Gentle guidance without lecturing
- ❌ No PII requests (name, address, school)
- ❌ No adult topics (loans, credit cards, complex investments)
- ✅ Focus on everyday situations (snacks, saving, sharing)

## Evaluation Metrics

The service evaluates choices using three dimensions (0.0-1.0):

1. **age_appropriateness**: How suitable is the decision for the child's age?
2. **goal_alignment**: How well does it align with their savings goals?
3. **financial_reasoning**: Quality of financial reasoning shown

## Project Structure

```
src/
├── __init__.py
├── main.py                 # FastAPI application entry point
├── config.py               # Configuration management
├── models.py               # Pydantic request/response models
├── llm_provider.py         # LLM provider abstraction (OpenAI/Gemini)
├── scenario_generator.py   # Indonesian scenario generation
├── choice_evaluator.py     # Indonesian choice evaluation
├── opik_tracer.py         # Opik tracing utilities
├── middleware.py          # Request validation middleware
├── exception_handlers.py  # Global exception handlers
└── routers/
    ├── __init__.py
    └── adventure.py       # Adventure endpoints

tests/
├── __init__.py
├── conftest.py           # Pytest fixtures
├── test_models.py        # Model validation tests
└── test_api.py           # API endpoint tests
```

## Setup

### Prerequisites

- Python 3.11+
- Poetry (for dependency management)
- OpenAI API key OR Google Gemini API key
- Opik API key (from Comet)

### Installation

1. Install dependencies:
```bash
poetry install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
# Choose your LLM provider
LLM_PROVIDER=openai  # or "gemini"

# If using OpenAI
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview

# If using Gemini
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-pro

# Opik configuration
OPIK_API_KEY=your-opik-api-key-here
OPIK_PROJECT_NAME=money-adventures
```

## Running the Service

### Development Mode

```bash
poetry run python -m src.main
```

Or with auto-reload:

```bash
poetry run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
poetry run uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The service will be available at `http://localhost:8000`

**API Documentation:**
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## API Documentation

Once running, access the interactive API documentation:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **OpenAPI JSON**: http://localhost:8000/api/openapi.json
- **OpenAPI YAML**: See `openapi.yaml` file

## API Endpoints

### Health Check

```bash
GET /
GET /health
```

Returns service status and version information.

### Generate Adventure (Indonesian)

```bash
POST /api/adventure/generate
```

**Request Body:**
```json
{
  "user_age": 10,
  "allowance": 70000.0,
  "goal_context": "Menabung untuk sepeda baru",
  "recent_activities": ["Mencatat pengeluaran: jajan Rp 5.000"]
}
```

**Response:**
```json
{
  "scenario": "Kamu menemukan uang Rp 10.000 di jalan! Apa yang akan kamu lakukan?",
  "choices": [
    "Menabung untuk tujuan sepeda",
    "Membeli jajan favorit",
    "Memberikan setengahnya untuk amal"
  ],
  "opik_trace_id": "trace_abc123xyz"
}
```

**Opik Trace Metadata:**
- `user_age`: Child's age
- `allowance_daily`: Daily allowance in Rupiah
- `goal_context`: Savings goal
- `language`: "indonesian"
- `max_story_words`: 60

### Evaluate Choice (Indonesian)

```bash
POST /api/adventure/evaluate
```

**Request Body:**
```json
{
  "scenario": "Kamu menemukan uang Rp 10.000 di jalan!",
  "choice_index": 0,
  "choice_text": "Menabung untuk tujuan sepeda",
  "user_age": 10,
  "amounts": {
    "found_money": 10000.0,
    "expense": 0.0,
    "saving": 10000.0,
    "goal_name": "Sepeda baru"
  }
}
```

**Response:**
```json
{
  "feedback": "Pilihan yang bagus! Menabung untuk tujuanmu menunjukkan perencanaan yang baik. Kamu berpikir tentang masa depan!",
  "scores": {
    "age_appropriateness": 0.9,
    "goal_alignment": 0.95,
    "financial_reasoning": 0.85
  },
  "opik_trace_id": "trace_def456uvw"
}
```

**Opik Trace Metadata:**
- `user_age`: Child's age
- `choice`: Selected choice text
- `choice_index`: Choice index
- `expense_amount`: Expense amount (if any)
- `saving_amount`: Saving amount (if any)
- `goal_name`: Goal name (if any)
- `language`: "indonesian"
- `evaluation_method`: "llm_as_judge"

**Opik Feedback Scores Logged:**
- `age_appropriateness`
- `goal_alignment`
- `financial_reasoning`

## LLM Provider Configuration

### Using OpenAI

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=1000
```

### Using Google Gemini

```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-pro
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=1000
```

The service automatically uses the configured provider. No code changes needed!

## Testing

### Run All Tests

```bash
poetry run pytest
```

### Run with Coverage

```bash
poetry run pytest --cov=src --cov-report=html
```

### Run Specific Test File

```bash
poetry run pytest tests/test_models.py
```

### Run with Verbose Output

```bash
poetry run pytest -v
```

## Configuration

All configuration is managed through environment variables. See `.env.example` for available options:

### Application Settings
- `APP_NAME`: Application name
- `APP_VERSION`: Version number
- `DEBUG`: Debug mode (true/false)
- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 8000)

### LLM Provider Settings
- `LLM_PROVIDER`: "openai" or "gemini"

### OpenAI Settings (if using OpenAI)
- `OPENAI_API_KEY`: Your OpenAI API key
- `OPENAI_MODEL`: Model name (e.g., gpt-4-turbo-preview)
- `OPENAI_TEMPERATURE`: Sampling temperature (0-1)
- `OPENAI_MAX_TOKENS`: Maximum tokens to generate

### Gemini Settings (if using Gemini)
- `GEMINI_API_KEY`: Your Google Gemini API key
- `GEMINI_MODEL`: Model name (e.g., gemini-pro)
- `GEMINI_TEMPERATURE`: Sampling temperature (0-1)
- `GEMINI_MAX_TOKENS`: Maximum tokens to generate

### Opik Settings
- `OPIK_API_KEY`: Your Opik API key from Comet
- `OPIK_PROJECT_NAME`: Project name for traces
- `OPIK_WORKSPACE`: Workspace name

### CORS Settings
- `CORS_ORIGINS`: Allowed origins (JSON array)
- `CORS_ALLOW_CREDENTIALS`: Allow credentials (true/false)

## Error Handling

The service uses consistent error responses across all endpoints:

```json
{
  "status_code": 400,
  "message": "Validation error",
  "error": "Bad Request",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/v1/adventure/generate",
  "validation_errors": [
    {
      "field": "user_age",
      "message": "Must be between 5 and 18"
    }
  ]
}
```

### HTTP Status Codes

- **200**: Success
- **400**: Bad Request (validation errors)
- **404**: Not Found
- **405**: Method Not Allowed
- **422**: Unprocessable Entity (business logic errors)
- **500**: Internal Server Error

## Observability with Opik

All AI operations are traced using Opik (Comet platform):

### Generation Traces
- **Trace Name**: `saverfox.money_adventure.generate`
- **Metadata**: user_age, allowance_daily, goal_context, language, max_story_words
- **Tags**: generation, indonesian, age_{user_age}
- **Output**: scenario, choices, word_count

### Evaluation Traces
- **Trace Name**: `saverfox.money_adventure.evaluate`
- **Metadata**: user_age, choice, expense_amount, saving_amount, goal_name, language, evaluation_method
- **Tags**: evaluation, indonesian, age_{user_age}
- **Output**: feedback, scores
- **Feedback Scores**: age_appropriateness, goal_alignment, financial_reasoning

Access your traces at: https://www.comet.com/opik

## Development

### Code Style

The project uses:
- **Black** for code formatting (line length: 100)
- **Ruff** for linting
- **MyPy** for type checking

Run formatters:
```bash
poetry run black src tests
poetry run ruff check src tests
poetry run mypy src
```

### Adding New Endpoints

1. Create a new router in `src/routers/`
2. Add the router to `src/main.py`
3. Add tests in `tests/`
4. Update OpenAPI spec in `openapi.yaml`
5. Update this README

## Architecture

The service follows a clean architecture pattern:

- **Routers**: Handle HTTP requests and responses
- **LLM Provider**: Abstract LLM interface (OpenAI/Gemini)
- **Services**: Business logic (ScenarioGenerator, ChoiceEvaluator)
- **Models**: Request/response validation (Pydantic)
- **Middleware**: Cross-cutting concerns (logging, validation)
- **Exception Handlers**: Consistent error responses
- **Opik Tracer**: Observability and tracing

## Integration with API Service

The AI service is called by the TypeScript API service:

1. API service receives client request
2. API service calls AI service with user context
3. AI service generates Indonesian scenario/evaluation
4. AI service returns result with Opik trace ID
5. API service stores result with trace ID in database
6. API service returns result to client

## Docker Support

Build and run with Docker:

```bash
# Build image
docker build -t saverfox-ai .

# Run container
docker run -p 8000:8000 --env-file .env saverfox-ai
```

Or use docker-compose from the root backend directory:

```bash
cd ..
docker-compose up ai-service
```

## Prompt Engineering

### Generation Prompts
The service uses carefully crafted Indonesian prompts that:
- Emphasize child-friendly language
- Enforce 60-word limit
- Prevent PII requests
- Avoid adult topics
- Focus on everyday situations

### Evaluation Prompts
The evaluation prompts:
- Provide encouraging feedback
- Use gentle guidance
- Avoid judgmental language
- Consider age appropriateness
- Align with savings goals

## License

MIT
