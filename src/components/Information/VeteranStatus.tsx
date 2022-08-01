import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import Select from 'react-select';

import {
  validateEmail,
  validatePhonenumber,
  validateZipcode,
} from './Information.validators';
import * as validators from './Information.validators';

interface Props extends RouteComponentProps {
    name: string;
    username: string;
  }

interface State {
    veteranStatus: string;
    veteranStatusTemp: string;
    protectedVeteranStatus: string;
    protectedVeteranStatusTemp: string;
    branch: string;
    branchTemp: string;
    yearsOfService: string;
    yearsOfServiceTemp: string;
    rank: string;
    rankTemp: string;
    dischargeType: string;
    dischargeTypeTemp: string;
    editInfo: boolean;
}

class BasicInfo extends Component<Props, State, any> {
  constructor(props) {
    super(props);
    this.state = {
      veteranStatus: '',
      veteranStatusTemp: '',
      protectedVeteranStatus: '',
      protectedVeteranStatusTemp: '',
      branch: '',
      branchTemp: '',
      yearsOfService: '',
      yearsOfServiceTemp: '',
      rank: '',
      rankTemp: '',
      dischargeType: '',
      dischargeTypeTemp: '',
      editInfo: false,
    };
    this.handleChangeYoS = this.handleChangeYoS.bind(this);
    this.setYoS = this.setYoS.bind(this);
    this.setDropDown = this.setDropDown.bind(this);
    this.setDropDownStatus = this.setDropDownStatus.bind(this);
    this.toggleEdit = this.toggleEdit.bind(this);
    this.saveInfo = this.saveInfo.bind(this);
    this.cancel = this.cancel.bind(this);
  }

  handleChangeYoS(event: any) {
    this.setState({
      yearsOfServiceTemp: event.target.value,
    });
  }

  setYoS() {
    if (this.state.yearsOfService === '') {
      return 'Years';
    }
    return this.state.yearsOfService;
  }

    handleChangeVeteranStatus = (value) => {
      this.setState({ veteranStatusTemp: value.label });
    }

    handleChangeProtectedVeteranStatus = (value) => {
      this.setState({ protectedVeteranStatusTemp: value.label });
    }

    handleChangeBranch = (value) => {
      this.setState({ branchTemp: value.label });
    }

    handleChangeRank = (value) => {
      this.setState({ rankTemp: value.label });
    }

    handleChangeDischarge = (value) => {
      this.setState({ dischargeTypeTemp: value.label });
    }

    setDropDown = (data) => {
      if (data === '') {
        return 'Select...';
      }
      return data;
    }

    setDropDownStatus = (data) => {
      if (data === '') {
        return 'Yes/No';
      }
      return data;
    }

    setData = (data) => {
      if (data === '') {
        return '';
      }
      return data;
    }

