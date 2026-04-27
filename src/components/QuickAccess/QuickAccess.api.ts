import getServerURL from '../../serverOverride';
import FileType from '../../static/FileType';
import { QuickAccessFile } from './QuickAccess.util';

export function fetchDocuments(): Promise<QuickAccessFile[]> {
  return fetch(`${getServerURL()}/get-files`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ fileType: FileType.IDENTIFICATION_PDF }),
  })
    .then((response) => response.json())
    .then((x) => (Array.isArray(x.documents) ? x.documents : []));
}
