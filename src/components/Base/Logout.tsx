import { useHistory } from 'react-router-dom';
import React from 'react';

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
    <button type="button" onClick={handleLogout} className="btn btn-primary btn-dark-custom">Log Out</button>
  );
}

export default Logout;
