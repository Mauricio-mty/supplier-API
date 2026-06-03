import { PartialType } from '@nestjs/mapped-types';
import { CreateComprasDto } from './create-compras.dto';

export class UpdateComprasDto extends PartialType(CreateComprasDto) {}