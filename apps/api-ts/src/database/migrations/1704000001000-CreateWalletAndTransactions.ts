import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableCheck } from 'typeorm';

/**
 * Migration: Create Wallet and Wallet Transactions Tables
 * 
 * Creates tables for managing user virtual currency:
 * - wallets: Stores user coin balances with non-negative constraint
 * - wallet_transactions: Audit trail for all wallet operations
 * 
 * Requirements: 10.2, 3.4
 */
export class CreateWalletAndTransactions1704000001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create wallets table
    await queryRunner.createTable(
      new Table({
        name: 'wallets',
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
            isUnique: true,
          },
          {
            name: 'balance',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
            isNullable: false,
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

    // Add CHECK constraint to ensure balance is non-negative
    await queryRunner.createCheckConstraint(
      'wallets',
      new TableCheck({
        name: 'CHK_wallets_balance_non_negative',
        expression: 'balance >= 0',
      }),
    );

    // Create foreign key from wallets to users
    await queryRunner.createForeignKey(
      'wallets',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Create wallet_transactions table
    await queryRunner.createTable(
      new Table({
        name: 'wallet_transactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'wallet_id',
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
            name: 'transaction_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'description',
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

    // Create foreign key from wallet_transactions to wallets
    await queryRunner.createForeignKey(
      'wallet_transactions',
      new TableForeignKey({
        columnNames: ['wallet_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'wallets',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes for better query performance
    await queryRunner.query(
      `CREATE INDEX "IDX_wallets_user_id" ON "wallets" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_wallet_transactions_wallet_id" ON "wallet_transactions" ("wallet_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_wallet_transactions_created_at" ON "wallet_transactions" ("created_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    const walletTransactionsTable = await queryRunner.getTable('wallet_transactions');
    const walletTransactionsFk = walletTransactionsTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('wallet_id') !== -1,
    );
    if (walletTransactionsFk) {
      await queryRunner.dropForeignKey('wallet_transactions', walletTransactionsFk);
    }

    const walletsTable = await queryRunner.getTable('wallets');
    const walletsFk = walletsTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('user_id') !== -1,
    );
    if (walletsFk) {
      await queryRunner.dropForeignKey('wallets', walletsFk);
    }

    // Drop check constraint
    await queryRunner.dropCheckConstraint('wallets', 'CHK_wallets_balance_non_negative');

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_wallets_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_wallet_transactions_wallet_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_wallet_transactions_created_at"`);

    // Drop tables
    await queryRunner.dropTable('wallet_transactions');
    await queryRunner.dropTable('wallets');
  }
}
