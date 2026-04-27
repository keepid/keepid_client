import { IdCategories } from '../Documents/IdCategories';

export enum QuickAccessCategory {
  SocialSecurityCard = 'social-security',
  DriversLicense = 'drivers-license',
  BirthCertificate = 'birth-certificate',
}

export const QUICK_ACCESS_ID_CATEGORIES: Record<QuickAccessCategory, IdCategories> = {
  [QuickAccessCategory.SocialSecurityCard]: IdCategories.SocialSecurityCard,
  [QuickAccessCategory.DriversLicense]: IdCategories.DriversLicense,
  [QuickAccessCategory.BirthCertificate]: IdCategories.BirthCertificate,
};

// The server's `idCategory` field is the IdCategoryType enum's `name()`
// (e.g. SOCIAL_SECURITY_CARD), while `idCategoryDisplay` (and the legacy
// `idCategory` value pre-enum) is the human-readable form
// (e.g. "Social Security Card"). We match against either.
const QUICK_ACCESS_ENUM_NAMES: Record<QuickAccessCategory, string> = {
  [QuickAccessCategory.SocialSecurityCard]: 'SOCIAL_SECURITY_CARD',
  [QuickAccessCategory.DriversLicense]: 'DRIVERS_LICENSE_PHOTO_ID',
  [QuickAccessCategory.BirthCertificate]: 'BIRTH_CERTIFICATE',
};

export type QuickAccessFile = {
  filename: string;
  uploadDate: string;
  uploader: string;
  id: string;
  idCategory?: string;
  idCategoryDisplay?: string;
}

export function getIdCategoryForQuickAccessCategory(
  category: string,
): IdCategories | undefined {
  return QUICK_ACCESS_ID_CATEGORIES[category as QuickAccessCategory];
}

export function findMostRecentDocumentForCategory(
  documents: QuickAccessFile[],
  category: string,
): QuickAccessFile | null {
  const displayName = getIdCategoryForQuickAccessCategory(category);
  if (!displayName) return null;
  const enumName = QUICK_ACCESS_ENUM_NAMES[category as QuickAccessCategory];

  const matches = documents.filter((doc) => {
    const raw = (doc.idCategory || '').trim();
    const display = (doc.idCategoryDisplay || '').trim();
    return raw === displayName
      || raw === enumName
      || display === displayName;
  });
  if (matches.length === 0) return null;

  return matches.sort((a, b) => {
    const aTime = new Date(a.uploadDate).getTime();
    const bTime = new Date(b.uploadDate).getTime();
    return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
  })[0];
}
