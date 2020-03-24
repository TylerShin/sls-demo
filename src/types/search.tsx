export type PAPER_LIST_SORT_OPTIONS = 'RELEVANCE' | 'MOST_CITATIONS' | 'OLDEST_FIRST' | 'NEWEST_FIRST';

export interface RawFilter {
  year: string;
  fos: string;
  journal: string;
}

export interface FilterObject {
  yearFrom: number | string;
  yearTo: number | string;
  fos: string[];
  journal: string[];
}
