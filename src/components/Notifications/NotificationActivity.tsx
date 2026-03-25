import React, { useEffect, useState } from 'react';
import { useAlert } from 'react-alert';

import getServerURL from '../../serverOverride';

interface NotificationRecord {
  _id: string;
  workerUsername: string;
  clientUsername: string;
  clientPhoneNumber: string;
  message: string;
  sentAt: string;
}

function formatTimestamp(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return iso;
  }
}

export default function NotificationActivity({
  clientUsername, refreshTrigger,
}: {
  clientUsername: string;
  refreshTrigger: number;
}) {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const alert = useAlert();

  useEffect(() => {
    fetch(`${getServerURL()}/get-notification-history`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientUsername }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'SUCCESS') {
          setNotifications(data.notifications || []);
        }
        setIsLoading(false);
      })
      .catch(() => {
        alert.show('Error fetching notification history');
        setIsLoading(false);
      });
  }, [clientUsername, refreshTrigger]);

  if (isLoading) {
    return (<p className="tw-text-center tw-text-gray-500 tw-py-4">Loading...</p>);
  }

  if (notifications.length === 0) {
    return (
      <div className="tw-text-center tw-text-gray-500 tw-py-4">
        No notifications sent yet
      </div>
    );
  }

  return (
    <div className="tw-px-3 tw-py-2">
      {notifications.map((n) => (
        <div
          key={n._id}
          className="tw-border tw-border-gray-200 tw-rounded-md tw-p-3 tw-mb-3 tw-bg-white tw-text-left"
        >
          <div className="tw-flex tw-justify-between tw-items-start tw-mb-2">
            <span className="tw-text-xs tw-font-medium tw-text-gray-500">
              Sent by {n.workerUsername}
            </span>
            <span className="tw-text-xs tw-text-gray-400">
              {formatTimestamp(n.sentAt)}
            </span>
          </div>
          <p className="tw-text-sm tw-text-gray-800 tw-mb-0 tw-leading-relaxed tw-whitespace-pre-wrap">
            {n.message}
          </p>
        </div>
      ))}
    </div>
  );
}
