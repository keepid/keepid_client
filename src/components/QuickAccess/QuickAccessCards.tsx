import '../../static/styles/App.scss';

import React, { useEffect, useState } from 'react';
import { useAlert } from 'react-alert';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

// @ts-ignore
import BirthCertificateSvg from '../../static/images/QuickAccess/BirthCertificate.svg';
// @ts-ignore
import DriversLicenseSvg from '../../static/images/QuickAccess/DriversLicense.svg';
// @ts-ignore
import SocialSecurityCardSvg from '../../static/images/QuickAccess/SocialSecurityCard.svg';
import { fetchDocuments } from './QuickAccess.api';
import Messages from './QuickAccess.messages';
import {
  findMostRecentDocumentForCategory,
  getIdCategoryForQuickAccessCategory,
  QuickAccessFile,
} from './QuickAccess.util';

const quickAccessCards = [
  {
    id: 'social-security',
    svg: SocialSecurityCardSvg,
  },
  { id: 'drivers-license', svg: DriversLicenseSvg },
  { id: 'birth-certificate', svg: BirthCertificateSvg },
];

function QuickAccessCards(): React.ReactElement {
  const intl = useIntl();
  const alert = useAlert();
  const [documents, setDocuments] = useState<QuickAccessFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments()
      .then((docs) => setDocuments(docs))
      .catch(() => {
        alert.show('Failed to fetch quick access documents.');
      })
      .then(() => setLoading(false));
  }, [alert]);

  return (
    <div className="tw-mx-auto tw-py-2 sm:tw-py-4">
      <h2 className="tw-text-2xl tw-font-semibold tw-mb-2 sm:tw-mb-4">Quick Access</h2>
      <div className="tw-grid tw-grid-cols-1 tw-gap-x-4 tw-gap-y-2 sm:tw-grid-cols-2 sm:tw-gap-y-4 lg:tw-grid-cols-3">
        {quickAccessCards.map((c) => {
          const title = intl.formatMessage(
            Messages[`quick-access.${c.id}.title`],
          );
          const document = findMostRecentDocumentForCategory(documents, c.id);
          const idCategory = getIdCategoryForQuickAccessCategory(c.id);
          const missing = !loading && !document;
          const uploadSearch = new URLSearchParams({
            mode: 'choose',
            category: idCategory || '',
            returnTo: `/quick-access/${c.id}`,
          }).toString();
          const to = missing
            ? {
              pathname: '/upload-document',
              search: `?${uploadSearch}`,
            }
            : `/quick-access/${c.id}`;

          return (
            <div
              key={`quick-access-${c.id}`}
              className="quick-access-card tw-rounded-lg tw-bg-white tw-p-3 sm:tw-p-4"
            >
              <Link
                to={to}
                className="tw-block tw-text-inherit tw-no-underline focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-blue-500 focus-visible:tw-ring-offset-2"
              >
                <div className="tw-flex tw-flex-col tw-items-center">
                  <div className="tw-mb-2 sm:tw-mb-4">
                    <img className="tw-h-16 tw-w-16" src={c.svg} alt={title} />
                  </div>
                  <h6 className="tw-text-center tw-mb-1 sm:tw-mb-2">
                    {title}
                  </h6>
                  {!loading && (
                    <span
                      className={`tw-text-xs tw-font-semibold ${
                        missing
                          ? 'tw-text-red-600'
                          : 'tw-rounded-full tw-px-3 tw-py-1 tw-bg-green-100 tw-text-green-800'
                      }`}
                    >
                      {missing ? 'Missing. Scan or Upload' : 'Ready'}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default QuickAccessCards;
