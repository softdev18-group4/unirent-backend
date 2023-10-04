import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { GetUser } from '@/common/decorators/get-users.decorator';
import { JwtGuard } from '@/common/guards/jwt.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) { }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @Roles(Role.Admin)
  create(
    @Body() createCouponDto: CreateCouponDto,
    @GetUser() currentUser,
  ) {
    return this.couponsService.create(createCouponDto, currentUser);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @Roles(Role.Admin)
  findAll() {
    return this.couponsService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @Roles(Role.Admin)
  findOne(@Param('id') id: string) {
    return this.couponsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @Roles(Role.Admin)
  update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponsService.update(id, updateCouponDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @Roles(Role.Admin)
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }
}
