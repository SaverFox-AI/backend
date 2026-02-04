# SaverFox API Service (TypeScript/NestJS)

The TypeScript API service handles authentication, user profiles, game state management, and orchestrates calls to the AI service for educational money scenarios.

## Features

- **Authentication**: User registration and JWT-based login
- **Profile & Onboarding**: User profile creation and starter character selection
- **Wallet Management**: Virtual currency balance and transaction tracking
- **Shop System**: Browse and purchase characters and food items
- **Daily Missions**: Track expenses and savings to earn rewards
- **Tamagotchi Care**: Feed and maintain virtual pet companions
- **Savings Goals**: Set and track financial goals with bonus rewards
- **Money Adventures**: AI-generated financial scenarios with evaluation

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Running AI service (for adventure features)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file and update with your configuration:

```bash
cp .env.example .env
```

Required environment variables:
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`: PostgreSQL connection
- `JWT_SECRET`: Secret key for JWT token signing
- `AI_SERVICE_URL`: URL of the Python AI service

### 3. Set Up Database

Create the PostgreSQL database:

```bash
createdb saverfox_db
```

Run migrations to create tables:

```bash
npm run migration:run
```

Seed initial data (starter characters, foods, missions):

```bash
npm run seed
```

### 4. Run the Service

Development mode with hot reload:

```bash
npm run start:dev
```

Production mode:

```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000` (or your configured PORT).

## API Documentation

Once running, access the interactive API documentation at:
- Swagger UI: `http://localhost:3000/api/docs`
- OpenAPI JSON: `http://localhost:3000/api/docs-json`

## Testing

Run all tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:cov
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run end-to-end tests:

```bash
npm run test:e2e
```

### Testing Strategy

The project uses a dual testing approach:

1. **Unit Tests**: Specific examples and edge cases
2. **Property-Based Tests**: Universal properties using fast-check (100+ iterations)

Property tests validate correctness properties like:
- Wallet balance never goes negative
- Purchases are atomic (all-or-nothing)
- Authentication creates valid accounts
- Mission completion awards coins

## Database Migrations

Generate a new migration:

```bash
npm run migration:generate -- src/database/migrations/MigrationName
```

Run pending migrations:

```bash
npm run migration:run
```

Revert last migration:

```bash
npm run migration:revert
```

## Project Structure

```
src/
├── auth/              # Authentication module (registration, login, JWT)
├── profile/           # User profile and onboarding
├── wallet/            # Wallet and transaction management
├── shop/              # Shop browsing and purchases
├── mission/           # Daily missions and logging
├── tamagotchi/        # Tamagotchi care and state
├── goal/              # Savings goals tracking
├── adventure/         # Adventure orchestration with AI service
├── config/            # Configuration and database setup
├── database/          # Migrations and seeds
└── main.ts            # Application entry point
```

## Key Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Profile & Onboarding
- `POST /api/profile` - Create user profile
- `GET /api/characters/starter` - Get starter characters
- `POST /api/characters/choose` - Choose starter character

### Wallet
- `GET /api/wallet` - Get current balance

### Shop
- `GET /api/shop/characters` - Browse characters
- `GET /api/shop/foods` - Browse food items
- `POST /api/shop/buy` - Purchase item

### Missions
- `GET /api/missions/today` - Get today's mission
- `POST /api/missions/log-expense` - Log an expense
- `POST /api/missions/log-saving` - Log a saving

### Tamagotchi
- `POST /api/tamagotchi/feed` - Feed your Tamagotchi

### Goals
- `POST /api/goals` - Create a savings goal
- `GET /api/goals` - Get all goals
- `POST /api/goals/:id/progress` - Add progress to goal

### Adventures
- `POST /api/adventure/generate` - Generate AI scenario
- `POST /api/adventure/submit-choice` - Submit choice for evaluation
- `GET /api/adventure/:id` - Get specific adventure
- `GET /api/adventure` - Get adventure history

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 3000 |
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_USERNAME` | Database username | saverfox |
| `DB_PASSWORD` | Database password | - |
| `DB_DATABASE` | Database name | saverfox_db |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRATION` | JWT token expiration | 24h |
| `AI_SERVICE_URL` | AI service URL | http://localhost:8000 |
| `AI_SERVICE_TIMEOUT` | AI service timeout (ms) | 30000 |
| `AI_SERVICE_MAX_RETRIES` | Max retry attempts for AI service | 3 |
| `AI_SERVICE_RETRY_DELAY` | Initial retry delay (ms) | 1000 |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:3001 |
| `LOG_LEVEL` | Logging level | debug |

## Error Handling

The API uses consistent error response format across all endpoints:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/endpoint",
  "validationErrors": [
    {
      "field": "fieldName",
      "message": "Error message"
    }
  ]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `422` - Unprocessable Entity (business logic error)
- `500` - Internal Server Error
- `503` - Service Unavailable (AI service down)

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check connection credentials in `.env`
- Ensure database exists: `psql -l`

### Migration Errors
- Check migration files in `src/database/migrations/`
- Verify TypeORM configuration in `src/config/data-source.ts`
- Try reverting and re-running: `npm run migration:revert && npm run migration:run`

### AI Service Connection
- Verify AI service is running at configured URL
- Check `AI_SERVICE_URL` in `.env`
- Review AI service logs for errors

## License

MIT
