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
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Food Entity
 * 
 * Represents a food item available in the shop for feeding tamagotchis.
 * Each food has a nutrition value that affects tamagotchi stats.
 * 
 * Requirements: 4.1
 */
@Entity('foods')
export class Food {
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
    type: 'integer',
    nullable: false,
    name: 'nutrition_value',
  })
  @IsNumber()
  @Min(1)
  nutritionValue: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @Column({
    type: 'text',
    nullable: true,
    name: 'image_url',
  })
  @IsString()
  imageUrl: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt: Date;
}
