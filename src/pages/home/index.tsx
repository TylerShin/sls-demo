import React, { FC } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import { LazyImage } from '@pluto_network/pluto-design-elements';
import { useSelector } from 'react-redux';
import HomeAPI from '@src/api/home';
import SearchInput from '../../components/searchInput';
import Footer from '../../components/footer';
import Icon from '../../components/icons';
import { AppState } from '../../store/rootReducer';
import { UserDevice } from '../../reducers/layout';
import formatNumber from '@src/helpers/formatNumber';
import { Institute } from '@src/model/Institute';
import AffiliationsInfo from './components/affiliationsInfo';
const useStyles = require('isomorphic-style-loader/useStyles');
const styles = require('./home.scss');

const MAX_KEYWORD_SUGGESTION_LIST_COUNT = 5;
const JOURNALS = [
  'nature',
  'science',
  'ieee',
  'cell',
  'acs',
  'aps',
  'lancet',
  'acm',
  'jama',
  'bmj',
  'pnas',
  'more-journals',
];
const MOBILE_JOURNALS = ['nature', 'science', 'lancet', 'acm', 'ieee', 'cell', 'more-journal-mobile'];

const HomeHelmet: FC = () => {
  const structuredData = {
    '@context': 'http://schema.org',
    '@type': 'Organization',
    url: 'https://scinapse.io',
    logo: 'https://s3.amazonaws.com/pluto-asset/scinapse/scinapse-logo.png',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        email: 'team@pluto.network',
        url: 'https://pluto.network',
        contactType: 'customer service',
      },
    ],
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://scinapse.io/search?query={search_term_string}&utm_source=google_search_result',
      'query-input': 'required name=search_term_string',
    },
    sameAs: [
      'https://www.facebook.com/PlutoNetwork',
      'https://twitter.com/pluto_network',
      'https://medium.com/pluto-network',
      'https://pluto.network',
    ],
  };

  return (
    <Helmet
      script={[
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(structuredData),
        },
      ]}
    >
      <link rel="canonical" href="https://scinapse.io" />
    </Helmet>
  );
};

const ScinapseFigureContent: React.FC<{ paperCount: number }> = ({ paperCount }) => {
  return (
    <>
      <div className={styles.cumulativeCountContainer}>
        <span>
          <b>120,000+</b> registered researchers have found
        </span>
        <br />
        <span>
          <b>
            {formatNumber(paperCount)}
            {`+`}
          </b>
          {` papers using Scinapse`}
        </span>
      </div>
      <Icon icon="ARROW_DOWN" className={styles.downIcon} />
    </>
  );
};

const Home: React.FC = () => {
  useStyles(styles);
  const isMobile = useSelector<AppState, boolean>((state: AppState) => state.layout.userDevice === UserDevice.MOBILE);
  const instituteInfo = useSelector<AppState, Institute | null>((state: AppState) => state.currentUser.ipInstitute);
  const [papersFoundCount, setPapersFoundCount] = React.useState(0);
  const cancelToken = React.useRef(axios.CancelToken.source());

  React.useEffect(() => {
    HomeAPI.getPapersFoundCount().then(res => {
      setPapersFoundCount(res.data.content);
    });

    return () => {
      cancelToken.current.cancel();
      cancelToken.current = axios.CancelToken.source();
    };
  }, []);
  const journalList = (isMobile ? MOBILE_JOURNALS : JOURNALS).map((journal, index) => {
    return (
      <div className={styles.journalImageWrapper} key={index}>
        <LazyImage
          src={`https://assets.pluto.network/journals/${journal}.png`}
          webpSrc={`https://assets.pluto.network/journals/${journal}.webp`}
          imgClassName={styles.journalImage}
          loading="lazy"
          alt={`${journal}LogoImage`}
        />
      </div>
    );
  });

  return (
    <div className={styles.articleSearchFormContainer}>
      <HomeHelmet />
      <h1 style={{ display: 'none' }}>Scinapse | Academic search engine for paper</h1>
      <div className={styles.searchFormInnerContainer}>
        <div className={styles.searchFormContainer}>
          <div className={styles.formWrapper}>
            <div className={styles.title}>
              <Icon icon="SCINAPSE_HOME_LOGO" className={styles.scinapseHomeLogo} />
            </div>
            <div className={styles.subTitle}>Academic Search Engine</div>
            {instituteInfo && (
              <div className={styles.instituteName}>
                for <b>{instituteInfo.name}</b>
              </div>
            )}
            <div tabIndex={0} className={styles.searchInputForm}>
              <SearchInput
                maxCount={MAX_KEYWORD_SUGGESTION_LIST_COUNT}
                actionArea="home"
                autoFocus={!isMobile}
                inputClassName={styles.searchInput}
              />
            </div>
            <div className={styles.searchTryKeyword} />
            <div className={styles.catchphrase}>We’re better than Google Scholar. We mean it.</div>
            <ScinapseFigureContent paperCount={papersFoundCount} />
          </div>
        </div>
        <div>
          <div className={styles.journalsInfo}>
            <div className={styles.title}>
              Covering <span className={styles.bold}>48,000</span> journals and counting
            </div>
            <div className={styles.contentBlockDivider} />
            <div className={styles.journalListContainer}>{journalList}</div>
          </div>
          <AffiliationsInfo />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Home;
