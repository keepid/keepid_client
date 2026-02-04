import React, { useState } from 'react';
import { useAlert } from 'react-alert';

import getServerURL from '../../serverOverride';

type Props = {
  username: string | undefined;
};

enum PasswordError {
  OldPasswordWrong = 1,
  NewPasswordSameAsOld,
  NewPasswordInvalid,
  NewPasswordConfirmWrong,
  NoError,
}

export default function AccountSettingsSection({ username }: Props) {
  const alert = useAlert();

  const [enteredPassword, setEnteredPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState<PasswordError>(PasswordError.NoError);
  const [buttonState, setButtonState] = useState('');
  const [passwordChangeReadOnly, setPasswordChangeReadOnly] = useState(true);

  const [twoFactorOn, setTwoFactorOn] = useState<boolean | null>(null);
  const [isLoading2FA, setIsLoading2FA] = useState(false);

  React.useEffect(() => {
    // Load current 2FA status once
    const controller = new AbortController();
    const { signal } = controller;
    setIsLoading2FA(true);
    fetch(`${getServerURL()}/get-user-info`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      signal,
    })
      .then((res) => res.json())
      .then((json) => {
        if (json && typeof json.twoFactorOn === 'boolean') {
          setTwoFactorOn(json.twoFactorOn);
        }
      })
      .catch(() => {
        // non-fatal
      })
      .finally(() => setIsLoading2FA(false));

    return () => {
      controller.abort();
    };
  }, []);

  function handleEditPassword() {
    setPasswordChangeReadOnly(false);
  }

  function handleCancelPassword() {
    setPasswordChangeReadOnly(true);
    setEnteredPassword('');
    setNewPassword('');
    setNewPasswordConfirm('');
    setPasswordError(PasswordError.NoError);
    setButtonState('');
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setButtonState('running');
    setPasswordError(PasswordError.NoError);

    if (newPassword !== newPasswordConfirm) {
      setButtonState('');
      setPasswordError(PasswordError.NewPasswordConfirmWrong);
      return;
    }

    const data = {
      oldPassword: enteredPassword,
      newPassword,
    };

    fetch(`${getServerURL()}/change-password`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        const { status } = responseJSON;
        if (status === 'AUTH_SUCCESS') {
          handleCancelPassword();
          alert.show('Successfully updated password');
        } else if (status === 'PASSWORD_UNCHANGED') {
          setPasswordError(PasswordError.NewPasswordSameAsOld);
        } else if (status === 'AUTH_FAILURE') {
          setPasswordError(PasswordError.OldPasswordWrong);
        } else if (status === 'INVALID_PARAMETER') {
          setPasswordError(PasswordError.NewPasswordInvalid);
        } else {
          alert.show('Failed resetting password, please try again.', { type: 'error' });
        }
        setButtonState('');
      })
      .catch(() => {
        alert.show('Failed resetting password, please try again.', { type: 'error' });
        setButtonState('');
      });
  }

  function handleChange2FA(next: boolean) {
    const data = { twoFactorOn: next };
    fetch(`${getServerURL()}/change-two-factor-setting`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        const { status } = responseJSON;
        if (status === 'SUCCESS') {
          setTwoFactorOn(next);
        } else {
          alert.show('Failed updating two-factor setting.', { type: 'error' });
        }
      })
      .catch(() => {
        alert.show('Failed updating two-factor setting.', { type: 'error' });
      });
  }

  if (!username) {
    return null;
  }

  return (
    <div className="card mt-3 mb-3 pl-5 pr-5">
      <div className="card-body">
        <h5 className="card-title tw-mb-3">Account Settings</h5>

        <hr />

        <div className="row tw-mb-3">
          <div className="col-3 card-text mt-2 text-primary-theme">Two-Factor Authentication</div>
          <div className="col-9 card-text">
            {isLoading2FA ? (
              <span>Loading...</span>
            ) : (
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="twoFactorToggle"
                  checked={!!twoFactorOn}
                  onChange={(e) => handleChange2FA(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="twoFactorToggle">
                  {twoFactorOn ? 'On' : 'Off'}
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="row tw-mb-2">
          <div className="col-3 card-text mt-2 text-primary-theme">Password</div>
          <div className="col-9 card-text">
            {passwordChangeReadOnly ? (
              <div className="tw-flex tw-items-center tw-gap-2">
                <span className="tw-text-gray-600">••••••••</span>
                <button
                  type="button"
                  name="editPassword"
                  className="btn btn-outline-dark btn-sm"
                  onClick={handleEditPassword}
                >
                  Edit
                </button>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="tw-w-full">
                {passwordError === PasswordError.OldPasswordWrong && (
                  <p className="text-danger tw-mb-2">Old password is incorrect</p>
                )}
                <div className="row tw-mb-2 tw-mt-1">
                  <label htmlFor="enteredPassword" className="col-3 card-text mt-2 text-primary-theme">
                    Old password
                  </label>
                  <div className="col-9 card-text">
                    <input
                      type="password"
                      className="form-control form-purple"
                      name="enteredPassword"
                      id="enteredPassword"
                      value={enteredPassword}
                      onChange={(e) => setEnteredPassword(e.target.value)}
                    />
                  </div>
                </div>
                {passwordError === PasswordError.NewPasswordSameAsOld && (
                  <p className="text-danger tw-mb-2">
                    The new password cannot match the old password
                  </p>
                )}
                {passwordError === PasswordError.NewPasswordInvalid && (
                  <p className="text-danger tw-mb-2">The new password is invalid</p>
                )}
                <div className="row tw-mb-2 tw-mt-1">
                  <label htmlFor="newPassword" className="col-3 card-text mt-2 text-primary-theme">
                    New password (at least 8 characters)
                  </label>
                  <div className="col-9 card-text">
                    <input
                      type="password"
                      className="form-control form-purple"
                      name="newPassword"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>
                {passwordError === PasswordError.NewPasswordConfirmWrong && (
                  <p className="text-danger tw-mb-2">
                    The password does not match the one above
                  </p>
                )}
                <div className="row tw-mb-2 tw-mt-1">
                  <label htmlFor="newPasswordConfirm" className="col-3 card-text mt-2 text-primary-theme">
                    Confirm new password
                  </label>
                  <div className="col-9 card-text">
                    <input
                      type="password"
                      className="form-control form-purple"
                      name="newPasswordConfirm"
                      id="newPasswordConfirm"
                      value={newPasswordConfirm}
                      onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="tw-flex tw-justify-end tw-gap-2 tw-mt-2">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={handleCancelPassword}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn btn-outline-dark ld-ext-right ${buttonState}`}
                  >
                    Submit
                    <div className="ld ld-ring ld-spin" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
