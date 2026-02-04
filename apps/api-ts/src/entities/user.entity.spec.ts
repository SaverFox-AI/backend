import { validate } from 'class-validator';
import { User } from './user.entity';

describe('User Entity', () => {
  describe('Entity Structure', () => {
    it('should create a user instance with all required fields', () => {
      const user = new User();
      user.username = 'testuser';
      user.email = 'test@example.com';
      user.passwordHash = 'hashed_password_123';

      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      expect(user.passwordHash).toBe('hashed_password_123');
    });

    it('should have proper column mappings', () => {
      const user = new User();
      user.username = 'testuser';
      user.email = 'test@example.com';
      user.passwordHash = 'hashed_password';
      
      // Verify camelCase properties exist
      expect(user).toHaveProperty('passwordHash');
      expect(user.passwordHash).toBe('hashed_password');
    });
  });

  describe('Validation', () => {
    it('should pass validation with valid data', async () => {
      const user = new User();
      user.username = 'validuser';
      user.email = 'valid@example.com';
      user.passwordHash = 'hashed_password';

      const errors = await validate(user);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with empty username', async () => {
      const user = new User();
      user.username = '';
      user.email = 'test@example.com';
      user.passwordHash = 'hashed_password';

      const errors = await validate(user);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('username');
    });

    it('should fail validation with short username', async () => {
      const user = new User();
      user.username = 'ab'; // Less than 3 characters
      user.email = 'test@example.com';
      user.passwordHash = 'hashed_password';

      const errors = await validate(user);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('username');
    });

    it('should fail validation with long username', async () => {
      const user = new User();
      user.username = 'a'.repeat(51); // More than 50 characters
      user.email = 'test@example.com';
      user.passwordHash = 'hashed_password';

      const errors = await validate(user);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('username');
    });

    it('should fail validation with invalid email', async () => {
      const user = new User();
      user.username = 'testuser';
      user.email = 'invalid-email';
      user.passwordHash = 'hashed_password';

      const errors = await validate(user);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should fail validation with empty email', async () => {
      const user = new User();
      user.username = 'testuser';
      user.email = '';
      user.passwordHash = 'hashed_password';

      const errors = await validate(user);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should fail validation with empty password hash', async () => {
      const user = new User();
      user.username = 'testuser';
      user.email = 'test@example.com';
      user.passwordHash = '';

      const errors = await validate(user);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('passwordHash');
    });
  });

  describe('Edge Cases', () => {
    it('should accept username at minimum length (3 characters)', async () => {
      const user = new User();
      user.username = 'abc';
      user.email = 'test@example.com';
      user.passwordHash = 'hashed_password';

      const errors = await validate(user);
      expect(errors.length).toBe(0);
    });

    it('should accept username at maximum length (50 characters)', async () => {
      const user = new User();
      user.username = 'a'.repeat(50);
      user.email = 'test@example.com';
      user.passwordHash = 'hashed_password';

      const errors = await validate(user);
      expect(errors.length).toBe(0);
    });

    it('should accept valid long email', async () => {
      const user = new User();
      user.username = 'testuser';
      // Create a valid email that's reasonably long
      const localPart = 'a'.repeat(50);
      user.email = `${localPart}@example.com`;
      user.passwordHash = 'hashed_password';

      const errors = await validate(user);
      expect(errors.length).toBe(0);
    });
  });
});
