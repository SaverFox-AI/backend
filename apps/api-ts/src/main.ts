import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {
  AllExceptionsFilter,
  HttpExceptionFilter,
  ValidationExceptionFilter,
} from './common/filters';

/**
 * Bootstrap the NestJS application
 */
async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    
    // Global exception filters (order matters - most specific first)
    app.useGlobalFilters(
      new ValidationExceptionFilter(),
      new HttpExceptionFilter(),
      new AllExceptionsFilter(),
    );
    
    // Global validation pipe for request validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    
    // API prefix
    const apiPrefix = process.env.API_PREFIX || 'api';
    app.setGlobalPrefix(apiPrefix);
    
    // CORS configuration
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : ['http://localhost:3001'];
    
    app.enableCors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    });
    
    // Swagger/OpenAPI configuration
    const config = new DocumentBuilder()
      .setTitle('SaverFox API Service')
      .setDescription(
        'API service for SaverFox AI Backend - A money adventure game for teaching children financial literacy',
      )
      .setVersion('1.0.0')
      .addTag('auth', 'Authentication endpoints')
      .addTag('profile', 'User profile and onboarding')
      .addTag('wallet', 'Wallet and coin management')
      .addTag('shop', 'Shop and inventory')
      .addTag('missions', 'Daily missions and logging')
      .addTag('tamagotchi', 'Tamagotchi care')
      .addTag('goals', 'Savings goals')
      .addTag('adventure', 'AI-generated money adventures')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
        },
        'JWT-auth',
      )
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    
    // Start the server
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    
    console.log(`🚀 SaverFox API Service is running on: http://0.0.0.0:${port}/${apiPrefix}`);
    console.log(`📚 API Documentation available at: http://0.0.0.0:${port}/api/docs`);
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
