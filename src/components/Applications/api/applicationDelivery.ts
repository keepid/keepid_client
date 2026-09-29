import getServerURL from '../../../serverOverride';
import { ApplicationMailStatus, getApplicationMailTableLabel } from './applicationMailStatus';

export type DeliveryMode = 'MAIL' | 'PRINT_ONLY' | 'RECORD_ONLY';
export type DeliveryFilter = '' | DeliveryMode;
export type DeliveryStatusFilter = '' | 'NEEDS_MAILING' | 'MAILED';

export interface DeliveryRecord {
  deliveryMode?: DeliveryMode;
  applicationState?: string;
  mailStatus?: ApplicationMailStatus;
}

export const deliveryLabels: Record<DeliveryMode, string> = {
  MAIL: 'Mail', PRINT_ONLY: 'Print only', RECORD_ONLY: 'Record only',
};

export const deliveryStatusLabel = (row: DeliveryRecord): string => {
  if (row.applicationState === 'DRAFT') return 'Draft';
  if (row.applicationState === 'CANCELLED') return 'Cancelled';
  if (row.applicationState === 'AWAITING_SIGNATURE') return 'Awaiting signature';
  if (row.deliveryMode === 'PRINT_ONLY') {
    return row.applicationState === 'PRINTED' ? 'Printed and given to client' : 'Ready to print';
  }
  if (row.deliveryMode === 'RECORD_ONLY') return 'Saved for records';
  return getApplicationMailTableLabel(row.mailStatus || 'READY_TO_MAIL');
};

export const matchesDeliveryFilters = (row: DeliveryRecord, mode: DeliveryFilter, status: DeliveryStatusFilter): boolean => {
  const deliveryMode = row.deliveryMode || 'MAIL';
  if (mode && deliveryMode !== mode) return false;
  if (status === 'NEEDS_MAILING') {
    return deliveryMode === 'MAIL'
      && row.applicationState === 'READY_TO_MAIL'
      && (row.mailStatus === 'READY_TO_MAIL' || row.mailStatus === 'NOT_MAILED');
  }
  if (status === 'MAILED') {
    return deliveryMode === 'MAIL'
      && ['MAILED', 'MAILED_WITH_LOB', 'MAILED_MANUALLY'].includes(row.mailStatus || '');
  }
  return true;
};

export const setApplicationPrinted = async (applicationId: string, printed: boolean): Promise<string> => {
  const response = await fetch(`${getServerURL()}/api/service-records/${encodeURIComponent(applicationId)}/printed`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ printed }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Could not update print status.');
  return result.state;
};
