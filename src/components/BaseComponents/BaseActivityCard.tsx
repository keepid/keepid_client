import React from 'react';

interface ActivityProps {
  activity: any;
}

export default function ActivityCard({ activity }: ActivityProps): React.ReactElement {
  const uploaderUsername = activity.invokerUsername;
  const objectName = activity.objectName;
  const { type } = activity;

  if (uploaderUsername && type) {
    const displayType = type.replace('Activity', '');
    const newDate = new Date(Date.parse(activity.occurredAt));
    const dateString = newDate.toLocaleDateString();
    const daysDifference = Math.round(
      (new Date().getTime() - newDate.getTime()) / (1000 * 3600 * 24),
    );

    return (
      <div
        key={activity.id}
        className="activities-card-container flex flex-row justify-between items-center bg-gray-50 rounded-md"
        style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '12px 8px' }} // forces flex row
      >
        {/* Column 1: Activity type */}
        <div style={{ flex: '1', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
          <h6 className="text-gray-600 font-semibold m-0">{displayType}Activity</h6>
        </div>

        {/* Column 2: Object name */}
        <div style={{ flex: '2', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h6 className="text-gray-800 truncate m-0">{objectName}</h6>
        </div>

        {/* Column 3: Metadata */}
        <div style={{ flex: '2', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <p className="text-gray-500 text-sm m-0">
            Completed by {uploaderUsername}, {dateString}, {daysDifference} days ago
          </p>
        </div>
      </div>
    );
  }

  return <div />;
}
