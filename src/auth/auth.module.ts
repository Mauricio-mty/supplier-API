// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt'; // 💡 Importa JwtModuleOptions
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({ // 💡 Forzamos el tipo de retorno aquí
        secret: configService.get<string>('JWT_SECRET') || 'secretKeyDeRespaldo', // 💡 Respaldo si es undefined
        signOptions: {
          // Usamos "as any" o aseguramos un string directo para saltar la restricción estricta de StringValue
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '8h') as any, 
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}