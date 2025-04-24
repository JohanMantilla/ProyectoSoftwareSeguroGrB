import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { NATS_SERVICE } from '../config/services.config';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enum/roles.enum';
import { CreatePrivacyPolicyDto } from './dto/create-privacy-policy.dto';
import { UpdatePrivacyPolicyDto } from './dto/update-privacy-policy.dto';

@Controller('transparency')
export class TransparencyController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @UseGuards(AuthGuard)
  @Get('policies')
  async getAllPolicies() {
    try {
      return await firstValueFrom(
        this.client.send('get.all.policies', {})
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE)
  @Post('policies')
  async createPolicy(@Body() createDto: CreatePrivacyPolicyDto) {
    try {
      return await firstValueFrom(
        this.client.send('create.policy', createDto)
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE)
  @Put('policies/:id')
  async updatePolicy(
    @Param('id') id: string,
    @Body() updateDto: UpdatePrivacyPolicyDto
  ) {
    try {
      return await firstValueFrom(
        this.client.send('update.policy', { id, updateDto })
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE)
  @Delete('policies/:id')
  async deletePolicy(@Param('id') id: string) {
    try {
      return await firstValueFrom(
        this.client.send('delete.policy', id)
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }
}