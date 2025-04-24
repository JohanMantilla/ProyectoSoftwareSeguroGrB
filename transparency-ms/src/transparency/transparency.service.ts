import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { CreatePrivacyPolicyDto } from './dto/create-privacy-policy.dto';
import { UpdatePrivacyPolicyDto } from './dto/update-privacy-policy.dto';

@Injectable()
export class TransparencyService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('Transparency-Service');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('MongoDb connected');
  }

  async getAllPolicies() {
    try {
      return await this.privacyPolicy.findMany({
        orderBy: {
          titulo: 'asc'
        }
      });
    } catch (error) {
      this.logger.error(error);
      throw new RpcException(error);
    }
  }

  async createPolicy(createDto: CreatePrivacyPolicyDto) {
    try {
      return await this.privacyPolicy.create({
        data: createDto
      });
    } catch (error) {
      this.logger.error(error);
      throw new RpcException(error);
    }
  }

  async updatePolicy(id: string, updateDto: UpdatePrivacyPolicyDto) {
    try {
      return await this.privacyPolicy.update({
        where: { id },
        data: updateDto
      });
    } catch (error) {
      this.logger.error(error);
      throw new RpcException(error);
    }
  }

  async deletePolicy(id: string) {
    try {
      return await this.privacyPolicy.delete({
        where: { id }
      });
    } catch (error) {
      this.logger.error(error);
      throw new RpcException(error);
    }
  }
}