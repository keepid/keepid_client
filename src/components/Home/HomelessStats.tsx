import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  homelessStatLabel: { id: 'home.stats.homeless-stat-label', defaultMessage: 'Homeless Population in U.S.' },
  homelessStatValue: { id: 'home.stats.homeless-stat-value', defaultMessage: '552,830' },

  philadelphiaHomelessStatLabel: {
    id: 'home.stats.philadelphia-homeless-stat-label',
    defaultMessage: 'Chronically Homeless Population in Philadelphia',
  },
  philadelphiaHomelessStatValue: { id: 'home.stats.philadelphia-homeless-stat-value', defaultMessage: '5,800' },

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
    defaultMessage: 'The lack of <b>identification</b> is a serial struggle for those experiencing homelessness.',
  },

  subProblemShelter: {
    id: 'home.stats.sub-problem.shelter',
    defaultMessage: 'Denied access to shelters or adequate housing services',
  },
  subProblemFoodStamps: { id: 'home.stats.sub-problem.food-stamps', defaultMessage: 'Denied access to food stamps' },
  subProblemMedical: {
    id: 'home.stats.sub-problem.medical',
    defaultMessage: 'Denied access to Medicaid or other medical services',
  },
});

const HomelessStats = (): JSX.Element => {
  const intl = useIntl();

  return (
    <>
      <div className="container-fluid mx-0 pt-5 pb-4 background">
        <div className="container section2">
          <div className="row text-center">
            <SourcedStatistic
              label={intl.formatMessage(messages.homelessStatLabel)}
              stat={intl.formatMessage(messages.homelessStatValue)}
            />
            <SourcedStatistic
              label={intl.formatMessage(messages.philadelphiaHomelessStatLabel)}
              stat={intl.formatMessage(messages.philadelphiaHomelessStatValue)}
            />
            <SourcedStatistic
              label={intl.formatMessage(messages.philadelphiaYouthHomelessStatLabel)}
              stat={intl.formatMessage(messages.philadelphiaYouthHomelessStatValue)}
            />
          </div>
        </div>
      </div>

      <div className="container mt-4 mb-4 pt-5 pb-5">
        <div id="info" className="row d-flex align-items-center">
          <div className="col-md-6 ">
            <h1 className="text-center m-3 pb-5">
              {intl.formatMessage(messages.coreProblem, {
                b: (...chunks) => <span className="text-primary-theme font-weight-bold">{chunks}</span>,
              })}
            </h1>
          </div>
          <div className="col-md-6">
            <SubProblemStatistic label={intl.formatMessage(messages.subProblemShelter)} stat="54%" />
            <SubProblemStatistic label={intl.formatMessage(messages.subProblemFoodStamps)} stat="53%" />
            <SubProblemStatistic label={intl.formatMessage(messages.subProblemMedical)} stat="45%" />
          </div>
        </div>
      </div>
    </>
  );
};

const SourcedStatistic = (props: { label: string; stat: string }): JSX.Element => {
  const intl = useIntl();
  return (
    <div className="col-md-4 flex-column ">
      <h1 className="font-weight-bold statistic-text mb-2">{props.stat}</h1>
      <span className="statistic-subtext">{props.label}</span>
      <p className="text-muted pt-2 pb-2">
        <a href="https://www.projecthome.org/about/facts-homelessness">
          {intl.formatMessage(messages.statsSource)}
        </a>
      </p>
    </div>
  );
};

const SubProblemStatistic = (props: { label: string; stat: string }): JSX.Element => (
  <div className="row d-flex align-items-center">
    <div className="col-6 text-center">
      <h1 className="font-weight-bold statistic-text">{props.stat}</h1>
    </div>
    <div className="col-6">
      <span className="statistic-subtext">{props.label}</span>
    </div>
  </div>
);

export default HomelessStats;
