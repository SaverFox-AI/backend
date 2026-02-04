import { validate } from 'class-validator';
import { Profile } from './profile.entity';

describe('Profile Entity', () => {
  describe('Entity Structure', () => {
    it('should create a profile instance with all required fields', () => {
      const profile = new Profile();
      profile.userId = '123e4567-e89b-12d3-a456-426614174000';
      profile.age = 10;
      profile.allowance = 25.50;
      profile.currency = 'USD';
      profile.onboardingCompleted = false;

      expect(profile).toBeDefined();
      expect(profile.userId).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(profile.age).toBe(10);
      expect(profile.allowance).toBe(25.50);
      expect(profile.currency).toBe('USD');
      expect(profile.onboardingCompleted).toBe(false);
    });

    it('should have proper column mappings', () => {
      const profile = new Profile();
      profile.userId = '123e4567-e89b-12d3-a456-426614174000';
      profile.age = 10;
      profile.allowance = 25.50;
      profile.currency = 'USD';
      profile.onboardingCompleted = false;
      
      // Verify camelCase properties exist
      expect(profile).toHaveProperty('userId');
      expect(profile.userId).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(profile).toHaveProperty('onboardingCompleted');
      expect(profile.onboardingCompleted).toBe(false);
    });
  });

  describe('Validation', () => {
    it('should pass validation with valid data', async () => {
      const profile = new Profile();
      profile.userId = '123e4567-e89b-12d3-a456-426614174000';
      profile.age = 12;
      profile.allowance = 30.00;
      profile.currency = 'USD';
      profile.onboardingCompleted = false;

      const errors = await validate(profile);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with empty userId', async () => {
      const profile = new Profile();
      profile.userId = '';
      profile.age = 10;
      profile.allowance = 25.00;
      profile.currency = 'USD';

      const errors = await validate(profile);
      expect(errors.length).toBeGreaterThan(0);
      const userIdError = errors.find(e => e.property === 'userId');
      expect(userIdError).toBeDefined();
    });

    it('should fail validation with age below minimum (5)', async () => {
      const profile = new Profile();
      profile.userId = '123e4567-e89b-12d3-a456-426614174000';
      profile.age = 4;
      profile.allowance = 25.00;
      profile.currency = 'USD';

      const errors = await validate(profile);
      expect(errors.length).toBeGreaterThan(0);
      const ageError = errors.find(e => e.property === 'age');
      expect(ageError).toBeDefined();
    });

    it('should fail validation with age above maximum (18)', async () => {
      const profile = new Profile();
      profile.userId = '123e4567-e89b-12d3-a456-426614174000';
      profile.age = 19;
      profile.allowance = 25.00;
      profile.currency = 'USD';

      const errors = await validate(profile);
      expect(errors.length).toBeGreaterThan(0);
      const ageError = errors.find(e => e.property === 'age');
      expect(ageError).toBeDefined();
    });

    it('should fail validation with non-integer age', async () => {
      const profile = new Profile();
      profile.userId = '123e4567-e89b-12d3-a456-426614174000';
      profile.age = 10.5;
      profile.allowance = 25.00;
      profile.currency = 'USD';

      const errors = await validate(profile);
      expect(errors.length).toBeGreaterThan(0);
      const ageError = errors.find(e => e.property === 'age');
      expect(ageError).toBeDefined();
    });

    it('should fail validation with negative allowance', async () => {
      const profile = new Profile();
      profile.userId = '123e4567-e89b-12d3-a456-426614174000';
      profile.age = 10;
      profile.allowance = -5.00;
      profile.currency = 'USD';

      const errors = await validate(profile);
      expect(errors.length).toBeGreaterThan(0);
      const allowanceError = errors.find(e => e.property === 'allowance');
      expect(allowanceError).toBeDefined();
    });

    it('should fail validation with zero allowance', async () => {
      const profile = new Profile();
      profile.userId = '123e4567-e89b-12d3-a456-426614174000';
      profile.age = 10;
      profile.allowance = 0;
      profile.currency = 'USD';

      const errors = await validate(profile);
      expect(errors.length).toBeGreaterThan(0);
      const allowanceError = errors.find(e => e.property === 'allowance');
      expect(allowanceError).toBeDefined();
    });

    it('should fail validation with allowance having more than 2 decimal places', async () => {
      const profile = new Profile();
      profile.userId = '123e4567-e89b-12d3-a456-426614174000';
      profile.age = 10;
      profile.allowance = 25.123; // 3 decimal places
      profile.currency = 'USD';

      const errors = await validate(profile);
      expect(errors.length).toBeGreaterThan(0);
      const allowanceError = errors.find(e => e.property === 'allowance');
      expect(allowanceError).toBeDefined();
    });

    it('should fail validation with currency not exactly 3 characters', async () => {
      const profile = new Profile();
      profile.userId = '123e4567-e89b-12d3-a456-426614174000';
      profile.age = 10;
      profile.allowance = 25.00;
      profile.currency = 'US'; // Only 2 characters

      const errors = await validate(profile);
      expect(errors.length).toBeGreaterThan(0);
      const currencyError = errors.find(e => e.property === 'currency');
      expect(currencyError).toBeDefined();
    });

    it('should fail validation with invalid onboardingCompleted type', async () => {
      const profile = new Profile();
      profile.userId = '123e4567-e89b-12d3-a456-426614174000';
      profile.age = 10;
      profile.allowance = 25.00;
      profile.currency = 'USD';
      profile.onboardingCompleted = 'true' as any; // String instead of boolean

      const errors = await validate(profile);
      expect(errors.length).toBeGreaterThan(0);
      const onboardingError = errors.find(e => e.property === 'onboardingCompleted');
      expect(onboardingError).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should accept age at minimum boundary (5)', async () => {
      const profile = new Profile();
      profile.userId = '123e4567-e89b-12d3-a456-426614174000';
      profile.age = 5;
      profile.allowance = 10.00;
      profile.currency = 'USD';
      profile.onboardingCompleted = false;

      const errors = await validate(profile);
      expect(errors.length).toBe(0);
    });

    it('should accept age at maximum boundary (18)', async () => {
      const profile = new Profile();
      profile.userId = '123e4567-e89b-12d3-a456-426614174000';
      profile.age = 18;
      profile.allowance = 50.00;
      profile.currency = 'USD';
      profile.onboardingCompleted = false;

      const errors = await validate(profile);
      expect(errors.length).toBe(0);
    });

    it('should accept allowance with 2 decimal places', async () => {
      const profile = new Profile();
      profile.userId = '123e4567-e89b-12d3-a456-426614174000';
      profile.age = 10;
      profile.allowance = 25.99;
      profile.currency = 'USD';
      profile.onboardingCompleted = false;

      const errors = await validate(profile);
      expect(errors.length).toBe(0);
    });

    it('should accept allowance with 1 decimal place', async () => {
      const profile = new Profile();
      profile.userId = '123e4567-e89b-12d3-a456-426614174000';
      profile.age = 10;
      profile.allowance = 25.5;
      profile.currency = 'USD';
      profile.onboardingCompleted = false;

      const errors = await validate(profile);
      expect(errors.length).toBe(0);
    });

    it('should accept allowance with no decimal places', async () => {
      const profile = new Profile();
      profile.userId = '123e4567-e89b-12d3-a456-426614174000';
      profile.age = 10;
      profile.allowance = 25;
      profile.currency = 'USD';
      profile.onboardingCompleted = false;

      const errors = await validate(profile);
      expect(errors.length).toBe(0);
    });

    it('should accept different currency codes', async () => {
      const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];
      
      for (const currency of currencies) {
        const profile = new Profile();
        profile.userId = '123e4567-e89b-12d3-a456-426614174000';
        profile.age = 10;
        profile.allowance = 25.00;
        profile.currency = currency;
        profile.onboardingCompleted = false;

        const errors = await validate(profile);
        expect(errors.length).toBe(0);
      }
    });

    it('should accept onboardingCompleted as true', async () => {
      const profile = new Profile();
      profile.userId = '123e4567-e89b-12d3-a456-426614174000';
      profile.age = 10;
      profile.allowance = 25.00;
      profile.currency = 'USD';
      profile.onboardingCompleted = true;

      const errors = await validate(profile);
      expect(errors.length).toBe(0);
    });

    it('should accept onboardingCompleted as false', async () => {
      const profile = new Profile();
      profile.userId = '123e4567-e89b-12d3-a456-426614174000';
      profile.age = 10;
      profile.allowance = 25.00;
      profile.currency = 'USD';
      profile.onboardingCompleted = false;

      const errors = await validate(profile);
      expect(errors.length).toBe(0);
    });

    it('should accept very large allowance values', async () => {
      const profile = new Profile();
      profile.userId = '123e4567-e89b-12d3-a456-426614174000';
      profile.age = 18;
      profile.allowance = 99999999.99; // Maximum for decimal(10,2)
      profile.currency = 'USD';
      profile.onboardingCompleted = false;

      const errors = await validate(profile);
      expect(errors.length).toBe(0);
    });

    it('should accept minimum positive allowance', async () => {
      const profile = new Profile();
      profile.userId = '123e4567-e89b-12d3-a456-426614174000';
      profile.age = 10;
      profile.allowance = 0.01; // Minimum positive value
      profile.currency = 'USD';
      profile.onboardingCompleted = false;

      const errors = await validate(profile);
      expect(errors.length).toBe(0);
    });
  });
});
