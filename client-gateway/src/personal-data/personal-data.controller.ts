import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Query, UseGuards } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config/services.config';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enum/roles.enum';
import { User } from 'src/auth/decorators';
import { CurrentUser } from 'src/auth/interfaces/current-user.interface';
import { CreatePersonalDataDto } from './dto/create-personal-data.dto';
import { CreateSensitiveDataDto } from './dto/create-sensitive-data.dto';
import { UpdatePersonalDataDto } from './dto/update-personal-data.dto';
import { CreateARCORequestDto } from './dto/create-arco-request.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FilterARCORequestDto } from './dto/filter-arco-request.dto';
import { UpdateARCORequestDto } from './dto/update-arco-request.dto';

@Controller('personal-data')
export class PersonalDataController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) { }

  // Personal Data Endpoints
  @Post('create')
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE,Role.USER_ROLE)
  async createPersonalData(
    @Body() createDto: CreatePersonalDataDto,
    @User() user: CurrentUser
  ) {
    try {
      createDto.titularId = user.id;
      return await firstValueFrom(
        this.client.send('personaldata.create', createDto)
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('all-data')
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE)
  async getAllPersonalData(@Query() paginationDto: PaginationDto) {
    try {
      return await firstValueFrom(
        this.client.send('personaldata.find.all', paginationDto)
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE, Role.USER_ROLE)
  async getPersonalDataById(@Param('id') id: string) {
    try {
      return await firstValueFrom(
        this.client.send('personaldata.find.one', id)
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('titular/:titularId')
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE, Role.USER_ROLE)
  async getPersonalDataByTitularId(@Param('titularId') titularId: string) {
    try {
      return await firstValueFrom(
        this.client.send('personaldata.find.by.titular', titularId)
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE, Role.USER_ROLE)
  async updatePersonalData(
    @Param('id') id: string,
    @Body() updateDto: UpdatePersonalDataDto
  ) {
    try {
      return await firstValueFrom(
        this.client.send('personaldata.update', { id, updateDto })
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE, Role.USER_ROLE)
  async deletePersonalData(@Param('id') id: string) {
    try {
      return await firstValueFrom(
        this.client.send('personaldata.remove', id)
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  // Sensitive Data Endpoints
  @Post('sensitive')
  @UseGuards(AuthGuard)
  @Roles(Role.USER_ROLE)
  async createSensitiveData(
    @Body() createDto: CreateSensitiveDataDto,
    @User() user: CurrentUser
  ) {
    try {
      createDto.titularId = user.id;
      return await firstValueFrom(
        this.client.send('sensitivedata.create', createDto)
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  // ARCO Request Endpoints
  @Post('arco')
  @UseGuards(AuthGuard)
  @Roles(Role.USER_ROLE)
  async createARCORequest(
    @Body() createDto: CreateARCORequestDto,
    @User() user: CurrentUser
  ) {
    try {
      createDto.titularId = user.id;
      return await firstValueFrom(
        this.client.send('arco.create', createDto)
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('arco/requests')
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE)
  async getAllARCORequests(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterARCORequestDto
  ) {
    try {
      // Combinamos los DTOs en un solo objeto payload
      const payload = {
        paginationDto: {
          page: parseInt(paginationDto.page?.toString() || '1'),
          limit: parseInt(paginationDto.limit?.toString() || '10')
        },
        filterDto: filterDto ? {
          titularId: filterDto.titularId,
          tipo: filterDto.tipo,
          status: filterDto.status,
          dateFrom: filterDto.dateFrom ? new Date(filterDto.dateFrom) : undefined,
          dateTo: filterDto.dateTo ? new Date(filterDto.dateTo) : undefined
        } : undefined
      };

      return await firstValueFrom(
        this.client.send('arco.find.all', payload)
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('arco/:id')
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE, Role.USER_ROLE)
  async getARCORequestById(@Param('id') id: string) {
    try {
      return await firstValueFrom(
        this.client.send('arco.find.one', id)
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Patch('arco/:id')
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE)
  async updateARCORequest(
    @Param('id') id: string,
    @Body() updateDto: UpdateARCORequestDto
  ) {
    try {
      return await firstValueFrom(
        this.client.send('arco.update', { id, updateDto })
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('user/arco-requests')
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE, Role.USER_ROLE)
  async getUserARCORequests(
    @User() user: CurrentUser,
    @Query() paginationDto: PaginationDto
  ) {
    try {
      const filterDto: FilterARCORequestDto = { titularId: user.id };
      return await firstValueFrom(
        this.client.send('arco.find.all', { paginationDto, filterDto })
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }
}