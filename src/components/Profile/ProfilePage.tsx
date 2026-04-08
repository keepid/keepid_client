import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAlert } from 'react-alert';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import Role from '../../static/Role';
import AccountSettingsSection from './AccountSettingsSection';
import EssentialAccountSection from './EssentialAccountSection';
import OrganizationInfoSection from './OrganizationInfoSection';
import ProfileModal from './ProfileModal';
import RecentActivity from './RecentActivity';
import SavedApplicationInfoSection from './SavedApplicationInfoSection';
import WorkerNotesSection from './WorkerNotesSection';

type Props = {
  targetUsername?: string;
};

export type NameObj = {
  first?: string;
  middle?: string;
  last?: string;
  suffix?: string;
  maiden?: string;
};

export type AddressObj = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  zip?: string;
  county?: string;
};

export type PhoneBookEntry = {
  label: string;
  phoneNumber: string;
};

export type ProfileData = {
  status?: string;
  message?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  organization?: string;
  privilegeLevel?: string;
  currentName?: NameObj;
  nameHistory?: NameObj[];
  personalAddress?: AddressObj;
  mailAddress?: AddressObj;
  phoneBook?: PhoneBookEntry[];
  sex?: string;
  motherName?: NameObj;
  fatherName?: NameObj;
  workerNotes?: string;
};

export default function ProfilePage({ targetUsername }: Props) {
  const alert = useAlert();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoAvailable, setPhotoAvailable] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const currentUserRole = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('mySessionStorageData');
      if (raw) return JSON.parse(raw).role as string;
    } catch { /* ignore */ }
    return '';
  }, []);

  const isAdmin = currentUserRole === Role.Admin || currentUserRole === Role.Director;

  const canEditName = useMemo(() => {
    if (!profile) return true;
    if (!targetUsername) return true;
    if (profile.privilegeLevel === 'Client') {
      return currentUserRole === Role.Worker;
    }
    return (
      currentUserRole === Role.Worker
      || currentUserRole === Role.Admin
      || currentUserRole === Role.Director
    );
  }, [profile, targetUsername, currentUserRole]);

  const canEditBirthDate = useMemo(() => {
    if (currentUserRole === Role.Client) return false;
    if (!profile) return true;
    if (!targetUsername) return true;
    if (profile.privilegeLevel === 'Client') {
      return currentUserRole === Role.Worker;
    }
    return (
      currentUserRole === Role.Worker
      || currentUserRole === Role.Admin
      || currentUserRole === Role.Director
    );
  }, [profile, targetUsername, currentUserRole]);

  const lockClientLegalNameInSavedSection = Boolean(
    targetUsername
    && profile?.privilegeLevel === 'Client'
    && currentUserRole !== Role.Worker,
  );

  const displayName = useMemo(() => {
    if (!profile) return '';
    return [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.email || '';
  }, [profile]);

  const title = useMemo(() => {
    if (targetUsername && displayName) return `${displayName}'s Profile`;
    return 'Profile';
  }, [targetUsername, displayName]);

  const isWorkerView = !!targetUsername;
  const canRemoveClient = isWorkerView && isAdmin && profile?.privilegeLevel === 'Client';

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
      } catch {
        // Silent failure -- profile picture is non-critical
      }
    },
    [],
  );

  useEffect(() => {
    if (!profile?.username) return;
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
      const json = (await res.json()) as ProfileData;

      if (json?.status && json.status !== 'SUCCESS') {
        alert.show(`Failed to load profile: ${json.message || json.status}`, { type: 'error' });
      }
      setProfile(json);
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
    return () => { controller.abort(); };
  }, [alert, targetUsername]);

  async function handleRemoveClient() {
    if (!targetUsername) return;
    setIsRemoving(true);
    try {
      const res = await fetch(`${getServerURL()}/remove-organization-member`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: targetUsername }),
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        alert.show('Client removed successfully.', { type: 'success' });
        setShowRemoveModal(false);
        history.push('/home');
      } else {
        alert.show(`Failed to remove client: ${data.message || data.status}`, { type: 'error' });
      }
    } catch (error) {
      alert.show(`Failed to remove client: ${error}`, { type: 'error' });
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <div className="tw-w-full tw-max-w-5xl tw-mx-auto tw-px-4 tw-py-6">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content="Keep.id Profile" />
      </Helmet>

      {isWorkerView && (
        <div className="card mt-3 mb-3 pl-5 pr-5">
          <div className="card-body">
            <h4 className="card-title tw-mb-0 tw-font-bold">
              {displayName ? `${displayName}'s Profile` : 'Profile'}
            </h4>
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
                      {(profile.firstName || profile.email || '?')
                        .toString()
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="tw-flex-1">
                  <div className="tw-text-base tw-font-semibold">
                    {displayName}
                  </div>
                  {profile.email && (
                    <div className="tw-text-sm tw-text-gray-500">
                      {profile.email}
                    </div>
                  )}
                </div>
                {profile.username && !isWorkerView && (
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
            canEditName={canEditName}
            canEditBirthDate={canEditBirthDate}
            onSaved={() => fetchProfile()}
          />

          {isWorkerView && profile.username && (
            <WorkerNotesSection
              workerNotes={profile.workerNotes}
              targetUsername={targetUsername!}
            />
          )}

          {profile.privilegeLevel === 'Client' && (
            <SavedApplicationInfoSection
              profile={profile}
              targetUsername={targetUsername}
              lockClientLegalNameFields={lockClientLegalNameInSavedSection}
              onSaved={() => fetchProfile()}
            />
          )}

          {!isWorkerView && profile.organization && (
            <OrganizationInfoSection organizationName={profile.organization} />
          )}

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

          {canRemoveClient && (
            <div className="card mt-3 mb-3 pl-5 pr-5 tw-border-red-200">
              <div className="card-body">
                <h5 className="card-title tw-text-red-700">Danger Zone</h5>
                <p className="tw-text-sm tw-text-gray-600 tw-mb-3">
                  Removing this client will permanently delete their account and all associated data
                  including documents, applications, and activity history. This action cannot be undone.
                </p>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => setShowRemoveModal(true)}
                >
                  Remove Client
                </button>
              </div>
            </div>
          )}

          {isPhotoModalOpen && profile.username && (
            <ProfileModal
              username={{ username: profile.username }}
              setModalOpen={setIsPhotoModalOpen}
              loadProfilePhoto={() => loadProfilePhoto(profile.username!)}
            />
          )}

          {showRemoveModal && (
            <div
              className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-black tw-bg-opacity-50"
              onClick={() => { if (!isRemoving) setShowRemoveModal(false); }}
              role="presentation"
            >
              <div
                className="tw-bg-white tw-rounded-lg tw-shadow-xl tw-p-6 tw-max-w-md tw-w-full tw-mx-4"
                onClick={(e) => e.stopPropagation()}
                role="presentation"
              >
                <h5 className="tw-text-lg tw-font-semibold tw-text-gray-900 tw-mb-2">
                  Remove Client
                </h5>
                <p className="tw-text-gray-600 tw-mb-4">
                  Are you sure you want to permanently remove{' '}
                  <span className="tw-font-semibold">{displayName}</span>?
                  All of their documents, applications, and activity history will be deleted.
                  This action cannot be undone.
                </p>
                <div className="tw-flex tw-justify-end tw-gap-3">
                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    onClick={() => setShowRemoveModal(false)}
                    disabled={isRemoving}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleRemoveClient}
                    disabled={isRemoving}
                  >
                    {isRemoving ? 'Removing...' : 'Remove Client'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
