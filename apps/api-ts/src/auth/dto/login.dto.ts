import { IsString, MinLength } from 'class-validator';

/**
 * LoginDto
 * 
 * Data transfer object for user login requests.
 * Accepts username or email as the identifier.
 * 
 * Requirements: 1.2, 1.4
 */
export class LoginDto {
  @IsString()
  @MinLength(1, { message: 'Username or email is required' })
  usernameOrEmail: string;

  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password: string;
}
