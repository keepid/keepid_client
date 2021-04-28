import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import statementOfSolidarity from '../../static/images/Team Keep AAPI Solidarity Statement.pdf';

const messages = defineMessages({
  statement: {
    id: 'home.statement-of-solidarity',
    defaultMessage:
            'We condemn the rising wave of violence and xenophobic rhetoric against members of the Asian American Pacific Islander (AAPI) community. Read our Statement of Solidarity with the AAPI Community <a>here</a>',
  },
});

const StatementOfSolidarity = () => {
  const intl = useIntl();
  const [showBanner, setShowBanner] = useState(true);
  return (
    <div>
      {showBanner && (
        <div className="w-100" style={{ backgroundColor: '#FFBB7B' }}>
          <button
            type="button"
            className="close float-right mr-5 mt-1"
            aria-label="Close"
            onClick={() => setShowBanner(false)}
          >
            <span aria-hidden="true">&times;</span>
          </button>
          <div className="container text-center py-2 font-weight-bold">
            {intl.formatMessage(messages.statement, {
              a: (...chunks) => (
                <a href={statementOfSolidarity} target="_blank" rel="noreferrer">
                  {chunks}
                </a>
              ),
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatementOfSolidarity;
