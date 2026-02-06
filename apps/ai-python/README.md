# SaverFox AI Service (AI Coach Agent)

Python FastAPI service for generating Indonesian money adventure scenarios and evaluating player choices using AI.

## Features

- 🇮🇩 Indonesian Language: Child-friendly Indonesian for all scenarios
- 🤖 Multi-LLM Support: OpenAI, Google Gemini, or Kimi (Moonshot)
- 📚 Adventure Generation: Contextual financial scenarios (max 60 words)
- ⚖️ LLM-as-Judge Evaluation: Educational feedback with scores
- 📊 Opik Integration: Full observability with traces
- ✅ Robust JSON Parsing: Handles imperfect LLM outputs
- 🔄 Auto-retry: Regenerates if constraints violated

## Quick Start

### 1. Install Dependencies
```bash
poetry install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and choose LLM provider:

**Option A: Gemini (Recommended - Free tier available)**
```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=your-key-here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_MAX_TOKENS=2000
```

**Option B: OpenAI**
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4
```

**Option C: Kimi (Moonshot)**
```env
LLM_PROVIDER=kimi
KIMI_API_KEY=sk-your-key-here
KIMI_MODEL=moonshot-v1-8k
```

**Opik (Optional but recommended)**
```env
OPIK_API_KEY=your-key-here
OPIK_WORKSPACE=your-workspace
OPIK_PROJECT_NAME=saverfox-ai
```

### 3. Run Service
```bash
poetry run python -m src.main
```

Service runs at: http://localhost:8000

### 4. Test API

**Swagger UI:** http://localhost:8000/api/docs

**Generate Scenario:**
```bash
curl -X POST http://localhost:8000/api/adventure/generate \
  -H "Content-Type: application/json" \
  -d '{"user_age": 10, "allowance": 70000, "goal_context": "Menabung untuk sepeda baru"}'
```

**Evaluate Choice:**
```bash
curl -X POST http://localhost:8000/api/adventure/evaluate \
  -H "Content-Type: application/json" \
  -d '{"scenario": "Kamu dapat uang Rp 10.000", "choice_index": 0, "choice_text": "Menabung semua", "user_age": 10}'
```

## API Endpoints

### POST /api/adventure/generate
Generate Indonesian money adventure scenario.

**Request:**
```json
{
  "user_age": 10,
  "allowance": 70000,
  "goal_context": "Menabung untuk sepeda baru",
  "recent_activities": ["Jajan Rp 5.000"]
}
```

**Response:**
```json
{
  "scenario": "Hari ini kamu dapat uang saku Rp 10.000...",
  "choices": [
    "Menabung semua untuk sepeda",
    "Jajan es krim",
    "Jajan sedikit, sisanya ditabung"
  ],
  "opik_trace_id": "trace_123"
}
```

### POST /api/adventure/evaluate
Evaluate player's choice with feedback.

**Request:**
```json
{
  "scenario": "Kamu dapat uang Rp 10.000",
  "choice_index": 0,
  "choice_text": "Menabung semua untuk sepeda",
  "user_age": 10,
  "amounts": {
    "saving": 10000,
    "goal_name": "Sepeda baru"
  }
}
```

**Response:**
```json
{
  "feedback": "Pilihan yang bagus! Menabung menunjukkan perencanaan yang baik.",
  "scores": {
    "age_appropriateness": 0.9,
    "goal_alignment": 0.95,
    "financial_reasoning": 0.85
  },
  "opik_trace_id": "trace_456"
}
```

## Run Experiments

Evaluate prompts with 50 test cases:

```bash
poetry run python experiment_runner.py --experiment-name "baseline-v1"
```

View results in Opik dashboard: https://www.comet.com/opik

## LLM Provider Setup

### Gemini (Free)
1. https://makersuite.google.com/app/apikey
2. Create API key
3. Paste to `.env`

### OpenAI (Paid)
1. https://platform.openai.com/api-keys
2. Create key & add billing
3. Paste to `.env`

### Kimi (Paid)
1. https://platform.moonshot.cn/console/api-keys
2. Create key & top up
3. Paste to `.env`

### Opik (Free)
1. https://www.comet.com/signup
2. Settings → API Keys
3. Paste to `.env`

## Troubleshooting

**429 Rate Limit:**
- Gemini free: 15 req/min, wait 1 minute
- OpenAI: Top up billing
- Kimi: Check quota

**JSON Parse Failed:**
- Increase `GEMINI_MAX_TOKENS=2000`
- Use `gemini-1.5-flash` model
- Or switch to Kimi (more reliable)

**Opik Workspace Error:**
- Check workspace name in dashboard
- Update `OPIK_WORKSPACE` in `.env`

## Project Structure

```
src/
├── main.py                 # FastAPI app
├── config.py               # Settings
├── models.py               # Pydantic models
├── llm_provider.py         # LLM abstraction (OpenAI/Gemini/Kimi)
├── scenario_generator.py   # Indonesian scenario generation
├── choice_evaluator.py     # Choice evaluation
├── json_utils.py           # Robust JSON extraction
├── opik_tracer.py         # Opik integration
└── routers/
    └── adventure.py       # API endpoints

tests/
├── conftest.py
├── test_models.py
└── test_api.py

eval_dataset.jsonl         # 50 test cases
experiment_runner.py       # Experiment orchestration
```

## License

MIT
