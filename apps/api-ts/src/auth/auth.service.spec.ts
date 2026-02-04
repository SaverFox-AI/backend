import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';

// Mock bcrypt module
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully register a new user', async () => {
      const mockUser = {
        id: '123',
        username: registerData.username,
        email: registerData.email,
        passwordHash: 'hashed_password',
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock_token');

      const result = await service.register(
        registerData.username,
        registerData.email,
        registerData.password,
      );

      expect(result).toEqual({
        userId: '123',
        token: 'mock_token',
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(2); // Check username and email
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('should throw ConflictException if username already exists', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce({ username: registerData.username });

      await expect(
        service.register(registerData.username, registerData.email, registerData.password),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserRepository.findOne
        .mockResolvedValueOnce(null) // username check
        .mockResolvedValueOnce({ email: registerData.email }); // email check

      await expect(
        service.register(registerData.username, registerData.email, registerData.password),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash password before saving', async () => {
      const mockUser = {
        id: '123',
        username: registerData.username,
        email: registerData.email,
        passwordHash: 'hashed_password',
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock_token');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      await service.register(registerData.username, registerData.email, registerData.password);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerData.password, 10);
    });
  });

  describe('login', () => {
    const loginData = {
      usernameOrEmail: 'testuser',
      password: 'password123',
    };

    const mockUser = {
      id: '123',
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: '$2b$10$hashedpassword',
    };

    it('should successfully login with valid credentials', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock_token');
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginData.usernameOrEmail, loginData.password);

      expect(result).toEqual({
        userId: '123',
        token: 'mock_token',
      });
      expect(mockUserRepository.findOne).toHaveBeenCalled();
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login(loginData.usernameOrEmail, loginData.password),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login(loginData.usernameOrEmail, loginData.password),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should accept email as login identifier', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock_token');
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.login('test@example.com', loginData.password);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: [
          { username: 'test@example.com' },
          { email: 'test@example.com' },
        ],
      });
    });
  });

  describe('validateUser', () => {
    it('should return user if found', async () => {
      const mockUser = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser('123');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: '123' } });
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser('123');

      expect(result).toBeNull();
    });
  });
});
