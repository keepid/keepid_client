import React, { useEffect, useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import { ApplicationMailStatus } from './api/applicationMailStatus';
import { validApplicationId } from './applicationLinks';
import ApplicationPdfPreview, { PreviewLocationState } from './ApplicationPdfPreview';

type Props = React.ComponentProps<typeof ApplicationPdfPreview>;

// A UUID URL can be opened in a new tab. Resolve names and permissions through the server.
export default function ApplicationPreviewRoute(props: Props) {
  const location = useLocation();
  const id = new URLSearchParams(location.search).get('applicationId');
  const [resolved, setResolved] = useState<{ id: string; details: PreviewLocationState } | null>(null);
  const [failure, setFailure] = useState<{ id: string; message: string } | null>(null);

  useEffect(() => {
    if (id === null || !validApplicationId(id)) return undefined;
    const controller = new AbortController();
    setResolved(null);
    setFailure(null);
    fetch(`${getServerURL()}/api/applications/${encodeURIComponent(id)}`, {
      credentials: 'include',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            response.status === 401 ? 'Please sign in again to open this application.'
              : 'This application is unavailable or you do not have access.',
          );
        }
        const item = await response.json();
        setResolved({
          id,
          details: {
            applicationId: item.id,
            applicationFilename: item.applicationName || item.title || 'Application',
            clientUsername: item.clientUsername,
            targetUser: item.clientUsername,
            applicantName: [item.clientFirstName, item.clientLastName].filter(Boolean).join(' '),
            uploadedByName: [item.createdByFirstName, item.createdByLastName].filter(Boolean).join(' ')
              || item.createdByUsername,
            createdDate: item.createdAt,
            lastUpdatedDate: item.updatedAt,
            mailStatus: item.mailStatus as ApplicationMailStatus,
            mailedAt: item.mailedAt,
          },
        });
      })
      .catch((error: Error) => {
        if (error.name !== 'AbortError') setFailure({ id, message: error.message });
      });
    return () => controller.abort();
  }, [id]);

  // Preserve existing internal navigation callers while they move to UUID URLs.
  if (id === null) return <ApplicationPdfPreview {...props} />;
  let error = failure?.id === id ? failure.message : null;
  if (!validApplicationId(id)) error = 'This application link is invalid.';
  if (error) {
    return (
    <div className="tw-max-w-4xl tw-mx-auto tw-p-6">
      <Alert variant="danger">{error}</Alert>
      <Link to="/applications">Back to Applications</Link>
    </div>
    );
  }
  if (resolved?.id !== id) {
    return (
    <div className="tw-flex tw-justify-center tw-p-10" role="status">
      <Spinner animation="border" /><span className="tw-ml-3">Loading application...</span>
    </div>
    );
  }
  return <ApplicationPdfPreview key={id} {...props} applicationDetails={resolved.details} />;
}
