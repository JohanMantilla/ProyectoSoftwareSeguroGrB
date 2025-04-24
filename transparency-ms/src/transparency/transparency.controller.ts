import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TransparencyService } from './transparency.service';
import { CreatePrivacyPolicyDto } from './dto/create-privacy-policy.dto';
import { UpdatePrivacyPolicyDto } from './dto/update-privacy-policy.dto';

@Controller()
export class TransparencyController {
  constructor(private readonly transparencyService: TransparencyService) {}

  @MessagePattern('get.all.policies')
  getAllPolicies() {
    return this.transparencyService.getAllPolicies();
  }

  @MessagePattern('create.policy')
  createPolicy(@Payload() createDto: CreatePrivacyPolicyDto) {
    return this.transparencyService.createPolicy(createDto);
  }

  @MessagePattern('update.policy')
  updatePolicy(@Payload() data: { id: string; updateDto: UpdatePrivacyPolicyDto }) {
    return this.transparencyService.updatePolicy(data.id, data.updateDto);
  }

  @MessagePattern('delete.policy')
  deletePolicy(@Payload() id: string) {
    return this.transparencyService.deletePolicy(id);
  }
}