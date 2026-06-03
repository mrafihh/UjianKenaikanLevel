import { PartialType } from '@nestjs/swagger';
import { CreateXenditDto } from './create-xendit.dto';

export class UpdateXenditDto extends PartialType(CreateXenditDto) {}
