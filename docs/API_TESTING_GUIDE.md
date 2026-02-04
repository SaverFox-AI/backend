# SaverFox API Testing Guide

## Postman Collection

This guide explains how to use the Postman collection to test the SaverFox API.

## Setup

### 1. Import Collection and Environment

1. Open Postman
2. Click **Import** button
3. Import `SaverFox-API.postman_collection.json`
4. Import `SaverFox-API.postman_environment.json`
5. Select "SaverFox Local Environment" from the environment dropdown

### 2. Start Services

Make sure both services are running:

```bash
# Start with Docker Compose
docker-compose up

# Or start individually
cd apps/api-ts
npm run start:dev

cd apps/ai-python
uvicorn src.main:app --reload --port 8000
```

## Testing Flow

### Complete User Journey

Follow this sequence to test the complete user flow:

#### 1. Authentication
- **Register** - Creates new user account
  - Auto-saves `userId` and `token` to environment
- **Login** - Authenticates existing user
  - Auto-saves `userId` and `token` to environment

#### 2. Profile & Onboarding
- **Create Profile** - Set age, allowance, currency
  - Auto-saves `profileId`
- **Get Starter Characters** - View available starter characters
  - Auto-saves first `characterId`
- **Choose Starter Character** - Select and create tamagotchi
  - Completes onboarding

#### 3. Wallet
- **Get Wallet Balance** - Check current coins

#### 4. Shop
- **Get Characters** - Browse purchasable characters
  - Auto-saves first `shopCharacterId`
- **Get Foods** - Browse food items
  - Auto-saves first `foodId`
- **Buy Item** - Purchase food or character
- **Get Inventory** - View owned items

#### 5. Missions
- **Get Today's Mission** - View active daily mission
- **Log Expense** - Record spending
- **Log Saving** - Record savings
- **Get Expenses** - View expense history
- **Get Savings** - View savings history

#### 6. Tamagotchi
- **Get Tamagotchi** - Check tamagotchi status
- **Feed Tamagotchi** - Feed with owned food

#### 7. Goals
- **Create Goal** - Set savings target
  - Auto-saves `goalId`
- **Get All Goals** - View all goals
- **Get Active Goals** - View incomplete goals
- **Get Completed Goals** - View achieved goals
- **Add Progress to Goal** - Add money to goal
- **Delete Goal** - Remove a goal

#### 8. Adventures
- **Generate Adventure** - Create AI scenario
  - Auto-saves `adventureId`
- **Submit Choice** - Evaluate decision
- **Get Adventure** - View specific adventure
- **Get Adventure History** - View all adventures

#### 9. AI Service (Direct)
- **Health Check** - Verify AI service status
- **Generate Adventure (Direct)** - Test AI generation
- **Evaluate Choice (Direct)** - Test AI evaluation

## Environment Variables

The environment automatically manages these variables:

| Variable | Description | Auto-set |
|----------|-------------|----------|
| `baseUrl` | API service URL | Manual |
| `aiServiceUrl` | AI service URL | Manual |
| `token` | JWT authentication token | Auto (Register/Login) |
| `userId` | Current user ID | Auto (Register/Login) |
| `profileId` | User profile ID | Auto (Create Profile) |
| `characterId` | Starter character ID | Auto (Get Starter Characters) |
| `shopCharacterId` | Shop character ID | Auto (Get Characters) |
| `foodId` | Food item ID | Auto (Get Foods) |
| `goalId` | Savings goal ID | Auto (Create Goal) |
| `adventureId` | Adventure ID | Auto (Generate Adventure) |

## Authentication

Most endpoints require authentication. The collection automatically:
1. Saves JWT token from Register/Login responses
2. Includes token in Authorization header for protected endpoints

If you get 401 errors, run Register or Login again to refresh the token.

## Tips

### Testing Different Users
1. Change username/email in Register request
2. Run Register to create new user
3. All subsequent requests use the new user's token

### Testing Edge Cases
- **Insufficient Funds**: Try buying expensive items
- **Invalid Items**: Use non-existent IDs
- **Validation Errors**: Send incomplete/invalid data

### Monitoring AI Operations
- Check Opik dashboard for trace IDs
- Adventure responses include `generation_opik_trace_id`
- Evaluation responses include `evaluation_opik_trace_id`

## Swagger UI

Alternative to Postman, use the interactive API documentation:

```
http://localhost:3000/api/docs
```

Features:
- Try endpoints directly in browser
- View request/response schemas
- See validation requirements
- Test authentication

## Troubleshooting

### Connection Refused
- Verify services are running
- Check ports 3000 (API) and 8000 (AI) are available
- Review Docker logs: `docker-compose logs`

### 401 Unauthorized
- Token expired or invalid
- Run Login again to get fresh token

### 422 Validation Error
- Check request body matches schema
- Review error message for specific field issues

### 500 Internal Server Error
- Check service logs
- Verify database connection
- Ensure AI service (OpenAI) credentials are configured

## API Documentation

For detailed endpoint documentation, see:
- Swagger UI: `http://localhost:3000/api/docs`
- API Service README: `apps/api-ts/README.md`
- AI Service README: `apps/ai-python/README.md`
