import React, { useEffect, useState } from 'react';
import { useAlert } from 'react-alert';

import getServerURL from '../../serverOverride';
import ActivityCard from '../BaseComponents/BaseActivityCard';

interface NotifyIdPickupActivity {
  _id: string;
  type: string;
  occurredAt: string;
  objectName: string;
  invokerUsername: string;
  targetUsername: string;
}

export default function NotificationActivity({
  clientUsername, refreshTrigger,
}: {
  clientUsername: string;
  refreshTrigger: number;
}) {
  const [activities, setActivities] = useState<NotifyIdPickupActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const alert = useAlert();

  useEffect(() => {
    fetch(`${getServerURL()}/get-all-activities`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ username: clientUsername }),
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        const allActivities: any[] = responseJSON.activities || [];
        const filtered = allActivities.filter(
          (a) => a.type === 'NotifyIdPickupActivity' && a.targetUsername === clientUsername,
        );
        setActivities(filtered);
        setIsLoading(false);
      })
      .catch(() => {
        alert.show('Error fetching notification history');
        setIsLoading(false);
      });
  }, [clientUsername, refreshTrigger]);

  if (isLoading) {
    return (<p className="tw-text-center tw-text-gray-500">Loading...</p>);
  }

  if (activities.length === 0) {
    return (
      <div className="tw-text-center">
        No notifications found
      </div>
    );
  }

  return (
    <>
      {activities.map((activity) => (
        <ActivityCard key={activity._id} activity={activity} />
      ))}
    </>
  );
}