    getRanks = (branch) => {
      if (branch === 'Air Force') {
        return [
          { value: 'airman basic', label: 'Airman Basic (E-1)' },
          { value: 'airman', label: 'Airman (E-2)' },
          { value: 'airman first class', label: 'Airman First Class (E-3)' },
          { value: 'senior airman', label: 'Senior Airman (E-4)' },
          { value: 'staff sergeant', label: 'Staff Sergeant (E-5)' },
          { value: 'technical sergeant', label: 'Technical Sergeant (E-6)' },
          { value: 'master sergeant', label: 'Master Sergeant (E-7)' },
          { value: 'senior master sergeant', label: 'Senior Master Sergeant (E-8)' },
          { value: 'chief master sergeant', label: 'Chief Master Sergeant (E-9)' },
          { value: 'command chief master sergeant', label: 'Command Chief Master Sergeant (E-9)' },
        ];
      } if (branch === 'Marine Corps') {
        return [
          { value: 'private', label: 'Private (E-1)' },
          { value: 'private first class', label: 'Private First Class (E-2)' },
          { value: 'lance corporal', label: 'Lance Corporal (E-3)' },
          { value: 'corporal', label: 'Corporal (E-4)' },
          { value: 'sergeant', label: 'Sergeant (E-5)' },
          { value: 'staff sergeant', label: 'Staff Sergeant (E-6)' },
          { value: 'gunnery sergeant', label: 'Gunnery Sergeant (E-7)' },
          { value: 'master sergeant', label: 'Master Sergeant (E-8)' },
          { value: 'first sergeant', label: 'First Sergeant (E-9)' },
          { value: 'mastery gunnery sergeant', label: 'Master Gunnery Sergeant (E-9)' },
          { value: 'sergeant major', label: 'Sergeant Major (E-9)' },
        ];
      } if (branch === 'Navy') {
        return [
          { value: 'seaman recruit', label: 'Seaman Recruit (E-1)' },
          { value: 'seaman apprentice', label: 'Seaman Apprentice (E-2)' },
          { value: 'seaman', label: 'Seaman (E-3)' },
          { value: 'petty officer third class', label: 'Petty Officer Third Class (E-4)' },
          { value: 'petty officer second class', label: 'Petty Officer Second Class (E-5)' },
          { value: 'petty officer first class', label: 'Petty Officer First Class (E-6)' },
          { value: 'chief petty officer', label: 'Chief Petty Officer (E-7)' },
          { value: 'senior chief petty officer', label: 'Senior Chief Petty Officer (E-8)' },
          { value: 'master chief petty officer', label: 'Master Chief Petty Officer (E-9)' },
          { value: 'command master chief petty officer', label: 'Command Master Chief Petty Officer (E-9)' },
        ];
      } if (branch === 'Coast Guard') {
        return [
          { value: 'seaman recruit', label: 'Seaman Recruit (E-1)' },
          { value: 'seaman apprentice', label: 'Seaman Apprentice (E-2)' },
          { value: 'seaman fireman airman', label: 'Seaman/Fireman/Airman (E-3)' },
          { value: 'petty officer third class', label: 'Petty Officer Third Class (E-4)' },
          { value: 'petty officer second class', label: 'Petty Officer Second Class (E-5)' },
          { value: 'petty officer first class', label: 'Petty Officer First Class (E-6)' },
          { value: 'chief petty officer', label: 'Chief Petty Officer (E-7)' },
          { value: 'senior chief petty officer', label: 'Senior Chief Petty Officer (E-8)' },
          { value: 'master chief petty officer', label: 'Master Chief Petty Officer (E-9)' },
          { value: 'command master chief petty officer', label: 'Command Master Chief Petty Officer (E-9)' },
        ];
      } if (branch === 'Space Force') {
        return [
          { value: 'specialist one', label: 'Specialist One (E-1)' },
          { value: 'specialist two', label: 'Specialist Two (E-2)' },
          { value: 'specialist three', label: 'Specialist Three(E-3)' },
          { value: 'specialist four', label: 'Specialist Four (E-4)' },
          { value: 'sergeant', label: 'Sergeant (E-5)' },
          { value: 'technical sergeant', label: 'Technical Sergeant (E-6)' },
          { value: 'master sergeant', label: 'Master Sergeant (E-7)' },
          { value: 'senior master sergeant', label: 'Senior Master Sergeant (E-8)' },
          { value: 'chief master sergeant', label: 'Chief Master Sergeant (E-9)' },
          { value: 'command chief master sergeant', label: 'Command Chief Master Sergeant (E-9)' },
        ];
      } if (branch === 'Army') {
        return [
          { value: 'private', label: 'Private (E-1)' },
          { value: 'private 2', label: 'Private (E-2)' },
          { value: 'private first class', label: 'Private First Class (E-3)' },
          { value: 'corporal', label: 'Corporal (E-4)' },
          { value: 'specialist', label: 'Specialist (E-4)' },
          { value: 'sergeant', label: 'Sergeant (E-5)' },
          { value: 'staff sergeant', label: 'Staff Sergeant (E-6)' },
          { value: 'sergeant first class', label: 'Sergeant First Class (E-7)' },
          { value: 'master sergeant', label: 'Master Sergeant (E-8)' },
          { value: 'first sergeant', label: 'First Sergeant (E-8)' },
          { value: 'command sergeant major', label: 'Command Sergeant Major (E-9)' },
          { value: 'sergeant major', label: 'Sergeant Major (E-9)' },
        ];
      }
      return [];
    }

    toggleEdit(event: any) {
      const { editInfo } = this.state;
      this.setState({
        editInfo: !editInfo,
      });
    }

    cancel(event: any) {
      const { editInfo, veteranStatus, protectedVeteranStatus } = this.state;
      this.setState({
        editInfo: !editInfo,
        veteranStatusTemp: veteranStatus,
        protectedVeteranStatusTemp: protectedVeteranStatus,
      });
    }

