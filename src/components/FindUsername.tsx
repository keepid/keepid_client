import React from 'react';
import { useParams } from 'react-router';
import ClientProfilePage from './ClientProfilePage';

function FindUsername(props) {
  const { username }: any = useParams();
  return <ClientProfilePage username={username} />;
}

export default FindUsername;
