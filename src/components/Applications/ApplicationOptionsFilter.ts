import { ApplicationFormData } from './Hooks/ApplicationFormHook';

type ApplicationProperties = Pick<ApplicationFormData, 'type' | 'state' | 'situation'>;

export function filterAvailableApplications(
  data: ApplicationFormData,
  availableApplications: ApplicationProperties[],
): ApplicationProperties[] {
  return availableApplications.filter((a) => {
    if (data.type !== '' && a.type !== data.type) return false;
    if (data.state !== '' && a.state !== data.state) return false;
    if (data.situation !== '' && a.situation !== data.situation) return false;
    return true;
  });
}
