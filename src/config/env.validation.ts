import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsNumber, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsNotEmpty()
  @IsNumber()
  APP_PORT: number;
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
