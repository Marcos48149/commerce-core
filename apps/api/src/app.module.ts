import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma.module';
import { CommonModule } from './common/common.module';
import { IamModule } from './iam/iam.module';

@Module({
  imports: [PrismaModule, CommonModule, IamModule],
})
export class AppModule {}
