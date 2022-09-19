import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  header: {
    id: 'home.client-journey.header',
    defaultMessage: 'A Systemic Cycle',
  },
  homelessStatLabel: {
    id: 'home.stats.homeless-stat-label',
    defaultMessage: 'Homeless Population in U.S.',
  },
  homelessStatValue: {
    id: 'home.stats.homeless-stat-value',
    defaultMessage: '552,830',
  },

  philadelphiaHomelessStatLabel: {
    id: 'home.stats.philadelphia-homeless-stat-label',
    defaultMessage: 'Chronically Homeless Population in Philadelphia',
  },
  philadelphiaHomelessStatValue: {
    id: 'home.stats.philadelphia-homeless-stat-value',
    defaultMessage: '5,800',
  },

  philadelphiaYouthHomelessStatLabel: {
    id: 'home.stats.philadelphia-youth-homeless-stat-label',
    defaultMessage: 'Youth experiencing Homelessness in Philadelphia',
  },
  philadelphiaYouthHomelessStatValue: {
    id: 'home.stats.philadelphia-youth-homeless-stat-value',
    defaultMessage: '6,583',
  },

  statsSource: { id: 'home.stats.source', defaultMessage: 'Source' },

  coreProblem: {
    id: 'home.stats.core-problem',
    defaultMessage:
      'The lack of <b>identification</b> is a serial struggle for those experiencing homelessness.',
  },

  subProblemShelter: {
    id: 'home.stats.sub-problem.shelter',
    defaultMessage: 'Denied access to shelters or adequate housing services',
  },
  subProblemFoodStamps: {
    id: 'home.stats.sub-problem.food-stamps',
    defaultMessage: 'Denied access to food stamps',
  },
  subProblemMedical: {
    id: 'home.stats.sub-problem.medical',
    defaultMessage: 'Denied access to Medicaid or other medical services',
  },
});

function HomelessStats(): JSX.Element {
  const intl = useIntl();

  return (
    <>
      <div className="w-100 partial-background">
        <div className="container">
          <h1 className="text-white pt-4 pb-4">
            {intl.formatMessage(messages.header)}
          </h1>
        </div>
      </div>
      <div className="container mt-4 mb-4 pt-5 pb-5">
        <div id="info" className="row d-flex align-items-center">
          <div className="col-md-6 ">
            <h1 className="text-center m-3 pb-5">
              {intl.formatMessage(messages.coreProblem, {
                b: (...chunks) => (
                  <span className="text-primary-theme font-weight-bold">
                    {chunks}
                  </span>
                ),
              })}
            </h1>
          </div>
          <div className="col-md-6">
            <SubProblemStatistic
              label={intl.formatMessage(messages.subProblemShelter)}
              stat="54%"
            />
            <SubProblemStatistic
              label={intl.formatMessage(messages.subProblemFoodStamps)}
              stat="53%"
            />
            <SubProblemStatistic
              label={intl.formatMessage(messages.subProblemMedical)}
              stat="45%"
            />
          </div>
        </div>
      </div>
    </>
  );
}

function SubProblemStatistic(props: {
  label: string;
  stat: string;
}): JSX.Element {
  return (
<div className="row d-flex align-items-center">
    <div className="col-6 text-center">
      <h1 className="font-weight-bold statistic-text">{props.stat}</h1>
    </div>
    <div className="col-6">
      <span className="statistic-subtext">{props.label}</span>
    </div>
</div>
  );
}

export default HomelessStats;
