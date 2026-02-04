import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto';

/**
 * AuthController
 * 
 * Handles authentication endpoints for user registration and login.
 * All endpoints validate request data using DTOs with class-validator.
 * 
 * Requirements: 1.1, 1.2, 1.4
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   * 
   * POST /auth/register
   * 
   * Creates a new user account with validated credentials.
   * Returns user ID and JWT token on success.
   * 
   * @param registerDto - Registration data (username, email, password)
   * @returns Object containing userId and JWT token
   * @throws ConflictException if username or email already exists
   * @throws BadRequestException if validation fails
   * 
   * Validates: Requirements 1.1, 1.4
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { username, email, password } = registerDto;
    return this.authService.register(username, email, password);
  }

  /**
   * Login with existing credentials
   * 
   * POST /auth/login
   * 
   * Authenticates user with username/email and password.
   * Returns user ID and JWT token on success.
   * 
   * @param loginDto - Login data (usernameOrEmail, password)
   * @returns Object containing userId and JWT token
   * @throws UnauthorizedException if credentials are invalid
   * @throws BadRequestException if validation fails
   * 
   * Validates: Requirements 1.2, 1.4
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    const { usernameOrEmail, password } = loginDto;
    return this.authService.login(usernameOrEmail, password);
  }
}
