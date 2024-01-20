import { Module } from '@nestjs/common';
import { PrismaService } from './commons/prisma.service';
import { UserModule } from './domains';

@Module({
  imports: [UserModule],
  providers: [],
})
export class AppModule {}
