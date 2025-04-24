import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Gender } from './enums/user.enum';
import { NATS_SERVICE } from '../config/services.config';
import { firstValueFrom, TimeoutError } from 'rxjs';

@Injectable()
export class UserService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('User-Service');

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy
  ) {
    super()

  }

  async onModuleInit() {
    this.$connect();
    this.logger.log('MongoDb connected')

  }

  private handleError(error: any, defaultMessage: string, httpStatus: HttpStatus) {
    if (error instanceof RpcException) {
      throw error;
    }
    if (error instanceof TimeoutError) {
      throw new RpcException({
        status: HttpStatus.GATEWAY_TIMEOUT,
        message: 'Operation timed out',
      });
    }
    throw new RpcException({
      status: HttpStatus.INTERNAL_SERVER_ERROR || httpStatus,
      message: error.message || defaultMessage,
    });
  }

  private async fetchResourcesByIds(pattern: string, ids: string[] | number[]) {
    if (ids.length === 0) return [];

    return await firstValueFrom(
      this.client.send(pattern, { ids })
    );
  }


  async createUser(createUserDto: CreateUserDto) {
    try {
      const user = await this.user.findUnique({
        where: {
          email: createUserDto.email,
          isActive: true
        }
      })

      if (user) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: 'User already exists'
        })
      }
      const newUser = await this.user.create({
        data: createUserDto
      })
      return newUser;
    } catch (error) {
      this.handleError(
        error,
        'Internal server error creating user',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async findAllUser(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto
    const totalUsers = await this.user.count({ where: { isActive: true } });
    const lastPage = Math.ceil(totalUsers / limit)
    return {
      data: await this.user.findMany({
        where: { isActive: true },
        skip: (page - 1) * limit,
        take: limit
      }),
      meta: {
        totalUsers,
        page,
        lastPage
      }
    };
  }

  async findByEmail(email: string) {
    try {
      const user = await this.user.findUnique({ where: { email, isActive: true } })
      if (!user) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: `User not found`
        })
      }
      return user;

    } catch (error) {
      this.handleError(
        error,
        'Internal server error when searching for user by email',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async findUserById(id: string) {
    try {
      const user = await this.user.findUnique({ where: { id, isActive: true } })
      if (!user) {
        throw new RpcException({
          message: `User with id ${id} not found`,
          status: HttpStatus.NOT_FOUND
        })
      }
      return user;

    } catch (error) {
      this.handleError(
        error,
        'Internal server error finding user',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    try {
      await this.findUserById(id)
     
      const updatedUser = await this.user.update({
        where: { id, isActive: true },
        data: {
          ...updateUserDto,
          updatedAt: new Date()
        },
      });

      if (!updatedUser) {
        throw new RpcException({
          message: `User with id ${id} not found`,
          status: HttpStatus.NOT_FOUND,
        });
      }
      return {
        success: true,
        user: updatedUser
      };;

    } catch (error) {
      this.handleError(
        error,
        'Internal server error updating user',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async removeUser(id: string) {
    try {
      const updatedUser = await this.user.update({
        where: { id, isActive: true },
        data: {
          isActive: false,
          updatedAt: new Date()
        },
      });

      if (!updatedUser) {
        throw new RpcException({
          message: `User with id ${id} not found or already inactive`,
          status: HttpStatus.NOT_FOUND,
        });
      }

      return {
        success: true,
        message: `User with id ${id} has been deactivated`
      };

    } catch (error) {
      this.handleError(
        error,
        'Internal server error deleting user',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }





 
  





}


