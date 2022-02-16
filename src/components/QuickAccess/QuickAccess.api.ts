import getServerURL from '../../serverOverride';
import PDFType from '../../static/PDFType';
import { QuickAccessCategory, QuickAccessFile } from './QuickAccess.util';

export function getConfiguredDocumentForCategory(
  category: QuickAccessCategory,
): Promise<QuickAccessFile | null> {
  return Promise.resolve(null);
}

export function fetchDocuments(): Promise<QuickAccessFile[]> {
  return fetch(`${getServerURL()}/get-documents`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ pdfType: PDFType.IDENTIFICATION }),
  })
    .then((response) => response.json())
    .then((x) => {
      console.log('\n\nHEREEE', x, '\n\n');
      return x.documents;
    });
}

export function setQuickAccessDocumentForCategory(
  category: QuickAccessCategory,
  document: QuickAccessFile,
): Promise<void> {
  return Promise.resolve();
}
