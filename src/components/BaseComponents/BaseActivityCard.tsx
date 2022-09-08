import React from 'react';

interface ActivityProps {
  activity: any;
}

export default function (props: ActivityProps): React.ReactElement {
  const { activity } = props;
  const uploaderUsername = activity.username;
  const { type } = activity;
  if (uploaderUsername !== '' && type !== '') {
    const displayType = type.split('Activity');
    const newDate = new Date(Date.parse(activity.occurredAt));
    // return mm/dd/yyyy version of date
    const dateString = newDate.toLocaleDateString();
    // return difference number of days between current date and dateString for activity
    const daysDifference = Math.round(
      (new Date().getTime() - newDate.getTime()) / (1000 * 3600 * 24),
    );
    // eslint-disable-next-line no-underscore-dangle
    return (
      <div key={activity.id} className="ml-2 activities-card-container">
        <h6 id="activities-card-title">
          {displayType}
          Activity
        </h6>
        <p id="activities-card-date">
          {`Completed by ${uploaderUsername}, ${dateString}, ${daysDifference} days ago`}
        </p>
      </div>
    );
  }
  return <div />;
}
