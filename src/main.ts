import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import * as compression from 'compression'
import { ApiResponseDto, ApiErrorResponseDto, PaginatedResponseDto } from './common/dto/api-response.dto'
import { CustomValidationPipe } from './common/pipes/custom-validation.pipe'
import { initializeTransactionalContext } from 'typeorm-transactional'

async function bootstrap() {
  initializeTransactionalContext()
  const logger = new Logger('Bootstrap')

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  })

  const configService = app.get(ConfigService)
  const nodeEnv = configService.get<string>('NODE_ENV', 'dev')
  const isProduction = nodeEnv === 'production'

  const apiPrefix = configService.get<string>('API_PREFIX', 'api')
  app.setGlobalPrefix(apiPrefix)
  logger.log(`API prefix set to: ${apiPrefix}`)

  app.useGlobalPipes(
    new CustomValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: true },
      disableErrorMessages: isProduction,
    }),
  )

  app.use(helmet())
  app.use(compression())

  app.enableCors({
    origin: ['http://localhost:3000', 'http://157.10.199.189:4200', 'https://fe.dzus.edu.vn', 'https://dzus.edu.vn'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  })

  if (!isProduction || configService.get<boolean>('ENABLE_SWAGGER', true)) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('NestJS Backend')
      .setDescription(
        `
## API Documentation

This is a comprehensive API documentation for the NestJS Backend application.

### Authentication
- Most endpoints require JWT authentication
- Use the /auth/login endpoint to obtain a JWT token
- Include the token in the Authorization header as a Bearer token

### Permissions
- Some endpoints require specific roles (admin, user, etc.)
- Role-based access control is implemented throughout the API

### Common Response Format
All API responses follow a standard format:
\`\`\`json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful",
  "path": "/api/resource",
  "meta": { /* optional metadata */ }
}
\`\`\`

### Paginated Response Format
Endpoints that return lists of items use this format:
\`\`\`json
{
  "success": true,
  "data": [
    { /* item 1 */ },
    { /* item 2 */ }
  ],
  "message": "Operation successful",
  "path": "/api/resources",
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
\`\`\`

### Error Response Format
All errors follow this consistent format:
\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": [
      { /* detailed error information */ }
    ]
  },
  "path": "/api/resource"
}
\`\`\`

### Common Error Codes
- BAD_REQUEST: Invalid input data
- UNAUTHORIZED: Authentication required
- FORBIDDEN: Insufficient permissions
- NOT_FOUND: Resource not found
- CONFLICT: Resource conflict (e.g., duplicate entry)
- VALIDATION_ERROR: Input validation failed
- DATABASE_ERROR: Database operation failed
- INTERNAL_SERVER_ERROR: Unexpected server error
      `,
      )
      .setVersion('1.0')
      .setContact('Support Team', 'https://example.com/support', 'support@example.com')
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .setExternalDoc('Additional Documentation', 'https://example.com/docs')
      .addServer(configService.get<string>('API_URL', 'http://localhost:8080'), 'Development Server')
      .addServer(configService.get<string>('API_URL', 'https://api.dzus.edu.vn'), 'Staging Server')
      .addServer('https://api.example.com', 'Production Server')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Authentication', 'Authentication endpoints')
      .addTag('Users', 'User management endpoints')
      .addTag('Roles', 'Role management endpoints')
      .addTag('Health', 'Health check endpoints')
      .build()

    const document = SwaggerModule.createDocument(app, swaggerConfig, {
      deepScanRoutes: true,
      extraModels: [ApiResponseDto, ApiErrorResponseDto, PaginatedResponseDto],
    })

    SwaggerModule.setup('docs', app, document, {
      explorer: true,
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        defaultModelsExpandDepth: 3,
        defaultModelExpandDepth: 3,
      },
    })
    logger.log('Swagger documentation enabled at /docs')
  }

  const port = configService.get<number>('PORT', 4000)
  await app.listen(port)
  logger.log(`Application is running on: ${await app.getUrl()}`)
  logger.log(`Environment: ${nodeEnv}`)
}

void bootstrap()
