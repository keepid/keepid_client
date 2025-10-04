import { ApplicationFormData } from './Hooks/ApplicationFormHook';

type ApplicationProperties = Pick<ApplicationFormData, 'type' | 'state' | 'situation'>;

export const availableApplications: ApplicationProperties[] = [
  { type: 'PIDL', state: 'PA', situation: 'PI$RENEWAL' },
  { type: 'PIDL', state: 'PA', situation: 'PI$INITIAL' },
  { type: 'SS', state: 'FED', situation: 'REPLACEMENT' },
];

export function filterAvailableApplications(data: ApplicationFormData): ApplicationProperties[] {
  return availableApplications.filter((a) => {
    if (data.type !== '' && a.type !== data.type) return false;
    if (data.state !== '' && a.state !== data.state) return false;
    if (data.situation !== '' && a.situation !== data.situation) return false;
    return true;
  });
}
