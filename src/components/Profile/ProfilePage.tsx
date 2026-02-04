import React, { useEffect, useMemo, useState } from 'react';
import { useAlert } from 'react-alert';
import { Helmet } from 'react-helmet';

import getServerURL from '../../serverOverride';

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

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchProfile() {
      setIsLoading(true);
      try {
        const res = await fetch(`${getServerURL()}/get-user-info`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(targetUsername ? { username: targetUsername } : {}),
          signal: controller.signal,
        });
        const json = (await res.json()) as ProfileResponse;
        if (!isMounted) return;

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
        if (isMounted) setIsLoading(false);
      }
    }

    fetchProfile();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [alert, targetUsername]);

  return (
    <div className="container tw-py-6">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content="Keep.id Profile" />
      </Helmet>

      <div className="card mt-3 mb-3 pl-5 pr-5">
        <div className="card-body">
          <h5 className="card-title">Profile</h5>
          {targetUsername && (
            <small className="text-muted">
              Viewing profile for <strong>{targetUsername}</strong>
            </small>
          )}

          <hr />

          {isLoading && <p>Loading...</p>}

          {!isLoading && profile && (
            <div>
              <div className="row mb-2">
                <div className="col-3 text-primary-theme">Username</div>
                <div className="col-9">{profile.username || ''}</div>
              </div>
              <div className="row mb-2">
                <div className="col-3 text-primary-theme">Name</div>
                <div className="col-9">
                  {(profile.firstName || '')} {(profile.lastName || '')}
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-3 text-primary-theme">Email</div>
                <div className="col-9">{profile.email || ''}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Batch 2+: Essential account section */}
      {/* Batch 4+: Saved application information tabs */}
      {/* Batch 3+: Activity components at bottom */}
    </div>
  );
}
