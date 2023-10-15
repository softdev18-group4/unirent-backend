import { Module } from '@nestjs/common';
import { ConnectedUserService } from './connected-user.service';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  imports: [],
  providers: [ConnectedUserService, PrismaService],
  exports: [ConnectedUserService],
})
export class ConnectedUserModule {}
