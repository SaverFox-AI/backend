import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard
 * 
 * Guard for protecting routes with JWT authentication.
 * Use this guard on controllers or routes that require authentication.
 * 
 * Requirements: 1.2
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
