import { PartialType } from '@nestjs/mapped-types';
import { CreateButcherDto } from './create-butcher.dto';

export class UpdateButcherDto extends PartialType(CreateButcherDto) {}
