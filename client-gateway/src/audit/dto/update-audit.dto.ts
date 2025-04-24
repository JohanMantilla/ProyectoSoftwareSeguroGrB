import { PartialType } from '@nestjs/mapped-types';
import { CreateAuditLogDto } from './create-audit.dto';

export class UpdateAuditDto extends PartialType(CreateAuditLogDto) {
}
