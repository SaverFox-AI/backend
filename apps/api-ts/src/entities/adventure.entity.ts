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
  IsOptional,
  IsArray,
  Min,
} from 'class-validator';
import { User } from './user.entity';

/**
 * Adventure Entity
 * 
 * Represents an AI-generated money adventure scenario.
 * Stores the scenario, choices, user's selection, evaluation feedback,
 * and Opik trace IDs for observability.
 * 
 * Requirements: 8.4, 9.4, 13.4
 */
@Entity('adventures')
export class Adventure {
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
    type: 'text',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  scenario: string;

  @Column({
    type: 'jsonb',
    nullable: false,
  })
  @IsArray()
  @IsNotEmpty()
  choices: string[];

  @Column({
    type: 'integer',
    nullable: true,
    name: 'selected_choice_index',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  selectedChoiceIndex: number | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  feedback: string | null;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  @IsOptional()
  scores: {
    financial_wisdom?: number;
    long_term_thinking?: number;
    responsibility?: number;
  } | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'generation_opik_trace_id',
  })
  @IsString()
  @IsOptional()
  generationOpikTraceId: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'evaluation_opik_trace_id',
  })
  @IsString()
  @IsOptional()
  evaluationOpikTraceId: string | null;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'evaluated_at',
  })
  evaluatedAt: Date | null;
}
