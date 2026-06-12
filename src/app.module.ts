import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BodegaModule } from './evaluations/bodega/bodega.module';
import { CalidadModule } from './evaluations/calidad/calidad.module';
import { ComprasModule } from './evaluations/compras/compras.module';
import { RendimientosModule } from './evaluations/rendimiento/rendimiento.module';

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
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>('DATABASE_URL');
        
        return {
          type: 'postgres',
          url: dbUrl,
          host: !dbUrl ? configService.get<string>('DB_HOST') : undefined,
          port: !dbUrl ? configService.get<number>('DB_PORT') : undefined,
          username: !dbUrl ? configService.get<string>('DB_USERNAME') : undefined,
          password: !dbUrl ? configService.get<string>('DB_PASSWORD') : undefined,
          database: !dbUrl ? configService.get<string>('DB_NAME') : undefined,
          
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),
    
    AuthModule,
    UsersModule,
    BodegaModule,
    CalidadModule,
    ComprasModule,
    RendimientosModule,
  ],
})
export class AppModule {}