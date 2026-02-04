# API Documentation Summary

## Overview

Complete API documentation and testing resources for SaverFox AI Backend.

## Documentation Files

### 1. Postman Collection
**File**: `SaverFox-API.postman_collection.json`

Complete API collection with:
- 40+ endpoints organized by feature
- Automatic token management
- Environment variable auto-save
- Test scripts for validation
- Direct AI service endpoints

**Features Covered:**
- Authentication (Register, Login)
- Profile & Onboarding (Create Profile, Choose Character)
- Wallet (Get Balance)
- Shop (Browse, Purchase, Inventory)
- Missions (Daily Missions, Log Expense/Saving)
- Tamagotchi (Status, Feed)
- Goals (Create, View, Update, Delete)
- Adventures (Generate, Submit Choice, History)
- AI Service Direct (Health, Generate, Evaluate)

### 2. Postman Environment
**File**: `SaverFox-API.postman_environment.json`

Pre-configured environment with:
- Base URLs for both services
- Auto-managed authentication tokens
- Dynamic IDs (user, profile, character, goal, adventure)
- Ready to use after import

### 3. API Testing Guide
**File**: `API_TESTING_GUIDE.md`

Comprehensive testing guide including:
- Setup instructions
- Complete user journey flow
- Environment variable reference
- Authentication guide
- Testing tips and edge cases
- Troubleshooting section

### 4. Swagger UI Guide
**File**: `SWAGGER_GUIDE.md`

Interactive documentation guide covering:
- Accessing Swagger UI for both services
- Authentication setup
- Testing endpoints in browser
- Schema exploration
- Common workflows
- Export OpenAPI specs

### 5. .gitignore Files
**Files**: 
- `backend/.gitignore` (root)
- `backend/apps/api-ts/.gitignore` (API service)
- `backend/apps/ai-python/.gitignore` (AI service)

Comprehensive ignore patterns for:
- Dependencies (node_modules, __pycache__)
- Environment files (.env)
- Build outputs (dist, build)
- IDE files (.vscode, .idea)
- Logs and temporary files
- Database files
- Testing artifacts

## Quick Start

### Option 1: Postman (Recommended for Testing)

1. Import collection and environment into Postman
2. Select "SaverFox Local Environment"
3. Start services (Docker or manual)
4. Run "Register" request
5. Follow the user journey in order

### Option 2: Swagger UI (Recommended for Exploration)

1. Start services
2. Visit `http://localhost:3000/api/docs`
3. Click "Authorize" and enter token
4. Try endpoints directly in browser

## API Service Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with credentials

### Profile & Onboarding
- `POST /api/profile` - Create user profile
- `GET /api/characters/starter` - Get starter characters
- `POST /api/characters/choose` - Choose starter character

### Wallet
- `GET /api/wallet` - Get wallet balance

### Shop
- `GET /api/shop/characters` - Browse characters
- `GET /api/shop/foods` - Browse food items
- `POST /api/shop/buy` - Purchase item
- `GET /api/shop/inventory` - View inventory

### Missions
- `GET /api/missions/today` - Get today's mission
- `POST /api/missions/log-expense` - Log expense
- `POST /api/missions/log-saving` - Log saving
- `GET /api/missions/expenses` - Get expense history
- `GET /api/missions/savings` - Get savings history

### Tamagotchi
- `GET /api/tamagotchi` - Get tamagotchi status
- `POST /api/tamagotchi/feed` - Feed tamagotchi

### Goals
- `POST /api/goals` - Create goal
- `GET /api/goals` - Get all goals
- `GET /api/goals/active` - Get active goals
- `GET /api/goals/completed` - Get completed goals
- `POST /api/goals/:id/progress` - Add progress
- `DELETE /api/goals/:id` - Delete goal

### Adventures
- `POST /api/adventure/generate` - Generate AI scenario
- `POST /api/adventure/submit-choice` - Submit choice
- `GET /api/adventure/:id` - Get specific adventure
- `GET /api/adventure` - Get adventure history

## AI Service Endpoints Summary

- `GET /health` - Health check
- `POST /v1/adventure/generate` - Generate money scenario
- `POST /v1/adventure/evaluate` - Evaluate player choice

## Testing Workflow

### Complete User Journey

1. **Register & Login**
   - Create account
   - Get JWT token

2. **Onboarding**
   - Create profile (age, allowance)
   - Choose starter character
   - Get initial tamagotchi

3. **Explore Shop**
   - Browse characters and foods
   - Purchase food items
   - Check inventory

4. **Daily Activities**
   - Check today's mission
   - Log expenses and savings
   - Complete mission for rewards

5. **Tamagotchi Care**
   - Check tamagotchi status
   - Feed with owned food
   - Monitor hunger/happiness

6. **Set Goals**
   - Create savings goal
   - Add progress
   - Complete goal for bonus

7. **Adventures**
   - Generate AI scenario
   - Make choice
   - Receive feedback and scores

## Environment Variables

### API Service
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=saverfox
DB_PASSWORD=your_password
DB_DATABASE=saverfox_db
JWT_SECRET=your_jwt_secret
AI_SERVICE_URL=http://localhost:8000
```

### AI Service
```env
ENVIRONMENT=development
PORT=8000
OPENAI_API_KEY=your_openai_key
OPIK_API_KEY=your_opik_key
OPIK_WORKSPACE=saverfox-ai
OPIK_PROJECT_NAME=money-adventures
```

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

Token is obtained from:
- `POST /api/auth/register` response
- `POST /api/auth/login` response

Default token expiration: 24 hours

## Response Formats

### Success Response
```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Success"
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET/PUT/DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable | Business logic error |
| 500 | Server Error | Internal error |

## Observability

### Opik Tracing

All AI operations include trace IDs:
- `generation_opik_trace_id` - Scenario generation trace
- `evaluation_opik_trace_id` - Choice evaluation trace

View traces at: `https://www.comet.com/opik`

### Logging

- API Service: NestJS Logger (structured logs)
- AI Service: Python logging (configurable levels)

## Additional Resources

- **Main README**: `backend/README.md`
- **API Service README**: `backend/apps/api-ts/README.md`
- **AI Service README**: `backend/apps/ai-python/README.md`
- **API Testing Guide**: `backend/API_TESTING_GUIDE.md`
- **Swagger Guide**: `backend/SWAGGER_GUIDE.md`
- **Swagger UI**: `http://localhost:3000/api/docs`
- **AI Service Docs**: `http://localhost:8000/docs`

## Support

For issues:
1. Check service logs
2. Review error messages in responses
3. Verify environment configuration
4. Check Opik traces for AI operations
5. Review service-specific READMEs

## Next Steps

1. Import Postman collection and environment
2. Start services with Docker Compose
3. Follow API Testing Guide for complete flow
4. Explore Swagger UI for interactive testing
5. Monitor Opik dashboard for AI operations
