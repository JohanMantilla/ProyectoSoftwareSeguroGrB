import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PersonalDataService } from './personal-data.service';
import { CreatePersonalDataDto } from './dto/create-personal-data.dto';
import { UpdatePersonalDataDto } from './dto/update-personal-data.dto';
import { PaginationDto } from './dto/pagination.dto';
import { CreateARCORequestDto } from './dto/create-arco-request.dto';
import { FilterARCORequestDto } from './dto/filter-arco-request.dto';
import { UpdateARCORequestDto } from './dto/update-arco-request.dto';
import { CreateSensitiveDataDto } from './dto/create-sensitive-data.dto';

@Controller()
export class PersonalDataController {
  constructor(private readonly personalDataService: PersonalDataService) { }

  // Personal Data Endpoints
  @MessagePattern('personaldata.create')
  create(@Payload() createDto: CreatePersonalDataDto) {
    return this.personalDataService.create(createDto);
  }

  @MessagePattern('personaldata.find.all')
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.personalDataService.findAll(paginationDto);
  }

  @MessagePattern('personaldata.find.one')
  findOne(@Payload() id: string) {
    return this.personalDataService.findOne(id);
  }

  @MessagePattern('personaldata.find.by.titular')
  findByTitularId(@Payload() titularId: string) {
    return this.personalDataService.findByTitularId(titularId);
  }

  @MessagePattern('personaldata.update')
  update(@Payload() payload: { id: string, updateDto: UpdatePersonalDataDto }) {
    return this.personalDataService.update(payload.id, payload.updateDto);
  }

  @MessagePattern('personaldata.remove')
  remove(@Payload() id: string) {
    return this.personalDataService.remove(id);
  }

  // Sensitive Data Endpoints
  @MessagePattern('sensitivedata.create')
  createSensitiveData(@Payload() createDto: CreateSensitiveDataDto) {
    return this.personalDataService.createSensitiveData(createDto);
  }

  // ARCO Request Endpoints
  @MessagePattern('arco.create')
  createARCORequest(@Payload() createDto: CreateARCORequestDto) {
    return this.personalDataService.createARCORequest(createDto);
  }

  @MessagePattern('arco.find.all')
  findAllARCORequests(
    @Payload() payload: { paginationDto: PaginationDto; filterDto?: FilterARCORequestDto }
  ) {
    return this.personalDataService.findAllARCORequests(
      payload.paginationDto,
      payload.filterDto
    );
  }

  @MessagePattern('arco.find.one')
  findOneARCORequest(@Payload() id: string) {
    return this.personalDataService.findOneARCORequest(id);
  }

  @MessagePattern('arco.update')
  updateARCORequest(
    @Payload() payload: { id: string; updateDto: UpdateARCORequestDto }
  ) {
    return this.personalDataService.updateARCORequest(
      payload.id,
      payload.updateDto
    );
  }
}