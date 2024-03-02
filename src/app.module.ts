import { Module } from '@nestjs/common';
import { UserModule, EventModule } from './domains';

@Module({
  imports: [UserModule, EventModule],
  providers: [],
})
export class AppModule {}
