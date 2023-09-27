import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { BufferedFile } from '@/minio-client/file.model';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '@/common/guards/jwt.guard';

@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT-auth')
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile() image: BufferedFile) {
    return await this.uploadService.uploadImage(image);
  }
}
