# API Path Standardization Update

## Changes Made

Updated AI service to use consistent API paths with the TypeScript API service.

### Path Changes

**Before:**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`
- Generate endpoint: `POST /v1/adventure/generate`
- Evaluate endpoint: `POST /v1/adventure/evaluate`

**After:**
- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`
- OpenAPI JSON: `http://localhost:8000/api/openapi.json`
- Generate endpoint: `POST /api/adventure/generate`
- Evaluate endpoint: `POST /api/adventure/evaluate`

### Files Updated

1. **`src/config.py`**
   - Added `api_prefix: str = "/api"` configuration

2. **`src/main.py`**
   - Updated `docs_url="/api/docs"`
   - Updated `redoc_url="/api/redoc"`
   - Updated `openapi_url="/api/openapi.json"`
   - Created API router with prefix: `api_router = APIRouter(prefix=settings.api_prefix)`
   - Mounted adventure router under API prefix

3. **`src/routers/adventure.py`**
   - Changed router prefix from `/v1/adventure` to `/adventure`
   - API prefix is now handled at the app level

4. **`openapi.yaml`**
   - Updated server URLs to include `/api` base path
   - Updated endpoint paths: `/api/adventure/generate` and `/api/adventure/evaluate`
   - Updated example error paths

5. **`README.md`**
   - Updated all API documentation URLs
   - Updated endpoint paths in examples
   - Updated curl command examples

6. **`IMPLEMENTATION_SUMMARY.md`**
   - Updated usage examples with correct paths

7. **`.env.example`**
   - Added `API_PREFIX=/api` configuration

### Consistency with TypeScript API Service

Both services now use the same pattern:

**TypeScript API Service:**
- Base URL: `http://localhost:3000`
- API Prefix: `/api`
- Swagger: `http://localhost:3000/api/docs`
- Example: `POST /api/auth/register`

**Python AI Service:**
- Base URL: `http://localhost:8000`
- API Prefix: `/api`
- Swagger: `http://localhost:8000/api/docs`
- Example: `POST /api/adventure/generate`

### Updated API Endpoints

```bash
# Health checks (no prefix)
GET  http://localhost:8000/
GET  http://localhost:8000/health

# Adventure endpoints (with /api prefix)
POST http://localhost:8000/api/adventure/generate
POST http://localhost:8000/api/adventure/evaluate

# Documentation (with /api prefix)
GET  http://localhost:8000/api/docs
GET  http://localhost:8000/api/redoc
GET  http://localhost:8000/api/openapi.json
```

### Configuration

Add to your `.env` file:

```env
API_PREFIX=/api
```

This allows easy customization of the API prefix if needed in the future.

### Benefits

1. **Consistency**: Both services use the same URL structure
2. **Professional**: Standard REST API convention with `/api` prefix
3. **Flexibility**: Easy to change prefix via configuration
4. **Clear Separation**: Health checks at root, API endpoints under `/api`

### Testing

After starting the service:

```bash
# Start service
poetry run uvicorn src.main:app --reload

# Test health check
curl http://localhost:8000/health

# Test generate endpoint
curl -X POST http://localhost:8000/api/adventure/generate \
  -H "Content-Type: application/json" \
  -d '{"user_age": 10, "allowance": 70000.0}'

# View API documentation
open http://localhost:8000/api/docs
```

### Migration Notes

If you have existing code calling the old endpoints:

**Old:**
```typescript
const response = await fetch('http://localhost:8000/v1/adventure/generate', {
  method: 'POST',
  // ...
});
```

**New:**
```typescript
const response = await fetch('http://localhost:8000/api/adventure/generate', {
  method: 'POST',
  // ...
});
```

All endpoint paths now consistently use `/api` prefix! 🎉
