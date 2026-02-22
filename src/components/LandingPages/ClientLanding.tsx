import '../../static/styles/ClientLanding.scss';

import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import AtWorkPic from '../../static/images/atwork-rafiki.png';
import DocumentsPic from '../../static/images/documents-rafiki.png';
import ActivityCard from '../BaseComponents/BaseActivityCard';
import BaseCard, { CardImageLoc, CardSize } from '../BaseComponents/BaseCard';
import QuickAccessCards from '../QuickAccess/QuickAccessCards';
import QuickStartCard from '../QuickAccess/QuickStartCard';

interface Props extends RouteComponentProps {
  name: String;
  username: String;
}

interface State {
  activities: Array<any>;
  isLoading: Boolean;
}

class ClientLanding extends Component<Props, State, {}> {
  constructor(props) {
    super(props);
    this.state = {
      activities: [],
      isLoading: false,
    };
  }

  renderActivitiesCard = (activities) => {
    const { isLoading } = this.state;
    if (activities.length > 0) {
      // eslint-disable-next-line no-underscore-dangle
      return activities
        .slice(0, 5) // only get the first number of elements
        .map((activity) => (
          <ActivityCard key={activity._id} activity={activity} />
        ));
    }
    if (!isLoading) {
      return (
        <div className="ml-2">
          <h3>No activities found!</h3>
        </div>
      );
    }
    return null;
  };

  componentDidMount() {
    this.setState({ isLoading: true });
    fetch(`${getServerURL()}/get-all-activities`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        username: this.props.username,
      }),
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        if (responseJSON.status === 'SUCCESS') {
          this.setState({
            isLoading: false,
            activities: responseJSON.activities,
          });
        }
      });
  }

  render() {
    const { name, history } = this.props;
    const { activities, isLoading } = this.state;
    return (
      <div id="Buttons" className="container pt-5">
        <Helmet>
          <title>Home</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="d-flex py-2">
          <h1 id="welcome-title">{`Welcome, ${name}`}</h1>
        </div>
        <QuickStartCard />
        <div className="mb-3">
          <QuickAccessCards />
        </div>
        <div className="tw-container tw-mx-auto tw-mt-5">
          <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-5">
            <div id="Print container">
              <BaseCard
                cardTitle="Documents"
                cardText="Upload, view, and download your documents"
                buttonText="My Documents"
                cardSize={CardSize.SMALL_HORIZONTAL}
                imageSrc={DocumentsPic}
                imageSize="50%"
                imageLoc={CardImageLoc.RIGHT}
                imageObjectFit="contain"
                buttonOnClick={() => history.push('/my-documents')}
              />
            </div>

            <div id="Applications container">
              <BaseCard
                cardTitle="Application"
                cardText="Upload, complete, and manage your applications"
                buttonText="My Applications"
                cardSize={CardSize.SMALL_HORIZONTAL}
                imageSrc={AtWorkPic}
                imageSize="50%"
                imageLoc={CardImageLoc.RIGHT}
                imageObjectFit="contain"
                buttonOnClick={() => history.push('/applications')}
              />
            </div>
          </div>
        </div>
        <div className="tw-mx-auto tw-py-4 tw-mt-5">
          <h3 className="tw-text-center lg:tw-text-left">Recent Activity</h3>
        </div>
        {isLoading ? <div className="ld ld-ring ld-spin ml-0" /> : <div />}
        <ul className="tw-list-none tw-mb-20 tw-pl-0 tw-ml-0">
          {this.renderActivitiesCard(activities)}
        </ul>
      </div>
    );
  }
}

export default withRouter(ClientLanding);
