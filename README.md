# SaverFox AI Backend

A microservices-based backend system for an educational money management game designed to teach children financial literacy through interactive gameplay and AI-powered scenarios.

## Architecture

The system consists of two independent microservices:

```
backend/
├── apps/
│   ├── api-ts/          # TypeScript/NestJS API Service
│   └── ai-python/       # Python/FastAPI AI Service
```

### API Service (TypeScript/NestJS)
- **Port**: 3000
- **Responsibilities**: 
  - User authentication and session management
  - Game state management (wallet, inventory, missions)
  - Tamagotchi care and tracking
  - Shop and purchase transactions
  - Savings goals tracking
  - Adventure orchestration
- **Database**: PostgreSQL
- **Tech Stack**: NestJS, TypeORM, JWT, Jest, fast-check

### AI Service (Python/FastAPI)
- **Port**: 8000
- **Responsibilities**:
  - AI-powered money scenario generation
  - Player choice evaluation and feedback
  - Educational content creation
  - Observability with Opik tracing
- **Database**: Stateless (no database)
- **Tech Stack**: FastAPI, Pydantic, OpenAI, Opik, pytest, Hypothesis

## Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+ and Poetry
- **PostgreSQL** 14+
- **OpenAI API Key**
- **Opik API Key** (from Comet platform)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd backend
```

### 2. Set Up API Service

```bash
cd apps/api-ts

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials and JWT secret

# Set up database
createdb saverfox_db
npm run migration:run
npm run seed

# Start the service
npm run start:dev
```

API will be available at `http://localhost:3000`

### 3. Set Up AI Service

```bash
cd apps/ai-python

# Install dependencies
poetry install

# Configure environment
cp .env.example .env
# Edit .env with your OpenAI and Opik API keys

# Start the service
poetry run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

AI service will be available at `http://localhost:8000`

### 4. Verify Setup

- API Service: `http://localhost:3000/api/docs`
- AI Service: `http://localhost:8000/docs`

## Docker Compose Setup

For easier deployment, use Docker Compose to run all services:

```bash
# From the backend directory
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

This will start:
- PostgreSQL database on port 5432
- API service on port 3000
- AI service on port 8000

## Testing

### API Service Tests

```bash
cd apps/api-ts

# Run all tests
npm test

# Run with coverage
npm run test:cov

# Run property-based tests
npm test -- --testNamePattern="Property"

# Run E2E tests
npm run test:e2e
```

### AI Service Tests

```bash
cd apps/ai-python

# Run all tests
poetry run pytest

# Run with coverage
poetry run pytest --cov=app

# Run property-based tests only
poetry run pytest -m property

# Run unit tests only
poetry run pytest -m unit
```

## Testing Strategy

Both services employ a **dual testing approach**:

### 1. Unit Tests
- Specific examples demonstrating correct behavior
- Edge cases (empty inputs, boundary values, error conditions)
- Integration points between components
- Mocked external dependencies

### 2. Property-Based Tests
- Universal properties that hold for all inputs
- Comprehensive input coverage through randomization
- Invariant validation (e.g., wallet balance ≥ 0)
- Minimum 100 iterations per property test

**Property Test Examples:**
- **API Service**: Wallet balance never goes negative, purchases are atomic, authentication creates valid accounts
- **AI Service**: All responses include trace IDs, scores are in range [0, 1], validation rejects invalid inputs

## API Testing

### Postman Collection

A comprehensive Postman collection is available for testing all API endpoints:

**Files:**
- `SaverFox-API.postman_collection.json` - Complete API collection
- `SaverFox-API.postman_environment.json` - Environment variables
- `API_TESTING_GUIDE.md` - Detailed testing guide

**Quick Start:**
1. Import both files into Postman
2. Select "SaverFox Local Environment"
3. Start with Authentication → Register/Login
4. Follow the complete user journey in the collection

**Features:**
- Auto-saves tokens and IDs to environment
- Organized by feature (Auth, Profile, Wallet, Shop, etc.)
- Includes test scripts for validation
- Direct AI service endpoints for debugging

See `API_TESTING_GUIDE.md` for complete testing instructions.

### Swagger UI

Interactive API documentation with try-it-out functionality:
- **API Service**: `http://localhost:3000/api/docs`
- **AI Service**: `http://localhost:8000/docs`

## API Documentation

### API Service Endpoints

**Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

**Profile & Onboarding**
- `POST /api/profile` - Create user profile
- `GET /api/characters/starter` - Get starter characters
- `POST /api/characters/choose` - Choose starter character

**Game Features**
- `GET /api/wallet` - Get wallet balance
- `GET /api/shop/characters` - Browse characters
- `GET /api/shop/foods` - Browse food items
- `POST /api/shop/buy` - Purchase item
- `GET /api/missions/today` - Get today's mission
- `POST /api/missions/log-expense` - Log expense
- `POST /api/missions/log-saving` - Log saving
- `POST /api/tamagotchi/feed` - Feed Tamagotchi
- `POST /api/goals` - Create savings goal
- `GET /api/goals` - Get all goals
- `POST /api/goals/:id/progress` - Add progress to goal

**Adventures**
- `POST /api/adventure/generate` - Generate AI scenario
- `POST /api/adventure/submit-choice` - Submit choice for evaluation
- `GET /api/adventure/:id` - Get specific adventure
- `GET /api/adventure` - Get adventure history

### AI Service Endpoints

- `POST /v1/adventure/generate` - Generate money adventure scenario
- `POST /v1/adventure/evaluate` - Evaluate player choice

## Project Structure

