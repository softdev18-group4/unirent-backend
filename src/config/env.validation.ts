import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsNotEmpty()
  @IsNumber()
  APP_PORT: number;

  @IsNotEmpty()
  @IsString()
  DATABASE_URL: string;

  @IsNotEmpty()
  @IsString()
  JWT_SECRET: string;

  @IsNotEmpty()
  @IsNumber()
  JWT_EXPIRES_IN: number;

  @IsNotEmpty()
  @IsString()
  GOOGLE_CLIENT_ID: string;

  @IsNotEmpty()
  @IsString()
  GOOGLE_CLIENT_SECRET: string;

  @IsNotEmpty()
  @IsString()
  GOOGLE_CALLBACK_URL: string;

  @IsNotEmpty()
  @IsString()
  MINIO_ACCESS_KEY: string;

  @IsNotEmpty()
  @IsString()
  MINIO_SECRET_KEY: string;

  @IsNotEmpty()
  @IsString()
  MINIO_ENDPOINT: string;

  @IsNotEmpty()
  @IsString()
  MINIO_BUCKET: string;

  @IsNotEmpty()
  @IsNumber()
  MINIO_PORT: number;

  @IsNotEmpty()
  @IsString()
  MINIO_API_ENDPOINT: string;

  @IsNotEmpty()
  @IsString()
  STRIPE_API_SECRET_KEY: string;

  @IsNotEmpty()
  @IsString()
  STRIPE_WEBHOOK_SECRET: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
