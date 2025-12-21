import { SearchService, SearchResult } from './search.service';
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    globalSearch(query: string, limit?: string): Promise<SearchResult[]>;
}
