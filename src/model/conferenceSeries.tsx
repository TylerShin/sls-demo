import { schema } from 'normalizr';

export interface ConferenceSeries {
  id: string;
  name: string;
  paperCount: number;
  citationCount: number;
  nameAbbrev: string | null;
}

export const conferenceSeriesSchema = new schema.Entity('conferenceSeries');
