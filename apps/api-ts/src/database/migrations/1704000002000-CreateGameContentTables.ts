import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

/**
 * Migration: Create Game Content Tables
 * 
 * Creates tables for shop items and user inventory:
 * - characters: Available tamagotchi characters with pricing
 * - foods: Food items for feeding tamagotchis
 * - user_inventory: Tracks items owned by users
 * 
 * Requirements: 10.2
 */
export class CreateGameContentTables1704000002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create characters table
    await queryRunner.createTable(
      new Table({
        name: 'characters',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'image_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_starter',
            type: 'boolean',
            default: false,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create foods table
    await queryRunner.createTable(
      new Table({
        name: 'foods',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'nutrition_value',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'image_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create user_inventory table
    await queryRunner.createTable(
      new Table({
        name: 'user_inventory',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'item_type',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'item_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'quantity',
            type: 'integer',
            default: 1,
          },
          {
            name: 'acquired_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create foreign key from user_inventory to users
    await queryRunner.createForeignKey(
      'user_inventory',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes for better query performance
    await queryRunner.query(
      `CREATE INDEX "IDX_characters_is_starter" ON "characters" ("is_starter")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_inventory_user_id" ON "user_inventory" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_inventory_item_type_item_id" ON "user_inventory" ("item_type", "item_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key
    const table = await queryRunner.getTable('user_inventory');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('user_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('user_inventory', foreignKey);
    }

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_characters_is_starter"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_inventory_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_inventory_item_type_item_id"`);

    // Drop tables
    await queryRunner.dropTable('user_inventory');
    await queryRunner.dropTable('foods');
    await queryRunner.dropTable('characters');
  }
}
