import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { MongoIdDto } from './dto/mongo-id.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) { }

  @MessagePattern('create.user')
  createUser(@Payload() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @MessagePattern('find.all.users')
  findAllUser(@Payload() paginationDto: PaginationDto) {
    return this.userService.findAllUser(paginationDto);
  }

  @MessagePattern('find.user.by.id')
  findById(@Payload() mongoIdDto: MongoIdDto) {
    return this.userService.findUserById(mongoIdDto.id);
  }
  @MessagePattern('find.user.by.email')
  findByEmail(@Payload() email: string) {
    return this.userService.findByEmail(email);
  }

  @MessagePattern('update.user')
  updateUser(@Payload() payload: { id: string, updateUserDto: UpdateUserDto }) {
    return this.userService.updateUser(payload.id, payload.updateUserDto);
  }

  @MessagePattern('remove.user')
  removeUser(@Payload() mongoIdDto: MongoIdDto) {
    return this.userService.removeUser(mongoIdDto.id);
  }


}
