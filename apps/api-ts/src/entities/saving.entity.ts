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
 * Saving Entity
 * 
 * Tracks user savings logged for mission completion.
 * 
 * Requirements: 5.3
 */
@Entity('savings')
export class Saving {
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
    nullable: true,
  })
  @IsString()
  @MaxLength(100)
  source: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'logged_at',
  })
  loggedAt: Date;
}
