/* eslint-disable */

import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

interface Props extends RouteComponentProps {
    name: string;
    username: string;
  }

interface State {
    parent1First: string;
    parent1FirstTemp: string;
    parent1Last: string;
    parent1LastTemp: string;
    parent2First: string;
    parent2FirstTemp: string;
    parent2Last: string;
    parent2LastTemp: string;
    spouseFirst: string;
    spouseFirstTemp: string;
    spouseLast: string;
    spouseLastTemp: string;
    numberOfKids: number;
    numberOfKidsTemp: number;
    childrenFirstNames: string[],
    childrenFirstNamesTemp: string[],
    childrenLastNames: string[],
    childrenLastNamesTemp: string[],
    editInfo: boolean;
}

class FamilyInfo extends Component<Props, State, any> {
  constructor(props) {
    super(props);
    this.state = {
      parent1First: '',
      parent1FirstTemp: '',
      parent1Last: '',
      parent1LastTemp: '',
      parent2First: '',
      parent2FirstTemp: '',
      parent2Last: '',
      parent2LastTemp: '',
      spouseFirst: '',
      spouseFirstTemp: '',
      spouseLast: '',
      spouseLastTemp: '',
      numberOfKids: -1,
      numberOfKidsTemp: 0,
      childrenFirstNames: [],
      childrenFirstNamesTemp: [],
      childrenLastNames: [],
      childrenLastNamesTemp: [],
      editInfo: false,
    };
    this.toggleEdit = this.toggleEdit.bind(this);
    this.handleChangeParent1First = this.handleChangeParent1First.bind(this);
    this.handleChangeParent1Last = this.handleChangeParent1Last.bind(this);
    this.handleChangeParent2First = this.handleChangeParent2First.bind(this);
    this.handleChangeParent2Last = this.handleChangeParent2Last.bind(this);
    this.handleChangeSpouseFirst = this.handleChangeSpouseFirst.bind(this);
    this.handleChangeSpouseLast = this.handleChangeSpouseLast.bind(this);
    this.handleChangeNumberOfKids = this.handleChangeNumberOfKids.bind(this);
    this.handleChangeChildFirst = this.handleChangeChildFirst.bind(this);
    this.handleChangeChildLast = this.handleChangeChildLast.bind(this);
    this.saveInfo = this.saveInfo.bind(this);
  }

  handleChangeParent1First(event: any) {
    this.setState({
      parent1FirstTemp: event.target.value,
    });
  }

  handleChangeParent1Last(event: any) {
    this.setState({
      parent1LastTemp: event.target.value,
    });
  }

  handleChangeParent2First(event: any) {
    this.setState({
      parent2FirstTemp: event.target.value,
    });
  }

  handleChangeParent2Last(event: any) {
    this.setState({
      parent2LastTemp: event.target.value,
    });
  }

  handleChangeSpouseFirst(event: any) {
    this.setState({
      spouseFirstTemp: event.target.value,
    });
  }

  handleChangeSpouseLast(event: any) {
    this.setState({
      spouseLastTemp: event.target.value,
    });
  }

    handleChangeChildFirst = (index: number, event: any) => {
      const { childrenFirstNamesTemp } = this.state;
      childrenFirstNamesTemp[index] = event.target.value;
      this.setState({ childrenFirstNamesTemp });
    }

    handleChangeChildLast = (index: number, event: any) => {
      const { childrenLastNamesTemp } = this.state;
      childrenLastNamesTemp[index] = event.target.value;
      this.setState({ childrenLastNamesTemp });
    }

    getName = (first, last) => (`${first} ${last}`)

    handleChangeNumberOfKids(event: any) {
      let temp: string = event.target.value;
      if (temp === '') {
        temp = '0';
      }
      this.setState({
        numberOfKidsTemp: parseInt(temp, 10),
      });
    }

    toggleEdit(event: any) {
      const { editInfo } = this.state;
      this.setState({
        editInfo: !editInfo,
      });
    }

    setData = (data) => {
      if (data === -1) {
        return '';
      }
      return data;
    }

    getNumKids = (num) => {
      if (num === -1) {
        return 0;
      }
      return num;
    }

    saveInfo(event: any) {
      const {
        parent1FirstTemp,
        parent1LastTemp,
        parent2FirstTemp,
        parent2LastTemp,
        spouseFirstTemp,
        spouseLastTemp,
        numberOfKidsTemp,
        childrenFirstNamesTemp,
        childrenLastNamesTemp,
        editInfo,
      } = this.state;
      if (numberOfKidsTemp === 0) {
        this.setState({
          childrenFirstNamesTemp: [],
          childrenLastNamesTemp: [],
        });
      }
      this.setState({
        parent1First: parent1FirstTemp,
        parent1Last: parent1LastTemp,
        parent2First: parent2FirstTemp,
        parent2Last: parent2LastTemp,
        spouseFirst: spouseFirstTemp,
        spouseLast: spouseLastTemp,
        numberOfKids: numberOfKidsTemp,
        childrenFirstNames: childrenFirstNamesTemp,
        childrenLastNames: childrenLastNamesTemp,
        editInfo: !editInfo,
      });
    }

