import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsNotEmpty,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { User } from './user.entity';

/**
 * Goal Entity
 * 
 * Represents a savings goal set by a user.
 * Tracks target amount, current progress, and completion status.
 * 
 * Requirements: 7.1
 */
@Entity('goals')
export class Goal {
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
    type: 'varchar',
    length: 200,
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  @IsString()
  description: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    name: 'target_amount',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  targetAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    name: 'current_amount',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  currentAmount: number;

  @Column({
    type: 'boolean',
    default: false,
  })
  @IsBoolean()
  completed: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'completed_at',
  })
  completedAt: Date | null;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    name: 'updated_at',
  })
  updatedAt: Date;
}
