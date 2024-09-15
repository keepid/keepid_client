export enum QuickAccessCategory {
  SocialSecurityCard = 'social-security',
  DriversLicense = 'drivers-license',
  BirthCertificate = 'birth-certificate',
  VaccineCard = 'vaccine-card'
}
export type QuickAccessFile = {
  filename: string;
  uploadDate: string;
  uploader: string;
  id: string;
}
