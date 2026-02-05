import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAlert } from 'react-alert';
import { Helmet } from 'react-helmet';

import getServerURL from '../../serverOverride';
import AccountSettingsSection from './AccountSettingsSection';
import EssentialAccountSection from './EssentialAccountSection';
import ProfileModal from './ProfileModal';
import RecentActivity from './RecentActivity';
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
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoAvailable, setPhotoAvailable] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const title = useMemo(() => {
    if (targetUsername) return `Profile: ${targetUsername}`;
    return 'Profile';
  }, [targetUsername]);

  const loadProfilePhoto = useCallback(
    async (username: string) => {
      try {
        const res = await fetch(`${getServerURL()}/load-pfp`, {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({ username }),
        });
        const blob = await res.blob();
        if (blob.size > 72) {
          const url = (URL || (window as any).webkitURL).createObjectURL(blob);
          if (url) {
            setPhotoAvailable(true);
            setPhotoUrl(url);
          }
        } else {
          setPhotoAvailable(false);
          setPhotoUrl(null);
        }
      } catch (e) {
        // Silent failure – profile picture is non-critical
      }
    },
    [],
  );

  useEffect(() => {
    if (!profile?.username) {
      return;
    }
    loadProfilePhoto(profile.username);
  }, [loadProfilePhoto, profile?.username]);

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
        <div className="tw-w-full tw-max-w-5xl tw-mx-auto tw-px-4 tw-py-6">
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
                    <div className="card mt-3 mb-3 pl-5 pr-5">
                        <div className="card-body">
                            <div className="tw-flex tw-items-center tw-gap-4">
                                <div className="tw-flex-shrink-0">
                                    {photoAvailable && photoUrl ? (
                                        <img
                                          src={photoUrl}
                                          alt="Profile"
                                          className="tw-h-16 tw-w-16 tw-rounded-full tw-object-cover tw-border tw-border-gray-200"
                                        />
                                    ) : (
                                        <div className="tw-h-16 tw-w-16 tw-rounded-full tw-bg-gray-200 tw-flex tw-items-center tw-justify-center tw-text-lg tw-font-semibold tw-text-gray-600">
                                            {(profile.firstName || profile.username || '?')
                                              .toString()
                                              .charAt(0)
                                              .toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="tw-flex-1">
                                    <div className="tw-text-base tw-font-semibold">
                                        {[profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.username}
                                    </div>
                                    {profile.email && (
                                        <div className="tw-text-sm tw-text-gray-500">
                                            {profile.email}
                                        </div>
                                    )}
                                </div>
                                {profile.username && (
                                    <div className="tw-flex-shrink-0">
                                        <button
                                          type="button"
                                          className="btn btn-outline-dark btn-sm"
                                          onClick={() => setIsPhotoModalOpen(true)}
                                        >
                                            Update photo
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <EssentialAccountSection
                      profile={profile}
                      targetUsername={targetUsername}
                      onSaved={() => fetchProfile()}
                    />

                    <SavedApplicationInfoSection
                      privilegeLevel={profile.privilegeLevel}
                      optionalInformation={profile.optionalInformation}
                      usernameForUpdates={targetUsername || profile.username}
                      onSaved={() => fetchProfile()}
                    />

                    {/* Only allow changing password / 2FA on own profile */}
                    {!targetUsername && profile.username && (
                        <AccountSettingsSection username={profile.username} />
                    )}

                    {profile.username && (
                        <div className="card mt-3 mb-3 pl-5 pr-5">
                            <div className="card-body">
                                <RecentActivity username={{ username: profile.username }} />
                            </div>
                        </div>
                    )}

                    {isPhotoModalOpen && profile.username && (
                        <ProfileModal
                            // Modal expects an object with a username field
                          username={{ username: profile.username }}
                          setModalOpen={setIsPhotoModalOpen}
                          loadProfilePhoto={() => loadProfilePhoto(profile.username!)}
                        />
                    )}
                </>
            )}
        </div>
  );
}
