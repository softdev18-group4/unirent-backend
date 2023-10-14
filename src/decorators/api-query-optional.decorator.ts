import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function ApiQueryOptional(queryNameArray: string[]) {
  return applyDecorators(
    ...queryNameArray.map((queryName) => {
      return ApiQuery({
        name: queryName,
        type: String,
        required: false,
      });
    }),
  );
}
