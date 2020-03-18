import { AxiosResponse, CancelToken, AxiosInstance } from "axios";

export interface CompletionKeyword
  extends Readonly<{
    keyword: string;
    type: string;
  }> {}

export interface FOSSuggestion {
  keyword: string;
  type: "FOS";
  fosId: string;
}

export interface JournalSuggestion {
  keyword: string;
  type: string;
  journalId: string;
  impactFactor: number;
  abbrev: string | null;
  sci: boolean;
  jc: "JOURNAL" | "CONFERENCE";
}

interface FetchSuggestionKeywordParams {
  query: string;
  cancelToken: CancelToken;
  axios: AxiosInstance;
}

export async function fetchSuggestionKeyword({
  query,
  cancelToken,
  axios
}: FetchSuggestionKeywordParams) {
  const getCompleteKeywordResponse: AxiosResponse = await axios.get(
    "/complete",
    { params: { q: query }, cancelToken }
  );

  const completionKeywords: CompletionKeyword[] =
    getCompleteKeywordResponse.data.data;
  return completionKeywords;
}

export async function fetchFOSSuggestion(
  query: string,
  cancelToken: CancelToken
) {
  const res: AxiosResponse = await this.get("/complete/fos", {
    params: {
      q: query
    },
    cancelToken
  });

  const fosList: FOSSuggestion[] = res.data.data.content.map(
    (fos: FOSSuggestion) => ({
      ...fos,
      fosId: String(fos.fosId)
    })
  );
  return fosList;
}

export async function fetchJournalSuggestion(
  query: string,
  cancelToken: CancelToken
) {
  const res: AxiosResponse = await this.get("/complete/journal", {
    params: {
      q: query
    },
    cancelToken
  });

  const journalList: JournalSuggestion[] = res.data.data.content.map(
    (journal: JournalSuggestion) => ({
      ...journal,
      journalId: journal.journalId
    })
  );
  return journalList;
}