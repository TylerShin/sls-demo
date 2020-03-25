import React from 'react';
import NoSsr from '@material-ui/core/NoSsr';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import PDFViewer from './components/pdfViewer';
import { withStyles } from '@src/helpers/withStyles';
import ActionBar from './components/paperShowActionBar';
import DesktopRefCitedPapers from './components/refCitedPapers';
import PaperShowRefCitedTab from './components/refCitedTab';
import { formulaeToHTMLStr } from '@src/helpers/displayFormula';
import ErrorPage from '@src/pages/error/errorPage';
import EnvChecker from '@src/helpers/envChecker';
import VenueAndAuthors from '@src/components/paperItem/components/lineVenueAuthors';
import ActionTicketManager from '@src/helpers/actionTicketManager';
import RelatedPapers from './components/relatedPapers';
import PaperShowHelmet from '@src/components/helmet/paperShowHelmet';
import GoBackResultBtn from '@src/components/backButton';
import { ActionCreators } from '@src/actions/actionTypes';
import BottomBanner from './components/preNoted/bottomBanner';
import Footer from '@src/components/footer';
import PaperShowFigureList from '@src/components/paperShowFigureList';
import FindInLibraryDialog from './components/findInLibraryDialog';
import { ActionTagType } from '@src/constants/actionTicket';
import { AppState } from '@src/store/rootReducer';
import ArticleSpinner from '../spinner/articleSpinner';
import { denormalize } from 'normalizr';
import { paperSchema } from '@src/model/paper';
import { UserDevice } from '@src/reducers/layout';
import { RefCitedTabItem, PaperShowMatchParams } from '@src/pages/paperShow/types';
const styles = require('./paperShow.scss');

const NAVBAR_HEIGHT = parseInt(styles.navbarHeight, 10) + 1;
let ticking = false;

function mapStateToProps(state: AppState) {
  return {
    layout: state.layout,
    configuration: state.configuration,
    currentUser: state.currentUser,
    paperShow: state.paperShow,
    paper: denormalize(state.paperShow.paperId, paperSchema, state.entities),
    PDFViewerState: state.PDFViewerState,
  };
}

export type PaperShowProps = RouteComponentProps<PaperShowMatchParams> &
  ReturnType<typeof mapStateToProps> & {
    dispatch: Dispatch<any>;
  };

interface PaperShowStates
  extends Readonly<{
    isAboveRef: boolean;
    isOnRef: boolean;
    isOnCited: boolean;
    isOnFullText: boolean;
  }> {}

const Title: React.FC<{ title: string }> = React.memo(({ title }) => {
  return <h1 className={styles.paperTitle} dangerouslySetInnerHTML={{ __html: formulaeToHTMLStr(title) }} />;
});

const Abstract: React.FC<{ abstract: string }> = React.memo(({ abstract }) => {
  return <div className={styles.abstractContent} dangerouslySetInnerHTML={{ __html: formulaeToHTMLStr(abstract) }} />;
});

@withStyles<typeof PaperShow>(styles)
class PaperShow extends React.PureComponent<PaperShowProps, PaperShowStates> {
  private fullTextTabWrapper: HTMLDivElement | null;
  private refTabWrapper: HTMLDivElement | null;
  private citedTabWrapper: HTMLDivElement | null;

  public constructor(props: PaperShowProps) {
    super(props);

    this.state = {
      isAboveRef: true,
      isOnRef: false,
      isOnCited: false,
      isOnFullText: false,
    };
  }

  public async componentDidMount() {
    const { configuration } = this.props;

    const notRenderedAtServerOrJSAlreadyInitialized =
      !configuration.succeedAPIFetchAtServer || configuration.renderedAtClient;

    window.addEventListener('scroll', this.handleScroll, { passive: true });
    this.handleScrollEvent();

    if (notRenderedAtServerOrJSAlreadyInitialized) {
      this.scrollToRefCitedSection();
    }
  }

  public async componentDidUpdate(prevProps: PaperShowProps) {
    const { paper } = prevProps;

    if (!paper || !this.props.paper) return;

    const moveToDifferentPage = paper.id !== this.props.paper.id;

    if (moveToDifferentPage) {
      this.scrollToRefCitedSection();
      return this.handleScrollEvent();
    }
  }

