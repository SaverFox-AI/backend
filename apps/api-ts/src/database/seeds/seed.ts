import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import dataSource from '../../config/data-source';

// Load environment variables
config();

/**
 * Seed Script for Initial Game Data
 * 
 * Seeds the database with:
 * - 3 starter characters (Foxy, Penny, Buddy)
 * - 5 food items with varying nutrition and prices
 * - 3 initial daily missions
 * 
 * Requirements: 10.3
 */

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // Initialize data source
    await dataSource.initialize();
    console.log('✅ Database connection established');

    // Seed starter characters
    console.log('📦 Seeding starter characters...');
    await dataSource.query(`
      INSERT INTO characters (name, image_url, is_starter, price) VALUES
      ('Foxy the Fox', '/images/characters/foxy.png', true, 0),
      ('Penny the Penguin', '/images/characters/penny.png', true, 0),
      ('Buddy the Bear', '/images/characters/buddy.png', true, 0)
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Starter characters seeded');

    // Seed food items
    console.log('📦 Seeding food items...');
    await dataSource.query(`
      INSERT INTO foods (name, nutrition_value, price, image_url) VALUES
      ('Apple', 10, 5, '/images/foods/apple.png'),
      ('Sandwich', 25, 10, '/images/foods/sandwich.png'),
      ('Pizza Slice', 30, 15, '/images/foods/pizza.png'),
      ('Salad', 20, 12, '/images/foods/salad.png'),
      ('Ice Cream', 15, 8, '/images/foods/icecream.png')
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Food items seeded');

    // Seed initial missions
    console.log('📦 Seeding initial missions...');
    const today = new Date().toISOString().split('T')[0];
    
    await dataSource.query(`
      INSERT INTO missions (title, description, mission_type, requirements, reward_coins, active_date) VALUES
      (
        'Track Your Spending',
        'Log 3 expenses to understand where your money goes',
        'expense_tracking',
        '{"expense_count": 3}'::jsonb,
        10,
        '${today}'
      ),
      (
        'Start Saving',
        'Log 1 saving entry to begin building your savings habit',
        'saving_tracking',
        '{"saving_count": 1}'::jsonb,
        15,
        '${today}'
      ),
      (
        'Feed Your Pet',
        'Feed your tamagotchi once to keep it happy and healthy',
        'tamagotchi_care',
        '{"feed_count": 1}'::jsonb,
        5,
        '${today}'
      )
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Initial missions seeded');

    // Close connection
    await dataSource.destroy();
    console.log('✅ Database connection closed');
    console.log('🎉 Seeding completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

// Run seed function
seed();
