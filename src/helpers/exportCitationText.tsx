import axios from 'axios';
import getAPIHost from '../api/getHost';
import { AvailableExportCitationType } from '@src/types/citeFormat';

export async function exportCitationText(type: AvailableExportCitationType, selectedPaperIds: string[]) {
  const paperIds = selectedPaperIds.join(',');
  const enumValue = AvailableExportCitationType[type];

  const exportUrl = getAPIHost() + `/citations/export?pids=${paperIds}&format=${enumValue}`;

  await axios
    .get(exportUrl)
    .then(() => {
      window.location.href = exportUrl;
    })
    .catch(() => {
      window.alert('Selected papers can not export citation.');
    });
}
