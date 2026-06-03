import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BodegaModule } from './evaluations/bodega/bodega.module';
import { CalidadModule } from './evaluations/calidad/calidad.module';
import { ComprasModule } from './evaluations/compras/compras.module';

@Module({
  imports: [
    // 1. Carga las variables de entorno globalmente en la app
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    
    // 2. Configura TypeORM de forma asíncrona usando ConfigService
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        
        autoLoadEntities: true, // Mapea tus archivos .entity.ts para hacer consultas
        synchronize: false,    // 🔒 CRÍTICO: No creará ni modificará ninguna tabla en la BD
      }),
    }),
    
    AuthModule,
    UsersModule,
    BodegaModule,
    CalidadModule,
    ComprasModule,
  ],
})
export class AppModule {}