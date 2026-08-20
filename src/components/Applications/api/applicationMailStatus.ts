import getServerURL from '../../../serverOverride';

export type ApplicationMailStatus =
  | 'AWAITING_SIGNATURE'
  | 'READY_TO_MAIL'
  | 'NOT_MAILED'
  | 'MAILED_WITH_LOB'
  | 'MAILED_MANUALLY';

export interface ApplicationMailStatusInfo {
  mailStatus: ApplicationMailStatus;
  mailedAt: string | null;
}

interface ApplicationMailStatusResponse extends ApplicationMailStatusInfo {
  status: string;
  message?: string;
}

const DEFAULT_STATUS: ApplicationMailStatusInfo = {
  mailStatus: 'READY_TO_MAIL',
  mailedAt: null,
};

const parseResponse = async (response: Response): Promise<ApplicationMailStatusInfo> => {
  const result = await response.json() as ApplicationMailStatusResponse;
  if (!response.ok || result.status !== 'SUCCESS') {
    throw new Error(result.message || 'Could not update application mail status.');
  }
  return {
    mailStatus: result.mailStatus || DEFAULT_STATUS.mailStatus,
    mailedAt: result.mailedAt || null,
  };
};

export const getApplicationMailStatus = async (
  applicationId: string,
): Promise<ApplicationMailStatusInfo> => {
  const response = await fetch(`${getServerURL()}/get-application-mail-status`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId: applicationId }),
  });
  return parseResponse(response);
};

export const setApplicationManuallyMailed = async (
  applicationId: string,
  mailed: boolean,
): Promise<ApplicationMailStatusInfo> => {
  const response = await fetch(`${getServerURL()}/set-application-mail-status`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ applicationId, mailed }),
  });
  return parseResponse(response);
};

export const getApplicationMailTableLabel = (mailStatus: ApplicationMailStatus): string => {
  if (mailStatus === 'AWAITING_SIGNATURE') return 'Awaiting signature';
  if (mailStatus === 'READY_TO_MAIL' || mailStatus === 'NOT_MAILED') return 'Ready to mail';
  if (mailStatus === 'MAILED_WITH_LOB') return 'Mailed with Lob';
  if (mailStatus === 'MAILED_MANUALLY') return 'Printed then mailed';
  return 'Ready to mail';
};

export const getApplicationMailDetailLabel = ({
  mailStatus,
  mailedAt,
}: ApplicationMailStatusInfo): string => {
  if (mailStatus === 'AWAITING_SIGNATURE') return 'Awaiting signature';
  if (mailStatus === 'READY_TO_MAIL' || mailStatus === 'NOT_MAILED') return 'Ready to mail';
  const parsed = mailedAt ? new Date(mailedAt) : null;
  const date = parsed && !Number.isNaN(parsed.getTime())
    ? parsed.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    : null;
  const prefix = mailStatus === 'MAILED_WITH_LOB' ? 'Mailed with Lob' : 'Mailed manually';
  return date ? `${prefix} on ${date}` : prefix;
};
