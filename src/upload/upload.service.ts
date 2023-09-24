import { BufferedFile } from '@/minio-client/file.model';
import { MinioClientService } from '@/minio-client/minio-client.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
    constructor(private minioClientService: MinioClientService) {}

    async uploadImage(image: BufferedFile) {
        const uploadedImage = await this.minioClientService.upload(image);
        
        return {
            imageUrl: uploadedImage.url,
            message: 'Image upload successful', 
        };
    }
}
