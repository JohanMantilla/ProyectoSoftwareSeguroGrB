import { 
  Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query, UseGuards 
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from '../config/services.config';
import { CreateConsentDto } from './dto/create-consent.dto';
import { UpdateConsentDto } from './dto/update-consent.dto';
import { MongoIdDto } from './dto/mongo-id.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enum/roles.enum';
import { User } from 'src/auth/decorators';
import { CurrentUser } from 'src/auth/interfaces/current-user.interface';

@Controller('consent')
export class ConsentController {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy
  ) {}

  // 🔹 Crear un nuevo consentimiento
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE)
  @Post('create')
  async create(@Body() createConsentDto: CreateConsentDto) {
    try {
      return await firstValueFrom(
        this.client.send('consent.create', createConsentDto)
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  // 🔹 Obtener todos los consentimientos con paginación
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE)
  @Get('find-all')
  async findAll(@Query() paginationDto: PaginationDto) {
    try {
      return await firstValueFrom(
        this.client.send('consent.findAll', paginationDto)
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  // 🔹 Obtener todos los consentimientos de un titular
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE, Role.USER_ROLE)
  @Get('find-by-titular')
  async findByTitular(@User() user: CurrentUser) {
    try {
      const response = await firstValueFrom(
        this.client.send('consent.findByTitular', { id: user.id })
      );
      return response;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  // 🔹 Obtener un consentimiento por ID
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE)
  @Get('findOne/:id')
  async findOne(@Param() params: MongoIdDto) {
    try {
      const response = await firstValueFrom(
        this.client.send('consent.findOne', { id: params.id })
      );
      return response;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  // 🔹 Actualizar un consentimiento por ID
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE)
  @Patch('update/:id')
  async update(@Param() params: MongoIdDto, @Body() updateConsentDto: UpdateConsentDto) {
    try {
      const response = await firstValueFrom(
        this.client.send('consent.update', { id: params.id, data: updateConsentDto })
      )
      return response;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  // 🔹 Actualizar la fecha de revocación de un consentimiento
  @UseGuards(AuthGuard)
@Roles(Role.ADMIN_ROLE, Role.USER_ROLE)
@Patch('update-revoke-date/:id')
async updateRevokeDate(@Param() params: MongoIdDto, @Body() updateConsentDto: UpdateConsentDto) {
  try {
    // Validar la fecha antes de enviarla al microservicio
    if (updateConsentDto.fechaRevocacion) {
      const parsedDate = new Date(updateConsentDto.fechaRevocacion);
      if (isNaN(parsedDate.getTime())) {
        throw new RpcException('Formato de fecha inválido');
      }
    }

    return await firstValueFrom(
      this.client.send('consent.updateRevokeDate', { id: params.id, data: updateConsentDto })
    );
  } catch (error) {
    throw new RpcException(error);
  }
}


  // 🔹 Revocar un consentimiento (cambia estado a REVOCADO y asigna fechaRevocacion)
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE, Role.USER_ROLE)
  @Patch('revoke/:id')
  async revoke(@Param() params: MongoIdDto) {
    try {
      return await firstValueFrom(
        this.client.send('consent.revoke', { id: params.id })
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  // 🔹 Aprobar un consentimiento (cambia estado a ACTIVO y asigna fechaAprobacion)
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE, Role.USER_ROLE)
  @Patch('aprove/:id')
  async aprove(@Param() params: MongoIdDto) {
    try {
      return await firstValueFrom(
        this.client.send('consent.aprove', { id: params.id })
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  // 🔹 Rechazar un consentimiento (cambia estado a RECHAZADO)
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE, Role.USER_ROLE)
  @Patch('reject/:id')
  async reject(@Param() params: MongoIdDto) {
    try {
      return await firstValueFrom(
        this.client.send('consent.reject', { id: params.id })
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  // 🔹 Eliminar un consentimiento por ID
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE)
  @Delete('remove/:id')
  async remove(@Param() params: MongoIdDto) {
    try {
      const response = await firstValueFrom(
        this.client.send('consent.remove', { id: params.id })
      )
      return response
    } catch (error) {
      throw new RpcException(error);
    }
  }

  // Otener todos los logs de consentimientos
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE)
  @Get('logs')
  async getLogs() {
    try {
      return await firstValueFrom(
        this.client.send('consent.find.all.consent.logs', {})
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
