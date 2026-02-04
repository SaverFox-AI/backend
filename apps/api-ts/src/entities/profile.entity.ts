import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import {
  IsInt,
  IsNumber,
  IsString,
  IsBoolean,
  Min,
  Max,
  Length,
  IsNotEmpty,
  IsPositive,
} from 'class-validator';
import { User } from './user.entity';

/**
 * Profile Entity
 * 
 * Represents a user's profile information in the SaverFox AI system.
 * Stores personal details including age, allowance, currency preferences,
 * and onboarding completion status.
 * 
 * Requirements: 2.1
 */
@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
    nullable: false,
    name: 'user_id',
  })
  @IsNotEmpty()
  userId: string;

  @Column({
    type: 'integer',
    nullable: false,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(5)
  @Max(18)
  age: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  @IsPositive()
  allowance: number;

  @Column({
    type: 'varchar',
    length: 3,
    default: 'USD',
  })
  @IsString()
  @Length(3, 3)
  currency: string;

  @Column({
    type: 'boolean',
    default: false,
    name: 'onboarding_completed',
  })
  @IsBoolean()
  onboardingCompleted: boolean;

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

  // Relationships
  @OneToOne(() => User, (user) => user.profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
