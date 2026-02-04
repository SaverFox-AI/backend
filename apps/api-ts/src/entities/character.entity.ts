import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import {
  IsString,
  IsBoolean,
  IsNumber,
  IsNotEmpty,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Character Entity
 * 
 * Represents a tamagotchi character available in the shop.
 * Characters can be starter characters (free) or purchasable.
 * 
 * Requirements: 4.1
 */
@Entity('characters')
export class Character {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'image_url',
  })
  @IsString()
  imageUrl: string;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_starter',
  })
  @IsBoolean()
  isStarter: boolean;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt: Date;
}