  public componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  public render() {
    const { layout, paperShow, currentUser, paper, PDFViewerState } = this.props;
    const { isOnFullText, isOnCited, isOnRef } = this.state;

    if (paperShow.isLoadingPaper) {
      return (
        <div className={styles.paperShowWrapper}>
          <ArticleSpinner style={{ margin: '200px auto' }} />
        </div>
      );
    }

    if (paperShow.errorStatusCode) {
      return <ErrorPage />;
    }

    if (!paper) {
      return null;
    }

    return (
      <>
        <div className={styles.container}>
          <PaperShowHelmet paper={paper} />
          <article className={styles.paperShow}>
            <div className={styles.paperShowContent}>
              <GoBackResultBtn className={styles.backBtn} />
              <Title title={paper.title} />
              <VenueAndAuthors pageType="paperShow" actionArea="paperDescription" paper={paper} />
              <div className={styles.paperContentBlockDivider} />
              <div className={styles.actionBarWrapper}>
                <ActionBar
                  paper={paper}
                  isLoadingPDF={PDFViewerState.isLoading}
                  currentUser={currentUser}
                  hasPDFFullText={PDFViewerState.hasSucceed}
                  handleClickFullText={this.scrollToSection('fullText')}
                />
              </div>
              <div className={styles.paperContentBlockDivider} />
              <div className={styles.paperContent}>
                <div className={styles.abstract}>
                  <div className={styles.paperContentBlockHeader}>Abstract</div>
                </div>
                <Abstract abstract={paperShow.highlightAbstract || paper.abstract} />
                <PaperShowFigureList paper={paper} isMobile={layout.userDevice !== UserDevice.DESKTOP} />
              </div>
            </div>
          </article>
          <div>
            <div className={styles.refCitedTabWrapper} ref={el => (this.fullTextTabWrapper = el)}>
              <PaperShowRefCitedTab
                paper={paper}
                currentUser={currentUser}
                afterDownloadPDF={this.scrollToSection('fullText')}
                onClickDownloadPDF={this.handleClickDownloadPDF}
                onClickTabItem={this.handleClickRefCitedTabItem}
                isFixed={isOnFullText || isOnRef || isOnCited}
                isOnRef={isOnRef}
                isOnCited={isOnCited}
                isOnFullText={isOnFullText}
                isLoading={PDFViewerState.isLoading}
                canShowFullPDF={PDFViewerState.hasSucceed}
              />
            </div>
            <NoSsr>
              <PDFViewer paper={paper} />
            </NoSsr>
          </div>
          <RelatedPapers />
          <div className={styles.refCitedTabWrapper} ref={el => (this.refTabWrapper = el)} />
          <div className={styles.referenceWrapper}>
            <article className={styles.paperShow}>
              <div>
                <span className={styles.sectionTitle}>References</span>
                <span className={styles.sectionCount}>{paper.referenceCount}</span>
              </div>
              <div className={styles.otherPapers}>
                <div className={styles.references}>
                  <DesktopRefCitedPapers type="reference" paperId={paper.id} />
                </div>
              </div>
            </article>
          </div>
          <div className={styles.refCitedTabWrapper} ref={el => (this.citedTabWrapper = el)} />
          <div className={styles.citedWrapper}>
            <article className={styles.paperShow}>
              <div>
                <span className={styles.sectionTitle}>Cited By</span>
                <span className={styles.sectionCount}>{paper.citedCount}</span>
              </div>
              <div className={styles.otherPapers}>
                <DesktopRefCitedPapers type="cited" paperId={paper.id} />
              </div>
            </article>
          </div>
        </div>
        <div className={styles.footerWrapper}>
          <Footer containerStyle={{ backgroundColor: '#f8f9fb' }} />
        </div>
        <BottomBanner currentUser={currentUser} />
        <FindInLibraryDialog paperId={paper.id} />
      </>
    );
  }

  private scrollToRefCitedSection = () => {
    const { paperShow, location } = this.props;

    if (paperShow.citedPaperCurrentPage === 1 && location.hash === '#cited') {
      this.scrollToSection('cited');
    } else if (paperShow.referencePaperCurrentPage === 1 && location.hash === '#references') {
      this.scrollToSection('ref');
    }
  };

