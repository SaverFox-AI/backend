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
  IsInt,
  IsUUID,
  IsNotEmpty,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { User } from './user.entity';
import { Character } from './character.entity';

/**
 * Tamagotchi Entity
 * 
 * Represents a user's tamagotchi pet with its current state.
 * Tracks hunger, happiness, and health metrics.
 * 
 * Requirements: 6.3
 */
@Entity('tamagotchis')
export class Tamagotchi {
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

  @Column({
    type: 'uuid',
    nullable: false,
    name: 'character_id',
  })
  @IsUUID()
  @IsNotEmpty()
  characterId: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @Column({
    type: 'integer',
    default: 50,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  hunger: number;

  @Column({
    type: 'integer',
    default: 50,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  happiness: number;

  @Column({
    type: 'integer',
    default: 100,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  health: number;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'last_fed_at',
  })
  lastFedAt: Date;

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
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'character_id' })
  character: Character;
}
