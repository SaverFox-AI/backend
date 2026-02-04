import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableCheck } from 'typeorm';

/**
 * Migration: Create Tamagotchis Table
 * 
 * Creates table for managing user's virtual pet tamagotchis:
 * - tamagotchis: Stores tamagotchi state with stat constraints (0-100)
 * 
 * Requirements: 10.2
 */
export class CreateTamagotchisTable1704000003000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create tamagotchis table
    await queryRunner.createTable(
      new Table({
        name: 'tamagotchis',
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
            name: 'character_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'hunger',
            type: 'integer',
            default: 50,
            isNullable: false,
          },
          {
            name: 'happiness',
            type: 'integer',
            default: 50,
            isNullable: false,
          },
          {
            name: 'health',
            type: 'integer',
            default: 100,
            isNullable: false,
          },
          {
            name: 'last_fed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Add CHECK constraints to ensure stats are within valid range (0-100)
    await queryRunner.createCheckConstraint(
      'tamagotchis',
      new TableCheck({
        name: 'CHK_tamagotchis_hunger_range',
        expression: 'hunger >= 0 AND hunger <= 100',
      }),
    );

    await queryRunner.createCheckConstraint(
      'tamagotchis',
      new TableCheck({
        name: 'CHK_tamagotchis_happiness_range',
        expression: 'happiness >= 0 AND happiness <= 100',
      }),
    );

    await queryRunner.createCheckConstraint(
      'tamagotchis',
      new TableCheck({
        name: 'CHK_tamagotchis_health_range',
        expression: 'health >= 0 AND health <= 100',
      }),
    );

    // Create foreign key from tamagotchis to users
    await queryRunner.createForeignKey(
      'tamagotchis',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Create foreign key from tamagotchis to characters
    await queryRunner.createForeignKey(
      'tamagotchis',
      new TableForeignKey({
        columnNames: ['character_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'characters',
        onDelete: 'RESTRICT',
      }),
    );

    // Create indexes for better query performance
    await queryRunner.query(
      `CREATE INDEX "IDX_tamagotchis_user_id" ON "tamagotchis" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tamagotchis_character_id" ON "tamagotchis" ("character_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    const table = await queryRunner.getTable('tamagotchis');
    
    const userFk = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('user_id') !== -1,
    );
    if (userFk) {
      await queryRunner.dropForeignKey('tamagotchis', userFk);
    }

    const characterFk = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('character_id') !== -1,
    );
    if (characterFk) {
      await queryRunner.dropForeignKey('tamagotchis', characterFk);
    }

    // Drop check constraints
    await queryRunner.dropCheckConstraint('tamagotchis', 'CHK_tamagotchis_hunger_range');
    await queryRunner.dropCheckConstraint('tamagotchis', 'CHK_tamagotchis_happiness_range');
    await queryRunner.dropCheckConstraint('tamagotchis', 'CHK_tamagotchis_health_range');

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tamagotchis_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tamagotchis_character_id"`);

    // Drop table
    await queryRunner.dropTable('tamagotchis');
  }
}
