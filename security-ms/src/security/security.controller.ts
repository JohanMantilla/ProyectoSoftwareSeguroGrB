import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SecurityService } from './security.service';
import { CreateSecurityDto } from './dto/create-security.dto';
import { UpdateSecurityDto } from './dto/update-security.dto';

@Controller()
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @MessagePattern('createSecurity')
  create(@Payload() createSecurityDto: CreateSecurityDto) {
    return this.securityService.create(createSecurityDto);
  }

  @MessagePattern('findAllSecurity')
  findAll() {
    return this.securityService.findAll();
  }

  @MessagePattern('findOneSecurity')
  findOne(@Payload() id: number) {
    return this.securityService.findOne(id);
  }

  @MessagePattern('updateSecurity')
  update(@Payload() updateSecurityDto: UpdateSecurityDto) {
    return this.securityService.update(updateSecurityDto.id, updateSecurityDto);
  }

  @MessagePattern('removeSecurity')
  remove(@Payload() id: number) {
    return this.securityService.remove(id);
  }
}
