import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import AppSVG from '../../static/images/calendar.svg';
import FileSVG from '../../static/images/file.svg';
import SignDoc from '../../static/images/sign-document.png';
import BaseCard, { CardImageLoc, CardSize } from '../BaseComponents/BaseCard';

interface Props extends RouteComponentProps {
  name: String
  username: String
}

interface State {
  activities: Array<any>
}

function renderActivitiesCard(activities) {
  if (activities.length > 0) {
    return activities.map((activity) => (<div><h3>{activity.type[0]}</h3></div>));
  }
  return (<div><h3>No activities found!</h3></div>);
}

class ClientLanding extends Component<Props, State, {}> {
  constructor(props) {
    super(props);
    this.state = {
      activities: [],
    };
  }

  componentDidMount() {
    fetch(`${getServerURL()}/get-all-activities`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        username: this.props.username,
      }),
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        console.log(responseJSON);
        if (responseJSON.status === 'SUCCESS') {
          this.setState({ activities: responseJSON.activities.allActivities });
        }
      });
  }

  render() {
    const { name, history } = this.props;
    const { activities } = this.state;
    return (
      <div id="Buttons" className="container pt-5">
        <Helmet>
          <title>Home</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="d-flex p-2">
          <h1>
            Welcome,
            {' '}
            {name}
            !
          </h1>
        </div>
        <div className="row m-auto mt-5">
          <div className="d-flex p-2" id="Print container">
            <BaseCard cardTitle="Documents" cardText="Upload, view, and download your documents" buttonText="My Documents" cardSize={CardSize.SMALL_HORIZONTAL} imageSrc={SignDoc} imageSize="50%" imageLoc={CardImageLoc.RIGHT} imageObjectFit="contain" buttonOnClick={() => (history.push('/my-documents'))} />
          </div>
          <div className="d-flex p-2" id="Applications container">
            <BaseCard cardTitle="Application" cardText="Upload, complete, and manage your applications" buttonText="My Applications" cardSize={CardSize.SMALL_HORIZONTAL} imageSrc={SignDoc} imageSize="50%" imageLoc={CardImageLoc.RIGHT} imageObjectFit="contain" buttonOnClick={() => (history.push('/applications'))} />
          </div>
        </div>
        <div className="d-flex p-2 mt-5">
          <h3>
            Recent Activity
          </h3>
        </div>
        <div>
          { activities !== [] ? renderActivitiesCard(activities) : renderActivitiesCard([]) }
        </div>
      </div>
    );
  }
}

export default withRouter(ClientLanding);
