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
  Min,
  IsIn,
} from 'class-validator';
import { User } from './user.entity';

/**
 * UserInventory Entity
 * 
 * Tracks items owned by users (characters and foods).
 * Uses a generic item_type and item_id approach to handle different item types.
 * 
 * Requirements: 4.1
 */
@Entity('user_inventory')
export class UserInventory {
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
    length: 20,
    nullable: false,
    name: 'item_type',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['character', 'food'])
  itemType: 'character' | 'food';

  @Column({
    type: 'uuid',
    nullable: false,
    name: 'item_id',
  })
  @IsUUID()
  @IsNotEmpty()
  itemId: string;

  @Column({
    type: 'integer',
    default: 1,
  })
  @IsNumber()
  @Min(0)
  quantity: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'acquired_at',
  })
  acquiredAt: Date;
}
