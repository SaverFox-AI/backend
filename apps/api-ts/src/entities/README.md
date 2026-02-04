# Entities

This directory contains TypeORM entity definitions for the SaverFox AI Backend.

## Overview

Entities are TypeScript classes decorated with TypeORM decorators that map to database tables. They also include class-validator decorators for runtime validation.

## Entities

### User Entity (`user.entity.ts`)

Represents a user account in the system.

**Fields:**
- `id` (UUID): Primary key, auto-generated
- `username` (string): Unique username, 3-50 characters
- `email` (string): Unique email address, validated format
- `passwordHash` (string): Bcrypt hashed password
- `createdAt` (timestamp): Auto-generated creation timestamp
- `updatedAt` (timestamp): Auto-updated modification timestamp

**Relationships:**
- One-to-One with Profile

**Validation:**
- Username: Required, 3-50 characters, non-empty
- Email: Required, valid email format, max 255 characters
- Password Hash: Required, non-empty

### Profile Entity (`profile.entity.ts`)

Represents a user's profile information.

**Fields:**
- `id` (UUID): Primary key, auto-generated
- `userId` (UUID): Foreign key to users table
- `age` (integer): User's age, 5-18 years
- `allowance` (decimal): User's allowance amount, positive value with max 2 decimal places
- `currency` (string): Currency code, exactly 3 characters (e.g., USD, EUR)
- `onboardingCompleted` (boolean): Whether user has completed onboarding
- `createdAt` (timestamp): Auto-generated creation timestamp
- `updatedAt` (timestamp): Auto-updated modification timestamp

**Relationships:**
- One-to-One with User (CASCADE delete)

**Validation:**
- User ID: Required, non-empty
- Age: Required, integer, 5-18 range
- Allowance: Required, positive number, max 2 decimal places
- Currency: Required, exactly 3 characters
- Onboarding Completed: Boolean

## Usage

### Importing Entities

```typescript
import { User, Profile } from './entities';
```

### Creating a User

```typescript
const user = new User();
user.username = 'johndoe';
user.email = 'john@example.com';
user.passwordHash = await bcrypt.hash('password', 10);

await userRepository.save(user);
```

### Creating a Profile

```typescript
const profile = new Profile();
profile.userId = user.id;
profile.age = 12;
profile.allowance = 25.00;
profile.currency = 'USD';
profile.onboardingCompleted = false;

await profileRepository.save(profile);
```

### Validation

Entities use class-validator decorators. To validate an entity:

```typescript
import { validate } from 'class-validator';

const user = new User();
user.username = 'test';
user.email = 'invalid-email'; // Invalid format

const errors = await validate(user);
if (errors.length > 0) {
  console.log('Validation failed:', errors);
}
```

## Database Schema

The entities map to the following database tables created by migrations:

- `users` table (migration: `1704000000000-CreateUsersAndProfiles.ts`)
- `profiles` table (migration: `1704000000000-CreateUsersAndProfiles.ts`)

## Testing

Unit tests for entities are located in:
- `user.entity.spec.ts`
- `profile.entity.spec.ts`

Run tests with:
```bash
npm test -- --testPathPattern="entities/.*\.spec\.ts$"
```

## Requirements Mapping

- **Requirement 1.1**: User authentication - User entity stores credentials
- **Requirement 2.1**: User profile - Profile entity stores user details
- **Requirement 10.2**: Database migrations - Entities match migration schemas

## Notes

- All entities use UUID primary keys for better scalability
- Timestamps are automatically managed by TypeORM
- Column names use snake_case in the database but camelCase in TypeScript
- Foreign key relationships include CASCADE delete for data integrity
- Validation decorators ensure data quality before database operations
