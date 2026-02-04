import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

/**
 * Migration: Create Missions and Tracking Tables
 * 
 * Creates tables for daily missions and financial tracking:
 * - missions: Daily mission definitions with requirements
 * - user_missions: Tracks user progress on missions
 * - expenses: Records user expense entries
 * - savings: Records user saving entries
 * 
 * Requirements: 10.2
 */
export class CreateMissionsAndTrackingTables1704000004000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create missions table
    await queryRunner.createTable(
      new Table({
        name: 'missions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
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
            isNullable: false,
          },
          {
            name: 'mission_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'requirements',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'reward_coins',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'active_date',
            type: 'date',
            isNullable: false,
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

    // Create user_missions table
    await queryRunner.createTable(
      new Table({
        name: 'user_missions',
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
            name: 'mission_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'progress',
            type: 'jsonb',
            default: "'{}'",
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
        ],
      }),
      true,
    );

    // Create expenses table
    await queryRunner.createTable(
      new Table({
        name: 'expenses',
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
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'category',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'logged_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create savings table
    await queryRunner.createTable(
      new Table({
        name: 'savings',
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
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'source',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'logged_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'user_missions',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_missions',
      new TableForeignKey({
        columnNames: ['mission_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'missions',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'expenses',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'savings',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes for better query performance
    await queryRunner.query(
      `CREATE INDEX "IDX_missions_active_date" ON "missions" ("active_date")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_missions_user_id" ON "user_missions" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_missions_mission_id" ON "user_missions" ("mission_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_missions_completed" ON "user_missions" ("completed")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_expenses_user_id" ON "expenses" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_expenses_logged_at" ON "expenses" ("logged_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_savings_user_id" ON "savings" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_savings_logged_at" ON "savings" ("logged_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    const userMissionsTable = await queryRunner.getTable('user_missions');
    const userMissionsUserFk = userMissionsTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('user_id') !== -1,
    );
    if (userMissionsUserFk) {
      await queryRunner.dropForeignKey('user_missions', userMissionsUserFk);
    }

    const userMissionsMissionFk = userMissionsTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('mission_id') !== -1,
    );
    if (userMissionsMissionFk) {
      await queryRunner.dropForeignKey('user_missions', userMissionsMissionFk);
    }

    const expensesTable = await queryRunner.getTable('expenses');
    const expensesFk = expensesTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('user_id') !== -1,
    );
    if (expensesFk) {
      await queryRunner.dropForeignKey('expenses', expensesFk);
    }

    const savingsTable = await queryRunner.getTable('savings');
    const savingsFk = savingsTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('user_id') !== -1,
    );
    if (savingsFk) {
      await queryRunner.dropForeignKey('savings', savingsFk);
    }

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_missions_active_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_missions_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_missions_mission_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_missions_completed"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_expenses_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_expenses_logged_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_savings_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_savings_logged_at"`);

    // Drop tables
    await queryRunner.dropTable('savings');
    await queryRunner.dropTable('expenses');
    await queryRunner.dropTable('user_missions');
    await queryRunner.dropTable('missions');
  }
}
