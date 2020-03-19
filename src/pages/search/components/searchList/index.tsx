import React from 'react';
import store from 'store';
import { Paper } from '@src/model/paper';
import { CurrentUser } from '@src/model/currentUser';
import { withStyles } from '@src/helpers/withStyles';
import PaperAPI, { PaperSource } from '@src/api/paper';
import SearchPaperItem from '@src/components/paperItem/searchPaperItem';
import { HistoryPaper, RESEARCH_HISTORY_KEY } from '@src/components/researchHistory';
import ArticleSpinner from '@src/components/spinner/articleSpinner';
const styles = require('./searchList.scss');

interface SearchListProps {
  currentUser: CurrentUser;
  papers: Paper[];
  searchQueryText: string;
  isLoading: boolean;
}

const SearchList: React.FC<SearchListProps> = props => {
  const { papers, searchQueryText, isLoading } = props;
  const historyPapers: HistoryPaper[] = store.get(RESEARCH_HISTORY_KEY) || [];
  const [sourceDomains, setSourceDomains] = React.useState<PaperSource[]>([]);

  React.useEffect(() => {
    PaperAPI.getSources(papers.map(p => p.id)).then(domains => {
      setSourceDomains(domains);
    });
  }, [papers]);

  if (!papers || !searchQueryText) return null;

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <ArticleSpinner className={styles.loadingSpinner} />
      </div>
    );
  }

  const searchItems = papers.map(paper => {
    const matchedPaper = historyPapers.find(p => p.id === paper.id);
    let savedAt = null;
    if (matchedPaper) {
      savedAt = matchedPaper.savedAt;
    }

    return (
      <SearchPaperItem
        key={paper.id}
        paper={paper}
        pageType="searchResult"
        actionArea="searchResult"
        savedAt={savedAt}
        sourceDomain={sourceDomains.find(source => source.paperId === paper.id)}
      />
    );
  });

  return <div className={styles.searchItems}>{searchItems}</div>;
};

export default withStyles<typeof SearchList>(styles)(SearchList);
