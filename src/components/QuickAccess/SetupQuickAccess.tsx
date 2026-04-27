import React from 'react';
import { Redirect } from 'react-router-dom';

type Props = {
  category: string;
};

export default function SetupQuickAccess({ category }: Props) {
  return <Redirect to={`/quick-access/${category}`} />;
}
