import React, { FC, memo, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '@pluto_network/pluto-design-elements';
import Icon from '@src/components/icons';
import { openImportPaperDialog } from '@src/reducers/importPaperDialog';
import { IMPORT_SOURCE_TAB } from '../../types';
import ProfilePaperItem from '@src/components/paperItem/profilePaperItem';

const useStyles = require('isomorphic-style-loader/useStyles');
const s = require('../../profileShow.scss');

interface Props {
  profileSlug: string;
  paperIds: string[];
  totalCount: number;
  isEditable: boolean;
  fetchProfileShowData: () => void;
  onClickOpenDialog: () => void;
}

const RepresentativePaperListSection: FC<Props> = memo(
  ({ paperIds, isEditable, totalCount, profileSlug, fetchProfileShowData, onClickOpenDialog }) => {
    useStyles(s);
    const dispatch = useDispatch();

    const paperList = useMemo(() => {
      if (!paperIds.length) {
        return (
          <div className={s.noPaperWrapper}>
            <div className={s.noPaperDescription}>There is no representative publications.</div>
          </div>
        );
      } else {
        return paperIds
          .slice(0, 5)
          .map(id => (
            <ProfilePaperItem
              key={id}
              paperId={id}
              pageType="profileShow"
              actionArea="representativePaperList"
              ownProfileSlug={profileSlug}
              isEditable={false}
              fetchProfileShowData={fetchProfileShowData}
              isRepresentative={true}
            />
          ));
      }
    }, [paperIds, profileSlug, fetchProfileShowData]);

    const openShowAllDialogButton = paperIds.length > 5 && (
      <div className={s.showAllButtonWrapper}>
        <Button
          elementType="button"
          color="gray"
          variant="contained"
          title="Open Show All Representative Publications Dialog Button"
          onClick={onClickOpenDialog}
          fullWidth
        >
          <span>SHOW ALL</span>
        </Button>
      </div>
    );

    return (
      <>
        <div className={s.selectedPublicationSection}>
          <div className={s.sectionHeader}>
            <span className={s.sectionTitle}>Representative Publications</span>
            <span className={s.countBadge}>{totalCount}</span>
            <div className={s.rightBox}>
              {isEditable && false && (
                <Button
                  elementType="button"
                  color="gray"
                  variant="outlined"
                  title="Import Representative Publications"
                  onClick={() =>
                    dispatch(
                      openImportPaperDialog({
                        activeImportSourceTab: IMPORT_SOURCE_TAB.BIBTEX,
                        profileSlug,
                        isRepresentativeImporting: true,
                      })
                    )
                  }
                >
                  <Icon icon="ADD_NOTE" />
                  <span>Import Representative Publications</span>
                </Button>
              )}
            </div>
            <div className={s.divider} />
          </div>
          <div className={s.selectedPaperDescription} />
          {paperList}
          {openShowAllDialogButton}
          <div className={s.selectedPaperWrapper}>
            {isEditable && !totalCount && false && (
              <Button
                elementType="button"
                variant="outlined"
                color="gray"
                onClick={() =>
                  dispatch(
                    openImportPaperDialog({
                      activeImportSourceTab: IMPORT_SOURCE_TAB.BIBTEX,
                      profileSlug,
                      isRepresentativeImporting: true,
                    })
                  )
                }
                style={{
                  marginTop: '16px',
                }}
              >
                <Icon icon="PLUS" />
                <span>Import Representative Publications</span>
              </Button>
            )}
          </div>
        </div>
      </>
    );
  }
);

export default RepresentativePaperListSection;
