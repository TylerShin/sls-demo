import { CancelToken } from 'axios';
import { normalize } from 'normalizr';
import PlutoAxios from './pluto';
import { Collection, collectionSchema } from '../model/collection';
import { Paper } from '../model/paper';
import { PaperInCollection, paperInCollectionSchema } from '../model/paperInCollection';
import { AUTHOR_PAPER_LIST_SORT_OPTIONS } from '@src/types/search';
import { NormalizedDataWithPaginationV2, PaginationResponseV2 } from '@src/types/pagination';

export interface UpdatePaperNoteToCollectionParams {
  paperId: string;
  collectionId: number;
  note: string | null;
}

export interface PostCollectionParams {
  title: string;
  description: string;
}

export interface UpdateCollectionParams {
  collectionId: number;
  title: string;
  description: string;
}

export interface AddPaperToCollectionParams {
  collection: Collection;
  paperId: string;
  note?: string;
  cancelToken?: CancelToken;
}

export interface RemovePapersFromCollectionParams {
  collection: Collection;
  paperIds: string[];
  cancelToken?: CancelToken;
}

export interface GetCollectionsPapersParams {
  collectionId: number;
  page: number;
  sort: AUTHOR_PAPER_LIST_SORT_OPTIONS;
  cancelToken?: CancelToken;
  query?: string;
  size?: number;
}

interface UpdatePaperNoteResponse {
  note: string;
  paper: null;
  collectionId: number;
  paperId: string;
}

interface CollectionAPIGetPapersResult
  extends NormalizedDataWithPaginationV2<{
    papersInCollection: {
      [paperId: string]: PaperInCollection;
    };
  }> {}

class CollectionAPI extends PlutoAxios {
  public async getPapers(params: GetCollectionsPapersParams): Promise<CollectionAPIGetPapersResult> {
    const res = await this.get(`/collections/${params.collectionId}/papers`, {
      params: {
        q: params.query || null,
        page: params.page - 1,
        size: params.size || 10,
        sort: params.sort,
      },
      cancelToken: params.cancelToken,
    });

    const resData: PaginationResponseV2<PaperInCollection[]> = res.data;
    const normalizedData = normalize(resData.data.content, [paperInCollectionSchema]);

    return {
      entities: normalizedData.entities,
      result: normalizedData.result,
      page: { ...resData.data.page!, page: resData.data.page!.page + 1 },
      error: resData.error,
    };
  }

  public async addPaperToCollection(params: AddPaperToCollectionParams): Promise<{ success: true }> {
    const res = await this.post(`/collections/${params.collection.id}/papers`, {
      paper_id: String(params.paperId),
      note: params.note,
    });

    return res.data;
  }

  public async removePapersFromCollection(params: RemovePapersFromCollectionParams): Promise<{ success: true }> {
    const paperString = params.paperIds.join(',');
    const res = await this.delete(`/collections/${params.collection.id}/papers`, {
      params: {
        paper_ids: paperString,
      },
    });

    return res.data;
  }

  public async updatePaperNoteToCollection(
    params: UpdatePaperNoteToCollectionParams
  ): Promise<UpdatePaperNoteResponse> {
    const res = await this.put(`/collections/${params.collectionId}/papers/${params.paperId}`, {
      note: params.note,
    });
    const updatedNote: UpdatePaperNoteResponse = res.data.data;

    return {
      ...updatedNote,
      paperId: String(updatedNote.paperId),
    };
  }

  public async getCollection(
    collectionId: number,
    cancelToken?: CancelToken
  ): Promise<{
    entities: { collections: { [collectionId: number]: Collection } };
    result: number;
  }> {
    const res = await this.get(`/collections/${collectionId}`, { cancelToken });
    return normalize(res.data.data, collectionSchema);
  }

  public async postCollection({
    title,
    description,
  }: PostCollectionParams): Promise<{
    entities: { collections: { [collectionId: number]: Collection } };
    result: number;
  }> {
    const res = await this.post('/collections', {
      title,
      description,
    });
    const normalizedData = normalize(res.data.data, collectionSchema);
    return normalizedData;
  }

  public async deleteCollection(collectionId: number): Promise<{ success: true }> {
    const res = await this.delete(`/collections/${collectionId}`);

    return res.data;
  }

  public async updateCollection(
    params: UpdateCollectionParams
  ): Promise<{
    entities: { collections: { [collectionId: number]: Collection } };
    result: number;
  }> {
    const res = await this.put(`/collections/${params.collectionId}`, {
      title: params.title,
      description: params.description,
    });
    const normalizedData = normalize(res.data.data, collectionSchema);
    return normalizedData;
  }

  public async getRelatedPaperInCollection(collectionId: number): Promise<Paper[]> {
    const res = await this.get(`/collections/${collectionId}/related/sample`);
    return res.data.data.content;
  }
}

const collectionAPI = new CollectionAPI();

export default collectionAPI;
