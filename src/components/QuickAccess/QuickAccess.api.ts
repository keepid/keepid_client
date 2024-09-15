import getServerURL from '../../serverOverride';
import FileType from '../../static/FileType';
import PDFType from '../../static/PDFType';
import { QuickAccessCategory, QuickAccessFile } from './QuickAccess.util';

export function getConfiguredDocumentForCategory(
  category: QuickAccessCategory,
): Promise<QuickAccessFile | null> {
  return Promise.resolve(null);
}

export function fetchDocuments(): Promise<QuickAccessFile[]> {
  return fetch(`${getServerURL()}/get-files`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ fileType: FileType.IDENTIFICATION_PDF }),
  })
    .then((response) => response.json())
    .then((x) => {
      console.log('\n\nInside fetchDocuments, the response is', x, '\n\n');
      return x.documents;
    });
}

export function setQuickAccessDocumentForCategory(
  category: QuickAccessCategory,
  document: QuickAccessFile,
): Promise<void> {
  fetch(`${getServerURL()}/set-default-id`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      documentType: category,
      id: document.id,
    }),
  })
    .then((response) => response.json())
    .then((x) => {
      console.log(
        'Response from server is ',
        x,
        ' for setQuickAccess',
        category,
      );
    });
  return Promise.resolve();
}
