import React from 'react';
import { useHistory } from 'react-router-dom';

interface Props {
  logOut: () => void;
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
      className="btn btn-primary btn-dark-custom"
    >
      Log Out
    </button>
  );
}

export default Logout;
