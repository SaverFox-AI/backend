import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

/**
 * Migration: Create Goals and Adventures Tables
 * 
 * Creates tables for savings goals and AI-generated adventures:
 * - goals: User savings goals with progress tracking
 * - adventures: AI-generated money scenarios with Opik trace IDs
 * 
 * Requirements: 10.2, 13.4
 */
export class CreateGoalsAndAdventuresTables1704000005000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create goals table
    await queryRunner.createTable(
      new Table({
        name: 'goals',
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
            name: 'title',
            type: 'varchar',
            length: '200',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'target_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'current_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'completed',
            type: 'boolean',
            default: false,
          },
          {
            name: 'completed_at',
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

    // Create adventures table
    await queryRunner.createTable(
      new Table({
        name: 'adventures',
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
            name: 'scenario',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'choices',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'selected_choice_index',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'feedback',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'scores',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'generation_opik_trace_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'evaluation_opik_trace_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'evaluated_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'goals',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'adventures',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes for better query performance
    await queryRunner.query(
      `CREATE INDEX "IDX_goals_user_id" ON "goals" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_goals_completed" ON "goals" ("completed")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_adventures_user_id" ON "adventures" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_adventures_generation_opik_trace_id" ON "adventures" ("generation_opik_trace_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_adventures_evaluation_opik_trace_id" ON "adventures" ("evaluation_opik_trace_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_adventures_created_at" ON "adventures" ("created_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    const goalsTable = await queryRunner.getTable('goals');
    const goalsFk = goalsTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('user_id') !== -1,
    );
    if (goalsFk) {
      await queryRunner.dropForeignKey('goals', goalsFk);
    }

    const adventuresTable = await queryRunner.getTable('adventures');
    const adventuresFk = adventuresTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('user_id') !== -1,
    );
    if (adventuresFk) {
      await queryRunner.dropForeignKey('adventures', adventuresFk);
    }

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_goals_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_goals_completed"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_adventures_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_adventures_generation_opik_trace_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_adventures_evaluation_opik_trace_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_adventures_created_at"`);

    // Drop tables
    await queryRunner.dropTable('adventures');
    await queryRunner.dropTable('goals');
  }
}
