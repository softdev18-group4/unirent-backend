import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function PartialDTO() {
    return applyDecorators(
        ApiProperty({ required: false }),
    );
}
