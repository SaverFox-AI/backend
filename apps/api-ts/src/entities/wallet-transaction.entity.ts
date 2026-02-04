import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import {
  IsNumber,
  IsString,
  IsUUID,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { Wallet } from './wallet.entity';

/**
 * WalletTransaction Entity
 * 
 * Represents a transaction in a user's wallet.
 * Provides an audit trail for all wallet balance changes.
 * 
 * Requirements: 3.5
 */
@Entity('wallet_transactions')
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
    nullable: false,
    name: 'wallet_id',
  })
  @IsUUID()
  @IsNotEmpty()
  walletId: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  amount: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    name: 'transaction_type',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  transactionType: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  @IsString()
  description: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt: Date;

  // Relationships
  @ManyToOne(() => Wallet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;
}
