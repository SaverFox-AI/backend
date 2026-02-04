import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';

/**
 * AuthService
 * 
 * Handles user authentication operations including registration and login.
 * Implements password hashing with bcrypt and JWT token generation.
 * 
 * Requirements: 1.1, 1.2, 1.5
 */
@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user
   * 
   * Validates that username and email are unique, hashes the password,
   * and creates a new user account.
   * 
   * @param username - Unique username for the account
   * @param email - Unique email address
   * @param password - Plain text password (will be hashed)
   * @returns Object containing userId and JWT token
   * @throws ConflictException if username or email already exists
   * 
   * Validates: Requirements 1.1, 1.5
   */
  async register(
    username: string,
    email: string,
    password: string,
  ): Promise<{ userId: string; token: string }> {
    // Check if username already exists
    const existingUsername = await this.userRepository.findOne({
      where: { username },
    });
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    // Check if email already exists
    const existingEmail = await this.userRepository.findOne({
      where: { email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

    // Create new user
    const user = this.userRepository.create({
      username,
      email,
      passwordHash,
    });

    // Save user to database
    const savedUser = await this.userRepository.save(user);

    // Generate JWT token
    const token = this.generateToken(savedUser.id, savedUser.username);

    return {
      userId: savedUser.id,
      token,
    };
  }

  /**
   * Login with username/email and password
   * 
   * Authenticates user credentials and returns a JWT token on success.
   * Accepts either username or email as the identifier.
   * 
   * @param usernameOrEmail - Username or email address
   * @param password - Plain text password
   * @returns Object containing userId and JWT token
   * @throws UnauthorizedException if credentials are invalid
   * 
   * Validates: Requirements 1.2, 1.3
   */
  async login(
    usernameOrEmail: string,
    password: string,
  ): Promise<{ userId: string; token: string }> {
    // Find user by username or email
    const user = await this.userRepository.findOne({
      where: [
        { username: usernameOrEmail },
        { email: usernameOrEmail },
      ],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateToken(user.id, user.username);

    return {
      userId: user.id,
      token,
    };
  }

  /**
   * Validate user by ID
   * 
   * Used by JWT strategy to validate tokens and retrieve user information.
   * 
   * @param userId - User ID from JWT payload
   * @returns User entity or null if not found
   */
  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  /**
   * Generate JWT token
   * 
   * Creates a signed JWT token containing user ID and username.
   * 
   * @param userId - User ID to include in token
   * @param username - Username to include in token
   * @returns Signed JWT token string
   * 
   * Validates: Requirements 1.2
   */
  private generateToken(userId: string, username: string): string {
    const payload = {
      sub: userId,
      username,
    };
    return this.jwtService.sign(payload);
  }
}
