import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('Руководитель')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles('Руководитель')
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('couriers')
  async findCouriers() {
    return this.usersService.findCouriers();
  }

  @Get(':id')
  @Roles('Руководитель')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('Руководитель')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/deactivate')
  @Roles('Руководитель')
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.update(id, { isActive: false });
  }

  @Patch(':id/activate')
  @Roles('Руководитель')
  async activate(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.update(id, { isActive: true });
  }

  @Delete(':id')
  @Roles('Руководитель')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
