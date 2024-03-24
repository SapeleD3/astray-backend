import { Module } from '@nestjs/common';
import { UserModule, EventModule, OrderModule } from './domains';

@Module({
  imports: [UserModule, EventModule, OrderModule],
  providers: [],
})
export class AppModule {}
