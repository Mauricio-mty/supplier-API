import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // 👈 Esto es indispensable
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // 👈 Permite que AuthModule pueda usar este servicio
})
export class UsersModule {}
