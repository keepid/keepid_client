import '../../static/styles/ClientLanding.scss';

import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import AtWorkPic from '../../static/images/atwork-rafiki.png';
import DocumentsPic from '../../static/images/documents-rafiki.png';
import ActivityCard from '../BaseComponents/BaseActivityCard';
import BaseCard, { CardImageLoc, CardSize } from '../BaseComponents/BaseCard';

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
        <div className="d-flex p-2">
          <h1 id="welcome-title">{`Welcome, ${name}`}</h1>
        </div>
        <div className="row m-auto mt-5">
          <div className="d-flex p-2" id="Print container">
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
          <div className="d-flex p-2" id="Applications container">
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
        <div className="d-flex p-2 mt-5">
          <h3>Recent Activity</h3>
        </div>
        {isLoading ? <div className="ld ld-ring ld-spin ml-2" /> : <div />}
        <div>{this.renderActivitiesCard(activities)}</div>
      </div>
    );
  }
}

export default withRouter(ClientLanding);