    render() {
      const { name, username, history } = this.props;
      const {
        editInfo,
      } = this.state;

      return (
            <div className="container pt-5">
                <Helmet>
                    <title>Family Info</title>
                    <meta name="description" content="Keep.id" />
                </Helmet>
                <div className="d-flex p-2">
                    <h1 id="welcome-title">Family Information</h1>
                </div>
                <div className="row justify-content-between mb-2">
                    <Link to={`/my-information/${username}/${name}`}>
                        <button type="button" className="btn btn-sm btn-secondary mr-2">
                            Return to My Information
                        </button>
                    </Link>
                    <div className="row">
                        <Link to={`/basic-info/${username}/${name}`}>
                            <button type="button" className="btn btn-sm btn-secondary mx-2">
                                Basic Information
                            </button>
                        </Link>
                        <Link to={`/demographics/${username}/${name}`}>
                            <button type="button" className="btn btn-sm btn-secondary mr-2">
                                Demographics
                            </button>
                        </Link>
                        <Link to={`/veteran-status/${username}/${name}`}>
                            <button type="button" className="btn btn-sm btn-secondary">
                                Veteran Status Information
                            </button>
                        </Link>
                    </div>
                </div>
                <div className="card my-3 px-2 primary-border">
                    <div className="card-body">
                        <div className="row mb-4">
                            {editInfo ? (
                                <div className="column">
                                    <div className="larger-text py-1">
                                        Parents/Guardians
                                    </div>
                                    <div className="my-1 upload-text-style">
                                        Parent/Guardian #1:
                                    </div>
                                    <div className="row p-0 mb-2">
                                        <div className="container p-0 mr-4" style={{ width: 200 }}>
                                            <div className="mb-1">First Name</div>
                                            <input
                                              type="text"
                                              className="form-control name-dropdown smaller-input"
                                              id="parent1First"
                                              placeholder="First Name"
                                              onChange={this.handleChangeParent1First}
                                              value={this.state.parent1FirstTemp}
                                              aria-label="parent1First"
                                            />
                                        </div>
                                        <div className="container p-0" style={{ width: 200 }}>
                                            <div className="mb-1">Last Name</div>
                                            <input
                                              type="text"
                                              className="form-control name-dropdown smaller-input"
                                              id="parent1Last"
                                              placeholder="Last Name"
                                              onChange={this.handleChangeParent1Last}
                                              value={this.state.parent1LastTemp}
                                              aria-label="parent1Last"
                                            />
                                        </div>
                                    </div>
                                    <div className="my-1 upload-text-style">
                                        Parent/Guardian #2:
                                    </div>
                                    <div className="row p-0 mb-4">
                                        <div className="container p-0 mr-4" style={{ width: 200 }}>
                                            <div className="mb-1">First Name</div>
                                            <input
                                              type="text"
                                              className="form-control name-dropdown smaller-input"
                                              id="parent2First"
                                              placeholder="First Name"
                                              onChange={this.handleChangeParent2First}
                                              value={this.state.parent2FirstTemp}
                                              aria-label="parent2First"
                                            />
                                        </div>
                                        <div className="container p-0" style={{ width: 200 }}>
                                            <div className="mb-1">Last Name</div>
                                            <input
                                              type="text"
                                              className="form-control name-dropdown smaller-input"
                                              id="parent2Last"
                                              placeholder="Last Name"
                                              onChange={this.handleChangeParent2Last}
                                              value={this.state.parent2LastTemp}
                                              aria-label="parent2Last"
                                            />
                                        </div>
                                    </div>
                                    <div className="larger-text py-1">
                                        Spouse
                                    </div>
                                    <div className="row p-0 mb-5">
                                        <div className="container p-0 mr-4" style={{ width: 200 }}>
                                            <div className="mb-1">First Name</div>
                                            <input
                                              type="text"
                                              className="form-control name-dropdown smaller-input"
                                              id="spouseFirst"
                                              placeholder="First Name"
                                              onChange={this.handleChangeSpouseFirst}
                                              value={this.state.spouseFirstTemp}
                                              aria-label="spouseFirst"
                                            />
                                        </div>
                                        <div className="container p-0" style={{ width: 200 }}>
                                            <div className="mb-1">Last Name</div>
                                            <input
                                              type="text"
                                              className="form-control name-dropdown smaller-input"
                                              id="spouseLast"
                                              placeholder="Last Name"
                                              onChange={this.handleChangeSpouseLast}
                                              value={this.state.spouseLastTemp}
                                              aria-label="spouseLast"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="column" style={{ width: 480 }}>
                                    <div className="title-text-size pb-2"> Parents/Guardians:</div>
                                    <div className="mb-3">Individuals listed below are the <br />parents/guardians that raised the client.</div>
                                    <div className="row mb-3">
                                        <div className="large-bold-text mr-4">Parent/Guardian #1:</div>
                                        <div className="large-text">{this.getName(this.state.parent1First, this.state.parent1Last)}</div>
                                    </div>
                                    <div className="row mb-4">
                                        <div className="large-bold-text mr-4">Parent/Guardian #2:</div>
                                        <div className="large-text">{this.getName(this.state.parent2First, this.state.parent2Last)}</div>
                                    </div>
                                    <div className="title-text-size pb-2"> Spouse:</div>
                                    <div className="row mb-5">
                                        <div className="large-bold-text mr-4">Spouse Name:</div>
                                        <div className="large-text">{this.getName(this.state.spouseFirst, this.state.spouseLast)}</div>
                                    </div>
                                    <div className="container my-3"><br /></div>
                                </div>
                            )}
                            {editInfo ? (
                                <div className="column" style={{ marginLeft: 100 }}>
                                    <div className="larger-text py-1">
                                        Children:
                                    </div>
                                    <div className="row mb-1">
                                        <div className="mr-2 py-2">How many children do you have?</div>
                                        <input
                                          type="text"
                                          className="form-control child-field smaller-input"
                                          id="num of kids"
                                          onChange={this.handleChangeNumberOfKids}
                                          value={this.state.numberOfKidsTemp}
                                          aria-label="parent1Last"
                                        />
                                    </div>
                                    {Array.from(Array(this.state.numberOfKidsTemp)).map((x, index) => (
                                        <div key={index}>
                                            <div className="my-1 upload-text-style">
                                                Child #{index + 1}:
                                            </div>
                                            <div className="row p-0 mb-4">
                                                <div className="container p-0 mr-4" style={{ width: 200 }}>
                                                    <div className="mb-1">First Name</div>
                                                    <input
                                                      type="text"
                                                      className="form-control name-dropdown smaller-input"
                                                      id="childFirst"
                                                      placeholder="First Name"
                                                      onChange={(e) => this.handleChangeChildFirst(index, e)}
                                                      value={this.state.childrenFirstNamesTemp[index]}
                                                      aria-label="childFirst"
                                                    />
                                                </div>
                                                <div className="container p-0" style={{ width: 200 }}>
                                                    <div className="mb-1">Last Name</div>
                                                    <input
                                                      type="text"
                                                      className="form-control name-dropdown smaller-input"
                                                      id="childLast"
                                                      placeholder="Last Name"
                                                      onChange={(e) => this.handleChangeChildLast(index, e)}
                                                      value={this.state.childrenLastNamesTemp[index]}
                                                      aria-label="childLast"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="container my-3"><br /></div>
                                </div>
                            ) : (
                                <div className="column">
                                    <div className="title-text-size pb-2"> Children:</div>
                                    <div className="row mb-3">
                                        <div className="large-bold-text mr-4">How many children do you have?</div>
                                        <div className="large-text">{this.setData(this.state.numberOfKids)}</div>
                                    </div>
                                    {Array.from(Array(this.getNumKids(this.state.numberOfKids))).map((x, index) => (
                                        <div key={index}>
                                            <div className="row mb-4">
                                                <div className="large-bold-text mr-4">Child #{index + 1}:</div>
                                                <div className="large-text">{this.getName(this.state.childrenFirstNames[index], this.state.childrenLastNames[index])}</div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="container my-3"><br /></div>
                                </div>
                            )}
                        </div>
                        {!editInfo ? (
                                <button
                                  type="button"
                                  className="btn btn-primary dropdown-size large-bold-text lock-bottom-left mt-4"
                                  onClick={this.toggleEdit}
                                >
                                Edit Information
                                </button>
                        ) : (null)
                        }
                        {editInfo ? (
                            <div className="row lock-bottom-right mt-4">
                                <div className="column mr-4">
                                    <button
                                      type="button"
                                      className="btn btn-secondary"
                                      onClick={this.toggleEdit}
                                    >
                                        Cancel
                                    </button>
                                </div>
                                <div className="column">
                                    <button
                                      type="button"
                                      className="btn btn-success"
                                      onClick={this.saveInfo}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (null)
                        }
                    </div>
                </div>
            </div>
      );
    }
}

export default withRouter(FamilyInfo);
