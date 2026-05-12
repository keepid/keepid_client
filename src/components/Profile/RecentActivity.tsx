import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useAlert } from 'react-alert';

import getServerURL from '../../serverOverride';

function RecentActivity({ username }) {
  const [activities, setActivities] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const alert = useAlert();

  const renderActivitiesCard = (activities) => {
    if (activities.length > 0) {
      // eslint-disable-next-line no-underscore-dangle
      return activities
        .slice(0, 5) // only get the first number of elements
        .map((activity) => (
          <li className="odd:tw-bg-gray-100">
            <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
              <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                {activity.type}
              </p>
              <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                {format(new Date(activity.occurredAt), 'yyyy/MM/dd hh:mm a')}
              </p>
            </div>
          </li>
        ));
    }
    if (!isLoading) {
      return (
        <div className="tw-ml-2">
          <h3>No activities found!</h3>
        </div>
      );
    }
    return null;
  };

  const fetchRecentActivity = () => {
    fetch(`${getServerURL()}/get-all-activities`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ username: username.username }),
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        setActivities(responseJSON.activities);
        // console.log(responseJSON.activities);
        setIsLoading(false);
      })
      .catch((error) => {
        alert.show('Error fetching recent activity');
      });
  };

  useEffect(() => {
    if (!isCollapsed && !hasFetched) {
      setHasFetched(true);
      fetchRecentActivity();
    }
  }, [isCollapsed, hasFetched]);

  return (
    <div>
      <button
        type="button"
        className="btn btn-link tw-p-0 tw-text-left tw-no-underline hover:tw-no-underline focus:tw-no-underline"
        onClick={() => setIsCollapsed((prev) => !prev)}
        aria-expanded={!isCollapsed}
        aria-label={isCollapsed ? 'Expand recent activity' : 'Collapse recent activity'}
      >
        <h5 className="card-title tw-mb-0">
          Recent Activity
          <span className="tw-ml-2 tw-text-gray-500">{isCollapsed ? '▸' : '▾'}</span>
        </h5>
      </button>
      {!isCollapsed && <hr />}
      {!isCollapsed && (
        <ul className="tw-list-none tw-mb-20 tw-mt-4 tw-pl-0">
          {isLoading ? <li className="tw-text-gray-500">Loading...</li> : renderActivitiesCard(activities)}
        </ul>
      )}
    </div>
  );
}

export default RecentActivity;