```
backend/
├── apps/
│   ├── api-ts/                    # TypeScript API Service
│   │   ├── src/
│   │   │   ├── auth/              # Authentication module
│   │   │   ├── profile/           # Profile and onboarding
│   │   │   ├── wallet/            # Wallet management
│   │   │   ├── shop/              # Shop system
│   │   │   ├── mission/           # Daily missions
│   │   │   ├── tamagotchi/        # Tamagotchi care
│   │   │   ├── goal/              # Savings goals
│   │   │   ├── adventure/         # Adventure orchestration
│   │   │   ├── config/            # Configuration
│   │   │   ├── database/          # Migrations and seeds
│   │   │   └── main.ts            # Entry point
│   │   ├── test/                  # E2E tests
│   │   ├── package.json
│   │   ├── .env.example
│   │   └── README.md
│   │
│   └── ai-python/                 # Python AI Service
│       ├── src/
│       │   ├── main.py            # FastAPI entry point
│       │   ├── config.py          # Configuration
│       │   ├── models.py          # Pydantic models
│       │   ├── scenario_generator.py  # Scenario generation
│       │   ├── choice_evaluator.py    # Choice evaluation
│       │   ├── middleware.py      # Middleware
│       │   ├── exception_handlers.py  # Error handling
│       │   └── routers/           # API routes
│       ├── tests/
│       │   ├── test_models.py     # Model tests
│       │   └── test_api.py        # API tests
│       ├── pyproject.toml
│       ├── .env.example
│       └── README.md
│
├── docker-compose.yml             # Docker Compose configuration
└── README.md                      # This file
```

## Development Workflow

### 1. Feature Development

1. **API Service**: Implement endpoints, services, and database entities
2. **AI Service**: Implement AI logic and Opik tracing
3. **Write Tests**: Both unit and property-based tests
4. **Integration**: Test inter-service communication
5. **Documentation**: Update OpenAPI specs and README

### 2. Database Changes

```bash
cd apps/api-ts

# Generate migration
npm run migration:generate -- src/database/migrations/MigrationName

# Run migration
npm run migration:run

# Revert if needed
npm run migration:revert
```

### 3. Code Quality

**API Service:**
```bash
npm run lint        # ESLint
npm run format      # Prettier
npm test            # Run tests
```

**AI Service:**
```bash
poetry run black src tests      # Format
poetry run ruff check src       # Lint
poetry run mypy src             # Type check
poetry run pytest               # Run tests
```

## Environment Configuration

### API Service (.env)
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

### AI Service (.env)
```env
ENVIRONMENT=development
PORT=8000
OPENAI_API_KEY=your_openai_key
OPIK_API_KEY=your_opik_key
OPIK_WORKSPACE=saverfox-ai
OPIK_PROJECT_NAME=money-adventures
```

## Observability

### Opik Integration

The AI service integrates with Opik (Comet platform) for comprehensive observability:

- **Trace Generation**: Every AI operation creates a trace
- **Metadata**: User context, choices, amounts, scores
- **Metrics**: Financial literacy scores logged for analysis
- **Correlation**: Trace IDs stored in database for debugging

Access traces at: `https://www.comet.com/opik`

### Logging

- **API Service**: Structured logging with NestJS Logger
- **AI Service**: Python logging with configurable levels
- **Log Levels**: DEBUG, INFO, WARN, ERROR

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production` for API service
- [ ] Set `ENVIRONMENT=production` for AI service
- [ ] Use strong `JWT_SECRET`
- [ ] Configure production database credentials
- [ ] Set up database backups
- [ ] Configure CORS for production domains
- [ ] Set up monitoring and alerting
- [ ] Configure Opik for production workspace
- [ ] Set up SSL/TLS certificates
- [ ] Configure rate limiting
- [ ] Set up log aggregation

### Docker Deployment

```bash
# Build images
docker-compose build

# Run in production mode
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale api=3 --scale ai=2
```

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `.env`
- Ensure database exists: `createdb saverfox_db`

**AI Service Not Responding**
- Check AI service is running: `curl http://localhost:8000/docs`
- Verify `AI_SERVICE_URL` in API service `.env`
- Check OpenAI API key is valid

**Migration Errors**
- Check migration files in `apps/api-ts/src/database/migrations/`
- Try reverting: `npm run migration:revert`
- Verify database schema manually

**Test Failures**
- Ensure test database is set up
- Check mock configurations
- Run with verbose output: `npm test -- --verbose`

## Contributing

1. Create a feature branch
2. Implement changes with tests
3. Ensure all tests pass
4. Update documentation
5. Submit pull request

## License

MIT

## Documentation

### Complete Documentation Set

- **API Testing Guide**: `API_TESTING_GUIDE.md` - Comprehensive Postman testing guide
- **Swagger Guide**: `SWAGGER_GUIDE.md` - Interactive API documentation guide
- **API Documentation Summary**: `docs/API_DOCUMENTATION_SUMMARY.md` - Quick reference
- **API Service README**: `apps/api-ts/README.md` - TypeScript service details
- **AI Service README**: `apps/ai-python/README.md` - Python service details
- **Implementation Summary**: `docs/IMPLEMENTATION_SUMMARY.md` - Development history

### Quick Links

- **Postman Collection**: `SaverFox-API.postman_collection.json`
- **Postman Environment**: `SaverFox-API.postman_environment.json`
- **Swagger UI**: http://localhost:3000/api/docs
- **AI Service Docs**: http://localhost:8000/docs

## Support

For issues and questions:
- Check service-specific READMEs in `apps/api-ts/` and `apps/ai-python/`
- Review API documentation at `/docs` endpoints
- Check Opik traces for AI service debugging
- See `API_TESTING_GUIDE.md` for testing help
