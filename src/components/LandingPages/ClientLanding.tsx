import React, { Component, CSSProperties } from 'react';
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
  activities: Array<any>,
  isLoading: Boolean
}

const activitiesCardStyles: CSSProperties = {
  border: '1px solid black',
  backgroundColor: '#d3d3d3',
  borderRadius: '1.5%',
  marginBottom: '1.5%',
  overflow: 'hidden',
};

interface ActivityProps {
  activity: any,
}

function ActivitiesCard(props: ActivityProps) {
  const { activity } = props;
  const parsedInfo = JSON.parse(activity.info[0]);
  const type = activity.type[0];
  const date = parsedInfo.occuredAt.$date;
  const newDate = new Date(date);
  const daysDifference = Math.round((new Date().getTime() - newDate.getTime()) / (1000 * 3600 * 24));
  // eslint-disable-next-line no-underscore-dangle
  return (
    <div style={activitiesCardStyles} className="ml-2">
      <p style={{ float: 'left' }}>{type}</p>
      <p style={{ float: 'right' }}>
        {daysDifference}
        {' '}
        days ago
      </p>
    </div>
  );
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
    if (activities.length > 0) {
      // eslint-disable-next-line no-underscore-dangle
      return activities.map((activity) => (<ActivitiesCard key={JSON.parse(activity.info[0])._id.$oid} activity={activity} />));
    }
    if (!this.state.isLoading) {
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
        console.log(responseJSON);
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
        {isLoading ? <div className="ld ld-ring ld-spin ml-2" /> : <div />}
        <div>
          { this.renderActivitiesCard(activities) }
        </div>
      </div>
    );
  }
}

export default withRouter(ClientLanding);
