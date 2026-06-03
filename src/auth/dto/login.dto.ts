// src/auth/dto/login.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El formato del correo no es válido' })
  correo!: string;

  @IsString()
  @MinLength(3, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;
}