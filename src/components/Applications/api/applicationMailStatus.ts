import getServerURL from '../../../serverOverride';

export type ApplicationMailStatus =
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
  mailStatus: 'NOT_MAILED',
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
  if (mailStatus === 'MAILED_WITH_LOB') return 'Mailed with Lob';
  if (mailStatus === 'MAILED_MANUALLY') return 'Printed then mailed';
  return 'Not mailed';
};

export const getApplicationMailDetailLabel = ({
  mailStatus,
  mailedAt,
}: ApplicationMailStatusInfo): string => {
  if (mailStatus === 'NOT_MAILED') return 'Not mailed';
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
