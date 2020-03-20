import Axios, { AxiosResponse, CancelToken } from 'axios';
import PlutoAxios from './pluto';
import { Paper, PaperPdf } from '../model/paper';
import { PaperAuthor } from '../model/author';
import { PageObjectV2, PaginationResponseV2 } from '@src/types/pagination';
import { AvailableCitationType } from '@src/types/citeFormat';

export interface GetReferenceOrCitedPapersResult extends PageObjectV2 {
  entities: { papers: { [paperId: string]: Paper } };
  result: string[];
}

export interface GetPaperParams {
  paperId: string;
  cancelToken?: CancelToken;
}

export interface GetCitationTextParams {
  type: AvailableCitationType;
  paperId: string;
}

export interface GetCitationTextResult {
  citationText: string;
  format: string;
}

export interface GetCitationTextRawResult {
  citation_text: string | null;
  format: string | null;
}

export interface GetRelatedPapersParams {
  paperId: string;
  cancelToken?: CancelToken;
}

export interface GetOtherPapersFromAuthorParams {
  paperId: string;
  authorId: string;
  cancelToken: CancelToken;
}

export interface GetAuthorsOfPaperParams {
  paperId: string;
  page: number;
  cancelToken: CancelToken;
}

export interface PaperSource {
  paperId: string;
  doi: string | null;
  source: string | null;
  host: string | null;
}

interface RequestLibraryLinkParams {
  paperId: string;
  email: string;
  affiliationName: string;
  affiliationId: string | null;
}

interface RequestLibraryLinkResult {
  alreadyRequested: boolean;
  email: string;
  affiliationName: string;
  totalRequestCount: number;
}

class PaperAPI extends PlutoAxios {
  public async getAuthorsOfPaper({
    paperId,
    page,
    cancelToken,
  }: GetAuthorsOfPaperParams): Promise<PaginationResponseV2<PaperAuthor[]>> {
    const res = await this.get(`/papers/${paperId}/authors`, { params: { page: page - 1 }, cancelToken });
    return res.data as PaginationResponseV2<PaperAuthor[]>;
  }

  public async getCitationText(params: GetCitationTextParams): Promise<GetCitationTextResult> {
    const enumValue = AvailableCitationType[params.type];
    const res: AxiosResponse = await this.get(`/papers/${params.paperId}/citation?format=${enumValue}`);

    return res.data.data;
  }

  public async getBestPdfOfPaper(params: { paperId: string }) {
    const res = await this.post(`/papers/${params.paperId}/pdf`, null);

    return res.data.data.content as PaperPdf;
  }

  public async getPDFBlob(targetURL: string) {
    const res = await this.get(`/proxy/pdf`, {
      params: {
        url: targetURL,
      },
      responseType: 'arraybuffer',
    });

    return { data: res.data as ArrayBuffer };
  }

  public async getSources(paperIds: string[]): Promise<PaperSource[]> {
    const mockRes = await Axios.get('https://api.scinapse.io/papers/sources', {
      params: {
        paper_ids: paperIds.join(','),
      },
    });

    console.log(mockRes);

    const res = await this.get('/papers/sources', {
      headers: { 'Proxy-Trace-Enabled': true },
      params: {
        paper_ids: paperIds.join(','),
      },
    });

    return res.data.data.content;
  }

  public async requestLibraryLink(params: RequestLibraryLinkParams): Promise<RequestLibraryLinkResult> {
    const res = await this.post(`/library-link/request`, {
      paper_id: params.paperId,
      email: params.email,
      affiliation_name: params.affiliationName,
      affiliation_id: params.affiliationId || null,
    });

    return res.data.data.content;
  }
}

const paperAPI = new PaperAPI();

export default paperAPI;
