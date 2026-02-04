import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsObject,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Mission Entity
 * 
 * Represents a daily mission that users can complete to earn rewards.
 * Requirements are stored as JSONB for flexibility.
 * 
 * Requirements: 5.1
 */
@Entity('missions')
export class Mission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    name: 'mission_type',
  })
  @IsString()
  @IsNotEmpty()
  missionType: string;

  @Column({
    type: 'jsonb',
    nullable: false,
  })
  @IsObject()
  requirements: Record<string, any>;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    name: 'reward_coins',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  rewardCoins: number;

  @Column({
    type: 'date',
    nullable: false,
    name: 'active_date',
  })
  activeDate: Date;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt: Date;
}
