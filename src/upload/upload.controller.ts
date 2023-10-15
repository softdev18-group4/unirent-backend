import { Controller, Post, UploadedFile, UseGuards } from '@nestjs/common';
import { UploadService } from './upload.service';
import { BufferedFile } from '@/minio-client/file.model';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@/common/guards/jwt.guard';
import { ApiImage } from '@/decorators/api-image.decorator';

@ApiTags('file upload')
@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post()
  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiImage('image')
  async uploadImage(@UploadedFile() image: BufferedFile) {
    return await this.uploadService.uploadImage(image);
  }
}
