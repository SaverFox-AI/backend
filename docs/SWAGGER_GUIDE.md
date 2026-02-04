# Swagger UI Guide

## Overview

Both services provide interactive API documentation through Swagger UI, allowing you to explore and test endpoints directly in your browser.

## Accessing Swagger UI

### API Service
```
http://localhost:3000/api/docs
```

### AI Service
```
http://localhost:8000/docs
```

## Features

### Interactive Testing
- **Try It Out**: Execute API calls directly from the browser
- **Request Builder**: Fill in parameters and request bodies
- **Response Viewer**: See actual responses with status codes
- **Schema Validation**: View request/response schemas

### Documentation
- **Endpoint Descriptions**: Detailed information for each endpoint
- **Parameter Details**: Required/optional parameters with types
- **Response Codes**: All possible HTTP status codes
- **Authentication**: JWT bearer token configuration

## Using Swagger UI

### 1. Authentication (API Service)

Most endpoints require authentication:

1. Click **Register** endpoint under "auth" tag
2. Click **Try it out**
3. Fill in the request body:
   ```json
   {
     "username": "testuser",
     "email": "test@example.com",
     "password": "SecurePass123"
   }
   ```
4. Click **Execute**
5. Copy the `token` from the response
6. Click **Authorize** button at the top
7. Enter: `Bearer <your-token>`
8. Click **Authorize**

Now all protected endpoints will include your token automatically.

### 2. Testing Endpoints

#### Example: Create Profile

1. Expand **POST /profile** under "profile" tag
2. Click **Try it out**
3. Edit the request body:
   ```json
   {
     "age": 10,
     "allowance": 10.00,
     "currency": "USD"
   }
   ```
4. Click **Execute**
5. View the response below

#### Example: Generate Adventure

1. Expand **POST /adventure/generate** under "adventure" tag
2. Click **Try it out**
3. Fill in the request:
   ```json
   {
     "context": "I want to learn about saving money"
   }
   ```
4. Click **Execute**
5. Copy the `adventureId` from response
6. Use it in **POST /adventure/submit-choice**

### 3. Exploring Schemas

Click on **Schemas** at the bottom to view all data models:
- Request DTOs (Data Transfer Objects)
- Response models
- Entity structures
- Validation rules

## API Service Tags

The API is organized by feature:

| Tag | Description | Endpoints |
|-----|-------------|-----------|
| **auth** | Authentication | Register, Login |
| **profile** | User profile & onboarding | Create profile, Choose character |
| **wallet** | Coin management | Get balance |
| **shop** | Shopping & inventory | Browse items, Purchase, View inventory |
| **missions** | Daily missions | Get mission, Log expense/saving |
| **tamagotchi** | Pet care | Get status, Feed |
| **goals** | Savings goals | Create, View, Update, Delete goals |
| **adventure** | AI scenarios | Generate, Submit choice, View history |

## AI Service Endpoints

The AI service has simpler documentation:

| Endpoint | Description |
|----------|-------------|
| **GET /health** | Health check |
| **POST /v1/adventure/generate** | Generate money scenario |
| **POST /v1/adventure/evaluate** | Evaluate player choice |

## Tips

### Testing Complete Flows

**User Onboarding:**
1. POST /auth/register
2. POST /profile
3. GET /characters/starter
4. POST /characters/choose

**Shopping:**
1. GET /shop/foods
2. POST /shop/buy
3. GET /shop/inventory
4. POST /tamagotchi/feed

**Adventure:**
1. POST /adventure/generate
2. POST /adventure/submit-choice
3. GET /adventure/{id}

### Validation Errors

If you get 400 errors:
- Check required fields are filled
- Verify data types match schema
- Review validation rules in schema

### Common Status Codes

| Code | Meaning | Common Cause |
|------|---------|--------------|
| 200 | Success | Request completed |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid token |
| 404 | Not Found | Resource doesn't exist |
| 422 | Unprocessable | Business logic error |
| 500 | Server Error | Internal server issue |

## Advantages Over Postman

### When to Use Swagger UI:
- Quick endpoint exploration
- View all available endpoints at once
- Check request/response schemas
- No setup required
- Share documentation with team

### When to Use Postman:
- Complex test scenarios
- Automated testing with scripts
- Environment management
- Collection organization
- Team collaboration

## Customization

The Swagger configuration is in `apps/api-ts/src/main.ts`:

```typescript
const config = new DocumentBuilder()
  .setTitle('SaverFox API Service')
  .setDescription('...')
  .setVersion('1.0.0')
  .addTag('auth', 'Authentication endpoints')
  // ... more tags
  .addBearerAuth()
  .build();
```

To customize:
1. Edit the DocumentBuilder configuration
2. Add/modify tags
3. Update endpoint decorators in controllers
4. Restart the service

## Exporting OpenAPI Spec

To export the OpenAPI specification:

### API Service (Manual)
1. Visit `http://localhost:3000/api/docs-json`
2. Save the JSON response
3. Convert to YAML if needed

### AI Service (Automatic)
FastAPI automatically generates OpenAPI spec at:
- JSON: `http://localhost:8000/openapi.json`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Troubleshooting

### Swagger UI Not Loading
- Verify service is running
- Check browser console for errors
- Clear browser cache
- Try different browser

### Authorization Not Working
- Ensure token format is: `Bearer <token>`
- Check token hasn't expired (default: 24h)
- Re-login to get fresh token

### Endpoints Not Showing
- Verify controllers have `@ApiTags()` decorator
- Check endpoints have proper HTTP method decorators
- Restart service after code changes

## Additional Resources

- [Swagger Documentation](https://swagger.io/docs/)
- [NestJS OpenAPI](https://docs.nestjs.com/openapi/introduction)
- [FastAPI Documentation](https://fastapi.tiangolo.com/tutorial/metadata/)
- API Testing Guide: `API_TESTING_GUIDE.md`
- Postman Collection: `SaverFox-API.postman_collection.json`
