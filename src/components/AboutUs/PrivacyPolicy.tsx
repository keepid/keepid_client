import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

interface State {}

class PrivacyPolicy extends React.Component<{}, State> {
  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    return (
      <div className="container">
        <Helmet>
          <title>Privacy Policy</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="jumbotron-fluid mt-5">
          <h1 className="display-5">Privacy Policy</h1>
          <p className="lead pt-3">
            We need your identification information to help you gain access to services and keep your identity safe. See
            {' '}
            <Link to="/our-mission">Our Mission.</Link>
          </p>
        </div>
        <div className="jumbotron-fluid mt-5">
          <h1 className="display-5">The Information You Give Us</h1>
          <p className="pt-3">
            When you fill out your forms that you’ll upload to the website, you might put in your name, email, phone number, EIN, address, zip code, birthdate, etc. This is completely voluntary and only according to the forms of identification or government/agency applications you’ll be filling out. On our end, we also collect your IP address and page visits to ensure you’re a real person (i.e. not a bot) and record login attempts, which helps us keep the product secure.
          </p>
          <p className="pt-2">
            We obtain the IP address from the HTTP request headers; the voluntary release information is collected through the forms and uploads.
            Your information is stored by secure cloud providers; as of now, we will store it indefinitely or until further notice.
          </p>
        </div>
        <div className="jumbotron-fluid mt-5">
          <h1 className="display-5">Information Access and Sharing</h1>
          <p className="pt-3">
            In our view, there are different tiers of information access:
          </p>
          <ul>
            <li className="pt-2">
              The first tier is application information. This includes login attempts, logged actions, and a database of all users, organizations, and encrypted documents. This tier is only accessible to employees of Team Keep. We protect this tier with rigorous security measures including access control and two-factor authentication.
            </li>
            <li className="pt-2">
              The second tier is user-shared information. Third-party organizations such as nonprofits and municipal agencies will have access to the PDF documents users upload as well as user ID (name, License ID #, etc.). At this tier, organizations have access to the personal information of various users, but only under signed consensual agreement between the user and an individual worker at the organization. In other words, not all of the workers at the organization will have access.
            </li>
            <li className="pt-2">
              The third tier is user-specific information. Users are able to see all of their own personal information and cannot see the information of other users. The secure storage of this information as well as its secure transmission to nonprofits and other partners is the purpose of Keep.id.
            </li>
            <li className="pt-2">
              The final tier is HTTP request information, which is metadata attached to the information sent from the application in the first tier. We share this information with Google as a third-party service in the form of ReCaptcha, which helps prevent bots.
            </li>
          </ul>
          <p className="pt-2">
            We obtain the IP address from the HTTP request headers; the voluntary release information is collected through the forms and uploads.
            Your information is stored by secure cloud providers; as of now, we will store it indefinitely or until further notice.
          </p>
        </div>
        <div className="jumbotron-fluid mt-5">
          <h1 className="display-5">Safeguarding Your Information</h1>
          <p className="pt-3">
            Your identification information is protected by secure encryption – HTTPS, firewalls, whitelisting, access control, transport-level security, strong username and password, HMAC, etc. We place a strong emphasis on information security and have installed strict access control around the three tiers of accessible information. Integrations with Cloudflare serve as our DNS and DDoS protection.
          </p>
          <p className="pt-2">
            In the event that we change or update this privacy policy, visitors will be notified via site interactions.
          </p>
        </div>
        <div className="jumbotron-fluid mt-5">
          <h1 className="display-5">How You Can Control Your Information</h1>
          <p className="pt-3">
            You choose which information you input into the forms you upload to the site – the more identification you can provide the better, of course, but you can choose what you’re comfortable with providing. Some information may be mandatory for form completion.
          </p>
          <p className="pt-2">
            You are also able to delete documents after uploading them to Keep.id at your discretion.
          </p>
        </div>
        <div className="jumbotron-fluid mt-5">
          <h1 className="display-5">Additional Context</h1>
          <h3>Gaining Access to Help Services</h3>
          <p className="pt-3">
            Let’s say you go to a local nonprofit or government agency to apply for food stamps or fill out a job application, and you need to provide proof of identification beyond what information you can recall or say from knowledge. Proof can often only exist on a piece of paper or document stored on a computer or online. If you don’t have such proof of identification on your person, you can use Keep.id to easily access your identification from a computer and then be able to apply for services.
          </p>
          <h3>Keeping Track of Homeless Individuals</h3>
          <p className="pt-2">
            If you’re a nonprofit and are seeking to register the homeless persons in your region or area of coverage, keeping multiple users’ documents together for your file can be very valuable in your outreach to a certain city or district. We can help you cover all the homeless in your area that may need assistance with help services, job applications, etc.
          </p>
        </div>
        <div className="jumbotron-fluid mt-5">
          <h1 className="display-5">Key Terms</h1>
          <p className="pt-3">
            Bot: Sometimes non-human programs may attempt to access or log into websites. By using your IP address, and recaptcha, we can prevent bots from disrupting Keep.id.
          </p>
          <p className="pt-2">
            Cloud Database: Our cloud databases store data on geographically distributed servers on existing computing infrastructure such as Amazon Web Services.
          </p>
          <p className="pt-2">
            DNS/DDoS protection: DNS stands for Domain Name System, and DDoS stands for Distributed Denial of Service. Our protection prevents attackers from targeting our DNS and servers.
          </p>
          <p className="pt-2">
            EIN: Employee Identification Number.
          </p>
          <p className="pt-2">
            IP Address: Internet Protocol Address. An IP address is given to any piece of hardware that accesses the Internet. These addresses contain geographic information in many cases, and therefore can be used to track users.
          </p>
          <p className="pt-2">
            Two-Factor Authentication: You have to provide two distinct pieces of information in order to prove your identity and gain access to an application. They include something only you know, something only you have, or inherent factors (fingerprint, voice recognition, etc.).
          </p>
        </div>
        <div className="jumbotron-fluid mt-5">
          <h1 className="display-5">When This Policy Applies</h1>
          <p className="pt-3">
            This privacy policy applies to all of the services used through the website Keep.id, regardless of the Internet-accessing device. This policy does not apply to services that have separate privacy policies that do not incorporate this privacy policy.
          </p>
          <p className="pt-2">
            Currently there are no other services that advertise Keep.id, and as such this policy will not apply to those services. We also do not advertise other services on our website to which this privacy policy would also not apply.
          </p>
        </div>
        <div className="jumbotron-fluid mt-5">
          <h1 className="display-5">Contact</h1>
          <p className="pt-3">
            Please reach out to us with any questions you have about your security or identification. As an organization that specializes in this very subject, we take your concern seriously.
          </p>
          <p className="pt-2">
            Our email is contact@keep.id. We will reply within 48 hours.
          </p>
        </div>
      </div>
    );
  }
}

export default PrivacyPolicy;
