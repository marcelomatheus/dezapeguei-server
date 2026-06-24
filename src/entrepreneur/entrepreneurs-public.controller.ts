import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EntrepreneurService } from './entrepreneur.service';

@ApiTags('Entrepreneurs')
@Controller('entrepreneurs')
export class EntrepreneursPublicController {
  constructor(private readonly entrepreneurService: EntrepreneurService) {}

  @Get(':id')
  findPublic(@Param('id') id: string) {
    return this.entrepreneurService.getPublicProfile(id);
  }
}
