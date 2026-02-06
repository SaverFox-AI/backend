import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import {
  IsUUID,
  IsBoolean,
  IsObject,
  IsNotEmpty,
} from 'class-validator';
import { User } from './user.entity';
import { Mission } from './mission.entity';

/**
 * UserMission Entity
 * 
 * Tracks user progress on missions.
 * Progress is stored as JSONB for flexibility.
 * 
 * Requirements: 5.1
 */
@Entity('user_missions')
export class UserMission {
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

  // Removed @ManyToOne relation to avoid TypeORM conflict
  // @ManyToOne(() => User, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'user_id' })
  // user: User;

  @Column({
    type: 'uuid',
    nullable: false,
    name: 'mission_id',
  })
  @IsUUID()
  @IsNotEmpty()
  missionId: string;

  // Removed @ManyToOne relation to avoid TypeORM conflict
  // @ManyToOne(() => Mission)
  // @JoinColumn({ name: 'mission_id' })
  // mission: Mission;

  @Column({
    type: 'jsonb',
    default: {},
  })
  @IsObject()
  progress: Record<string, any>;

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
}