    showInformation = () => {
      const { veteranStatusTemp, protectedVeteranStatusTemp } = this.state;
      if (veteranStatusTemp === 'Yes' || protectedVeteranStatusTemp === 'Yes') {
        return true;
      }
      return false;
    }

    saveInfo(event: any) {
      const {
        veteranStatusTemp,
        protectedVeteranStatusTemp,
        branchTemp,
        rankTemp,
        yearsOfServiceTemp,
        dischargeTypeTemp,
        editInfo,
      } = this.state;
      if (veteranStatusTemp === 'No' && protectedVeteranStatusTemp === 'No') {
        this.setState({
          branchTemp: '',
          rankTemp: '',
          yearsOfServiceTemp: '',
          dischargeTypeTemp: '',
        });
      }
      this.setState({
        veteranStatus: veteranStatusTemp,
        protectedVeteranStatus: protectedVeteranStatusTemp,
        branch: branchTemp,
        rank: rankTemp,
        yearsOfService: yearsOfServiceTemp,
        dischargeType: dischargeTypeTemp,
        editInfo: !editInfo,
      });
    }

    render() {
      const { name, history } = this.props;
      const {
        veteranStatus,
        protectedVeteranStatus,
        branch,
        rank,
        yearsOfService,
        dischargeType,
        editInfo,
      } = this.state;

      const veteranStatusOptions = [
        { value: 'No', label: 'No' },
        { value: 'Yes', label: 'Yes' },
      ];

      const protectedVeteranStatusOptions = [
        { value: 'No', label: 'No' },
        { value: 'Yes', label: 'Yes' },
      ];

      const branchOptions = [
        { value: 'air force', label: 'Air Force' },
        { value: 'navy', label: 'Navy' },
        { value: 'army', label: 'Army' },
        { value: 'marine', label: 'Marine Corps' },
        { value: 'coast guard', label: 'Coast Guard' },
        { value: 'space force', label: 'Space Force' },
      ];

      const dischargeOptions = [
        { value: 'honorable', label: 'Honorable' },
        { value: 'general', label: 'General' },
        { value: 'other', label: 'Other Than Honorable (OTH)' },
        { value: 'bad conduct', label: 'Bad Conduct (BCD)' },
        { value: 'dishonorable', label: 'Dishonorable' },
      ];

      return (
            <div className="container pt-5">
                <Helmet>
                    <title>Veteran Status</title>
                    <meta name="description" content="Keep.id" />
                </Helmet>
                <div className="d-flex p-2">
                    <h1 id="welcome-title">Veteran Status Information</h1>
                </div>
                <div className="row justify-content-between mb-2">
                    <Link to="/my-information">
                        <button type="button" className="btn btn-sm btn-secondary mr-2">
                            Return to My Information
                        </button>
                    </Link>
                    <div className="row">
                        <Link to="/basic-info">
                            <button type="button" className="btn btn-sm btn-secondary mx-2">
                                Basic Information
                            </button>
                        </Link>
                        <Link to="/family-info">
                            <button type="button" className="btn btn-sm btn-secondary mr-2">
                                Family Information
                            </button>
                        </Link>
                        <Link to="/demographics">
                            <button type="button" className="btn btn-sm btn-secondary">
                                Demographics
                            </button>
                        </Link>
                    </div>
                </div>
                <div className="card my-3 px-2 primary-border">
                    <div className="card-body">
                        <div className="row mb-4">
                            <div className="column">
                                <div className="row justify-content-between mb-2">
                                    <p className="large-bold-text column py-2">Are you a veteran?</p>
                                    {editInfo ? (
                                        <div className="row justify-content-between">
                                            <Select
                                              placeholder={this.setDropDownStatus(this.state.veteranStatusTemp)}
                                              aria-label="veteran"
                                              options={veteranStatusOptions}
                                              closeMenuOnSelect
                                              onChange={this.handleChangeVeteranStatus}
                                              value={this.state.veteranStatusTemp}
                                              menuPlacement="bottom"
                                              className="dropdown-size"
                                            />
                                        </div>
                                    ) : (
                                        <div className="container large-dropdown-size">
                                            <div className="large-text py-2">{this.setData(this.state.veteranStatus)}</div>
                                        </div>
                                    )}
                                </div>
                                <div className="row mb-2 justify-content-between">
                                    <p className="large-bold-text column py-2 mr-4">Are you a protected veteran?</p>
                                    {editInfo ? (
                                        <div className="row justify-content-between">
                                            <Select
                                              placeholder={this.setDropDownStatus(this.state.protectedVeteranStatusTemp)}
                                              aria-label="protected veteran"
                                              options={protectedVeteranStatusOptions}
                                              closeMenuOnSelect
                                              onChange={this.handleChangeProtectedVeteranStatus}
                                              value={this.state.protectedVeteranStatusTemp}
                                              menuPlacement="bottom"
                                              className="dropdown-size"
                                            />
                                        </div>
                                    ) : (
                                        <div className="container large-dropdown-size">
                                            <div className="large-text py-2">{this.setData(this.state.protectedVeteranStatus)}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {this.showInformation() ? (
                        <div className="row mb-4">
                            <div className="column">
                                <div className="row justify-content-between mb-2">
                                    <p className="large-bold-text column py-2">Branch/Service:</p>
                                    {editInfo ? (
                                        <div className="row justify-content-between">
                                            <Select
                                              placeholder={this.setDropDown(this.state.branchTemp)}
                                              aria-label="branch"
                                              options={branchOptions}
                                              closeMenuOnSelect
                                              onChange={this.handleChangeBranch}
                                              value={this.state.branchTemp}
                                              menuPlacement="bottom"
                                              className="dropdown-size"
                                            />
                                        </div>
                                    ) : (
                                        <div className="container large-dropdown-size">
                                            <div className="large-text py-2">{this.setData(this.state.branch)}</div>
                                        </div>
                                    )}
                                </div>
                                <div className="row justify-content-between mb-4">
                                    <p className="large-bold-text column mr-4 py-2">Years of Service:</p>
                                    {editInfo ? (
                                        <div className="row justify-content-between">
                                            <button type="button" className="transparent-button dropdown-size p-0">
                                                <input
                                                  type="text"
                                                  className="form-control small-dropdown-size smaller-input"
                                                  id="yearsOfService"
                                                  placeholder={this.setYoS()}
                                                  onChange={this.handleChangeYoS}
                                                  value={this.state.yearsOfServiceTemp}
                                                  aria-label="years of service"
                                                />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="container large-dropdown-size">
                                            <div className="large-text py-2">{this.setData(this.state.yearsOfService)}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="column" style={{ marginLeft: 200 }}>
                                <div className="row justify-content-between mb-2">
                                    <p className="large-bold-text column mr-4 py-2">Rank at Discharge:</p>
                                    {editInfo ? (
                                        <div className="row justify-content-between">
                                            <Select
                                              placeholder={this.setDropDown(this.state.rankTemp)}
                                              aria-label="rank"
                                              options={this.getRanks(this.state.branchTemp)}
                                              closeMenuOnSelect
                                              onChange={this.handleChangeRank}
                                              value={this.state.rankTemp}
                                              menuPlacement="bottom"
                                              className="large-dropdown-size"
                                            />
                                        </div>
                                    ) : (
                                        <div className="container large-dropdown-size">
                                            <div className="large-text py-2">{this.setData(this.state.rank)}</div>
                                        </div>
                                    )}
                                </div>
                                <div className="row justify-content-between mb-4">
                                    <p className="large-bold-text column py-2">Discharge Type:</p>
                                    {editInfo ? (
                                        <div className="row justify-content-between">
                                            <Select
                                              placeholder={this.setDropDown(this.state.dischargeTypeTemp)}
                                              aria-label="discharge type"
                                              options={dischargeOptions}
                                              closeMenuOnSelect
                                              onChange={this.handleChangeDischarge}
                                              value={this.state.dischargeTypeTemp}
                                              menuPlacement="bottom"
                                              className="large-dropdown-size"
                                            />
                                        </div>
                                    ) : (
                                        <div className="container large-dropdown-size">
                                            <div className="large-text py-2">{this.setData(this.state.dischargeType)}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        ) : (null)}
                        {!this.showInformation() ? <div className="container my-2"><br /></div> : (null)}
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
                                      onClick={this.cancel}
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

export default withRouter(BasicInfo);
