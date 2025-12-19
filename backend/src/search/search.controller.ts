import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService, SearchResult } from './search.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('api/search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('global')
  async globalSearch(
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ): Promise<SearchResult[]> {
    const limitNum = limit ? Math.min(parseInt(limit, 10), 20) : 10;
    return this.searchService.globalSearch(query, limitNum);
  }
}
