import { ApplicationFormData } from './Hooks/ApplicationFormHook';

type ApplicationProperties = Partial<Pick<ApplicationFormData, 'applicationId' | 'label' | 'type' | 'state' | 'idType' | 'housingStatus' | 'situation'>>;

export function filterAvailableApplications(
  data: ApplicationFormData,
  availableApplications: ApplicationProperties[],
): ApplicationProperties[] {
  return availableApplications.filter((a) => {
    if (data.applicationId !== '' && a.applicationId !== data.applicationId) return false;
    if (data.type !== '' && a.type && a.type !== data.type) return false;
    if (data.state !== '' && a.state && a.state !== data.state) return false;
    if (data.idType !== '' && a.idType && a.idType !== data.idType) return false;
    if (data.housingStatus !== '' && a.housingStatus && a.housingStatus !== data.housingStatus) return false;
    if (data.situation !== '' && a.situation && a.situation !== data.situation) return false;
    return true;
  });
}
