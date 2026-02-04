import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { User } from './user.entity';

/**
 * Expense Entity
 * 
 * Tracks user expenses logged for mission completion.
 * 
 * Requirements: 5.2
 */
@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
    nullable: false,
    name: 'user_id',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  category: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  @IsString()
  description: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'logged_at',
  })
  loggedAt: Date;
}
