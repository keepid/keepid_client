import getServerURL from '../../serverOverride';
import PDFType from '../../static/PDFType';
import { QuickAccessCategory, QuickAccessFile } from './QuickAccess.util';

export function getConfiguredDocumentForCategory(
  category: QuickAccessCategory,
): Promise<QuickAccessFile | null> {
  return Promise.resolve(null);
}

export function fetchDocuments(): Promise<QuickAccessFile[]> {
  return fetch(`${getServerURL()}/filter-pdf-2`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ pdfType: PDFType.IDENTIFICATION_DOCUMENT }),
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
