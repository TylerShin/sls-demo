import { CancelToken } from 'axios';
import { Paper } from '@src/model/paper';
import { AggregationData } from '@src/model/aggregation';
import { Suggestion } from '@src/model/suggestion';
import { BasePaperAuthor } from '@src/model/author';
import { Affiliation } from '@src/model/affiliation';
import { Author } from '@src/model/author/author';
import { NewFOS } from '@src/model/fos';
import { PaginationResponseV2, PageObjectV2 } from '@src/types/pagination';

export interface BaseSearchParams {
  query: string;
  sort: string;
  page?: number;
  cancelToken?: CancelToken;
  detectYear?: boolean;
}

export interface PaperSearchParams extends BaseSearchParams {
  filter: string;
}

export interface MatchEntityAuthor extends BasePaperAuthor {
  lastKnownAffiliation: Affiliation | null;
  fosList: NewFOS[];
  paperCount: number;
  citationCount: number;
  profileImageUrl: string | null;
  representativePapers: Paper[];
}

export interface MatchAuthor {
  content: MatchEntityAuthor[];
  totalElements: number;
}

export interface SearchResult extends PaginationResponseV2<Paper[]> {
  data: {
    content: Paper[];
    page: PageObjectV2 | null;
    doi: string | null;
    doiPatternMatched: boolean;
    aggregation: AggregationData | null;
    matchedAuthor: MatchAuthor;
    resultModified: boolean;
    suggestion: Suggestion | null;
    detectedYear: number | null;
    detectedPhrases: string[];
  };
}

export interface AuthorSearchResult extends PaginationResponseV2<Author[]> {
  data: {
    content: Author[];
    page: PageObjectV2 | null;
  };
}