  private handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(this.handleScrollEvent);
    }
    ticking = true;
  };

  private handleClickDownloadPDF = () => {
    const { dispatch } = this.props;
    dispatch(ActionCreators.clickPDFDownloadBtn());
  };

  private handleScrollEvent = () => {
    const scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;

    // ref/cited tab
    if (this.fullTextTabWrapper && this.refTabWrapper && this.citedTabWrapper) {
      const fullTextOffsetTop = this.fullTextTabWrapper.offsetTop;
      const refOffsetTop = this.refTabWrapper.offsetTop;
      const citedOffsetTop = this.citedTabWrapper.offsetTop;
      const currentScrollTop = scrollTop + NAVBAR_HEIGHT;

      if (citedOffsetTop === 0 && refOffsetTop === 0 && fullTextOffsetTop === 0) {
        this.setState(prevState => ({
          ...prevState,
          isOnFullText: false,
          isOnRef: false,
          isOnCited: false,
          isAboveRef: false,
        }));
      } else if (fullTextOffsetTop > currentScrollTop) {
        this.setState(prevState => ({
          ...prevState,
          isOnFullText: false,
          isOnRef: false,
          isOnCited: false,
          isAboveRef: true,
        }));
      } else if (currentScrollTop >= fullTextOffsetTop && currentScrollTop < refOffsetTop) {
        this.setState(prevState => ({
          ...prevState,
          isOnFullText: true,
          isOnRef: false,
          isOnCited: false,
          isAboveRef: true,
        }));
      } else if (currentScrollTop >= refOffsetTop && currentScrollTop < citedOffsetTop) {
        this.setState(prevState => ({
          ...prevState,
          isOnFullText: false,
          isOnRef: true,
          isOnCited: false,
          isAboveRef: false,
        }));
      } else if (currentScrollTop >= citedOffsetTop) {
        this.setState(prevState => ({
          ...prevState,
          isOnFullText: false,
          isOnRef: false,
          isOnCited: true,
          isAboveRef: false,
        }));
      }
    } else if (this.refTabWrapper && this.citedTabWrapper) {
      const refOffsetBottom = this.refTabWrapper.offsetTop;
      const citedOffsetTop = this.citedTabWrapper.offsetTop;
      const currentScrollTop = scrollTop + NAVBAR_HEIGHT;

      if (!this.state.isAboveRef && currentScrollTop < refOffsetBottom) {
        this.setState(prevState => ({ ...prevState, isAboveRef: true, isOnCited: false, isOnRef: false }));
      } else if (!this.state.isOnRef && currentScrollTop >= refOffsetBottom && currentScrollTop < citedOffsetTop) {
        this.setState(prevState => ({
          ...prevState,
          isAboveRef: false,
          isOnCited: false,
          isOnRef: true,
        }));
      } else if (!this.state.isOnCited && currentScrollTop >= citedOffsetTop) {
        this.setState(prevState => ({
          ...prevState,
          isAboveRef: false,
          isOnCited: true,
          isOnRef: false,
        }));
      }
    }

    ticking = false;
  };

  private handleClickRefCitedTabItem = (section: RefCitedTabItem) => () => {
    const { paper } = this.props;
    let actionTag: ActionTagType;
    if (section === 'fullText') {
      actionTag = 'downloadPdf';
    } else if (section === 'ref') {
      actionTag = 'refList';
    } else {
      actionTag = 'citedList';
    }

    this.scrollToSection(section)();
    ActionTicketManager.trackTicket({
      pageType: 'paperShow',
      actionType: 'fire',
      actionArea: 'contentNavbar',
      actionTag,
      actionLabel: String(paper!.id),
    });
  };

  private scrollToSection = (section: RefCitedTabItem) => () => {
    let target: HTMLDivElement | null = null;

    switch (section) {
      case 'fullText': {
        target = this.fullTextTabWrapper;
        break;
      }

      case 'ref': {
        target = this.refTabWrapper;
        break;
      }

      case 'cited': {
        target = this.citedTabWrapper;
        break;
      }
    }

    if (!EnvChecker.isOnServer() && target) {
      window.scrollTo(0, target.offsetTop - NAVBAR_HEIGHT);
    }
  };
}

export default connect(mapStateToProps)(withRouter(PaperShow));
