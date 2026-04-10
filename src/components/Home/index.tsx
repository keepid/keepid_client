import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { defineMessages, useIntl } from 'react-intl';

import Role from '../../static/Role';
import EnsuringSecurity from './EnsuringSecurity';
import FocusingOnPeople from './FocusingOnPeople';
import HeroAuthSection from './HeroAuthSection';
import HomelessStats from './HomelessStats';
import IntroText from './IntroText';
import WhoWeAreServing from './WhoWeAreServing';

const messages = defineMessages({
  title: {
    id: 'home.title',
    defaultMessage: 'Welcome',
    description: 'Home welcome message',
  },
  brandHeader: {
    id: 'home.brand-header',
    defaultMessage: 'An Identification Platform',
    description: 'The tagline shown on the home page',
  },
  subHeader: {
    id: 'home.sub-header',
    defaultMessage: 'for those experiencing homelessness',
  },
});

interface HomeProps {
  logIn?: (
    role: Role,
    username: string,
    organization: string,
    name: string
  ) => void;
  logOut?: () => void;
  role?: Role;
  autoLogout?: boolean;
  setAutoLogout?: (logout: boolean) => void;
}

function Home({ logIn, logOut, role, autoLogout, setAutoLogout }: HomeProps) {
  const intl = useIntl();

  useEffect(() => {
    // Dynamically load the GTM script
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=AW-391118279';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      // Initialize gtag only after the script has loaded
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', 'AW-391118279');

      // Now it's safe to call your conversion event
      gtag('event', 'conversion', { send_to: 'AW-391118279/baegCKfsltgDEMf7v7oB' });
    };
  }, []);

  return (
    <div>
      <Helmet>
        <title>{intl.formatMessage(messages.title)}</title>
        <meta name="description" content="Keep.id" />
      </Helmet>
      {/* <StatementOfSolidarity /> */}
      <HeroAuthSection
        brandHeader={intl.formatMessage(messages.brandHeader)}
        subHeader={intl.formatMessage(messages.subHeader)}
        logIn={logIn}
        logOut={logOut}
        role={role}
        autoLogout={autoLogout}
        setAutoLogout={setAutoLogout}
      />

      <IntroText />

      <FocusingOnPeople />

      <EnsuringSecurity />

      <HomelessStats />

      <WhoWeAreServing />
    </div>
  );
}

export default Home;
