import React, { useEffect, useMemo, useState } from 'react';
import { useAlert } from 'react-alert';
import { Helmet } from 'react-helmet';

import getServerURL from '../../serverOverride';
import RecentActivity from '../MyInformation/RecentActivity';
import EssentialAccountSection from './EssentialAccountSection';
import SavedApplicationInfoSection from './SavedApplicationInfoSection';

type Props = {
    targetUsername?: string;
};

type ProfileResponse = {
    status?: string;
    message?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    privilegeLevel?: string;
    optionalInformation?: any;
};

export default function ProfilePage({ targetUsername }: Props) {
  const alert = useAlert();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);

  const title = useMemo(() => {
    if (targetUsername) return `Profile: ${targetUsername}`;
    return 'Profile';
  }, [targetUsername]);

  async function fetchProfile(signal?: AbortSignal) {
    setIsLoading(true);
    try {
      const res = await fetch(`${getServerURL()}/get-user-info`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetUsername ? { username: targetUsername } : {}),
        signal,
      });
      const json = (await res.json()) as ProfileResponse;

      if (json?.status && json.status !== 'SUCCESS') {
        alert.show(`Failed to load profile: ${json.message || json.status}`, { type: 'error' });
        setProfile(json);
      } else {
        setProfile(json);
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        alert.show(`Failed to load profile: ${e?.message || String(e)}`, { type: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    fetchProfile(controller.signal);
    return () => {
      controller.abort();
    };
  }, [alert, targetUsername]);

  return (
        <div className="container tw-py-6">
            <Helmet>
                <title>{title}</title>
                <meta name="description" content="Keep.id Profile" />
            </Helmet>

            {targetUsername && (
                <div className="card mt-3 mb-3 pl-5 pr-5">
                    <div className="card-body">
                        <h5 className="card-title tw-mb-0">Profile</h5>
                        <small className="text-muted">
                            Viewing profile for <strong>{targetUsername}</strong>
                        </small>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="card mt-3 mb-3 pl-5 pr-5">
                    <div className="card-body">
                        <p className="tw-mb-0">Loading...</p>
                    </div>
                </div>
            )}

            {!isLoading && profile && (
                <>
                    <EssentialAccountSection
                      profile={profile}
                      targetUsername={targetUsername}
                      onSaved={() => fetchProfile()}
                    />

                    <SavedApplicationInfoSection
                      privilegeLevel={profile.privilegeLevel}
                      optionalInformation={profile.optionalInformation}
                    />

                    {profile.username && (
                        <div className="card mt-3 mb-3 pl-5 pr-5">
                            <div className="card-body">
                                <RecentActivity username={{ username: profile.username }} />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
  );
}
