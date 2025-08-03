import React from 'react';
import { useHistory } from 'react-router-dom';

interface Props {
    logOut: () => void,
}

function Logout(props: Props): React.ReactElement {
  const history = useHistory();

  const handleLogout = (): void => {
    props.logOut();
    history.push('/login');
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="tw-border
                    tw-border-secondary-theme
                    tw-text-secondary-theme
                    tw-no-underline
                    hover:tw-bg-secondary-theme
                    hover:tw-text-white
                    hover:tw-no-underline
                    tw-w-full
                    tw-py-2
                    tw-rounded
                    tw-mr-2"
    >Log Out
    </button>
  );
}

export default Logout;
