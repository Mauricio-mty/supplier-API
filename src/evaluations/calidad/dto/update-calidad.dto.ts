import { PartialType } from '@nestjs/mapped-types';
import { CreateCalidadDto } from './create-calidad.dto';

export class UpdateCalidadDto extends PartialType(CreateCalidadDto) {}