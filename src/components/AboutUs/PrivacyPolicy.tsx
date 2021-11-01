import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

interface State {}

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="container">
      <Helmet>
        <title>Privacy Policy</title>
        <meta name="description" content="Keep.id" />
      </Helmet>
      <div className="jumbotron-fluid mt-5">
        <h1 className="display-5">Privacy Policy</h1>
        <p className="lead-medium pt-3">
          When you use Keep.id, you’ll be uploading identification documents
          that by nature will contain information about you. It will always be
          your choice to upload these documents and to use the application.
          Keep.id will be storing them on the secure cloud, able to be
          accessed with the Internet and only by you and those with permitted
          access. With your identification documents stored on Keep.id, you’ll
          be able to gain access to government and aid services and have a
          reliable location for storing your identification. See
          <Link to="/our-mission">Our Mission.</Link>
        </p>
      </div>
      <div className="jumbotron-fluid mt-5">
        <h1 className="display-5">The Information You Give Us</h1>
        <p className="lead-medium pt-3">
          When you fill out your forms that you’ll upload to the website, you
          might put in your name, email, phone number, EIN, address, zip code,
          birthdate, etc. This is completely voluntary and only according to
          the forms of identification or government/agency applications you’ll
          be filling out. On our end, we collect your IP address and page
          visits to ensure you’re a real person (i.e. not a bot) and record
          login attempts, which help us keep the product secure.
          <p className="lead-medium pt-2">
            Your information is stored by secure cloud providers, that is, on
            remote servers. As of now we will store it indefinitely or until
            further notice.
          </p>
        </p>
        <p className="lead-medium pt-2">
          We obtain the IP address from the HTTP request headers; the
          voluntary release information is collected through the forms and
          uploads. Your information is stored by secure cloud providers; as of
          now, we will store it indefinitely or until further notice.
        </p>
      </div>
      <div className="jumbotron-fluid mt-5">
        <h1 className="display-5">Information Access and Sharing</h1>
        <p className="lead-medium pt-3">
          In our view, there are different tiers of information access:
        </p>
        <ul>
          <li className="lead-medium pt-2">
            The first tier is application information. This includes login
            attempts, logged actions, and a database of all users,
            organizations, and encrypted documents. This tier is only
            accessible to employees of Team Keep. We protect this tier with
            rigorous security measures including access control and two-factor
            authentication.
          </li>
          <li className="lead-medium pt-2">
            The second tier is user-shared information. Third-party
            organizations such as nonprofits and municipal agencies will have
            access to the PDF documents users upload as well as user ID (name,
            License ID#, etc.). At this tier, organizations have access to the
            personal information of various users, but only under signed
            consensual agreement between each user and an individual worker at
            the organization. In other words, not all of the workers at the
            organization will have access.
          </li>
          <li className="lead-medium pt-2">
            The third tier is user-specific information. Users are able to see
            all of their own personal information and cannot see the
            information of other users. The secure storage of this information
            as well as its secure transmission over the Internet to nonprofits
            and other partners is the purpose of Keep.id.
          </li>
          <li className="lead-medium pt-2">
            The final tier is HTTP request information, which is metadata
            attached to the information sent from the application in the first
            tier to Keep.id’s server. We share this information with Google as
            a third-party service in the form of ReCaptcha, which helps to
            prevent bots.
          </li>
        </ul>
      </div>
      <div className="jumbotron-fluid mt-5">
        <h1 className="display-5">Safeguarding Your Information</h1>
        <p className="lead-medium pt-3">
          Your identification information is protected by secure encryption –
          HTTPS, firewalls, whitelisting, access control, transport-level
          security, strong username and password, HMAC, etc. We place a strong
          emphasis on information security and have installed strict access
          control around the three tiers of accessible information.
          Integrations with Cloudflare serve as our DNS and DDoS protection.
          With server logging we keep track of activity and audit the
          application. In addition, we have installed automatic logoff so that
          if you leave the application open and unattended for some time, you
          will be automatically signed out.
        </p>
        <p className="lead-medium pt-2">
          In the event that we change or update this privacy policy, visitors
          will be notified via site interactions.
        </p>
      </div>
      <div className="jumbotron-fluid mt-5">
        <h1 className="display-5">How You Can Control Your Information</h1>
        <p className="lead-medium pt-3">
          You choose which information you input into the forms you upload to
          the site – the more identification you can provide the better, of
          course, but you can choose what you’re comfortable with providing.
          Some information may be mandatory for form completion.
        </p>
        <p className="lead-medium pt-2">
          You are also able to delete documents after uploading them to
          Keep.id at your discretion.
        </p>
      </div>
      <div className="jumbotron-fluid mt-5">
        <h1 className="display-5">Key Terms</h1>
        <p className="lead-medium pt-3">
          Bot: Sometimes non-human programs may attempt to access or log into
          websites. By using your IP address and ReCaptcha, we can prevent
          bots from disrupting Keep.id.
        </p>
        <p className="lead-medium pt-2">
          Cloud Database: Our cloud databases store data on geographically
          distributed servers on existing computing infrastructure such as
          Amazon Web Services and MongoDB Atlas.
        </p>
        <p className="lead-medium pt-2">
          DNS/DDoS protection: DNS stands for Domain Name System, and DDoS
          stands for Distributed Denial of Service. Our protection prevents
          attackers from targeting our DNS and servers.
        </p>
        <p className="lead-medium pt-2">
          EIN: Employee Identification Number.
        </p>
        <p className="lead-medium pt-2">
          HTTP: Hypertext Transfer Protocol. A foundational procedure that
          establishes communication between a client and server in loading a
          website. HTTPS (Hypertext Transfer Protocol Secure) is an extension
          of HTTP that adds protection across the channel of communication.
        </p>
        <p className="lead-medium pt-2">
          IP Address: Internet Protocol Address. An IP address is given to any
          piece of hardware that accesses the Internet. These addresses
          contain geographic information in many cases, and therefore can be
          used to track users.
        </p>
        <p className="lead-medium pt-2">
          Two-Factor Authentication: You have to provide two distinct pieces
          of information in order to prove your identity and gain access to an
          application. They include something only you know, something only
          you have, or inherent factors (fingerprint, voice recognition,
          etc.).
        </p>
      </div>
      <div className="jumbotron-fluid mt-5">
        <h1 className="display-5">When This Policy Applies</h1>
        <p className="lead-medium pt-3">
          This privacy policy applies to all of the services used through the
          website Keep.id, regardless of the Internet-accessing device. This
          policy does not apply to services that have separate privacy
          policies that do not incorporate this privacy policy.
        </p>
        <p className="lead-medium pt-2">
          Currently there are no other services that advertise Keep.id, and as
          such this policy will not apply to those services. We also do not
          advertise other services on our website to which this privacy policy
          would also not apply.
        </p>
      </div>
      <div className="jumbotron-fluid mt-5">
        <h1 className="display-5">Contact</h1>
        <p className="lead-medium pt-3">
          Please reach out to us with any questions you have about your
          security or identification. As an organization that specializes in
          this very subject, we take your concern seriously.
        </p>
        <p className="lead-medium pt-2">
          Our email is contact@keep.id. We will reply within 48 hours.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
