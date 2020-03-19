import { CancelToken } from 'axios';
import { normalize } from 'normalizr';
import PlutoAxios from './pluto';
import { Collection, collectionSchema } from '../model/collection';
import { memberSchema, Member } from '../model/member';
import { Profile } from '../model/profile';
import { CommonPaginationResponsePart } from '@src/types/pagination';
import { ProfileParams } from './types/profile';
import { KeywordSettingsResponse } from './types/keywordSetting';

export interface GetCollectionsResponse extends CommonPaginationResponsePart {
  content: Collection[];
  entities: { collections: { [collectionId: number]: Collection } };
  result: number[];
}

export type CreateMemberProfileResponse = {
  profile: Profile;
};

export type MemberProfileParam = ProfileParams & {
  password: string;
};

class MemberAPI extends PlutoAxios {
  public async getMember(
    memberId: number,
    cancelToken?: CancelToken
  ): Promise<{
    entities: { members: { [memberId: number]: Member } };
    result: number;
  }> {
    const res = await this.get(`/members/${memberId}`, { cancelToken });
    const member = res.data;
    const normalizedMember = normalize(member, memberSchema);
    return normalizedMember;
  }

  public async getCollections(memberId: number, cancelToken?: CancelToken): Promise<GetCollectionsResponse> {
    const res = await this.get(`/members/${memberId}/collections`, { cancelToken });
    const data = res.data.data;
    const normalizedCollections = normalize(res.data.data.content, [collectionSchema]);

    return { ...data, ...normalizedCollections };
  }

  public async getMyCollections(paperId: string, cancelToken?: CancelToken): Promise<GetCollectionsResponse> {
    const res = await this.get(`/members/me/collections`, {
      params: {
        paper_id: String(paperId),
      },
      cancelToken,
    });
    const data = res.data.data;
    const normalizedCollections = normalize(res.data.data.content, [collectionSchema]);

    return { ...data, ...normalizedCollections };
  }

  public async getKeywordSettings(): Promise<KeywordSettingsResponse> {
    const res = await this.get(`/members/me/alerts/keywords`);
    return res.data;
  }

  public async newKeywordSettings(keyword: string): Promise<KeywordSettingsResponse> {
    const res = await this.post(`/members/me/alerts/keywords`, { keyword });
    return res.data;
  }

  public async deleteKeywordSettings(keywordId: string): Promise<KeywordSettingsResponse> {
    const res = await this.delete(`/members/me/alerts/keywords/${keywordId}`);
    return res.data;
  }

  public async createMemberWithProfile(token: string, params: MemberProfileParam) {
    const res = await this.post(`/members/profile?token=${token}`, params);
    return res.data.data.content as CreateMemberProfileResponse;
  }
}

const memberAPI = new MemberAPI();

export default memberAPI;
