// src/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users', { schema: 'public' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  nombre!: string;

  @Column({ unique: true, length: 255 })
  correo!: string; // 👈 Usaremos este para el login

  @Column({ length: 50 })
  rol!: string; // 👈 Ideal para controlar accesos por departamento

  @Column({ length: 255 })
  password!: string;
}