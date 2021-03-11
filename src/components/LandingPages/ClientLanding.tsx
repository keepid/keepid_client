import React, { Component, CSSProperties } from 'react';
import { Helmet } from 'react-helmet';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import AtWorkPic from '../../static/images/atwork-rafiki.png';
import DocumentsPic from '../../static/images/documents-rafiki.png';
import BaseCard, { CardImageLoc, CardSize } from '../BaseComponents/BaseCard';

interface Props extends RouteComponentProps {
  name: String
  username: String
}

interface State {
  activities: Array<any>,
  isLoading: Boolean
}

const activitiesCardStyles: CSSProperties = {
  border: '1px solid #D3D3D3',
  backgroundColor: '#F8F8F8',
  boxSizing: 'border-box',
  borderRadius: '1.5%',
  marginBottom: '1.5%',
  overflow: 'hidden',
};

const activityTitleStyles: CSSProperties = {
  float: 'left',
  color: '#6C757D',
  fontFamily: 'Raleway',
  fontStyle: 'normal',
  fontWeight: 'bold',
  fontSize: '16px',
  lineHeight: '18px',
  padding: '0.75%',
};

const activityDateStyles: CSSProperties = {
  float: 'right',
  color: '#6C757D',
  fontFamily: 'Inter',
  fontStyle: 'normal',
  fontWeight: 'normal',
  fontSize: '16px',
  lineHeight: '18px',
  padding: '0.75%',
};

interface ActivityProps {
  activity: any,
}

function ActivitiesCard(props: ActivityProps) {
  const { activity } = props;
  const parsedInfo = JSON.parse(activity.info[0]);
  const uploaderUsername = parsedInfo.owner.username;
  const type = activity.type[0];
  if (type !== 'LoginActivity' && uploaderUsername !== '' && type !== '') {
    const displayType = type.split('Activity');
    const newDate = new Date(parsedInfo.occuredAt.$date);
    // return mm/dd/yyyy version of date
    const dateString = newDate.toLocaleDateString();
    // return difference number of days between current date and dateString for activity
    const daysDifference = Math.round((new Date().getTime() - newDate.getTime()) / (1000 * 3600 * 24));
    // eslint-disable-next-line no-underscore-dangle
    return (
      <div style={activitiesCardStyles} className="ml-2">
        <h6 style={activityTitleStyles}>
          {displayType}
          {' '}
          Activity
        </h6>
        <p style={activityDateStyles}>
          Uploaded by
          {' '}
          {uploaderUsername}
          {', '}
          {dateString}
          {', '}
          {daysDifference}
          {' '}
          days ago
        </p>
      </div>
    );
  }
  return (<div />);
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
      return activities.map((activity) => (<ActivitiesCard key={JSON.parse(activity.info[0])._id.$oid} activity={activity} />));
    }
    if (!isLoading) {
      return (<div className="ml-2"><h3>No activities found!</h3></div>);
    }
    return null;
  }

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
          this.setState({ isLoading: false, activities: responseJSON.activities.allActivities });
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
          <h1 id="welcome-title">
            Welcome,
            {' '}
            {name}
            !
          </h1>
        </div>
        <div className="row m-auto mt-5">
          <div className="d-flex p-2" id="Print container">
            <BaseCard cardTitle="Documents" cardText="Upload, view, and download your documents" buttonText="My Documents" cardSize={CardSize.SMALL_HORIZONTAL} imageSrc={DocumentsPic} imageSize="50%" imageLoc={CardImageLoc.RIGHT} imageObjectFit="contain" buttonOnClick={() => (history.push('/my-documents'))} />
          </div>
          <div className="d-flex p-2" id="Applications container">
            <BaseCard cardTitle="Application" cardText="Upload, complete, and manage your applications" buttonText="My Applications" cardSize={CardSize.SMALL_HORIZONTAL} imageSrc={AtWorkPic} imageSize="50%" imageLoc={CardImageLoc.RIGHT} imageObjectFit="contain" buttonOnClick={() => (history.push('/applications'))} />
          </div>
        </div>
        <div className="d-flex p-2 mt-5">
          <h3>
            Recent Activity
          </h3>
        </div>
        {isLoading ? <div className="ld ld-ring ld-spin ml-2" /> : <div />}
        <div>
          { this.renderActivitiesCard(activities) }
        </div>
      </div>
    );
  }
}

export default withRouter(ClientLanding);
